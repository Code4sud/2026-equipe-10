import { useEffect, useRef, useState } from 'react';
import { PERSONA, PERSONA_METIERS } from '../data/demo';
import { joli, loadIndex, search } from '../lib/metiers';
import { findMetiersInPdf } from '../lib/pdf';
import type { IndexEntry, Selection } from '../types';
import { Card } from './Layout';
import { IconCheck, IconUpload, Star } from './Icons';

interface Props {
  count: number;
  onImport: (sel: Selection[], label: string) => void;
  onReset: () => void;
  sourceLabel: string;
  goMetiers: () => void;
  goCentre: () => void;
}

export function RapportTab({ count, onImport, onReset, sourceLabel, goMetiers, goCentre }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState<IndexEntry[]>([]);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<IndexEntry[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadIndex().then(setIndex).catch(() => setStatus('Impossible de charger la liste des métiers.'));
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setStatus('Lecture du rapport sur ton appareil…');
    try {
      const sel = await findMetiersInPdf(file, index.length ? index : await loadIndex());
      if (sel.length) {
        setStatus('');
        onImport(sel, 'Ton rapport, lu sur ton appareil');
      } else {
        setStatus("Aucun métier reconnu dans ce PDF. Tu peux les chercher dans la liste.");
        setPicking(true);
      }
    } catch {
      setStatus('Impossible de lire ce PDF. Tu peux chercher tes métiers dans la liste.');
      setPicking(true);
    }
  }

  const results = search(index, query).filter((e) => !chosen.some((c) => c.id === e.id));
  const imported = count > 0;

  return (
    <section className="stack">
      <header className="stack-sm">
        <h1 className="disp h1">Ton rapport, <span className="accent">expliqué simplement</span></h1>
        <p className="lead">Dépose ton Rapport des Possibles, ou cherche des métiers parmi les {index.length || '1 100'} fiches de l'ONISEP.</p>
      </header>

      {!imported && (
        <div className="grid-2">
          <Card className="dropzone">
            <IconUpload />
            <strong className="title-sm">Dépose ton Rapport des Possibles</strong>
            <span className="muted">PDF · il est lu sur ton appareil et n'est envoyé nulle part</span>
            <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Choisir mon PDF</button>
            <button type="button" className="btn btn-ghost" onClick={() => setPicking((p) => !p)}>Chercher des métiers dans la liste</button>
            <button type="button" className="link-btn" onClick={() => onImport(PERSONA_METIERS, `Rapport fictif de ${PERSONA.prenom}, ${PERSONA.age} ans, ${PERSONA.ville}`)}>
              Essayer avec le rapport fictif de {PERSONA.prenom}
            </button>
            {status && <p className="status" role="status">{status}</p>}
          </Card>

          {picking ? (
            <Card>
              <label htmlFor="recherche" className="title-sm">Cherche un métier vu au lycée, en salon…</label>
              <input id="recherche" className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex. infirmier, menuisier, développeur…" autoComplete="off" />
              {results.length > 0 && (
                <ul className="results">
                  {results.map((e) => (
                    <li key={e.id}>
                      <button type="button" className="result" onClick={() => { setChosen((c) => [...c, e]); setQuery(''); }}>
                        <strong>{joli(e.nom)}</strong>
                        <span className="small">{e.niv ? `Niveau minimal : ${e.niv}` : ''}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {query.length >= 2 && results.length === 0 && <span className="muted">Aucun métier trouvé : essaie un autre mot.</span>}
              {chosen.length > 0 && (
                <div className="tags">
                  {chosen.map((c) => (
                    <button key={c.id} type="button" className="tag tag-btn" onClick={() => setChosen((x) => x.filter((y) => y.id !== c.id))} aria-label={`Retirer ${c.nom}`}>
                      {joli(c.nom)} ✕
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="btn" disabled={!chosen.length} onClick={() => onImport(chosen.map((c) => ({ id: c.id })), 'Métiers choisis dans la liste')}>
                Voir ces métiers ({chosen.length})
              </button>
            </Card>
          ) : (
            <Card>
              <div className="row"><Star size={18} /><strong className="title-sm">Pas encore passé·e au Centre ?</strong></div>
              <p className="body">Tu as vu des métiers au lycée ou dans un salon ? Cherche-les dans la liste, puis viens faire le parcours complet au Centre des Possibles.</p>
              <button type="button" className="btn btn-ghost" onClick={() => setPicking(true)}>Chercher des métiers</button>
              <button type="button" className="btn" onClick={goCentre}>Découvrir le Centre</button>
            </Card>
          )}
        </div>
      )}

      {imported && (
        <div className="grid-2">
          <Card>
            <div className="row">
              <span className="badge-ok"><IconCheck /></span>
              <strong className="title-md">{count} métier{count > 1 ? 's' : ''} retenu{count > 1 ? 's' : ''}</strong>
            </div>
            <p className="body">{sourceLabel}. Ton rapport n'a pas quitté ton appareil.</p>
            <button type="button" className="btn" onClick={goMetiers}>Voir mes métiers</button>
            <button type="button" className="link-btn" onClick={onReset}>Changer de rapport</button>
          </Card>
          <Card>
            <div className="row"><Star size={18} /><strong className="title-sm">Bon à savoir</strong></div>
            <p className="body">Les zones de ton rapport donnent un temps de préparation indicatif. En France, certains métiers sont plus accessibles : on te le signale, d'après les fiches de l'ONISEP.</p>
          </Card>
        </div>
      )}
    </section>
  );
}
