import { useState } from 'react';
import { ZONES, LBA, ONISEP_AF, REGION_SUD } from '../data/demo';
import type { Metier } from '../types';
import { Card, Sources } from './Layout';
import { IconBack, Star } from './Icons';

interface Props {
  metiers: Metier[];
  selId: string | null;
  onSelect: (id: string | null) => void;
  onAsk: (id: string) => void;
  goRapport: () => void;
}

export function MetiersTab({ metiers, selId, onSelect, onAsk, goRapport }: Props) {
  const sel = metiers.find((m) => m.id === selId) ?? null;

  if (!metiers.length) {
    return (
      <Card className="empty">
        <Star size={32} />
        <strong className="title-md">Pas encore de métiers</strong>
        <p className="body">Dépose ton rapport ou choisis tes métiers pour commencer.</p>
        <button type="button" className="btn" onClick={goRapport}>Aller à mon rapport</button>
      </Card>
    );
  }

  return (
    <div className={`metiers-layout${sel ? ' has-sel' : ''}`}>
      <section className="metiers-list stack">
        <header className="stack-sm">
          <h1 className="disp h1">Tes métiers</h1>
          <p className="lead">Dans l'ordre de ton rapport, sans classement.</p>
        </header>
        {[...ZONES.map((z) => ({ key: `z${z.numero}`, label: `Zone ${z.numero}`, duree: z.duree, items: metiers.filter((m) => m.zoneRapport === z.numero) })),
          { key: 'libre', label: 'Mes choix', duree: 'métiers choisis dans la liste', items: metiers.filter((m) => !m.zoneRapport) }]
          .filter((g) => g.items.length)
          .map((g) => (
            <div key={g.key} className="stack-sm">
              <div className="zone-head"><span className="disp zone-label">{g.label}</span><span className="muted">{g.duree}</span></div>
              {g.items.map((m) => (
                <button key={m.id} type="button" className={`metier-card${m.id === selId ? ' selected' : ''}`} onClick={() => onSelect(m.id)}>
                  <span className="metier-nom">{m.libelleRapport ?? m.nom}</span>
                  {m.libelleRapport && <span className="small">Fiche ONISEP : {m.nom}</span>}
                  <span className="metier-pitch">{m.pitch.length > 170 ? `${m.pitch.slice(0, m.pitch.lastIndexOf(' ', 170))}…` : m.pitch}</span>
                  <span className="tags">
                    <span className="tag">{m.accesCourt}</span>
                    {m.plusAccessible && <span className="tag tag-accent">Plus accessible en France</span>}
                  </span>
                </button>
              ))}
            </div>
          ))}
      </section>

      <section className="metiers-fiche">
        {sel ? (
          <Fiche m={sel} onBack={() => onSelect(null)} onAsk={() => onAsk(sel.id)} />
        ) : (
          <Card className="empty only-desktop">
            <Star size={36} />
            <strong className="disp title-lg">Choisis un métier</strong>
            <p className="body">Sa fiche s'affiche ici : en 30 secondes, ce que dit ton rapport et la réalité en France, les chemins et les vraies formations près de Nice.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

function Fiche({ m, onBack, onAsk }: { m: Metier; onBack: () => void; onAsk: () => void }) {
  const zone = m.zoneRapport ? ZONES[m.zoneRapport - 1] : null;
  if (m.sansFiche) {
    return (
      <article className="stack">
        <button type="button" className="link-btn back only-mobile" onClick={onBack}><IconBack /> Tes métiers</button>
        <h1 className="disp h1">{m.nom}</h1>
        <Card>
          <h2 className="h2">Pas encore de fiche</h2>
          <p className="body">{m.pitch}</p>
          {zone && <span className="muted">Ton rapport : zone {zone.numero} ({zone.duree})</span>}
          <a href={REGION_SUD.url} target="_blank" rel="noreferrer" className="small strong">Chercher ce métier sur orientation-regionsud.fr ↗</a>
        </Card>
        <button type="button" className="btn" onClick={onAsk}>Poser une question sur ce métier</button>
      </article>
    );
  }
  return (
    <article className="stack">
      <button type="button" className="link-btn back only-mobile" onClick={onBack}><IconBack /> Tes métiers</button>
      <h1 className="disp h1">{m.libelleRapport ?? m.nom}</h1>
      {m.libelleRapport && <span className="muted">Fiche ONISEP la plus proche : {m.nom}. Vérifie avec ton psychologue que c'est bien le même métier.</span>}

      <Card>
        <h2 className="h2">En 30 secondes</h2>
        <p className="body">{m.pitch}</p>
        <Sources sources={m.sources} />
      </Card>

      <Card>
        <h2 className="h2">{zone ? 'Ton rapport et la réalité en France' : "Comment on y accède en France"}</h2>
        {zone && <span className="muted">Ton rapport : zone {zone.numero} ({zone.duree}){m.niveauMin ? ` · ONISEP : niveau minimal ${m.niveauMin}` : ''}</span>}
        {m.plusAccessible ? (
          <div className="good-news">
            <span className="row"><Star /> <strong>Bonne nouvelle</strong></span>
            <span>{m.accesFrance}</span>
          </div>
        ) : (
          <p className="body">{m.accesFrance}</p>
        )}
        <Sources sources={m.sources} />
      </Card>

      {m.chemins.length > 0 && <Card>
        <h2 className="h2">Les chemins pour y arriver</h2>
        {m.chemins.map((c, i) => (
          <div key={c.titre} className="chemin">
            <span className="chemin-num">{i + 1}</span>
            <span className="stack-xs"><strong>{c.titre}</strong><span className="small">{c.detail}</span></span>
          </div>
        ))}
        <Sources sources={m.sources} />
      </Card>}

      <PresDeChezToi m={m} />

      <div className="grid-2 tight">
        <Card>
          <strong>Ça coûte combien ?</strong>
          <span className="small">En apprentissage, la formation est gratuite et tu es payé·e.</span>
        </Card>
        <Card>
          <strong>Et le salaire ?</strong>
          {m.salaire ? (
            <span className="small">Pour un·e débutant·e, d'après l'ONISEP : {m.salaire.charAt(0).toLowerCase() + m.salaire.slice(1)}. Ça varie selon la région et l'employeur.</span>
          ) : (
            <span className="small">Pas de chiffre vérifié : regarde la fiche régionale.</span>
          )}
          <a href={REGION_SUD.url} target="_blank" rel="noreferrer" className="small strong">Salaires en Région Sud ↗</a>
        </Card>
      </div>

      <button type="button" className="btn" onClick={onAsk}>Poser une question sur ce métier</button>
    </article>
  );
}

/** Vraies formations en région Sud (open data ONISEP), rangées par distance depuis Nice. Aucune n'est « conseillée ». */
function PresDeChezToi({ m }: { m: Metier }) {
  const [tout, setTout] = useState(false);
  const { liste, dep06, region, alternanceUrl } = m.proches;
  const vues = tout ? liste : liste.slice(0, 4);
  return (
    <Card>
      <div className="row between"><h2 className="h2">Près de chez toi</h2><span className="muted">depuis Nice · à vol d'oiseau</span></div>
      {liste.length ? (
        <>
          <p className="small">
            {dep06 > 0 ? `${dep06} formation${dep06 > 1 ? 's' : ''} dans les Alpes-Maritimes` : 'Pas de formation dans les Alpes-Maritimes'}
            {region > dep06 ? `, ${region} en région Sud` : ''}. Les plus proches :
          </p>
          {vues.map((f) => (
            <a key={f.intitule + f.etablissement} className="formation" href={f.url} target="_blank" rel="noreferrer">
              <span className="row between"><strong>{f.intitule}</strong><span className="km">{f.distanceKm} km</span></span>
              <span className="small">{f.etablissement} · {f.ville}</span>
              <span className="formation-tags">
                {f.statut && <span className="tag">{f.statut}</span>}
                {f.duree && <span className="tag">{f.duree}</span>}
                {f.niveau && <span className="tag">sortie : {f.niveau}</span>}
                {f.cout && <span className="tag tag-cout">{f.cout}</span>}
              </span>
            </a>
          ))}
          {liste.length > 4 && <button type="button" className="link-btn" onClick={() => setTout((t) => !t)}>{tout ? 'Voir moins' : `Voir les ${liste.length} plus proches`}</button>}
        </>
      ) : (
        <p className="body">Pas de formation repérée en région Sud dans les données de l'ONISEP pour ce métier. Ça ne ferme rien : ton ou ta psychologue peut t'aider à chercher ailleurs, en alternance ou en formation continue.</p>
      )}
      <a className="btn btn-ghost" href={alternanceUrl} target="_blank" rel="noreferrer">Voir l'alternance autour de Nice ↗</a>
      <span className="muted">En alternance, la formation est gratuite et tu es payé·e. Les offres et les CFA sont sur La bonne alternance, le service public de l'apprentissage.</span>
      <Sources sources={[ONISEP_AF, LBA, REGION_SUD]} />
    </Card>
  );
}
