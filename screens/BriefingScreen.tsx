import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { DAWN_STEPS } from '../constants';
import { Moon, Play, CheckCircle2, Eye, EyeOff, Ghost, ShieldCheck, Hourglass } from 'lucide-react';
import { Role } from '../types';

export const BriefingScreen: React.FC = () => {
  const { predatorCount, guardianCount, startGame, players, isHost, currentPlayer } = useGame();
  const [activeStep, setActiveStep] = useState<number>(-1); // -1 means distribution phase
  const [showRoles, setShowRoles] = useState(false);
  const [revealMyRole, setRevealMyRole] = useState(false);

  // ------------------------------------------------------------------
  // PLAYER VIEW
  // ------------------------------------------------------------------
  if (!isHost) {
    const myRole = currentPlayer?.role || Role.UNKNOWN;
    const isPredator = myRole === Role.PREDATOR;

    return (
      <Container>
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in">
          <div className="text-center space-y-2">
             <div className="bg-indigo-500/20 p-4 rounded-full inline-block mb-2">
                <Hourglass size={48} className="text-indigo-400 animate-pulse" />
             </div>
             <h2 className="text-2xl font-bold text-white">Attendi il Master</h2>
             <p className="text-slate-400">È in corso la fase dell'Alba...</p>
          </div>

          <Card title="Il tuo Ruolo Segreto" className="w-full max-w-sm border-2 border-indigo-500/30">
             <div 
               onClick={() => setRevealMyRole(!revealMyRole)}
               className={`
                 relative h-40 rounded-xl cursor-pointer transition-all duration-500 flex flex-col items-center justify-center text-center p-4 border
                 ${revealMyRole 
                   ? (isPredator ? 'bg-indigo-900/40 border-indigo-500' : 'bg-red-900/40 border-red-500') 
                   : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
               `}
             >
               {!revealMyRole ? (
                 <>
                   <EyeOff size={32} className="text-slate-500 mb-2" />
                   <span className="font-bold text-slate-300 uppercase tracking-widest">Tocca per rivelare</span>
                 </>
               ) : (
                 <div className="animate-in zoom-in duration-300">
                    {isPredator ? <Ghost size={48} className="text-indigo-400 mx-auto mb-2" /> : <ShieldCheck size={48} className="text-red-400 mx-auto mb-2" />}
                    <h3 className={`text-2xl font-extrabold uppercase ${isPredator ? 'text-indigo-400' : 'text-red-400'}`}>
                      {isPredator ? 'Predatore' : 'Guardiano'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2">
                      {isPredator ? 'Caccia di notte. Inganna di giorno.' : 'Proteggi il villaggio. Scopri i predatori.'}
                    </p>
                 </div>
               )}
             </div>
             <p className="text-xs text-center text-slate-500 mt-3">Non mostrare questo schermo a nessuno.</p>
          </Card>
        </div>
      </Container>
    );
  }

  // ------------------------------------------------------------------
  // HOST VIEW
  // ------------------------------------------------------------------
  return (
    <Container className="pb-8">
      <header className="pt-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Preparazione</h2>
        <p className="text-slate-400 text-sm">Distribuzione e fase Alba</p>
      </header>

      {/* Card Setup */}
      <Card className={activeStep >= 0 ? 'hidden' : ''}>
        <div className="flex justify-around mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-950 bg-indigo-200 w-16 h-20 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-indigo-400">
               {predatorCount}
            </div>
            <span className="text-sm text-slate-300">Predatori</span>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-900 bg-red-200 w-16 h-20 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-red-400">
               {guardianCount}
            </div>
            <span className="text-sm text-slate-300">Guardiani</span>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-4 mb-4 border border-slate-700">
           <div className="flex justify-between items-center mb-3">
              <h4 className="text-slate-300 font-bold text-sm">Ruoli Assegnati (Solo Master)</h4>
              <button onClick={() => setShowRoles(!showRoles)} className="text-slate-400 hover:text-white">
                  {showRoles ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
           </div>
           
           {showRoles ? (
               <ul className="space-y-2 max-h-48 overflow-y-auto">
                   {players.map(p => (
                       <li key={p.id} className="flex justify-between text-sm border-b border-slate-800 pb-1 last:border-0">
                           <span className="text-slate-300">{p.name}</span>
                           <span className={`font-mono font-bold ${p.role === Role.PREDATOR ? 'text-indigo-400' : 'text-red-400'}`}>
                               {p.role === Role.PREDATOR ? 'PREDATORE' : 'GUARDIANO'}
                           </span>
                       </li>
                   ))}
               </ul>
           ) : (
               <p className="text-xs text-slate-500 italic text-center py-2">
                   Clicca l'occhio per vedere i ruoli e distribuire le carte. I giocatori vedono il proprio ruolo sul loro schermo.
               </p>
           )}
        </div>

        {activeStep === -1 && (
          <Button 
            onClick={() => setActiveStep(0)} 
            fullWidth 
            variant="secondary"
          >
            Ruoli assegnati, inizia Alba
          </Button>
        )}
      </Card>

      {/* Dawn Script */}
      {activeStep >= 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                <Moon size={20} /> Fase Alba
            </h3>
            <button onClick={() => setActiveStep(-1)} className="text-xs text-slate-500 underline">Torna ai ruoli</button>
          </div>
          
          <div className="space-y-4 mb-8">
            {DAWN_STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              const isPast = activeStep > idx;
              
              return (
                <div 
                  key={idx}
                  onClick={() => idx <= activeStep && setActiveStep(idx)}
                  className={`
                    p-4 rounded-xl border transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? 'bg-indigo-900/40 border-indigo-500 ring-1 ring-indigo-500/50' 
                      : isPast 
                        ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                        : 'bg-slate-900 border-slate-800 opacity-40'}
                  `}
                >
                  <div className="flex gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold
                      ${isActive ? 'bg-indigo-500 text-white' : isPast ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-400'}
                    `}>
                      {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <p className={`text-sm ${isActive ? 'text-white font-medium' : 'text-slate-400'}`}>
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-4 z-20">
            {activeStep < DAWN_STEPS.length - 1 ? (
              <Button onClick={() => setActiveStep(activeStep + 1)} fullWidth>
                Prossimo Passaggio
              </Button>
            ) : (
              <Button onClick={startGame} fullWidth className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20">
                <Play size={20} /> Inizia Partita
              </Button>
            )}
          </div>
        </div>
      )}
    </Container>
  );
};