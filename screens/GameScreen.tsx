import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { GamePhase, Player, Winner, Role } from '../types';
import { Sun, Moon, Skull, CheckCircle, RotateCcw, Award, EyeOff, Eye, ShieldCheck, Ghost, User } from 'lucide-react';

const PlayerRow: React.FC<{ 
  player: Player; 
  onKill: (id: string) => void;
  onRevive: (id: string) => void;
  phase: GamePhase;
  showRoles: boolean;
  isHost: boolean;
  currentUserId: string | undefined;
}> = ({ player, onKill, onRevive, phase, showRoles, isHost, currentUserId }) => {
  
  // Logic: 
  // - Host sees role IF showRoles is true.
  // - Player sees NO roles in list (only their own in the top card, redundant here).
  // - Everyone sees alive/dead status.
  
  const isMe = player.id === currentUserId;
  // Role is visible ONLY if (Host AND toggled ON) OR (It's me - optional, usually hidden in list to avoid shoulder surfing).
  // Let's decide: In list, ONLY HOST sees roles. Player sees roles only in their private card.
  const isRoleVisible = isHost && showRoles;

  return (
    <div className={`
      flex items-center justify-between p-3 rounded-lg border mb-2 transition-all
      ${player.is_alive 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale'}
    `}>
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        {/* Avatar / Role Icon */}
        <div className={`
          w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-colors border
          ${!isRoleVisible 
             ? (player.is_alive ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-red-900/20 border-red-900/50 text-red-900') 
             : (player.role === Role.PREDATOR ? 'bg-indigo-900/50 border-indigo-500/50 text-indigo-400' : 'bg-red-900/30 border-red-500/50 text-red-400')
          }
        `}>
           {!isRoleVisible ? (
             player.is_alive ? <User size={20} /> : <Skull size={20} />
           ) : (
             player.role === Role.PREDATOR ? <Ghost size={20} /> : <ShieldCheck size={20} />
           )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className={`font-medium truncate ${player.is_alive ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
            {player.name} {isMe && '(Tu)'}
          </span>
          {/* Only Host sees text role in list */}
          {isRoleVisible && (
            <span className={`text-[10px] font-bold uppercase tracking-wider ${player.role === Role.PREDATOR ? 'text-indigo-400' : 'text-red-400'}`}>
              {player.role === Role.PREDATOR ? 'Predatore' : 'Guardiano'}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 ml-2">
        {isHost && (
            player.is_alive ? (
            <button 
                onClick={() => {
                if (window.confirm(`Sei sicuro di eliminare ${player.name}?`)) {
                    onKill(player.id);
                }
                }}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors border border-transparent hover:border-red-900/30"
                title="Elimina Giocatore"
            >
                <Skull size={20} />
            </button>
            ) : (
            <button 
                onClick={() => onRevive(player.id)}
                className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-emerald-400 hover:bg-emerald-950/30 rounded-full transition-colors border border-transparent hover:border-emerald-900/30"
                title="Riporta in vita (Errore)"
            >
                <RotateCcw size={18} />
            </button>
            )
        )}
      </div>
    </div>
  );
};

const RoleCard: React.FC<{ role: Role }> = ({ role }) => {
  const [revealed, setRevealed] = useState(false);
  const isPredator = role === Role.PREDATOR;

  return (
    <div 
      onClick={() => setRevealed(!revealed)}
      className={`
        mb-6 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-lg
        ${revealed 
          ? (isPredator ? 'bg-indigo-950 border-indigo-500 shadow-indigo-900/50' : 'bg-red-950 border-red-500 shadow-red-900/50') 
          : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
      `}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${revealed ? (isPredator ? 'bg-indigo-500/20' : 'bg-red-500/20') : 'bg-slate-800'}`}>
            {!revealed ? <EyeOff size={24} className="text-slate-400" /> : (isPredator ? <Ghost size={28} className="text-indigo-400" /> : <ShieldCheck size={28} className="text-red-400" />)}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Il tuo Ruolo</h3>
            <p className={`font-bold text-lg ${revealed ? 'text-white' : 'text-slate-500 blur-sm'}`}>
              {revealed ? (isPredator ? 'PREDATORE' : 'GUARDIANO') : 'Tocca per vedere'}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500">
           {revealed ? (isPredator ? 'Nascondi' : 'Nascondi') : 'Rivela'}
        </div>
      </div>
      {revealed && (
        <div className={`px-4 pb-4 text-xs ${isPredator ? 'text-indigo-300' : 'text-red-300'}`}>
           {isPredator 
             ? "Durante la Notte, apri gli occhi e scegli una vittima insieme agli altri Predatori."
             : "Sei un cittadino. Cerca di individuare i Predatori durante il Giorno."}
        </div>
      )}
    </div>
  );
};

export const GameScreen: React.FC = () => {
  const { 
    gamePhase, 
    toggleGamePhase, 
    players, 
    killPlayer, 
    revivePlayer, 
    endGame,
    roundCount,
    isHost,
    currentPlayer
  } = useGame();

  const [showEndModal, setShowEndModal] = useState(false);
  const [showRoles, setShowRoles] = useState(false); 

  const aliveCount = players.filter(p => p.is_alive).length;
  const isDay = gamePhase === GamePhase.DAY;

  return (
    <Container className={isDay ? 'bg-slate-950' : 'bg-[#0f111a]'}>
      {/* Header Info */}
      <div className="sticky top-0 z-30 pt-4 pb-4 bg-slate-950/95 backdrop-blur border-b border-slate-800 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Turno {roundCount}
            </span>
            <div className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 ${isDay ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
              {isDay ? <Sun size={12} /> : <Moon size={12} />}
              {isDay ? 'GIORNO' : 'NOTTE'}
            </div>
          </div>
          
          {isHost && (
            <button 
                onClick={() => setShowRoles(!showRoles)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                ${showRoles ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            >
                {showRoles ? <Eye size={14} /> : <EyeOff size={14} />}
                {showRoles ? 'Vedi Ruoli' : 'Nascondi'}
            </button>
          )}
        </div>

        {isHost ? (
            <div className="flex gap-2">
                <Button 
                    onClick={toggleGamePhase} 
                    variant={isDay ? 'primary' : 'secondary'}
                    className={`flex-1 text-sm py-2 ${isDay ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                    {isDay ? (
                        <>Vai alla Notte <Moon size={16} /></>
                    ) : (
                        <>Vai al Giorno <Sun size={16} /></>
                    )}
                </Button>
                <Button 
                    onClick={() => setShowEndModal(true)} 
                    variant="danger" 
                    className="px-3 py-2"
                    title="Fine Partita"
                >
                    <Award size={20} />
                </Button>
            </div>
        ) : (
            <div className={`p-3 rounded-lg text-center text-sm border font-medium ${isDay ? 'text-amber-200 border-amber-900/30 bg-amber-900/10' : 'text-indigo-200 border-indigo-900/30 bg-indigo-900/10'}`}>
                {isDay ? 'Discuti con gli altri.' : 'Attendi il risveglio.'}
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* PRIVATE ROLE CARD (For Non-Host or even Host if playing) */}
        {!isHost && currentPlayer && (
           <RoleCard role={currentPlayer.role} />
        )}

        {/* Phase Rules/Guide */}
        <div className={`
          p-4 rounded-xl border relative overflow-hidden transition-all duration-500
          ${isDay 
            ? 'bg-gradient-to-br from-amber-900/10 to-slate-900 border-amber-900/30' 
            : 'bg-gradient-to-br from-indigo-900/10 to-slate-950 border-indigo-900/30'}
        `}>
            <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDay ? 'text-amber-100' : 'text-indigo-200'}`}>
              {isDay ? 'Fase Diurna' : 'Notte dei Predatori'}
            </h3>
            
            {isDay ? (
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li>Discussione libera.</li>
                <li>Chiunque può accusare.</li>
              </ul>
            ) : (
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                 <li>I Predatori scelgono una vittima.</li>
                 <li>I Guardiani restano in silenzio.</li>
              </ul>
            )}
        </div>

        {/* Players List */}
        <div>
          <div className="flex justify-between items-end mb-3 px-1">
             <h4 className="text-slate-500 uppercase text-xs font-bold tracking-wider">
               Giocatori
             </h4>
             <span className="text-xs text-slate-500">
               {aliveCount} Vivi
             </span>
          </div>
          <div className="space-y-2">
            {players.map(p => (
              <PlayerRow 
                key={p.id} 
                player={p} 
                onKill={killPlayer} 
                onRevive={revivePlayer}
                phase={gamePhase}
                showRoles={showRoles}
                isHost={isHost}
                currentUserId={currentPlayer?.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* End Game Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-yellow-500" /> Chi ha vinto?
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => endGame(Winner.PREDATORS)}
                className="bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-900/50 text-indigo-200 p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
              >
                <Ghost size={24} className="text-indigo-400" />
                <span className="font-bold">Predatori</span>
              </button>
              <button 
                onClick={() => endGame(Winner.GUARDIANS)}
                className="bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-200 p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
              >
                <ShieldCheck size={24} className="text-red-400" />
                <span className="font-bold">Guardiani</span>
              </button>
            </div>
            <Button variant="ghost" fullWidth onClick={() => setShowEndModal(false)}>
              Annulla, continua a giocare
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};