import React from 'react';
import { useGame } from '../GameContext';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Winner } from '../types';
import { Trophy, RefreshCcw, Users } from 'lucide-react';

export const EndScreen: React.FC = () => {
  const { winner, guardianCount, players, resetGame } = useGame();

  const isPredatorWin = winner === Winner.PREDATORS;
  const aliveGuardians = players.filter(p => p.isAlive).length; // Rough estimate, technically we don't know roles
  
  // Note: Since the app doesn't know who is who (roles were physical), 
  // we display the calculation logic rather than the final leaderboard.
  
  return (
    <Container>
      <div className="flex-1 flex flex-col items-center justify-center pt-8">
        <div className={`
          w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl
          ${isPredatorWin ? 'bg-red-500 shadow-red-500/40' : 'bg-emerald-500 shadow-emerald-500/40'}
        `}>
          <Trophy size={48} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-white mb-2 text-center">
          Vincono i {isPredatorWin ? 'Predatori' : 'Guardiani'}!
        </h2>
        
        <p className="text-slate-400 mb-8 text-center max-w-xs">
          La partita è terminata. Ecco come calcolare il punteggio.
        </p>

        <Card title="Calcolo Punteggio" className="w-full">
          {isPredatorWin ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-300">Punti base per Predatore vivo:</span>
                <span className="text-xl font-bold text-red-400">{guardianCount}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ogni giocatore che era <strong>Predatore</strong> ed è ancora <strong>VIVO</strong> ottiene {guardianCount} punti (pari al numero iniziale di Guardiani).
              </p>
            </div>
          ) : (
             <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-300">Punti base per Guardiano vivo:</span>
                <span className="text-xl font-bold text-emerald-400">{aliveGuardians}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ogni giocatore che era <strong>Guardiano</strong> ed è ancora <strong>VIVO</strong> ottiene {aliveGuardians} punti (pari ai Guardiani sopravvissuti).
              </p>
              <div className="bg-slate-900/50 p-2 rounded text-xs text-amber-500 border border-amber-900/30 flex gap-2 items-start">
                 <span>⚠️</span>
                 <span>Nota: Il master deve chiedere ai giocatori di rivelare le carte per confermare i ruoli.</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-3 mt-8 pb-4">
        <Button onClick={() => resetGame(true)} fullWidth>
          <RefreshCcw size={20} /> Nuova Partita (Stessi Giocatori)
        </Button>
        <Button onClick={() => resetGame(false)} variant="secondary" fullWidth>
          <Users size={20} /> Nuova Partita (Cambia Giocatori)
        </Button>
      </div>
    </Container>
  );
};