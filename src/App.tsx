import { useEffect, useState } from 'react';
import { loadMetiers } from './lib/metiers';
import { load, save } from './lib/storage';
import { theme } from './theme';
import type { ChatMessage, Metier, SavedQuestion, Selection, TabId } from './types';
import { NavTabs, Wordmark } from './components/Layout';
import { RapportTab } from './components/RapportTab';
import { MetiersTab } from './components/MetiersTab';
import { ChatTab } from './components/ChatTab';
import { CentreTab } from './components/CentreTab';

export default function App() {
  const [tab, setTab] = useState<TabId>('rapport');
  const [selection, setSelection] = useState<Selection[]>(() => load('selection', []));
  const [metiers, setMetiers] = useState<Metier[]>([]);
  const [sourceLabel, setSourceLabel] = useState<string>(() => load('sourceLabel', ''));
  const [selId, setSelId] = useState<string | null>(null);
  const [chatMetierId, setChatMetierId] = useState<string>('');
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [saved, setSaved] = useState<SavedQuestion[]>(() => load('saved', []));

  useEffect(() => {
    save('selection', selection);
    let alive = true;
    loadMetiers(selection).then((m) => { if (alive) setMetiers(m); });
    return () => { alive = false; };
  }, [selection]);
  useEffect(() => { save('sourceLabel', sourceLabel); }, [sourceLabel]);
  useEffect(() => { save('saved', saved); }, [saved]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab, selId]);

  // On garde l'ordre du rapport (jamais de tri par « pertinence »).
  const activeChatId = chatMetierId && metiers.some((m) => m.id === chatMetierId) ? chatMetierId : metiers[0]?.id ?? '';

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <Wordmark />
          <NavTabs tab={tab} onChange={setTab} variant="top" />
          <a className="btn btn-outline only-desktop" href={theme.centre.rdvUrl} target="_blank" rel="noreferrer">Prendre rendez-vous au Centre ↗</a>
          <span className="persona-pill only-mobile">{theme.personaNote}</span>
        </div>
      </header>

      <main className="container main">
        {tab === 'rapport' && (
          <RapportTab
            count={selection.length}
            sourceLabel={sourceLabel}
            onImport={(sel, label) => { setSelection(sel); setSourceLabel(label); setSelId(null); setTab('metiers'); }}
            onReset={() => { setSelection([]); setSourceLabel(''); setChats({}); setSelId(null); }}
            goMetiers={() => setTab('metiers')}
            goCentre={() => setTab('centre')}
          />
        )}
        {tab === 'metiers' && (
          <MetiersTab
            metiers={metiers}
            selId={selId}
            onSelect={setSelId}
            onAsk={(id) => { setChatMetierId(id); setTab('chat'); }}
            goRapport={() => setTab('rapport')}
          />
        )}
        {tab === 'chat' && (
          <ChatTab
            metiers={metiers}
            metierId={activeChatId}
            onMetierChange={setChatMetierId}
            messages={chats[activeChatId] ?? []}
            setMessages={(fn) => setChats((c) => ({ ...c, [activeChatId]: fn(c[activeChatId] ?? []) }))}
            saved={saved}
            onSave={(q) => setSaved((s) => [...s, q])}
            goCentre={() => setTab('centre')}
            goRapport={() => setTab('rapport')}
          />
        )}
        {tab === 'centre' && <CentreTab saved={saved} onRemove={(i) => setSaved((s) => s.filter((_, j) => j !== i))} />}
      </main>

      <footer className="container footer">Démo · données fictives · Sources : ROME 4.0, ONISEP, Carif-Oref Sud</footer>
      <NavTabs tab={tab} onChange={setTab} variant="bottom" />
    </div>
  );
}
