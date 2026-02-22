from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..services.file_manager import file_manager

router = APIRouter(prefix="/annotations", tags=["annotations"])


class Annotation(BaseModel):
    page: int
    x: float
    y: float
    width: float
    height: float
    text: Optional[str] = None
    color: str = "#ffeb3b"
    note: Optional[str] = None


@router.get("/{paper_id}")
def get_annotations(paper_id: str):
    """Get all annotations for a paper."""
    annotations = file_manager.load_annotations(paper_id)
    return {"annotations": annotations}


@router.post("/{paper_id}")
def save_annotations(paper_id: str, annotations: List[Annotation]):
    """Save annotations for a paper."""
    # Convert to dict for JSON serialization
    data = [a.model_dump() for a in annotations]
    file_manager.save_annotations(paper_id, data)
    return {"message": "Annotations saved"}
