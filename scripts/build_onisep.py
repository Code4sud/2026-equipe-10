"""Construit les données métiers de l'app à partir de l'open data ONISEP (Idéo-Fiches métiers).

Entrée  : le XML « Ideo-Fiches metiers.xml » (data.gouv.fr, Licence Ouverte).
Sorties : public/data/metiers-index.json   (recherche + reconnaissance du PDF, côté navigateur)
          public/data/fiches/<id>.json      (une fiche par métier, chargée à la demande)
          backend/data/onisep.json          (faits sourcés pour l'assistant)

Usage : python scripts/build_onisep.py "private/data/raw/Ideo-Fiches metiers.xml"
"""
import html, json, re, sys, unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Rang de niveau, aligné sur les zones du Rapport des Possibles (1 = le plus court).
RANG = {"sans diplôme": 1, "3E": 1, "diplôme national du brevet": 1, "CAP ou équivalent": 2,
        "CAP ou équivalent + 1 an": 2, "bac ou équivalent": 3, "bac + 1": 3, "bac + 2": 3,
        "bac + 3": 4, "bac + 4": 4, "bac + 5": 5, "bac + 6": 5, "bac + 7": 5, "bac + 8": 5, "bac + 9 et plus": 5}
TITRE_CHEMIN = re.compile(r"^(après (la )?\S.*|niveau .*|sans diplôme.*|en formation continue.*)$", re.I)


def texte(fragment: str | None) -> str:
    """HTML ONISEP -> texte simple."""
    if not fragment:
        return ""
    t = re.sub(r"<(br|/p|/li|/h\d)[^>]*>", "\n", fragment)
    t = html.unescape(re.sub(r"<[^>]+>", "", t))
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", t)).strip()


def paragraphes(fragment: str | None) -> list[str]:
    return [l.strip() for l in texte(fragment).split("\n") if l.strip()]


def court(s: str, n: int) -> str:
    return s if len(s) <= n else s[: s.rfind(" ", 0, n)] + "…"


def slug(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def acces(fragment: str | None) -> tuple[str, list[dict]]:
    """Sépare l'intro et les chemins (« Après la 3e » : [CAP…], « Niveau bac + 2 » : [BTS…])."""
    intro, chemins, cur = [], [], None
    for p in paragraphes(fragment):
        if len(p) < 40 and TITRE_CHEMIN.match(p):
            cur = {"titre": p, "items": []}
            chemins.append(cur)
        elif cur is not None and len(p) < 220:
            cur["items"].append(p)
        elif not chemins:
            intro.append(p)
    return " ".join(intro), [c for c in chemins if c["items"]]


def salaire(fragment: str | None) -> str:
    lignes = paragraphes(fragment)
    for i, l in enumerate(lignes):
        if l.lower().startswith("salaire du débutant") and i + 1 < len(lignes):
            return lignes[i + 1]
    return ""


def main(xml_path: str) -> None:
    root = ET.parse(xml_path).getroot()
    index, fiches = [], {}
    for m in root.findall("metier"):
        mid = m.findtext("identifiant")
        nom = m.findtext("nom_metier").strip()
        syn = sorted({n.strip() for s in m.findall("synonymes/synonyme")
                      for n in (s.findtext("nom_metier"), s.findtext("libelle_masculin"), s.findtext("libelle_feminin")) if n})
        syn += [x for x in (m.findtext("libelle_masculin"), m.findtext("libelle_feminin")) if x and x not in syn and x != nom]
        niv = (m.findtext("niveau_acces_min/libelle") or "").strip()
        intro, chemins = acces(m.findtext("acces_metier"))
        fiche = {
            "id": mid, "nom": nom, "synonymes": syn,
            "url": f"https://www.onisep.fr/http/redirection/metier/slug/{mid}",
            "accroche": court(texte(m.findtext("accroche_metier")), 400),
            "description": court(texte(m.findtext("format_court")), 700),
            "niveauMin": niv, "niveauRang": RANG.get(niv),
            "accesIntro": court(intro, 600), "chemins": chemins[:5],
            "formationsMin": [f.findtext("libelle") for f in m.findall("formations_min_requise/formation_min_requise")][:6],
            "salaireDebutant": salaire(m.findtext("vie_professionnelle")),
            "conditions": court(texte(m.findtext("condition_travail")), 500),
            "competences": court(texte(m.findtext("competences")), 500),
            "centresInteret": [c.findtext("libelle") for c in m.findall("centres_interet/centre_interet")],
            "romeV3": [r.text for r in m.findall("romesV3/romeV3") if r.text],
        }
        fiches[mid] = fiche
        index.append({"id": mid, "nom": nom, "syn": syn, "niv": niv, "a": court(fiche["accroche"], 140),
                      "ci": fiche["centresInteret"]})

    index.sort(key=lambda x: slug(x["nom"]))
    pub = ROOT / "public" / "data"
    (pub / "fiches").mkdir(parents=True, exist_ok=True)
    (pub / "metiers-index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    for mid, f in fiches.items():
        (pub / "fiches" / f"{mid}.json").write_text(json.dumps(f, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (ROOT / "backend" / "data" / "onisep.json").write_text(json.dumps(fiches, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    avec = sum(1 for f in fiches.values() if f["chemins"])
    print(f"{len(fiches)} métiers ONISEP · {avec} avec chemins d'accès · "
          f"{sum(1 for f in fiches.values() if f['salaireDebutant'])} avec salaire débutant")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "private/data/raw/Ideo-Fiches metiers.xml"))
