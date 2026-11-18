import type { ReactNode } from 'react';
import { theme } from '../theme';
import type { Source, TabId } from '../types';
import { IconCentre, IconChat, IconMetiers, IconRapport, Star } from './Icons';

export const Wordmark = () => (
  <div className="wordmark" aria-label={`${theme.appName} ${theme.appTagline}`}>
    <span className="wordmark-top">{theme.appName} <Star size={14} /></span>
    <span className="wordmark-tag disp">{theme.appTagline}</span>
  </div>
);

const TABS: { id: TabId; label: string; icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'rapport', label: 'Rapport', icon: IconRapport },
  { id: 'metiers', label: 'Métiers', icon: IconMetiers },
  { id: 'chat', label: 'Assistant', icon: IconChat },
  { id: 'centre', label: 'Le Centre', icon: IconCentre },
];

/** Barre de navigation toujours visible : en haut sur PC, en bas sur téléphone (voir styles.css). */
export function NavTabs({ tab, onChange, variant }: { tab: TabId; onChange: (t: TabId) => void; variant: 'top' | 'bottom' }) {
  return (
    <nav className={`nav nav-${variant}`} aria-label="Navigation principale">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" className={`nav-btn${tab === id ? ' active' : ''}`} aria-current={tab === id ? 'page' : undefined} onClick={() => onChange(id)}>
          <Icon size={variant === 'top' ? 18 : 22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`card ${className}`}>{children}</div>
);

export function Sources({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <span className="sources">
      Sources :{' '}
      {sources.map((s, i) => (
        <span key={s.label}>
          {i > 0 && ' · '}
          {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a> : s.label}
        </span>
      ))}
    </span>
  );
}
