import React from 'react';
import { useGame } from '../GameContext';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Users, Play, Copy, Share2, LogOut } from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabase';

export const LobbyScreen: React.FC = () => {
  const { roomCode, players, isHost, startGame, leaveGame, clientId } = useGame();

  const handleShare = () => {
    const config = getSupabaseConfig();
    
    // Create Magic Link
    // We encode params in Base64 to avoid URL parsing issues with special characters in keys
    const params = new URLSearchParams();
    if (roomCode) params.set('room', roomCode);
    if (config.url) params.set('u', btoa(config.url));
    if (config.key) params.set('k', btoa(config.key));

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    if (navigator.share) {
      navigator.share({
        title: 'Unisciti a Predatori vs Guardiani',
        text: `Entra nella mia partita!`,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copiato negli appunti! Invialo ai tuoi amici.');
    }
  };

  return (
    <Container>
      <header className="pt-8 text-center mb-8">
        <h2 className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">CODICE STANZA</h2>
        <div 
          onClick={handleShare}
          className="inline-flex items-center gap-4 bg-slate-800 border border-slate-600 px-6 py-3 rounded-2xl cursor-pointer hover:bg-slate-700 transition-colors"
        >
          <span className="text-4xl font-mono font-bold text-white tracking-widest">{roomCode}</span>
          <Copy size={20} className="text-slate-400" />
        </div>
        <p className="text-xs text-slate-500 mt-2">Tocca per copiare o condividere il Link Magico</p>
      </header>

      <Card className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
          <h3 className="text-slate-200 font-bold flex items-center gap-2">
            <Users size={20} className="text-indigo-400" />
            Giocatori ({players.length})
          </h3>
          {isHost && <span className="text-xs text-indigo-400 font-bold bg-indigo-400/10 px-2 py-1 rounded">MASTER</span>}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {players.length === 0 && (
            <div className="text-center py-8 text-slate-500 italic">
              In attesa di giocatori...
            </div>
          )}
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-1">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm font-mono border border-slate-700">
                {i + 1}
              </div>
              <span className={`font-medium ${p.id === useGame().currentPlayer?.id ? 'text-indigo-400' : 'text-slate-200'}`}>
                {p.name} {p.id === useGame().currentPlayer?.id && '(Tu)'}
              </span>
              {p.is_host && (
                <span className="ml-auto text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Host</span>
              )}
            </div>
          ))}
        </div>

        {isHost ? (
          <div className="space-y-3">
            <p className="text-xs text-center text-slate-400 mb-2">
              Sei il Master. Quando tutti sono pronti, inizia la partita.
            </p>
            <Button onClick={startGame} fullWidth disabled={players.length < 3}>
              <Play size={20} /> Inizia Assegnazione Ruoli
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <p className="text-sm text-slate-300">In attesa che il Master inizi la partita...</p>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-4 pb-4 text-center space-y-2">
        <button onClick={leaveGame} className="text-slate-500 hover:text-red-400 text-sm flex items-center justify-center gap-2 mx-auto transition-colors">
          <LogOut size={16} /> Esci dalla stanza
        </button>
        <div className="text-[10px] text-slate-700 font-mono">
            Client ID: {clientId.split('-')[0]}...
        </div>
      </div>
    </Container>
  );
};