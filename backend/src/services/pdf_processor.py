import fitz  # PyMuPDF
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from collections import Counter


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
    """Extract table of contents from PDF.

    First tries to get TOC from PDF bookmarks.
    If empty, automatically extracts headings from content.
    """
    doc = fitz.open(file_path)
    toc = doc.get_toc()

    # If PDF has bookmarks, use them
    if toc:
        doc.close()
        return [
            {"level": level, "title": title, "page": page}
            for level, title, page in toc
        ]

    # Otherwise, extract headings from content
    headings = extract_headings_from_content(doc)
    doc.close()

    return headings


def extract_headings_from_content(doc: fitz.Document) -> List[Dict]:
    """Extract headings from PDF content based on font sizes."""

    # Collect all text blocks with their font sizes
    font_sizes: List[Tuple[int, str, int, float]] = []  # (font_size, text, page_num, y_pos)

    for page_num, page in enumerate(doc):
        blocks = page.get_text("dict")["blocks"]

        for block in blocks:
            if "lines" not in block:
                continue

            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if not text or len(text) < 3:
                        continue

                    font_size = span["size"]
                    # Filter out very small or very large font sizes
                    if 8 <= font_size <= 40:
                        font_sizes.append((font_size, text, page_num + 1, block.get("bbox", [0, 0, 0, 0])[1]))

    if not font_sizes:
        return []

    # Find the most common font sizes (likely body text and headings)
    size_counter = Counter([fs[0] for fs in font_sizes])
    most_common_sizes = size_counter.most_common(10)

    # The body text is usually the most common size
    body_font_size = most_common_sizes[0][0] if most_common_sizes else 12

    # Headings are typically 1.2x or larger than body text
    heading_threshold = body_font_size * 1.15

    # Common heading keywords
    heading_keywords = [
        "abstract", "introduction", "related work", "background", "method",
        "methodology", "approach", "experiment", "evaluation", "results",
        "discussion", "conclusion", "future work", "references", "appendix",
        "chapter", "section", "overview", "summary", "motivation", "problem",
        "solution", "implementation", "analysis", "comparison", "benchmark"
    ]

    # Find potential headings
    potential_headings: List[Tuple[float, str, int]] = []  # (importance, title, page)

    for font_size, text, page_num, y_pos in font_sizes:
        if font_size >= heading_threshold:
            # Check if text looks like a heading
            text_lower = text.lower().strip()

            # Skip if it's too long (probably not a heading)
            if len(text) > 100:
                continue

            # Calculate importance score
            importance = font_size

            # Boost score for heading keywords at the beginning
            for keyword in heading_keywords:
                if text_lower.startswith(keyword):
                    importance += 5
                    break

            potential_headings.append((importance, text, page_num))

    # Sort by importance and page number
    potential_headings.sort(key=lambda x: (x[2], -x[0]))

    # Remove duplicates (same text on same page)
    seen = set()
    unique_headings = []
    for importance, title, page in potential_headings:
        key = (title.lower()[:30], page)
        if key not in seen:
            seen.add(key)
            unique_headings.append((importance, title, page))

    # Convert to TOC format
    # Determine levels based on font size
    if not unique_headings:
        return []

    # Group headings by approximate font size into levels
    font_size_groups: Dict[float, List] = {}
    for importance, title, page in unique_headings:
        # Find the original font size
        for fs, text, pn, _ in font_sizes:
            if text == title and pn == page:
                if fs not in font_size_groups:
                    font_size_groups[fs] = []
                font_size_groups[fs].append((title, page))
                break

    # Sort by font size (largest = level 1)
    sorted_sizes = sorted(font_size_groups.keys(), reverse=True)

    toc = []
    level = 1
    for size in sorted_sizes:
        for title, page in font_size_groups[size]:
            toc.append({
                "level": level,
                "title": title[:100],  # Truncate long titles
                "page": page
            })
        level = min(level + 1, 3)  # Max 3 levels

    # Sort by page number
    toc.sort(key=lambda x: (x["page"], x["level"]))

    return toc


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
