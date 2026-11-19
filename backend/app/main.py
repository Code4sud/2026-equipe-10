"""API FastAPI de l'assistant « Explore tes possibles ».

Données reçues : la question et l'identifiant du métier. Jamais le rapport ni une donnée personnelle.
Rien n'est enregistré côté serveur.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import config
from .assistant import answer
from .knowledge import get_metier

app = FastAPI(title="Explore tes possibles · API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["GET", "POST"], allow_headers=["*"])


class ChatIn(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    metier_id: str = Field(min_length=1, max_length=80)
    metier_nom: str | None = None
    zone: int | None = Field(default=None, ge=1, le=5)


class ChatOut(BaseModel):
    text: str
    sources: list[dict]
    known: bool
    suggest_save: bool


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "model": config.LLM_MODEL, "provider": config.LLM_BASE_URL}


@app.post("/api/chat", response_model=ChatOut)
def chat(body: ChatIn) -> ChatOut:
    metier = get_metier(body.metier_id)
    if metier is None:
        raise HTTPException(404, "Métier inconnu")
    try:
        return ChatOut(**answer(body.question, metier, body.zone))
    except Exception as exc:  # IA indisponible : le front bascule tout seul en mode démo
        raise HTTPException(503, f"Assistant indisponible : {type(exc).__name__}") from exc
