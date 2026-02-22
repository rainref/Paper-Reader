# Paper-Reader Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete academic PDF reader/viewer web application with AI-powered explanations and translation.

**Architecture:** React + TypeScript frontend with PDF.js, Python FastAPI backend with local SQLite storage, unified AI service supporting external APIs and local models.

**Tech Stack:** React, TypeScript, PDF.js, FastAPI, SQLite, PyMuPDF, OpenAI SDK, Anthropic SDK, Ollama

---

## Phase 1: Project Setup

### Task 1: Initialize Backend Project Structure

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/src/__init__.py`
- Create: `backend/src/main.py`
- Create: `backend/tests/__init__.py`

**Step 1: Create pyproject.toml**

```toml
[project]
name = "paper-reader-backend"
version = "0.1.0"
description = "Backend for Paper-Reader academic PDF application"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "pymupdf>=1.23.0",
    "sqlalchemy>=2.0.0",
    "openai>=1.10.0",
    "anthropic>=0.18.0",
    "httpx>=0.26.0",
    "python-dotenv>=1.0.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "httpx>=0.26.0",
]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[tool.pytest.ini_options]
asyncio_mode = "auto"
```

**Step 2: Create basic main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Paper-Reader Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Paper-Reader API"}

@app.get("/health")
def health():
    return {"status": "ok"}
```

**Step 3: Verify server starts**

Run: `cd backend && uvicorn src.main:app --reload`
Expected: Server starts on http://127.0.0.1:8000

**Step 4: Commit**

```bash
git add backend/pyproject.toml backend/src/ backend/tests/
git commit -m "feat: initialize backend project structure"
```

---

### Task 2: Initialize Frontend Project with Vite

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`

**Step 1: Create package.json**

```json
{
  "name": "paper-reader-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "pdfjs-dist": "^4.0.379",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.1.0",
    "vitest": "^1.2.0"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Paper Reader</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 6: Create App.tsx**

```tsx
function App() {
  return (
    <div>
      <h1>Paper Reader</h1>
      <p>Loading...</p>
    </div>
  )
}

export default App
```

**Step 7: Create index.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

**Step 8: Verify frontend builds**

Run: `cd frontend && npm install && npm run dev`
Expected: Frontend starts on http://localhost:5173

**Step 9: Commit**

```bash
git add frontend/
git commit -m "feat: initialize frontend project with Vite"
```

---

## Phase 2: Backend Core

### Task 3: Backend Configuration and Database Models

**Files:**
- Modify: `backend/src/main.py`
- Create: `backend/src/config.py`
- Create: `backend/src/models.py`
- Create: `backend/tests/test_config.py`

**Step 1: Create config.py**

```python
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    app_dir: Path = Path(__file__).parent.parent
    data_dir: Path = app_dir / "data"
    papers_dir: Path = data_dir / "papers"
    annotations_dir: Path = data_dir / "annotations"
    db_path: Path = data_dir / "papers.db"

    # AI Configuration
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    default_ai_provider: str = "openai"  # openai, anthropic, ollama

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
settings.papers_dir.mkdir(parents=True, exist_ok=True)
settings.annotations_dir.mkdir(parents=True, exist_ok=True)
```

**Step 2: Create models.py**

```python
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from ..config import settings

Base = declarative_base()

class Paper(Base):
    __tablename__ = "papers"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    authors = Column(Text)
    abstract = Column(Text)
    doi = Column(String)
    arxiv_id = Column(String)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = Column(JSON)

class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String, nullable=False)
    page = Column(Integer, nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    text = Column(Text)
    color = Column(String, default="#ffeb3b")
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create engine
engine = create_engine(f"sqlite:///{settings.db_path}")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Step 3: Update main.py to include config**

```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from src.config import settings
from src.models import get_db

app = FastAPI(title="Paper-Reader Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Paper-Reader API"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/config")
def get_config():
    return {
        "default_ai_provider": settings.default_ai_provider,
        "ollama_base_url": settings.ollama_base_url,
    }
```

**Step 4: Write test for config**

```python
# backend/tests/test_config.py
from src.config import settings

def test_settings_defaults():
    assert settings.app_dir.name == "backend"
    assert settings.papers_dir.exists()
    assert settings.annotations_dir.exists()
```

**Step 5: Run test**

Run: `cd backend && python -m pytest tests/test_config.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add backend/src/ backend/tests/
git commit -m "feat: add config and database models"
```

---

### Task 4: PDF Processing Service

**Files:**
- Create: `backend/src/services/pdf_processor.py`
- Create: `backend/tests/test_pdf_processor.py`

**Step 1: Create pdf_processor.py**

```python
import fitz  # PyMuPDF
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
from ..config import settings

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
```

**Step 2: Write test for PDF processor**

```python
# backend/tests/test_pdf_processor.py
from pathlib import Path
from src.services.pdf_processor import generate_paper_id

def test_generate_paper_id():
    id1 = generate_paper_id("10.1234/example")
    id2 = generate_paper_id("10.1234/example")
    assert id1 == id2
    assert len(id1) == 16

def test_generate_paper_id_different():
    id1 = generate_paper_id("10.1234/example")
    id2 = generate_paper_id("10.5678/other")
    assert id1 != id2
```

**Step 3: Run test**

Run: `cd backend && python -m pytest tests/test_pdf_processor.py -v`
Expected: PASS

**Step 4: Commit**

```bash
git add backend/src/services/ backend/tests/
git commit -m "feat: add PDF processing service"
```

---

### Task 5: File Manager Service

**Files:**
- Create: `backend/src/services/file_manager.py`
- Create: `backend/tests/test_file_manager.py`

**Step 1: Create file_manager.py**

```python
import shutil
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
        import json
        file_path = self.annotations_dir / f"{paper_id}.json"
        with open(file_path, 'w') as f:
            json.dump(annotations, f)
        return file_path

    def load_annotations(self, paper_id: str) -> list:
        """Load annotations from JSON file."""
        import json
        file_path = self.annotations_dir / f"{paper_id}.json"
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return []

file_manager = FileManager()
```

**Step 2: Write test**

```python
# backend/tests/test_file_manager.py
from src.services.file_manager import FileManager
from pathlib import Path
import tempfile
import os

def test_file_manager():
    with tempfile.TemporaryDirectory() as tmpdir:
        # This would need to mock settings for proper testing
        pass  # Placeholder - settings need to be properly testable

def test_paper_id_generation_consistency():
    from src.services.pdf_processor import generate_paper_id
    id1 = generate_paper_id("test-doi-123")
    id2 = generate_paper_id("test-doi-123")
    assert id1 == id2
```

**Step 3: Commit**

```bash
git add backend/src/services/ backend/tests/
git commit -m "feat: add file manager service"
```

---

### Task 6: Paper Import API Endpoints

**Files:**
- Create: `backend/src/routers/papers.py`
- Modify: `backend/src/main.py`

**Step 1: Create papers router**

```python
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
            metadata=metadata
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
```

**Step 2: Update main.py to include router**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import papers

app = FastAPI(title="Paper-Reader Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(papers.router, prefix="/api")

# ... rest of the file
```

**Step 3: Test endpoint**

Run: `cd backend && uvicorn src.main:app --reload`
Expected: Server starts

**Step 4: Commit**

```bash
git add backend/src/routers/ backend/src/main.py
git commit -m "feat: add paper import API endpoints"
```

---

## Phase 3: Backend AI Integration

### Task 7: AI Service Adapter

**Files:**
- Create: `backend/src/services/ai_service.py`
- Create: `backend/tests/test_ai_service.py`

**Step 1: Create ai_service.py**

```python
from typing import Optional, Dict
from ..config import settings

class AIService:
    def __init__(self):
        self.provider = settings.default_ai_provider

    async def query(
        self,
        prompt: str,
        context: str,
        model: Optional[str] = None
    ) -> str:
        """Query AI with paper context."""
        if self.provider == "openai":
            return await self._query_openai(prompt, context, model)
        elif self.provider == "anthropic":
            return await self._query_anthropic(prompt, context, model)
        elif self.provider == "ollama":
            return await self._query_ollama(prompt, context, model)
        else:
            raise ValueError(f"Unknown provider: {self.provider}")

    async def _query_openai(self, prompt: str, context: str, model: str = None) -> str:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key)

        full_prompt = f"""You are a helpful academic assistant.

Paper content:
{context}

User question: {prompt}

Please provide a detailed and accurate response based on the paper content above."""

        response = await client.chat.completions.create(
            model=model or "gpt-4",
            messages=[{"role": "user", "content": full_prompt}]
        )
        return response.choices[0].message.content

    async def _query_anthropic(self, prompt: str, context: str, model: str = None) -> str:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=settings.anthropic_api_key)

        full_prompt = f"""You are a helpful academic assistant.

Paper content:
{context}

User question: {prompt}

Please provide a detailed and accurate response based on the paper content above."""

        response = await client.messages.create(
            model=model or "claude-3-sonnet-20240229",
            max_tokens=4096,
            messages=[{"role": "user", "content": full_prompt}]
        )
        return response.content[0].text

    async def _query_ollama(self, prompt: str, context: str, model: str = None) -> str:
        import httpx

        full_prompt = f"""You are a helpful academic assistant.

Paper content:
{context}

User question: {prompt}

Please provide a detailed and accurate response based on the paper content above."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": model or "llama2",
                    "prompt": full_prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            return response.json().get("response", "")

    async def translate(self, text: str, target_lang: str = "Chinese") -> str:
        """Translate text to target language."""
        prompt = f"""Translate the following academic_lang}.
Maintain the academic tone and technical terminology. text to {target If there are technical terms, provide both the original term and translation:

{text}"""

        return await self.query(prompt, "")  # No context needed for translation

ai_service = AIService()
```

**Step 2: Add AI endpoints to papers router**

```python
# Add to backend/src/routers/papers.py

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
    from ..services.pdf_processor import extract_metadata
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

        from ..services.pdf_processor import extract_metadata
        metadata = extract_metadata(file_path)
        text_to_translate = metadata.get("text", "")[:10000]
    else:
        text_to_translate = text

    translation = await ai_service.translate(text_to_translate)
    return {"translation": translation}
```

**Step 3: Commit**

```bash
git add backend/src/services/ai_service.py backend/src/routers/papers.py
git commit -m "feat: add AI service adapter"
```

---

### Task 8: Annotations API

**Files:**
- Create: `backend/src/routers/annotations.py`
- Modify: `backend/src/main.py`

**Step 1: Create annotations router**

```python
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
```

**Step 2: Update main.py**

```python
from src.routers import papers, annotations
# ...
app.include_router(annotations.router, prefix="/api")
```

**Step 3: Commit**

```bash
git add backend/src/routers/annotations.py backend/src/main.py
git commit -m "feat: add annotations API"
```

---

## Phase 4: Frontend Core

### Task 9: Frontend Basic Structure and Routing

**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/pages/Library.tsx`
- Create: `frontend/src/pages/PaperView.tsx`
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/api/paperApi.ts`

**Step 1: Update App.tsx with routing**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Library from './pages/Library'
import PaperView from './pages/PaperView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/paper/:id" element={<PaperView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**Step 2: Create API client**

```typescript
// frontend/src/api/paperApi.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export interface Paper {
  id: string
  title: string
  authors: string
  abstract?: string
  doi?: string
  arxiv_id?: string
  created_at: string
}

export interface TocItem {
  level: number
  title: string
  page: number
}

export interface Annotation {
  page: number
  x: number
  y: number
  width: number
  height: number
  text?: string
  color: string
  note?: string
}

export const paperApi = {
  listPapers: () => api.get<Paper[]>('/papers/').then(r => r.data),

  getPaper: (id: string) => api.get<Paper>(`/papers/${id}`).then(r => r.data),

  importPaper: (file?: File, url?: string, arxivId?: string, doi?: string) => {
    const formData = new FormData()
    if (file) formData.append('file', file)
    if (url) formData.append('url', url)
    if (arxivId) formData.append('arxiv_id', arxivId)
    if (doi) formData.append('doi', doi)
    return api.post<{ id: string }>('/papers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  getToc: (id: string) => api.get<{ toc: TocItem[] }>(`/papers/${id}/toc`).then(r => r.data),

  queryAI: (id: string, question: string) =>
    api.post<{ answer: string }>(`/papers/${id}/ai/query`, { question }).then(r => r.data),

  translate: (id: string, text?: string, full?: boolean) =>
    api.post<{ translation: string }>(`/papers/${id}/translate`, { text, full }).then(r => r.data),

  getAnnotations: (id: string) =>
    api.get<{ annotations: Annotation[] }>(`/annotations/${id}`).then(r => r.data),

  saveAnnotations: (id: string, annotations: Annotation[]) =>
    api.post(`/annotations/${id}`, annotations).then(r => r.data),
}
```

**Step 3: Create basic pages**

```tsx
// frontend/src/pages/Library.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { paperApi, Paper } from '../api/paperApi'

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paperApi.listPapers()
      .then(setPapers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>My Library</h1>
      {papers.length === 0 ? (
        <p>No papers yet. Import your first paper!</p>
      ) : (
        <ul>
          {papers.map(paper => (
            <li key={paper.id}>
              <Link to={`/paper/${paper.id}`}>{paper.title}</Link>
              <span> - {paper.authors}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

```tsx
// frontend/src/pages/PaperView.tsx
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { paperApi, Paper } from '../api/paperApi'

export default function PaperView() {
  const { id } = useParams<{ id: string }>()
  const [paper, setPaper] = useState<Paper | null>(null)

  useEffect(() => {
    if (id) {
      paperApi.getPaper(id).then(setPaper)
    }
  }, [id])

  if (!paper) return <div>Loading...</div>

  return (
    <div>
      <h1>{paper.title}</h1>
      <p>{paper.authors}</p>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: add frontend routing and basic pages"
```

---

## Phase 5: Frontend PDF Viewer

### Task 10: PDF Viewer Component

**Files:**
- Create: `frontend/src/components/PdfViewer.tsx`
- Create: `frontend/src/hooks/usePdf.ts`

**Step 1: Create PDF viewer component**

```tsx
// frontend/src/components/PdfViewer.tsx
import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface PdfViewerProps {
  url: string
  onPageChange?: (page: number) => void
}

export default function PdfViewer({ url, onPageChange }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      setPdf(pdfDoc)
      setNumPages(pdfDoc.numPages)
      setLoading(false)
    })
  }, [url])

  useEffect(() => {
    if (!pdf || !canvasRef.current) return

    pdf.getPage(pageNum).then(page => {
      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!
      const viewport = page.getViewport({ scale })

      canvas.height = viewport.height
      canvas.width = viewport.width

      page.render({
        canvasContext: context,
        viewport
      })
    })
  }, [pdf, pageNum, scale])

  const prevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
      onPageChange?.(pageNum - 1)
    }
  }

  const nextPage = () => {
    if (pageNum < numPages) {
      setPageNum(pageNum + 1)
      onPageChange?.(pageNum + 1)
    }
  }

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))

  if (loading) return <div>Loading PDF...</div>

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={prevPage} disabled={pageNum <= 1}>Prev</button>
        <span>{pageNum} / {numPages}</span>
        <button onClick={nextPage} disabled={pageNum >= numPages}>Next</button>
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>
      </div>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/ frontend/src/hooks/
git commit -m "feat: add PDF viewer component"
```

---

## Phase 6: Frontend Features

### Task 11: AI Chat Panel

**Files:**
- Create: `frontend/src/components/AIChat.tsx`

**Step 1: Create AI Chat component**

```tsx
// frontend/src/components/AIChat.tsx
import { useState } from 'react'
import { paperApi } from '../api/paperApi'

interface AIChatProps {
  paperId: string
}

export default function AIChat({ paperId }: AIChatProps) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!question.trim()) return

    const userMsg = { role: 'user' as const, content: question }
    setMessages(msgs => [...msgs, userMsg])
    setLoading(true)
    setQuestion('')

    try {
      const { answer } = await paperApi.queryAI(paperId, question)
      setMessages(msgs => [...msgs, { role: 'ai', content: answer }])
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'ai', content: 'Error: ' + e }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: 300, borderLeft: '1px solid #ccc', padding: 16, height: '100%', overflow: 'auto' }}>
      <h3>AI Assistant</h3>
      <div style={{ marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            margin: '8px 0'
          }}>
            <span style={{
              background: msg.role === 'user' ? '#007bff' : '#f0f0f0',
              color: msg.role === 'user' ? '#fff' : '#000',
              padding: '8px 12px',
              borderRadius: 12,
              display: 'inline-block'
            }}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Ask about this paper..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button onClick={ask} disabled={loading}>Send</button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/AIChat.tsx
git commit -m "feat: add AI chat panel"
```

---

### Task 12: Translation Panel

**Files:**
- Create: `frontend/src/components/TranslationPanel.tsx`

**Step 1: Create Translation Panel**

```tsx
// frontend/src/components/TranslationPanel.tsx
import { useState } from 'react'
import { paperApi } from '../api/paperApi'

interface TranslationPanelProps {
  paperId: string
}

export default function TranslationPanel({ paperId }: TranslationPanelProps) {
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [loading, setLoading] = useState(false)

  const translate = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const { translation: result } = await paperApi.translate(paperId, text, false)
      setTranslation(result)
    } catch (e) {
      setTranslation('Error: ' + e)
    } finally {
      setLoading(false)
    }
  }

  const translateFull = async () => {
    setLoading(true)
    try {
      const { translation: result } = await paperApi.translate(paperId, undefined, true)
      setTranslation(result)
    } catch (e) {
      setTranslation('Error: ' + e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: 300, borderLeft: '1px solid #ccc', padding: 16, height: '100%', overflow: 'auto' }}>
      <h3>翻译 (Translation)</h3>

      <button onClick={translateFull} disabled={loading} style={{ marginBottom: 16 }}>
        Translate Full Paper
      </button>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to translate..."
        style={{ width: '100%', height: 100, marginBottom: 8 }}
      />

      <button onClick={translate} disabled={loading} style={{ marginBottom: 16 }}>
        Translate
      </button>

      {translation && (
        <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 4 }}>
          <h4>中文翻译:</h4>
          <p>{translation}</p>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/TranslationPanel.tsx
git commit -m "feat: add translation panel"
```

---

### Task 13: Paper Import UI

**Files:**
- Create: `frontend/src/components/ImportDialog.tsx`

**Step 1: Create Import Dialog**

```tsx
// frontend/src/components/ImportDialog.tsx
import { useState, useRef } from 'react'
import { paperApi } from '../api/paperApi'

interface ImportDialogProps {
  onClose: () => void
  onImport: () => void
}

export default function ImportDialog({ onClose, onImport }: ImportDialogProps) {
  const [mode, setMode] = useState<'file' | 'url' | 'arxiv'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [arxivId, setArxivId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    setLoading(true)
    setError('')
    try {
      await paperApi.importPaper(
        mode === 'file' ? file || undefined : undefined,
        mode === 'url' ? url : undefined,
        mode === 'arxiv' ? arxivId : undefined
      )
      onImport()
      onClose()
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400 }}>
        <h2>Import Paper</h2>

        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setMode('file')}>File</button>
          <button onClick={() => setMode('url')}>URL</button>
          <button onClick={() => setMode('arxiv')}>arXiv</button>
        </div>

        {mode === 'file' && (
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
        )}

        {mode === 'url' && (
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="PDF URL"
            style={{ width: '100%' }}
          />
        )}

        {mode === 'arxiv' && (
          <input
            type="text"
            value={arxivId}
            onChange={e => setArxivId(e.target.value)}
            placeholder="arXiv ID (e.g., 2312.12345)"
            style={{ width: '100%' }}
          />
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleImport} disabled={loading}>
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/ImportDialog.tsx
git commit -m "feat: add paper import dialog"
```

---

### Task 14: Complete Paper View Page

**Files:**
- Modify: `frontend/src/pages/PaperView.tsx`

**Step 1: Update PaperView to include all components**

```tsx
// frontend/src/pages/PaperView.tsx
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { paperApi, Paper, TocItem, Annotation } from '../api/paperApi'
import PdfViewer from '../components/PdfViewer'
import AIChat from '../components/AIChat'
import TranslationPanel from '../components/TranslationPanel'

type Tab = 'ai' | 'translate' | 'annotations'

export default function PaperView() {
  const { id } = useParams<{ id: string }>()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab | null>(null)

  useEffect(() => {
    if (!id) return

    Promise.all([
      paperApi.getPaper(id),
      paperApi.getToc(id)
    ]).then(([p, t]) => {
      setPaper(p)
      setToc(t.toc)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading || !paper) return <div>Loading...</div>

  const pdfUrl = `/api/papers/${id}/pdf`

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* TOC Sidebar */}
      <div style={{ width: 200, borderRight: '1px solid #ccc', overflow: 'auto', padding: 8 }}>
        <h3>Table of Contents</h3>
        {toc.length === 0 ? (
          <p>No TOC available</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {toc.map((item, i) => (
              <li key={i} style={{ marginLeft: (item.level - 1) * 16 }}>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PDF Viewer */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <PdfViewer url={pdfUrl} />
      </div>

      {/* Tab Buttons */}
      <div style={{ position: 'absolute', top: 8, right: 320 }}>
        <button onClick={() => setTab(tab === 'ai' ? null : 'ai')}>AI Chat</button>
        <button onClick={() => setTab(tab === 'translate' ? null : 'translate')}>Translate</button>
      </div>

      {/* Side Panel */}
      {tab === 'ai' && id && <AIChat paperId={id} />}
      {tab === 'translate' && id && <TranslationPanel paperId={id} />}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/pages/PaperView.tsx
git commit -m "feat: complete paper view page with all features"
```

---

## Phase 7: Final Integration

### Task 15: Update Library with Import Button

**Files:**
- Modify: `frontend/src/pages/Library.tsx`

**Step 1: Update Library page**

```tsx
// frontend/src/pages/Library.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { paperApi, Paper } from '../api/paperApi'
import ImportDialog from '../components/ImportDialog'

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)

  const loadPapers = () => {
    paperApi.listPapers()
      .then(setPapers)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPapers()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Library</h1>
        <button onClick={() => setShowImport(true)}>+ Import Paper</button>
      </div>

      {papers.length === 0 ? (
        <p>No papers yet. Import your first paper!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          {papers.map(paper => (
            <Link
              key={paper.id}
              to={`/paper/${paper.id}`}
              style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 16,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{paper.title}</h3>
              <p style={{ fontSize: 12, color: '#666' }}>{paper.authors}</p>
            </Link>
          ))}
        </div>
      )}

      {showImport && (
        <ImportDialog
          onClose={() => setShowImport(false)}
          onImport={loadPapers}
        />
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/pages/Library.tsx
git commit -m "feat: update library with import functionality"
```

---

## Plan Complete

The implementation plan is saved to `docs/plans/2026-02-22-paper-reader-implementation-plan.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
