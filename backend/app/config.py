"""Configuration lue dans les variables d'environnement (fichier backend/.env en local)."""
import os
from pathlib import Path

try:  # charge backend/.env s'il existe, sans dépendance supplémentaire
    for line in (Path(__file__).resolve().parent.parent / ".env").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())
except FileNotFoundError:
    pass

# Fournisseur d'IA compatible OpenAI. Par défaut : OVHcloud AI Endpoints (UE, modèles open weight).
#  - OVH     : https://oai.endpoints.kepler.ai.cloud.ovh.net/v1   (clé facultative, débit limité sans clé)
#  - Mistral : https://api.mistral.ai/v1                          (désactiver l'entraînement dans la console)
#  - Ollama  : http://localhost:11434/v1                          (100 % local)
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1")
HAS_KEY = bool(os.getenv("LLM_API_KEY", "").strip())
LLM_API_KEY = os.getenv("LLM_API_KEY", "").strip() or "sans-cle"
LLM_MODEL = os.getenv("LLM_MODEL", "Mistral-Small-3.2-24B-Instruct-2506")
LLM_TIMEOUT = float(os.getenv("LLM_TIMEOUT", "60"))
DEBUG = os.getenv("DEBUG", "").strip() in ("1", "true", "oui")

# Origines autorisées à appeler l'API (le front local et GitHub Pages).
CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,https://code4sud.github.io"
).split(",") if o.strip()]

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "onisep.json"
