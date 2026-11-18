import { useRef, useState } from 'react';
import { METIERS, PERSONA } from '../data/demo';
import { findMetiersInPdf } from '../lib/pdf';
import { Card } from './Layout';
import { IconCheck, IconUpload, Star } from './Icons';

interface Props {
  metierIds: string[];
  onImport: (ids: string[], label: string) => void;
  onReset: () => void;
  sourceLabel: string;
  goMetiers: () => void;
  goCentre: () => void;
}

export function RapportTab({ metierIds, onImport, onReset, sourceLabel, goMetiers, goCentre }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setStatus('Lecture du rapport sur ton appareil…');
    try {
      const ids = await findMetiersInPdf(file, METIERS);
      if (ids.length) {
        setStatus('');
        onImport(ids, 'Ton rapport, lu sur ton appareil');
      } else {
        setStatus("Aucun métier reconnu. En démo, seuls les métiers fictifs sont reconnus : choisis-les dans la liste.");
        setPicking(true);
      }
    } catch {
      setStatus("Impossible de lire ce PDF. Tu peux choisir tes métiers dans la liste.");
      setPicking(true);
    }
  }

  const imported = metierIds.length > 0;

  return (
    <section className="stack">
      <header className="stack-sm">
        <h1 className="disp h1">Ton rapport, <span className="accent">expliqué simplement</span></h1>
        <p className="lead">Dépose ton Rapport des Possibles : on t'explique chaque métier, avec des sources publiques.</p>
      </header>

      {!imported && (
        <div className="grid-2">
          <Card className="dropzone">
            <IconUpload />
            <strong className="title-sm">Dépose ton Rapport des Possibles</strong>
            <span className="muted">PDF · il est lu sur ton appareil et n'est envoyé nulle part</span>
            <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Choisir mon PDF</button>
            <button type="button" className="btn btn-ghost" onClick={() => setPicking((p) => !p)}>Choisir mes métiers dans une liste</button>
            <button type="button" className="link-btn" onClick={() => onImport(METIERS.map((m) => m.id), `Rapport fictif de ${PERSONA.prenom}, ${PERSONA.age} ans, ${PERSONA.ville}`)}>
              Essayer avec le rapport fictif de {PERSONA.prenom}
            </button>
            {status && <p className="status" role="status">{status}</p>}
          </Card>

          {picking ? (
            <Card>
              <strong className="title-sm">Coche les métiers de ton rapport</strong>
              <div className="checklist">
                {METIERS.map((m) => (
                  <label key={m.id} className="check-item">
                    <input type="checkbox" checked={checked.includes(m.id)} onChange={(e) => setChecked((c) => (e.target.checked ? [...c, m.id] : c.filter((x) => x !== m.id)))} />
                    {m.nom}
                  </label>
                ))}
              </div>
              <button type="button" className="btn" disabled={!checked.length} onClick={() => onImport(checked, 'Métiers choisis dans la liste')}>
                Valider ({checked.length})
              </button>
            </Card>
          ) : (
            <Card>
              <div className="row"><Star size={18} /><strong className="title-sm">Pas encore passé·e au Centre ?</strong></div>
              <p className="body">Tu as vu des métiers au lycée ou dans un salon ? Commence ici, puis viens faire le parcours complet au Centre des Possibles.</p>
              <button type="button" className="btn btn-ghost" disabled>Me découvrir · questionnaire (bientôt)</button>
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
              <strong className="title-md">{metierIds.length} métier{metierIds.length > 1 ? 's' : ''} trouvé{metierIds.length > 1 ? 's' : ''}</strong>
            </div>
            <p className="body">{sourceLabel}. Ton rapport n'a pas quitté ton appareil.</p>
            <button type="button" className="btn" onClick={goMetiers}>Voir mes métiers</button>
            <button type="button" className="link-btn" onClick={onReset}>Changer de rapport</button>
          </Card>
          <Card>
            <div className="row"><Star size={18} /><strong className="title-sm">Bon à savoir</strong></div>
            <p className="body">Les zones de ton rapport donnent un temps de préparation indicatif. En France, certains métiers sont plus accessibles : on te le signale, sources à l'appui.</p>
          </Card>
        </div>
      )}
    </section>
  );
}
