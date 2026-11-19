"""Base de connaissances : les faits sourcés sur chaque métier, tirés de l'open data ONISEP.

L'IA n'a le droit de répondre QU'À PARTIR de ces faits. Chaque fait a un identifiant (F1, F2…)
que l'IA doit citer ; le backend vérifie ensuite que les identifiants cités existent vraiment.
Données : backend/data/onisep.json, généré par scripts/build_onisep.py (1 138 fiches métiers).
"""
import json
from dataclasses import dataclass
from functools import lru_cache

from .config import DATA_FILE

REGION_SUD = {"label": "orientation-regionsud.fr", "url": "https://www.orientation-regionsud.fr"}
APPRENTISSAGE = {"label": "ONISEP · apprentissage", "url": "https://www.onisep.fr"}
ONISEP_AF = {"label": "ONISEP · actions de formation (open data)",
             "url": "https://www.data.gouv.fr/datasets/ideo-actions-de-formation-initiale-univers-lycee"}
LBA = "https://labonnealternance.apprentissage.beta.gouv.fr/recherche?romes={}&lat=43.6969&lon=7.2706&radius=30&address=Nice"
ZONES = {1: "0 à 6 mois de préparation", 2: "3 mois à 2 ans", 3: "1 à 4 ans", 4: "2 à 6 ans", 5: "4 à 10 ans"}


@dataclass
class Fact:
    id: str
    text: str
    source: dict


@lru_cache
def _fiches() -> dict:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def get_metier(metier_id: str) -> dict | None:
    return _fiches().get(metier_id)


def nom(fiche: dict) -> str:
    return fiche["nom"].replace("/", "·")


def onisep(fiche: dict) -> dict:
    return {"label": "ONISEP · fiche métier", "url": fiche["url"]}


def facts_for(fiche: dict, zone: int | None = None) -> list[Fact]:
    """Transforme une fiche ONISEP en faits numérotés et sourcés."""
    src = onisep(fiche)
    textes = [
        f"Ce que fait un·e {nom(fiche)} : {fiche['accroche'] or fiche['description']}",
        f"Niveau d'accès minimal selon l'ONISEP : {fiche['niveauMin']}." if fiche.get("niveauMin") else "",
        f"Accès au métier : {fiche['accesIntro']}" if fiche.get("accesIntro") else "",
    ]
    textes += [f"Chemin « {c['titre']} » : {' ; '.join(c['items'])}." for c in fiche.get("chemins", [])]
    if fiche.get("formationsMin"):
        textes.append("Exemples de formations minimales requises : " + " ; ".join(fiche["formationsMin"][:4]) + ".")
    if fiche.get("conditions"):
        textes.append(f"Conditions de travail : {fiche['conditions']}")
    if fiche.get("competences"):
        textes.append(f"Qualités et compétences utiles : {fiche['competences']}")
    if zone in ZONES:
        rang = fiche.get("niveauRang")
        plus_court = bool(rang) and rang < zone
        textes.append(f"Dans le Rapport des Possibles, ce métier est en zone {zone} ({ZONES[zone]}). "
                      + ("D'après l'ONISEP, l'accès réel en France est plus court que ce que la zone laisse penser." if plus_court else ""))

    facts = [Fact(f"F{i}", t, src) for i, t in enumerate([t for t in textes if t], start=1)]
    p = fiche.get("proches")
    if p and p.get("liste"):
        ex = " ; ".join(f"{x['f']} ({x['e']}, {x['v']}, {x['km']} km de Nice)" for x in p["liste"][:4])
        combien = (f"{p['dep06']} formation(s) dans les Alpes-Maritimes et {p['region']} en région Sud"
                   if p["dep06"] else f"aucune formation dans les Alpes-Maritimes, {p['region']} en région Sud")
        facts.append(Fact(f"F{len(facts)+1}", f"Formations qui mènent à ce métier près de Nice (données ONISEP, hors apprentissage) : {combien}. "
                                                f"Les plus proches : {ex}.", ONISEP_AF))
    else:
        facts.append(Fact(f"F{len(facts)+1}", "Les données ONISEP ne recensent pas de formation menant à ce métier en région Sud "
                                                "(hors apprentissage).", ONISEP_AF))
    facts.append(Fact(f"F{len(facts)+1}", "Les offres et les formations en apprentissage autour de Nice sont sur La bonne alternance, le service public de l'apprentissage.",
                      {"label": "La bonne alternance", "url": LBA.format(",".join(fiche.get("romeV3") or []))}))
    n = len(facts)
    facts += [
        Fact(f"F{n+1}", "En apprentissage, la formation est gratuite pour l'apprenti et il est rémunéré.", APPRENTISSAGE),
        Fact(f"F{n+2}", "Les formations proches de chez soi et les salaires régionaux se consultent sur "
                        "orientation-regionsud.fr, la base utilisée sur la borne du Centre des Possibles.", REGION_SUD),
    ]
    return facts
