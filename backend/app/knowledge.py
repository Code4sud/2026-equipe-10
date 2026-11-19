"""Base de connaissances : les faits sourcés sur chaque métier.

L'IA n'a le droit de répondre QU'À PARTIR de ces faits. Chaque fait a un identifiant (F1, F2…)
que l'IA doit citer ; le backend vérifie ensuite que les identifiants cités existent vraiment.
"""
import json
from dataclasses import dataclass
from functools import lru_cache

from .config import DATA_FILE

REGION_SUD = {"label": "orientation-regionsud.fr", "url": "https://www.orientation-regionsud.fr"}
APPRENTISSAGE = {"label": "ONISEP · apprentissage", "url": "https://www.onisep.fr"}


@dataclass
class Fact:
    id: str
    text: str
    source: dict


@lru_cache
def _data() -> dict:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def get_metier(metier_id: str) -> dict | None:
    return next((m for m in _data()["metiers"] if m["id"] == metier_id), None)


def facts_for(metier: dict) -> list[Fact]:
    """Transforme la fiche d'un métier en faits numérotés et sourcés."""
    src = {s["label"]: s for s in metier.get("sources", [])}
    onisep_metier = next((s for k, s in src.items() if "fiche métier" in k), {"label": "ONISEP"})
    onisep_form = next((s for k, s in src.items() if "formations" in k), onisep_metier)
    rome = next((s for k, s in src.items() if k.startswith("ROME")), onisep_metier)
    zone = next(z for z in _data()["zones"] if z["numero"] == metier["zoneRapport"])

    facts = [
        Fact("F1", f"Description du métier {metier['nom']} : {metier['pitch']}", onisep_metier),
        Fact("F2", f"Accès au métier en France : {metier['accesFrance']}", onisep_form),
        Fact("F3", f"Dans le Rapport des Possibles, ce métier est en zone {zone['numero']} ({zone['duree']}). "
                   + ("En France, l'accès réel est plus court que ce que la zone laisse penser."
                      if metier.get("plusAccessible") else ""), onisep_form),
    ]
    for i, c in enumerate(metier.get("chemins", []), start=len(facts) + 1):
        facts.append(Fact(f"F{i}", f"Chemin possible « {c['titre']} » : {c['detail']}", onisep_form))
    n = len(facts)
    facts += [
        Fact(f"F{n+1}", "En apprentissage, la formation est gratuite pour l'apprenti et il est rémunéré.", APPRENTISSAGE),
        Fact(f"F{n+2}", "Les formations proches de chez soi et les salaires régionaux se consultent sur "
                        "orientation-regionsud.fr, la base utilisée sur la borne du Centre des Possibles.", REGION_SUD),
        Fact(f"F{n+3}", f"Les compétences et conditions de travail du métier {metier['nom']} sont décrites "
                        "dans la fiche ROME correspondante.", rome),
    ]
    for f in metier.get("formations", []):
        n = len(facts)
        facts.append(Fact(f"F{n+1}", f"Formation {f['intitule']} à {f['etablissement']}, {f['ville']}"
                                     + (" (en apprentissage)" if f.get("apprentissage") else ""), f["source"]))
    return facts
