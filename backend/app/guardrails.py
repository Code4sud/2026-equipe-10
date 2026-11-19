"""Garde-fous appliqués à CHAQUE réponse de l'IA, avant qu'elle n'arrive au jeune.

Règle 2 du hackathon : pas de verdict, aucune porte ne se ferme.
Règle « pas d'invention » : aucun chiffre de salaire, aucune affirmation sans source.
"""
import re
import unicodedata


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


# Formulations qui jugent la personne ou ferment une porte.
VERDICT_PATTERNS = [
    r"pas fait(e)? pour toi", r"pas pour toi", r"impossible pour toi", r"tu n.?as pas le niveau",
    r"tu n.?y arriveras", r"tu ne pourras (jamais|pas)", r"ce n.?est pas (possible|realiste) pour toi",
    r"abandonne", r"laisse tomber", r"trop difficile pour toi", r"aucune chance",
    r"je te (recommande|conseille) (ce|le|la|plutot)", r"le meilleur (choix|metier) pour toi",
    r"tu devrais (choisir|faire|plutot)", r"(fait|faite) pour toi",
    r"\b\d{1,3} ?%", r"\bscore\b", r"\bnote(r)? (de|sur) \d", r"classement",
]
# Chiffres de salaire : interdits tant qu'aucune source vérifiée ne les fournit.
SALARY_PATTERN = r"(\d[\d\s.,]*\s?(€|euros?|k€))|(smic)"


def find_verdict(text: str) -> str | None:
    t = _norm(text)
    for p in VERDICT_PATTERNS:
        m = re.search(p, t)
        if m:
            return m.group(0)
    return None


def has_salary_figure(text: str) -> bool:
    return re.search(SALARY_PATTERN, _norm(text)) is not None


SAFE_FALLBACK = (
    "Je préfère ne pas te répondre de travers. Ce que je peux te dire : aucune note ni aucun résultat "
    "ne ferme la porte d'un métier, il y a souvent plusieurs chemins pour y arriver. "
    "C'est une très bonne question à poser à ton psychologue au Centre."
)
