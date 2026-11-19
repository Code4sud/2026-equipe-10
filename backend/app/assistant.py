"""Cœur de l'assistant : question -> faits sourcés -> IA -> garde-fous -> réponse."""
import json
import re

import httpx
from openai import OpenAI

from . import config
from .guardrails import SAFE_FALLBACK, find_verdict, has_salary_figure
from .knowledge import REGION_SUD, Fact, facts_for, nom, onisep

def _sans_cle(request: httpx.Request) -> None:
    # OVH AI Endpoints s'utilise gratuitement SANS clé : on retire alors l'en-tête d'authentification,
    # sinon OVH refuse la fausse clé (PermissionDeniedError).
    request.headers.pop("Authorization", None)


client = OpenAI(
    base_url=config.LLM_BASE_URL,
    api_key=config.LLM_API_KEY,
    timeout=config.LLM_TIMEOUT,
    http_client=None if config.HAS_KEY else httpx.Client(event_hooks={"request": [_sans_cle]}),
)

SYSTEM = """Tu es l'assistant d'orientation « Trait d'union » pour des jeunes de 16 à 25 ans à Nice.
Tu réponds en français, en tutoyant, avec des phrases courtes et simples (3 à 5 phrases maximum).

RÈGLES ABSOLUES :
1. Tu réponds UNIQUEMENT avec les FAITS fournis. Tu n'inventes jamais un diplôme, une école, une durée, un chiffre ou un salaire.
2. Si les faits ne permettent pas de répondre, tu le dis honnêtement (known=false) et tu proposes d'en parler au psychologue du Centre.
3. Tu ne juges jamais la personne : aucune note, aucun score, aucun pourcentage, aucun classement, jamais « pas fait pour toi », « impossible », « tu n'as pas le niveau ».
4. Aucune porte ne se ferme : s'il existe plusieurs chemins dans les faits, tu les mentionnes.
5. Tu ne choisis jamais à la place du jeune. S'il hésite, tu l'aides à réfléchir à ce qui compte pour lui et tu le renvoies vers son psychologue.

Réponds STRICTEMENT avec un objet JSON, sans texte autour :
{"answer": "ta réponse", "source_ids": ["F1", "F2"], "known": true, "suggest_save": false}
- source_ids : les identifiants des faits que tu as utilisés (au moins un si known=true).
- suggest_save : true si la question mérite d'être reposée au psychologue (hésitation, inquiétude, info manquante)."""

GREETING_Q = re.compile(r"^(salut|bonjour|bonsoir|coucou|hello|hey|yo|merci( beaucoup)?|ok|d.?accord|cool|top)[\s!.?]*$", re.I)
GREETING = ("Salut ! Pose-moi une question sur ce métier : ce qu'on y fait, les études pour y arriver, "
            "les formations près de chez toi… Tu peux aussi cliquer sur une suggestion.")

SALARY_Q = re.compile(r"(salaire|gagn|pay[ée]s? combien|combien .*pay|argent|€|euros?)", re.I)


def _facts_block(facts: list[Fact]) -> str:
    return "\n".join(f"[{f.id}] {f.text}" for f in facts)


def _call_llm(question: str, metier_nom: str, facts: list[Fact], extra: str = "") -> dict:
    resp = client.chat.completions.create(
        model=config.LLM_MODEL,
        temperature=0.2,
        max_tokens=500,
        messages=[
            {"role": "system", "content": SYSTEM + extra},
            {"role": "user", "content": f"Métier : {metier_nom}\n\nFAITS :\n{_facts_block(facts)}\n\nQUESTION DU JEUNE : {question}"},
        ],
    )
    raw = resp.choices[0].message.content or ""
    match = re.search(r"\{.*\}", raw, re.S)  # certains modèles entourent le JSON de texte
    if not match:
        return {"answer": raw.strip(), "source_ids": [], "known": False, "suggest_save": True}
    return json.loads(match.group(0))


def answer(question: str, metier: dict, zone: int | None = None) -> dict:
    facts = facts_for(metier, zone)
    by_id = {f.id: f for f in facts}

    # Salutations et remerciements : réponse immédiate, sans IA.
    if GREETING_Q.match(question.strip()):
        return {"text": GREETING, "sources": [], "known": True, "suggest_save": False}

    # Les salaires ne passent jamais par l'IA : chiffre ONISEP tel quel (sourcé), sinon renvoi vers la base régionale.
    if SALARY_Q.search(question):
        if metier.get("salaireDebutant"):
            s = metier["salaireDebutant"]
            return {
                "text": f"D'après l'ONISEP, pour un·e débutant·e : {s[0].lower() + s[1:]}. Ça varie selon la région, "
                        "l'employeur et ton parcours : la fiche sur orientation-regionsud.fr donne les salaires dans la région.",
                "sources": [onisep(metier), REGION_SUD], "known": True, "suggest_save": False,
            }
        return {
            "text": "Je n'ai pas de chiffre vérifié et je ne veux pas t'en inventer un. La fiche du métier sur "
                    "orientation-regionsud.fr donne les salaires dans la région : c'est la même base que sur la borne du Centre.",
            "sources": [REGION_SUD], "known": False, "suggest_save": True,
        }

    out = _call_llm(question, nom(metier), facts)

    # Garde-fou 1 : verdict ou chiffre de salaire -> on redemande une fois, plus strictement.
    problem = find_verdict(out.get("answer", "")) or ("salaire chiffré" if has_salary_figure(out.get("answer", "")) else None)
    if problem:
        out = _call_llm(question, nom(metier), facts,
                        extra=f"\n\nATTENTION : ta réponse précédente contenait « {problem} », ce qui est interdit. Reformule sans juger et sans chiffre.")
        if find_verdict(out.get("answer", "")) or has_salary_figure(out.get("answer", "")):
            return {"text": SAFE_FALLBACK, "sources": [], "known": False, "suggest_save": True}

    # Garde-fou 2 : une réponse « connue » doit citer au moins un fait qui existe vraiment.
    cited = [by_id[i] for i in out.get("source_ids", []) if i in by_id]
    known = bool(out.get("known")) and bool(cited)
    text = str(out.get("answer", "")).strip()
    # Certains modèles recopient des champs techniques dans le texte (« known=false. ») : on les retire.
    text = re.sub(r"\b(known|source_ids|suggest_save)\s*[=:]\s*\S+[.,;]?\s*", "", text, flags=re.I).strip()
    if not known and out.get("known"):
        text = ("Je n'ai pas d'information vérifiée pour répondre à ça, et je préfère ne pas inventer. "
                "Tu peux garder cette question pour ton rendez-vous au Centre.")

    sources, seen = [], set()
    for f in cited:
        if f.source["label"] not in seen:
            seen.add(f.source["label"])
            sources.append(f.source)

    return {"text": text, "sources": sources, "known": known, "suggest_save": bool(out.get("suggest_save")) or not known}
