# Paper-Reader Design Document

**Project**: Paper-Reader — Academic PDF Reader/Viewer
**Date**: 2026-02-22
**Status**: Approved

---

## 1. Architecture Overview

**Frontend**: React + TypeScript + PDF.js for PDF rendering and annotations
**Backend**: Python FastAPI for API endpoints, PDF processing, AI integration
**Storage**: Local file system (papers stored in app data directory)
**Metadata**: SQLite (local) for paper metadata, annotations, citations
**AI Integration**: Unified interface supporting external APIs (OpenAI, Claude) and local models (Ollama)

**High-Level Flow:**
```
User uploads PDF → Backend processes → Stores in local folder + extracts metadata
User views PDF → Frontend renders via PDF.js
User asks AI → Backend proxies to AI service → Returns explanation
```

---

## 2. Components

### Frontend (React)
- **PDF Viewer Component**: Renders PDFs using PDF.js, supports zoom, pan, page navigation
- **TOC Sidebar**: Displays table of contents extracted from PDF
- **Annotation Panel**: Highlights, notes, color-coded annotations
- **AI Chat Panel**: Interface to ask questions about the paper, view AI responses
- **Library View**: Grid/list of all imported papers with search/filter
- **Paper Detail View**: Metadata display, citations, references
- **Translation Panel**: Display Chinese translations

### Backend (FastAPI)
- **PDF Processor**: Extracts text, metadata, TOC, citations using libraries (PyMuPDF, pdfplumber)
- **AI Service**: Unified adapter for external APIs (Claude, OpenAI) and local models (Ollama)
- **Translation Service**: Uses AI to translate English to Chinese
- **File Manager**: Handles local file storage, organization
- **Citation Extractor**: Parses references/bibliography from papers
- **Import Service**: Handles downloads from URL, arXiv ID, DOI

### Data Storage (Local)
- `/papers/` — PDF files organized by paper ID
- `/metadata/` — SQLite database for metadata, citations, references
- `/annotations/` — JSON files for highlights and notes per paper
- `/config.json` — App settings (API keys, preferences)

---

## 3. Data Flow

### Paper Import Flow
```
1. User selects input (file upload / arXiv URL / arXiv ID / DOI)
2. Frontend sends to backend via REST API
3. Backend:
   - Downloads PDF if URL/ID provided
   - Saves PDF to local storage (/papers/{paper_id}.pdf)
   - Extracts metadata using PyMuPDF/pdfplumber
   - Generates paper_id (hash of DOI or UUID)
4. Backend returns paper metadata to frontend
5. Frontend displays in library view
```

### AI Explanation Flow
```
1. User types question in AI Chat Panel
2. Frontend sends question + paper context to backend
3. Backend:
   - Loads paper text (relevant pages or full text)
   - Constructs prompt with user question + paper content
   - Sends to configured AI service (API or local model)
4. AI returns response
5. Backend returns response to frontend
6. Frontend displays in chat
```

### Translation Flow
```
1. User selects text or clicks "Translate Full Paper"
2. Frontend sends to backend
3. Backend sends to AI with translation prompt
4. Returns Chinese translation
5. Frontend displays translation (tooltip, sidebar, or overlay)
```

### Annotation Flow
```
1. User selects text in PDF viewer → chooses highlight color/note
2. Frontend stores annotation locally (coordinates, text, color)
3. On save: frontend sends to backend → saves to /annotations/{paper_id}.json
4. Annotations persist across sessions
```

---

## 4. Error Handling

### Import Errors
- **Invalid URL/DOI**: Return clear error message, suggest checking format
- **Download failed**: Retry with timeout, show error if persistent
- **Corrupted PDF**: Detect during processing, show "Unable to parse PDF"
- **Duplicate paper**: Warn user, offer to view existing or replace

### AI Service Errors
- **API key missing**: Prompt user to configure in settings
- **API rate limit**: Show warning, suggest using local model or waiting
- **API timeout**: Retry once, then show error with retry button
- **Local model not running**: Detect and prompt to start Ollama

### File Storage Errors
- **Disk full**: Warn user before import fails
- **Permission denied**: Guide user to check folder permissions
- **File not found**: Handle gracefully if paper file deleted externally

---

## 5. Testing Strategy

### Unit Tests (Backend)
- PDF metadata extraction functions
- AI service adapter (mock responses)
- File manager (save/load/delete)
- Citation parser

### Integration Tests
- Full import flow (mock PDF or use sample)
- AI explanation flow (mock AI or use test key)
- Annotation save/load cycle

### Frontend Tests
- Component rendering (React Testing Library)
- User flows (Playwright for E2E if needed)

---

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /papers/import | Import paper (file, url, arxiv_id, doi) |
| GET | /papers/ | List all papers |
| GET | /papers/{id} | Get paper metadata |
| GET | /papers/{id}/pdf | Stream PDF file |
| GET | /papers/{id}/toc | Get table of contents |
| POST | /papers/{id}/ai/query | Ask AI about paper |
| POST | /papers/{id}/translate | Translate paper (selection or full) |
| GET | /annotations/{paper_id} | Get annotations |
| POST | /annotations/{paper_id} | Save annotations |
| GET | /config | Get settings |
| PUT | /config | Update settings (API keys, etc.) |

---

## 7. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + PDF.js |
| Backend | Python FastAPI |
| Database | SQLite (local) |
| PDF Processing | PyMuPDF, pdfplumber |
| AI Integration | OpenAI SDK, Anthropic SDK, Ollama |
| File Storage | Local filesystem |

---

*This design document is approved and ready for implementation.*
