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
