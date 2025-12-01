import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { ArrowLeft, Save, Copy, Check, Upload, Download, Smartphone } from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabase';
import { useGame } from '../GameContext';

const SQL_SCHEMA = `
-- 1. Create Rooms Table
create table public.rooms (
  code text primary key,
  phase text not null default 'LOBBY',
  game_phase text not null default 'DAY',
  round_count int not null default 1,
  winner text not null default 'NONE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Players Table
create table public.players (
  id text not null,
  room_code text not null references rooms(code) on delete cascade,
  name text not null,
  is_alive boolean default true,
  role text default 'UNKNOWN',
  is_host boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, room_code)
);

-- 3. Enable Realtime
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;

-- 4. Enable RLS (Optional for V1 dev mode, but good practice)
alter table public.rooms enable row level security;
alter table public.players enable row level security;

create policy "Public access for rooms" on public.rooms for all using (true) with check (true);
create policy "Public access for players" on public.players for all using (true) with check (true);
`;

export const SettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { configureServer, clientId } = useGame();
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [copied, setCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  const handleSave = () => {
    configureServer(url, key);
    onBack();
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyId = () => {
    navigator.clipboard.writeText(clientId);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  }

  const handleExport = () => {
    if (!url || !key) {
        alert("Nessuna configurazione da esportare.");
        return;
    }
    const data = JSON.stringify({ url, key }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = 'predatori-guardiani-config.json';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const data = JSON.parse(content);
                
                if (data.url && data.key) {
                    setUrl(data.url);
                    setKey(data.key);
                    alert("Configurazione caricata con successo!");
                } else {
                    alert("Il file non contiene una configurazione valida (mancano url o key).");
                }
            } catch (err) {
                console.error(err);
                alert("Errore nella lettura del file JSON.");
            }
        };
        reader.readAsText(file);
    };

    input.click();
  };

  return (
    <Container>
      <header className="flex items-center gap-3 pt-6 mb-6">
        <Button variant="ghost" onClick={onBack} className="!px-2">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-white">Impostazioni Server</h1>
      </header>

      <div className="space-y-6 pb-8">
        <Card title="Info Dispositivo">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-slate-300">
                <Smartphone size={18} />
                <span className="text-sm font-mono">{clientId.substring(0, 8)}...</span>
             </div>
             <button onClick={copyId} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded border border-slate-700">
                {idCopied ? 'Copiato!' : 'Copia ID Completo'}
             </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Usa questo ID se devi debuggare problemi di connessione multipla dallo stesso browser.
          </p>
        </Card>

        <Card title="1. Configurazione Database">
          <p className="text-sm text-slate-400 mb-4">
            Crea un progetto su <a href="https://supabase.com" target="_blank" className="text-indigo-400 underline">supabase.com</a>, vai nell'SQL Editor ed esegui questo script per creare le tabelle:
          </p>
          <div className="relative bg-slate-950 rounded-lg p-3 border border-slate-800">
            <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-40">
              {SQL_SCHEMA}
            </pre>
            <button 
              onClick={copySql}
              className="absolute top-2 right-2 p-2 bg-slate-800 rounded-md text-slate-300 hover:text-white"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </Card>

        <Card title="2. Collegamento App">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project URL</label>
              <input 
                type="text" 
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Anon Public Key</label>
              <input 
                type="text" 
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="eyJhbG..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800 mt-2">
                <Button onClick={handleExport} variant="secondary" className="flex-1 text-xs gap-1" title="Scarica configurazione">
                    <Download size={14} /> Esporta File
                </Button>
                <Button onClick={handleImport} variant="secondary" className="flex-1 text-xs gap-1" title="Carica configurazione">
                    <Upload size={14} /> Importa File
                </Button>
            </div>

            <Button onClick={handleSave} fullWidth variant="primary">
              <Save size={18} /> Salva Configurazione
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
};