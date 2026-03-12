from pypdf import PdfReader


def process_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file and return as a single string."""
    reader = PdfReader(pdf_path)
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text.strip())
    return "\n\n".join(parts)


def get_context(text: str, query: str, max_chars: int = 3000) -> str:
    """Return the most query-relevant chunk of PDF text (keyword scored)."""
    if len(text) <= max_chars:
        return text

    chunk_size = 1500
    overlap = 300
    chunks = [text[i: i + chunk_size] for i in range(0, len(text), chunk_size - overlap)]
    if not chunks:
        return text[:max_chars]

    query_words = set(query.lower().split())
    best = max(chunks, key=lambda c: sum(1 for w in query_words if w in c.lower()))
    return best
