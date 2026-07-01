"""
FastAPI application — main entrypoints.
"""
from __future__ import annotations

import uuid
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel

from agents.blueprint_gen import generate_blueprint, generate_followup_answer
from rag.vector_store import get_store

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Startup Blueprint Generator API",
    version="1.0.0",
    description="Converts a plain-language startup idea into a structured blueprint using IBM Granite RAG.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store {session_id: {idea, blueprint}}
_sessions: Dict[str, Dict[str, Any]] = {}


# ---------------------------------------------------------------------------
# Startup event — pre-warm the FAISS index
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    print("[main] Pre-warming FAISS vector store...")
    get_store()
    print("[main] Vector store ready.")


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class GenerateRequest(BaseModel):
    idea: str
    session_id: Optional[str] = None


class FollowUpRequest(BaseModel):
    session_id: str
    question: str


class ExportRequest(BaseModel):
    session_id: str
    format: str  # "pdf" or "docx"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "service": "Startup Blueprint Generator"}


@app.post("/api/generate")
async def generate(req: GenerateRequest):
    """
    Generate a full startup blueprint from a free-text idea.
    Returns the blueprint JSON and a session_id for follow-ups.
    """
    if not req.idea.strip():
        raise HTTPException(status_code=400, detail="Idea cannot be empty.")

    session_id = req.session_id or str(uuid.uuid4())

    try:
        blueprint = generate_blueprint(req.idea.strip())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Blueprint generation failed: {str(exc)}")

    _sessions[session_id] = {
        "idea": req.idea.strip(),
        "blueprint": blueprint,
    }

    return {
        "session_id": session_id,
        "blueprint": blueprint,
    }


@app.post("/api/followup")
async def followup(req: FollowUpRequest):
    """
    Answer a follow-up question in the context of an existing session.
    """
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Generate a blueprint first.")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        answer = generate_followup_answer(
            question=req.question.strip(),
            idea=session["idea"],
            blueprint=session["blueprint"],
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Follow-up failed: {str(exc)}")

    return {"answer": answer}


@app.post("/api/export")
async def export_blueprint(req: ExportRequest):
    """
    Export the blueprint as PDF or DOCX.
    """
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    fmt = req.format.lower()
    if fmt not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'docx'.")

    blueprint = session["blueprint"]
    idea_slug = "".join(c if c.isalnum() else "_" for c in blueprint.get("idea", "blueprint")[:30])

    try:
        if fmt == "docx":
            from exporters.docx_exporter import export_docx
            content = export_docx(blueprint)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"blueprint_{idea_slug}.docx"
        else:
            from exporters.pdf_exporter import export_pdf
            content = export_pdf(blueprint)
            media_type = "application/pdf"
            filename = f"blueprint_{idea_slug}.pdf"
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(exc)}")

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Retrieve an existing blueprint session."""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"session_id": session_id, "blueprint": session["blueprint"]}
