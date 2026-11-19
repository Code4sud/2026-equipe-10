import { ZONES, CARIF, REGION_SUD } from '../data/demo';
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
            <p className="body">Sa fiche s'affiche ici : en 30 secondes, ce que dit ton rapport et la réalité en France, les chemins et les formations près de chez toi.</p>
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

      <Card>
        <div className="row between"><h2 className="h2">Près de chez toi</h2><span className="muted">depuis Nice · 30 km</span></div>
        {m.formations.length ? (
          m.formations.map((f) => (
            <div key={f.intitule + f.etablissement} className="formation">
              <strong>{f.intitule}</strong>
              <span className="small">{f.etablissement} · {f.ville}{f.distanceKm != null ? ` · ${f.distanceKm} km` : ''}{f.apprentissage ? ' · apprentissage' : ''}</span>
            </div>
          ))
        ) : (
          <>
            <div className="placeholder">[Formation · établissement · ville · km] données ONISEP / Carif-Oref</div>
            <div className="placeholder">[Formation en apprentissage · CFA · ville · km]</div>
          </>
        )}
        <Sources sources={[CARIF, REGION_SUD]} />
      </Card>

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
