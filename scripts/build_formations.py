"""Formations près de Nice pour chaque métier, à partir de l'open data ONISEP (licence ouverte Etalab).

Entrées (à télécharger sur data.gouv.fr, à NE PAS mettre dans le dépôt) :
  - Idéo-Actions de formation initiale-Univers lycée (xlsx)
  - Idéo-Actions de formation initiale-Univers enseignement supérieur (xlsx)
  - Idéo-Fiches métiers (xml), pour savoir quelles formations (FOR.xxx) mènent à chaque métier.

Sortie : ajoute un champ « proches » à public/data/fiches/MET.xxx.json et à backend/data/onisep.json.
On ne garde que la région Provence-Alpes-Côte d'Azur. Distance à vol d'oiseau depuis Nice.
À lancer APRÈS scripts/build_onisep.py :
  python scripts/build_formations.py "Ideo-Fiches metiers.xml" lycee.xlsx superieur.xlsx
"""
import json
import math
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
REGION = "Provence-Alpes-Côte d'Azur"
NICE = (43.6969, 7.2706)  # place Masséna
MAX = 8  # formations affichées par métier


def km(lat: float, lon: float) -> int:
    p1, p2 = math.radians(NICE[0]), math.radians(lat)
    dp, dl = p2 - p1, math.radians(lon - NICE[1])
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(6371 * 2 * math.asin(math.sqrt(a)))


def cout(c: str | None) -> str:
    """« 5648 euros en 2025 (gratuit en apprentissage) » -> gardé tel quel, raccourci."""
    if not c:
        return ""
    c = c.strip()
    return c if len(c) <= 90 else c[:87].rsplit(" ", 1)[0] + "…"


def lire(path: str) -> list[dict]:
    ws = openpyxl.load_workbook(path, read_only=True).active
    it = ws.iter_rows(values_only=True)
    h = next(it)
    ix = {k: i for i, k in enumerate(h)}
    out = []
    for r in it:
        if r[ix["ENS région"]] != REGION or r[ix["ENS latitude"]] is None:
            continue
        g = lambda k: r[ix[k]]  # noqa: E731
        out.append({
            "for": str(g("FOR URL et ID Onisep")).rsplit("/", 1)[-1],
            "f": g("Formation (FOR) libellé"),
            "n": g("FOR niveau de sortie") or "",
            "e": g("Lieu d'enseignement (ENS) libellé"),
            "v": (g("ENS commune") or "").strip(),
            "dep": g("ENS département") or "",
            "s": g("ENS statut") or "",
            "c": cout(g("AF coût scolarité")),
            "duree": g("AF durée cycle standard") or "",
            "u": g("ENS URL et ID Onisep") or "",
            "km": km(float(g("ENS latitude")), float(g("ENS longitude"))),
        })
    return out


def main(xml: str, *xlsx: str) -> None:
    afs = [a for p in xlsx for a in lire(p)]
    par_for = defaultdict(list)
    for a in afs:
        par_for[a["for"]].append(a)

    proches = {}
    for m in ET.parse(xml).getroot().findall("metier"):
        ids = {f.findtext("id") for f in m.findall("formations_min_requise/formation_min_requise")}
        lieux = sorted((a for i in ids for a in par_for.get(i, [])), key=lambda a: (a["km"], a["f"]))
        if not lieux:
            continue
        vus, liste = set(), []
        for a in lieux:
            cle = (a["f"], a["e"])
            if cle in vus:
                continue
            vus.add(cle)
            liste.append({k: a[k] for k in ("f", "n", "e", "v", "s", "c", "duree", "u", "km")})
            if len(liste) == MAX:
                break
        proches[m.findtext("identifiant")] = {
            "region": len({(a["f"], a["e"]) for a in lieux}),
            "dep06": len({(a["f"], a["e"]) for a in lieux if a["dep"] == "Alpes-Maritimes"}),
            "liste": liste,
        }

    fiches_dir = ROOT / "public" / "data" / "fiches"
    for f in fiches_dir.glob("MET.*.json"):
        d = json.loads(f.read_text(encoding="utf-8"))
        d["proches"] = proches.get(d["id"])
        f.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    back = ROOT / "backend" / "data" / "onisep.json"
    if back.exists():
        data = json.loads(back.read_text(encoding="utf-8"))
        for mid, d in data.items():
            d["proches"] = proches.get(mid)
        back.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    n06 = sum(1 for p in proches.values() if p["dep06"])
    print(f"{len(afs)} lieux de formation en région Sud · {len(proches)} métiers avec au moins une formation · {n06} dans le 06")


if __name__ == "__main__":
    main(*sys.argv[1:])
