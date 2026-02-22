import fitz  # PyMuPDF
import hashlib
from pathlib import Path
from typing import Dict, List, Optional


def extract_metadata(file_path: Path) -> Dict:
    """Extract metadata from PDF."""
    doc = fitz.open(file_path)
    metadata = doc.metadata
    toc = doc.get_toc()

    # Extract text for AI context
    text = ""
    for page in doc:
        text += page.get_text()

    doc.close()

    return {
        "title": metadata.get("title", ""),
        "authors": metadata.get("author", ""),
        "subject": metadata.get("subject", ""),
        "creator": metadata.get("creator", ""),
        "toc": toc,
        "text": text[:10000]  # Limit text length
    }


def extract_toc(file_path: Path) -> List[Dict]:
    """Extract table of contents from PDF."""
    doc = fitz.open(file_path)
    toc = doc.get_toc()
    doc.close()

    return [
        {"level": level, "title": title, "page": page}
        for level, title, page in toc
    ]


def extract_page_text(file_path: Path, page_num: int) -> str:
    """Extract text from a specific page."""
    doc = fitz.open(file_path)
    if page_num < 1 or page_num > len(doc):
        doc.close()
        return ""
    page = doc[page_num - 1]
    text = page.get_text()
    doc.close()
    return text


def generate_paper_id(identifier: str) -> str:
    """Generate unique ID from DOI or arXiv ID."""
    return hashlib.sha256(identifier.encode()).hexdigest()[:16]
