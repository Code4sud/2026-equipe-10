import { theme } from '../theme';
import type { SavedQuestion } from '../types';
import { Card } from './Layout';

const STEPS = [
  { t: 'Des jeux et questionnaires', d: 'Une demi-journée ludique, sur ordinateur et tablette.' },
  { t: 'Un entretien avec un·e psychologue', d: "Pour lire ton rapport ensemble et ouvrir des pistes. C'est toi qui décides." },
  { t: "L'Agora des métiers", d: 'Casques de réalité virtuelle et borne pour découvrir les formations de la région.' },
];

export function CentreTab({ saved, onRemove }: { saved: SavedQuestion[]; onRemove: (i: number) => void }) {
  return (
    <section className="stack">
      <header className="stack-sm">
        <span className="overline">{theme.centre.nom.toUpperCase()} · NICE</span>
        <h1 className="disp h1">Viens explorer <span className="accent">tes possibles</span> en vrai</h1>
        <p className="lead">Ici, tu explores seul·e. Au Centre, tu passes une demi-journée à mieux te connaître, puis tu en parles avec un·e psychologue.</p>
      </header>

      <div className="grid-3">
        {STEPS.map((s, i) => (
          <Card key={s.t}>
            <span className="disp step-num">{i + 1}</span>
            <strong className="title-sm">{s.t}</strong>
            <span className="small">{s.d}</span>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="h2">Tes questions pour le rendez-vous</h2>
        {saved.length ? (
          saved.map((s, i) => (
            <div key={`${s.metierNom}-${s.question}`} className="saved-q">
              <span>« {s.question} » <span className="muted">· {s.metierNom}</span></span>
              <button type="button" className="link-btn" onClick={() => onRemove(i)} aria-label={`Retirer la question ${s.question}`}>Retirer</button>
            </div>
          ))
        ) : (
          <p className="body">Pose tes questions à l'assistant : celles qui n'ont pas de réponse sûre arrivent ici, pour en parler au Centre.</p>
        )}
      </Card>

      <div className="row between wrap">
        <div className="stack-xs">
          <strong>{theme.centre.public}</strong>
          <span className="muted">{theme.centre.adresse}</span>
        </div>
        <a className="btn" href={theme.centre.rdvUrl} target="_blank" rel="noreferrer">Prendre rendez-vous ↗</a>
      </div>
    </section>
  );
}
