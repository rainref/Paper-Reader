import shutil
import json
from pathlib import Path
from typing import Optional
from ..config import settings


class FileManager:
    def __init__(self):
        self.papers_dir = settings.papers_dir
        self.annotations_dir = settings.annotations_dir

    def save_paper(self, source: Path, paper_id: str) -> Path:
        """Save PDF file to papers directory."""
        dest = self.papers_dir / f"{paper_id}.pdf"
        shutil.copy2(source, dest)
        return dest

    def delete_paper(self, paper_id: str) -> bool:
        """Delete paper file."""
        file_path = self.papers_dir / f"{paper_id}.pdf"
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def get_paper_path(self, paper_id: str) -> Optional[Path]:
        """Get path to paper file."""
        file_path = self.papers_dir / f"{paper_id}.pdf"
        return file_path if file_path.exists() else None

    def paper_exists(self, paper_id: str) -> bool:
        """Check if paper exists."""
        return self.get_paper_path(paper_id) is not None

    def save_annotations(self, paper_id: str, annotations: list) -> Path:
        """Save annotations to JSON file."""
        file_path = self.annotations_dir / f"{paper_id}.json"
        with open(file_path, 'w') as f:
            json.dump(annotations, f)
        return file_path

    def load_annotations(self, paper_id: str) -> list:
        """Load annotations from JSON file."""
        file_path = self.annotations_dir / f"{paper_id}.json"
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return []


file_manager = FileManager()
