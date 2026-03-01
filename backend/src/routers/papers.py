from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from pathlib import Path
import tempfile
import httpx

from ..models import get_db, Paper
from ..services.pdf_processor import extract_metadata, extract_toc, generate_paper_id
from ..services.file_manager import file_manager

router = APIRouter(prefix="/papers", tags=["papers"])


@router.post("/import")
async def import_paper(
    file: UploadFile = File(None),
    url: str = Form(None),
    arxiv_id: str = Form(None),
    doi: str = Form(None),
    db: Session = Depends(get_db)
):
    """Import paper from file, URL, arXiv ID, or DOI."""
    paper_id = None
    temp_path = None

    try:
        # Handle file upload
        if file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                content = await file.read()
                tmp.write(content)
                temp_path = Path(tmp.name)
                paper_id = generate_paper_id(file.filename)

        # Handle URL
        elif url:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(response.content)
                    temp_path = Path(tmp.name)
                    paper_id = generate_paper_id(url)

        # Handle arXiv ID
        elif arxiv_id:
            arxiv_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
            async with httpx.AsyncClient() as client:
                response = await client.get(arxiv_url)
                response.raise_for_status()
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(response.content)
                    temp_path = Path(tmp.name)
                    paper_id = generate_paper_id(f"arxiv:{arxiv_id}")

        # Handle DOI
        elif doi:
            # Use DOI to get PDF (simplified - would need proper DOI resolution)
            raise HTTPException(status_code=400, detail="DOI import not yet implemented")

        else:
            raise HTTPException(status_code=400, detail="Must provide file, url, arxiv_id, or doi")

        if not temp_path or not paper_id:
            raise HTTPException(status_code=400, detail="Failed to process input")

        # Save file
        file_path = file_manager.save_paper(temp_path, paper_id)
        temp_path.unlink()

        # Extract metadata
        metadata = extract_metadata(file_path)

        # Save to database
        paper = Paper(
            id=paper_id,
            title=metadata.get("title", "Untitled"),
            authors=metadata.get("authors", ""),
            abstract=metadata.get("subject", ""),
            arxiv_id=arxiv_id,
            doi=doi,
            file_path=str(file_path),
            paper_metadata=metadata
        )
        db.add(paper)
        db.commit()

        return {
            "id": paper_id,
            "title": paper.title,
            "authors": paper.authors,
            "message": "Paper imported successfully"
        }

    except Exception as e:
        if temp_path and temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def list_papers(db: Session = Depends(get_db)):
    """List all papers."""
    papers = db.query(Paper).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "authors": p.authors,
            "created_at": p.created_at.isoformat()
        }
        for p in papers
    ]


@router.get("/{paper_id}")
def get_paper(paper_id: str, db: Session = Depends(get_db)):
    """Get paper metadata."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return {
        "id": paper.id,
        "title": paper.title,
        "authors": paper.authors,
        "abstract": paper.abstract,
        "doi": paper.doi,
        "arxiv_id": paper.arxiv_id,
        "created_at": paper.created_at.isoformat()
    }


@router.get("/{paper_id}/pdf")
def get_pdf(paper_id: str):
    """Stream PDF file."""
    file_path = file_manager.get_paper_path(paper_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF not found")

    from fastapi.responses import FileResponse
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"{paper_id}.pdf"
    )


@router.get("/{paper_id}/toc")
def get_toc(paper_id: str):
    """Get table of contents."""
    file_path = file_manager.get_paper_path(paper_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF not found")

    toc = extract_toc(file_path)
    return {"toc": toc}


@router.post("/{paper_id}/ai/query")
async def query_paper(
    paper_id: str,
    question: str = Form(...),
    db: Session = Depends(get_db)
):
    """Ask AI about a paper."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    file_path = file_manager.get_paper_path(paper_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF file not found")

    # Get paper text
    metadata = extract_metadata(file_path)
    context = metadata.get("text", "")[:15000]  # Limit context

    # Query AI
    from ..services.ai_service import ai_service
    answer = await ai_service.query(question, context)

    return {"answer": answer}


@router.post("/{paper_id}/translate")
async def translate_paper(
    paper_id: str,
    text: str = Form(None),
    full: bool = Form(False),
    db: Session = Depends(get_db)
):
    """Translate paper or selection."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    from ..services.ai_service import ai_service

    if full:
        # Translate full paper
        file_path = file_manager.get_paper_path(paper_id)
        if not file_path:
            raise HTTPException(status_code=404, detail="PDF file not found")

        metadata = extract_metadata(file_path)
        text_to_translate = metadata.get("text", "")[:10000]
    else:
        text_to_translate = text

    translation = await ai_service.translate(text_to_translate)
    return {"translation": translation}


@router.get("/{paper_id}/markdown")
async def get_markdown(paper_id: str, db: Session = Depends(get_db)):
    """获取 PDF 转换后的 Markdown 内容"""
    # 检查论文是否存在
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # 获取 PDF 文件路径
    file_path = file_manager.get_paper_path(paper_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF file not found")

    # 检查缓存
    from ..services.mineru_service import mineru_service
    cached = mineru_service.get_cached_markdown(paper_id, file_path)
    if cached:
        return {
            "markdown": cached["markdown"],
            "total_pages": cached.get("total_pages", 0),
            "from_cache": True
        }

    # 没有缓存，返回404提示前端需要转换
    raise HTTPException(status_code=404, detail="Markdown not found, conversion required")


@router.get("/{paper_id}/markdown/images/{image_name}")
async def get_markdown_image(paper_id: str, image_name: str, db: Session = Depends(get_db)):
    """获取 Markdown 中的图片"""
    # 检查论文是否存在
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # 获取 PDF 文件路径
    file_path = file_manager.get_paper_path(paper_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF file not found")

    # 获取图片路径
    from ..services.mineru_service import mineru_service
    img_path = mineru_service.get_image_path(paper_id, file_path, image_name)
    if not img_path:
        raise HTTPException(status_code=404, detail="Image not found")

    # 根据图片扩展名确定 content-type
    ext = image_name.lower().split('.')[-1]
    content_type = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    }.get(ext, 'application/octet-stream')

    from fastapi.responses import FileResponse
    return FileResponse(img_path, media_type=content_type)


@router.post("/{paper_id}/convert")
async def convert_to_markdown(paper_id: str, db: Session = Depends(get_db)):
    """手动触发 PDF 到 Markdown 的转换"""
    # 检查论文是否存在
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # 获取 PDF 文件路径
    file_path = file_manager.get_paper_path(paper_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="PDF file not found")

    # 转换 PDF 到 Markdown
    try:
        from ..services.mineru_service import mineru_service
        mineru_service.convert_pdf_to_markdown(file_path, paper_id)
        return {"status": "success", "message": "PDF converted to Markdown successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert PDF: {str(e)}")