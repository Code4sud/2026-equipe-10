"""Tests sans réseau : l'IA est simulée. Lancer avec : python -m pytest -q"""
from fastapi.testclient import TestClient

from app import assistant
from app.guardrails import find_verdict, has_salary_figure
from app.main import app

client = TestClient(app)


def fake_llm(responses):
    calls = iter(responses)
    return lambda *a, **k: next(calls)


def test_health():
    assert client.get("/api/health").json()["ok"] is True


def test_metier_inconnu():
    assert client.post("/api/chat", json={"question": "c'est quoi ?", "metier_id": "nope"}).status_code == 404


def test_reponse_sourcee(monkeypatch):
    monkeypatch.setattr(assistant, "_call_llm", fake_llm([{"answer": "Tu fais des soins.", "source_ids": ["F1"], "known": True, "suggest_save": False}]))
    r = client.post("/api/chat", json={"question": "c'est quoi ?", "metier_id": "MET.448"}).json()
    assert r["known"] and r["sources"] and "ONISEP" in r["sources"][0]["label"]


def test_source_inventee_devient_je_ne_sais_pas(monkeypatch):
    monkeypatch.setattr(assistant, "_call_llm", fake_llm([{"answer": "Il faut un master.", "source_ids": ["F99"], "known": True}]))
    r = client.post("/api/chat", json={"question": "quel diplôme ?", "metier_id": "MET.448"}).json()
    assert r["known"] is False and "pas d'information vérifiée" in r["text"]


def test_verdict_bloque(monkeypatch):
    bad = {"answer": "Ce métier n'est pas fait pour toi.", "source_ids": ["F1"], "known": True}
    monkeypatch.setattr(assistant, "_call_llm", fake_llm([bad, bad]))
    r = client.post("/api/chat", json={"question": "je suis nul, c'est mort ?", "metier_id": "MET.448"}).json()
    assert "pas fait pour toi" not in r["text"] and r["suggest_save"]


def test_verdict_reformule(monkeypatch):
    bad = {"answer": "Tu n'as pas le niveau.", "source_ids": ["F1"], "known": True}
    good = {"answer": "Il y a plusieurs chemins, dès le CAP.", "source_ids": ["F2"], "known": True}
    monkeypatch.setattr(assistant, "_call_llm", fake_llm([bad, good]))
    r = client.post("/api/chat", json={"question": "je suis nul ?", "metier_id": "MET.448"}).json()
    assert r["text"].startswith("Il y a plusieurs chemins")


def test_salaire_onisep_sans_ia(monkeypatch):
    monkeypatch.setattr(assistant, "_call_llm", lambda *a, **k: (_ for _ in ()).throw(AssertionError("ne doit pas appeler l'IA")))
    r = client.post("/api/chat", json={"question": "je gagnerai combien ?", "metier_id": "MET.448"}).json()
    assert r["known"] and "ONISEP" in r["text"] and "euros" in r["text"]


def test_zone_dans_les_faits():
    from app.knowledge import facts_for, get_metier
    faits = " ".join(f.text for f in facts_for(get_metier("MET.448"), 3))
    assert "zone 3" in faits and "plus court" in faits


def test_detecteurs():
    assert find_verdict("Franchement, ce n'est pas fait pour toi")
    assert find_verdict("Tu as 80 % de chances")
    assert find_verdict("Il existe plusieurs chemins pour y arriver") is None
    assert has_salary_figure("environ 1 800 € par mois")
    assert not has_salary_figure("le CAP dure 2 ans")


def test_salutation_sans_ia(monkeypatch):
    monkeypatch.setattr(assistant, "_call_llm", lambda *a, **k: (_ for _ in ()).throw(AssertionError("ne doit pas appeler l'IA")))
    r = client.post("/api/chat", json={"question": "Salut !", "metier_id": "MET.448"}).json()
    assert r["known"] and r["text"].startswith("Salut")
