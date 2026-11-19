import { useEffect, useMemo, useState } from 'react';
import {
  CENTRES, CONDITIONS, ECHELLE, EXPERIENCES, INFO, JAMAIS, LIBRES, MAX_VALEURS, MIROIR, MIROIR_COMMUN, MOI_VIDE, MONDES, QUESTIONS, VALEURS,
  colleEtudes, mondesDominants, pourquoi, raisonsDe, type Moi, type Monde,
} from '../data/riasec';
import { joli, loadIndex } from '../lib/metiers';
import { telechargerProfil } from '../lib/profilPdf';
import type { IndexEntry, SavedQuestion, Selection } from '../types';
import { Card } from './Layout';
import { IconBack, Star } from './Icons';

interface Props {
  onAddMetiers: (sel: Selection[]) => void;
  onSave: (q: SavedQuestion) => void;
  goCentre: () => void;
  goRapport: () => void;
  /** Métiers du Rapport des Possibles déjà chargés (ceux qui ont une zone), pour faire le lien. */
  rapport: Selection[];
}

type Etape = 'intro' | 'intuition' | 'questions' | 'moi' | 'resultat';
const tirer = <T,>(xs: T[], n: number) => [...xs].sort(() => Math.random() - 0.5).slice(0, n);

export function DecouvrirTab({ onAddMetiers, onSave, goCentre, goRapport, rapport }: Props) {
  const [etape, setEtape] = useState<Etape>('intro');
  const [intuition, setIntuition] = useState<Monde | null>(null);
  const [reponses, setReponses] = useState<number[]>([]);
  const [index, setIndex] = useState<IndexEntry[]>([]);
  const [tirage, setTirage] = useState(0);
  const [choisis, setChoisis] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [garde, setGarde] = useState(false);
  const [pdf, setPdf] = useState<'idle' | 'busy' | 'err'>('idle');
  const [pdfErr, setPdfErr] = useState('');
  const [moi, setMoi] = useState<Moi>(MOI_VIDE);
  const basculer = (k: 'valeurs' | 'experiences', v: string, max = 99) => setMoi((m) => {
    const l = m[k];
    if (l.includes(v)) return { ...m, [k]: l.filter((x) => x !== v) };
    return l.length >= max ? m : { ...m, [k]: [...l, v] };
  });

  useEffect(() => { loadIndex().then(setIndex).catch(() => {}); }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [etape]);

  const i = reponses.length;
  const top = useMemo(() => (etape === 'resultat' ? mondesDominants(reponses) : []), [etape, reponses]);

  // Raisons : ce que le jeune a dit (expériences, valeurs, conditions), puis ses mondes. Chaque piste dit pourquoi elle est là.
  const raisons = useMemo(() => raisonsDe(moi, top), [moi, top]);

  // Pistes : un groupe par raison (les mots du jeune d'abord), métiers tirés au hasard, rangés par ordre alphabétique. Aucun classement.
  const pistes = useMemo(() => {
    const deja = new Set<string>();
    const dits = raisons.filter((r) => !r.texte.startsWith('tes réponses')).slice(0, 4);
    const mondes = raisons.filter((r) => r.texte.startsWith('tes réponses'));
    return [...dits, ...mondes].map((r) => {
      const ok = index.filter((e) => !deja.has(e.id) && e.ci.some((c) => r.ci.includes(c)));
      const t = tirer(ok, 3).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      t.forEach((e) => deja.add(e.id));
      return { raison: r.texte, total: ok.length, metiers: t };
    }).filter((g) => g.metiers.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raisons, index, tirage]);

  // Lien avec le Rapport des Possibles : métiers du rapport qui rejoignent ce que le jeune a dit.
  const liensRapport = useMemo(() => rapport
    .map((s) => index.find((e) => e.id === s.id))
    .filter((e): e is IndexEntry => !!e)
    .map((e) => ({ e, pq: pourquoi(raisons, e.ci) }))
    .filter((x) => x.pq.length), [rapport, index, raisons]);

  const recommencer = () => { setReponses([]); setIntuition(null); setChoisis([]); setNotes({}); setGarde(false); setMoi(MOI_VIDE); setEtape('intro'); };

  if (etape === 'intro') {
    return (
      <section className="stack">
        <button type="button" className="link-btn back" onClick={goRapport}><IconBack /> Retour</button>
        <header className="stack-sm">
          <h1 className="disp h1">Me <span className="accent">découvrir</span></h1>
          <p className="lead">20 questions sur ce qui t'attire, puis des pistes de métiers à explorer. Environ 5 minutes.</p>
        </header>
        <div className="grid-2">
          <Card>
            <strong className="title-sm">Comment ça marche</strong>
            <p className="body">Tu dis si des activités t'attirent. Tes réponses restent sur ton appareil : rien n'est envoyé, rien n'est gardé.</p>
            <p className="body">Ce n'est pas un test et il n'y a pas de bonne réponse. Pas de note, pas de score : juste des pistes pour réfléchir.</p>
            <button type="button" className="btn" onClick={() => setEtape('intuition')}>C'est parti</button>
          </Card>
          <Card>
            <div className="row"><Star size={18} /><strong className="title-sm">Pour aller plus loin</strong></div>
            <p className="body">Au Centre des Possibles, une demi-journée de jeux et un entretien avec un·e psychologue te donnent un vrai portrait, bien plus complet.</p>
            <button type="button" className="btn btn-ghost" onClick={goCentre}>Découvrir le Centre</button>
          </Card>
        </div>
      </section>
    );
  }

  if (etape === 'intuition') {
    return (
      <section className="stack">
        <header className="stack-sm">
          <h1 className="disp h1">Ton intuition</h1>
          <p className="lead">Avant de commencer : quel monde te ressemble le plus, à ton avis ? On comparera avec ce que tes réponses racontent.</p>
        </header>
        <div className="grid-3">
          {MONDES.map((m) => (
            <button key={m} type="button" className="metier-card" onClick={() => { setIntuition(m); setEtape('questions'); }}>
              <span className="metier-nom">{INFO[m].figure}</span>
              <span className="small">{INFO[m].nom}</span>
              <span className="metier-pitch">{INFO[m].texte}</span>
            </button>
          ))}
        </div>
        <button type="button" className="link-btn" onClick={() => setEtape('questions')}>Je ne sais pas, je passe</button>
      </section>
    );
  }

  if (etape === 'questions') {
    const q = QUESTIONS.at(i) ?? QUESTIONS[0];
    const repondre = (v: number) => {
      const n = [...reponses, v];
      setReponses(n);
      if (n.length >= QUESTIONS.length) setEtape('moi');
    };
    return (
      <section className="stack">
        <div className="progress" aria-label={`Question ${i + 1} sur ${QUESTIONS.length}`}>
          {QUESTIONS.map((_, k) => <i key={k} className={k < i ? 'done' : k === i ? 'now' : ''} />)}
        </div>
        <Card className="question-card">
          <span className="muted">Question {i + 1} sur {QUESTIONS.length}</span>
          <p className="question">Dans un métier, cette activité t'attire :<br /><strong>« {q.texte} »</strong></p>
          <div className="echelle">
            {ECHELLE.map((label, v) => (
              <button key={label} type="button" className="btn btn-ghost" onClick={() => repondre(v)}>{label}</button>
            ))}
          </div>
          <button type="button" className="link-btn" onClick={() => repondre(JAMAIS)}>Je n'ai jamais essayé, je ne sais pas</button>
          {i > 0 && <button type="button" className="link-btn" onClick={() => setReponses((r) => r.slice(0, -1))}><IconBack /> Question précédente</button>}
        </Card>
      </section>
    );
  }

  if (etape === 'moi') {
    return (
      <section className="stack">
        <header className="stack-sm">
          <h1 className="disp h1">Toi, <span className="accent">en vrai</span></h1>
          <p className="lead">Les questions, c'est un début. Ici, tu racontes avec tes mots. Tout est facultatif, rien n'est noté, et ça reste sur ton appareil.</p>
        </header>

        <Card>
          <h2 className="h2">Ce qui compte pour toi</h2>
          <p className="muted">Choisis jusqu'à {MAX_VALEURS} choses ({moi.valeurs.length}/{MAX_VALEURS}).</p>
          <div className="chips wrap-chips">
            {VALEURS.map((v) => (
              <button key={v} type="button" className={`chip${moi.valeurs.includes(v) ? ' on' : ''}`} aria-pressed={moi.valeurs.includes(v)}
                disabled={!moi.valeurs.includes(v) && moi.valeurs.length >= MAX_VALEURS} onClick={() => basculer('valeurs', v, MAX_VALEURS)}>{v}</button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="h2">Comment tu te vois travailler</h2>
          {CONDITIONS.map((c) => (
            <div key={c.id} className="stack-xs">
              <span className="small strong">{c.question}</span>
              <div className="chips wrap-chips">
                {c.choix.map((x) => {
                  const on = moi.conditions[c.id] === x;
                  return (
                    <button key={x} type="button" className={`chip${on ? ' on' : ''}`} aria-pressed={on}
                      onClick={() => setMoi((m) => ({ ...m, conditions: { ...m.conditions, [c.id]: on ? '' : x } }))}>{x}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h2 className="h2">Ce que tu as déjà fait ou aimes faire</h2>
          <p className="muted">Tout compte, même en dehors de l'école.</p>
          <div className="chips wrap-chips">
            {EXPERIENCES.map((v) => (
              <button key={v} type="button" className={`chip${moi.experiences.includes(v) ? ' on' : ''}`} aria-pressed={moi.experiences.includes(v)}
                onClick={() => basculer('experiences', v)}>{v}</button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="h2">Avec tes mots</h2>
          <p className="muted">N'écris pas ton nom ni d'informations sur d'autres personnes.</p>
          {LIBRES.map((l) => (
            <label key={l.id} className="stack-xs miroir">
              <span className="small strong">{l.question}</span>
              <span className="muted">{l.aide}</span>
              <textarea rows={3} maxLength={600} value={moi.libres[l.id] ?? ''}
                onChange={(e) => setMoi((m) => ({ ...m, libres: { ...m.libres, [l.id]: e.target.value } }))} />
            </label>
          ))}
        </Card>

        <div className="row wrap">
          <button type="button" className="btn" onClick={() => setEtape('resultat')}>Voir ce qui m'attire</button>
          <button type="button" className="link-btn" onClick={() => setEtape('resultat')}>Passer cette étape</button>
        </div>
      </section>
    );
  }

  // Résultat : des mondes et des pistes, jamais de chiffre ni de classement sur la personne.
  const miroir = intuition
    ? intuition === top[0]
      ? `Tu avais pensé à ${INFO[intuition].figure} : tes réponses vont dans le même sens.`
      : top.includes(intuition)
        ? `Tu avais pensé à ${INFO[intuition].figure} : il fait bien partie des mondes qui t'attirent, mais pas en premier. Pourquoi, à ton avis ?`
        : `Surprise : tu pensais à ${INFO[intuition].figure}, et tes réponses parlent plutôt de ${INFO[top[0]].figure}. Qu'est-ce que ça t'inspire ?`
    : '';
  const questionsMiroir = [MIROIR[top[0]], MIROIR[top[1]], ...MIROIR_COMMUN];

  return (
    <section className="stack">
      <header className="stack-sm">
        <h1 className="disp h1">Ce qui <span className="accent">t'attire</span></h1>
        <p className="lead">D'après tes réponses d'aujourd'hui. Ce sont des tendances, pas des cases : elles peuvent changer, et c'est normal.</p>
      </header>

      <div className="grid-3">
        {top.map((m) => (
          <Card key={m}>
            <span className="disp step-num">{INFO[m].figure}</span>
            <span className="small">Monde {INFO[m].nom}</span>
            <p className="body">{INFO[m].texte}</p>
          </Card>
        ))}
      </div>

      {(moi.valeurs.length > 0 || moi.experiences.length > 0 || Object.values(moi.conditions).some(Boolean) || Object.values(moi.libres).some((v) => v.trim())) && (
        <Card>
          <h2 className="h2">Ce que tu as dit de toi</h2>
          {moi.valeurs.length > 0 && <p className="body"><strong>Ce qui compte :</strong> {moi.valeurs.join(' · ')}</p>}
          {CONDITIONS.filter((c) => moi.conditions[c.id]).map((c) => <p key={c.id} className="body"><strong>{c.question}</strong> {moi.conditions[c.id]}</p>)}
          {moi.experiences.length > 0 && <p className="body"><strong>Déjà fait ou aimé :</strong> {moi.experiences.join(' · ')}</p>}
          {LIBRES.filter((l) => moi.libres[l.id]?.trim()).map((l) => <p key={l.id} className="body"><strong>{l.question} :</strong> {moi.libres[l.id].trim()}</p>)}
          <p className="muted">C'est exactement le genre de choses à raconter au ou à la psychologue du Centre.</p>
          <button type="button" className="link-btn" onClick={() => setEtape('moi')}>Modifier</button>
        </Card>
      )}

      <Card>
        <h2 className="h2">Le miroir</h2>
        {miroir && <p className="body"><strong>{miroir}</strong></p>}
        <p className="muted">Prends deux minutes pour répondre, pour toi. Rien n'est envoyé.</p>
        {questionsMiroir.map((q) => (
          <label key={q} className="stack-xs miroir">
            <span className="small strong">{q}</span>
            <textarea value={notes[q] ?? ''} onChange={(e) => setNotes((n) => ({ ...n, [q]: e.target.value }))} rows={2} />
          </label>
        ))}
        {garde ? (
          <span className="ok">Gardé dans « Le Centre », pour ton rendez-vous.</span>
        ) : (
          <button type="button" className="btn btn-ghost" disabled={![...Object.values(notes), ...Object.values(moi.libres)].some((v) => v.trim())} onClick={() => {
            Object.entries(notes).filter(([, v]) => v.trim()).forEach(([q, v]) => onSave({ question: `${q} : ${v.trim()}`, metierNom: 'Mon miroir' }));
            LIBRES.filter((l) => moi.libres[l.id]?.trim()).forEach((l) => onSave({ question: `${l.question} : ${moi.libres[l.id].trim()}`, metierNom: 'Toi, en vrai' }));
            setGarde(true);
          }}>Garder mes réponses pour mon rendez-vous</button>
        )}
      </Card>

      {rapport.length > 0 && (
        <Card>
          <h2 className="h2">Le lien avec ton Rapport des Possibles</h2>
          {liensRapport.length ? (
            <>
              <p className="body">Ce que tu as dit aujourd'hui rejoint ces métiers de ton rapport :</p>
              {liensRapport.map(({ e, pq }) => (
                <p key={e.id} className="body"><strong>{joli(e.nom)}</strong><br /><span className="small">Parce que {pq.join(', ')}</span></p>
              ))}
            </>
          ) : (
            <p className="body">Pas de lien évident cette fois entre tes réponses et les métiers de ton rapport. C'est une très bonne question à poser à ton ou ta psychologue.</p>
          )}
          <p className="muted">Les autres métiers de ton rapport restent tout aussi ouverts : ce n'est ni une note ni un tri.</p>
        </Card>
      )}

      <div className="stack-sm">
        <h2 className="h2">Des pistes à explorer</h2>
        <p className="muted">Chaque piste dit pourquoi elle est là. Les métiers sont tirés au hasard parmi les fiches de l'ONISEP et rangés par ordre alphabétique : ce n'est pas un classement. Coche ceux qui te donnent envie d'en savoir plus.</p>
      </div>
      <div className="grid-3">
        {pistes.map(({ raison, total, metiers }) => (
          <Card key={raison}>
            <strong className="title-sm">Parce que {raison}</strong>
            <span className="muted">{total} métiers possibles</span>
            {metiers.map((e) => (
              <label key={e.id} className="check-item">
                <input type="checkbox" checked={choisis.includes(e.id)} onChange={(ev) => setChoisis((c) => (ev.target.checked ? [...c, e.id] : c.filter((x) => x !== e.id)))} />
                <span className="stack-xs">
                  <span>{joli(e.nom)}</span>
                  {e.niv && <span className="small">Niveau minimal : {e.niv}</span>}
                  {colleEtudes(moi.conditions.etudes, e.niv) && <span className="tag-ok">Colle avec tes envies d'études</span>}
                </span>
              </label>
            ))}
          </Card>
        ))}
      </div>
      {moi.conditions.etudes && moi.conditions.etudes !== 'Je ne sais pas' && moi.conditions.etudes !== 'Longues si ça me plaît' && (
        <p className="muted">Un métier sans l'étiquette « Colle avec tes envies d'études » n'est pas fermé pour autant : passerelles, alternance, formation plus tard… parles-en au Centre.</p>
      )}
      <div className="row wrap">
        <button type="button" className="btn" disabled={!choisis.length} onClick={() => onAddMetiers(choisis.map((id) => ({ id })))}>
          Explorer ces métiers ({choisis.length})
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setTirage((t) => t + 1)}>D'autres pistes</button>
        <button type="button" className="link-btn" onClick={recommencer}>Recommencer</button>
      </div>

      <Card className="profil-card">
        <h2 className="h2">Garder mon profil</h2>
        <p className="body">Télécharge un PDF avec tes mondes, tes réponses au miroir et les métiers cochés. Apporte-le à ton rendez-vous. Il est créé sur ton appareil : rien n'est envoyé.</p>
        <button type="button" className="btn" disabled={pdf === 'busy'} onClick={async () => {
          setPdf('busy');
          try {
            await telechargerProfil({
              intuition, mondes: top, phraseMiroir: miroir, moi,
              miroir: questionsMiroir.map((q) => ({ question: q, reponse: notes[q] ?? '' })),
              metiers: index.filter((e) => choisis.includes(e.id)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
                .map((e) => ({ e, pourquoi: pourquoi(raisons, e.ci), etudes: colleEtudes(moi.conditions.etudes, e.niv) })),
              rapport: liensRapport.map(({ e, pq }) => ({ nom: joli(e.nom), pourquoi: pq })),
            });
            setPdf('idle');
          } catch (e) { console.error(e); setPdfErr(e instanceof Error ? e.message : String(e)); setPdf('err'); }
        }}>{pdf === 'busy' ? 'Création du PDF…' : 'Télécharger mon profil (PDF)'}</button>
        {pdf === 'err' && <span className="muted">Le PDF n'a pas pu être créé ({pdfErr}). Recharge la page (F5) et réessaie.</span>}
      </Card>

      <Card>
        <div className="row"><Star size={18} /><strong className="title-sm">Ce questionnaire ne remplace pas le Centre</strong></div>
        <p className="body">C'est un outil de réflexion indicatif, pas un test psychométrique. Pour un vrai portrait et un échange avec un·e psychologue, viens au Centre des Possibles.</p>
        <button type="button" className="btn" onClick={goCentre}>Prendre rendez-vous</button>
      </Card>
    </section>
  );
}
