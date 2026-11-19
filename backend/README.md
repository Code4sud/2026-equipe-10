# Backend · API de l'assistant

FastAPI + IA compatible OpenAI. Par défaut : **OVHcloud AI Endpoints** (hébergé dans l'UE, modèles open weight).
Reçoit seulement `question` + `metier_id`. Aucun rapport, aucune donnée personnelle, rien n'est stocké.

## Lancer en local (Windows / PowerShell)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```
Tester : http://localhost:8000/api/health puis http://localhost:8000/docs

Brancher le front : dans le `.env` à la racine, `VITE_API_URL=http://localhost:8000`, puis relancer `npm run dev`.

## Vérifier
- `python -m pytest -q` : tests sans réseau (IA simulée), dont les garde-fous anti-verdict.
- `python eval_pieges.py` : 12 questions sur la vraie IA, dont des pièges. Le score sert pour le pitch.

## Changer de fournisseur d'IA (`backend/.env`)
| Fournisseur | LLM_BASE_URL | Remarque |
|---|---|---|
| OVHcloud (défaut) | https://oai.endpoints.kepler.ai.cloud.ovh.net/v1 | UE, open weight, gratuit avec débit limité |
| Mistral | https://api.mistral.ai/v1 | offre gratuite : désactiver l'entraînement dans la console |
| Ollama (local) | http://localhost:11434/v1 | 100 % sur la machine |

## Comment l'assistant évite d'inventer
1. La fiche du métier est découpée en **faits numérotés et sourcés** (`app/knowledge.py`).
2. L'IA ne reçoit que ces faits et doit citer leurs numéros.
3. Le backend vérifie que les numéros existent : sinon, réponse « je ne sais pas ».
4. Filtre anti-verdict et anti-salaire inventé (`app/guardrails.py`) : une reformulation, sinon réponse prudente.
5. Les questions de salaire ne passent jamais par l'IA.
