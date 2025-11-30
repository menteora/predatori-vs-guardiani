import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { SettingsScreen } from './SettingsScreen';
import { ShieldAlert, Users, Settings as SettingsIcon, LogIn, Plus } from 'lucide-react';

interface SetupScreenProps {
  initialCode?: string;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ initialCode }) => {
  const { createGame, joinGame, isLoading, error } = useGame();
  const [mode, setMode] = useState<'menu' | 'join' | 'create'>('menu');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setMode('join');
    }
  }, [initialCode]);

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  const handleCreate = () => {
    if (!name.trim()) return;
    createGame(name);
  };

  const handleJoin = () => {
    if (!name.trim() || !code.trim()) return;
    joinGame(code.toUpperCase(), name);
  };

  // Safe error display string
  const errorMessage = error ? (typeof error === 'string' ? error : 'Errore sconosciuto') : null;

  if (mode === 'menu') {
    return (
      <Container>
         <div className="absolute top-4 right-4">
            <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <SettingsIcon size={24} />
            </button>
         </div>

         <header className="mb-12 text-center pt-16">
            <div className="flex justify-center mb-6">
                 <div className="relative">
                     <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                     <ShieldAlert size={64} className="text-indigo-400 relative z-10" />
                 </div>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
            Predatori vs Guardiani
            </h1>
            <p className="text-slate-400">Multiplayer Edition</p>
        </header>

        <div className="space-y-4">
            <Button onClick={() => setMode('create')} fullWidth className="h-16 text-lg">
                <Plus size={24} /> Crea Nuova Partita
            </Button>
            <Button onClick={() => setMode('join')} variant="secondary" fullWidth className="h-16 text-lg">
                <LogIn size={24} /> Unisciti a Partita
            </Button>
        </div>
        
        {errorMessage && (
            <div className="mt-8 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-200 text-sm text-center">
                {errorMessage}
                <div className="mt-2 text-xs opacity-70">Controlla le impostazioni (ingranaggio in alto a destra)</div>
            </div>
        )}
      </Container>
    );
  }

  return (
    <Container>
        <header className="pt-8 mb-8">
            <button onClick={() => setMode('menu')} className="text-slate-400 hover:text-white mb-4 text-sm font-medium">
                &larr; Indietro
            </button>
            <h2 className="text-2xl font-bold text-white">
                {mode === 'create' ? 'Crea Partita' : 'Unisciti'}
            </h2>
            <p className="text-slate-400 text-sm">Inserisci i tuoi dati per iniziare</p>
        </header>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Il tuo Nome</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Es. Mario"
                />
            </div>

            {mode === 'join' && (
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Codice Stanza</label>
                    <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase font-mono tracking-widest"
                        placeholder="ABCD"
                        maxLength={4}
                    />
                </div>
            )}

            <Button 
                onClick={mode === 'create' ? handleCreate : handleJoin} 
                fullWidth 
                disabled={isLoading || !name || (mode === 'join' && !code)}
            >
                {isLoading ? 'Caricamento...' : (mode === 'create' ? 'Crea Stanza' : 'Entra')}
            </Button>
            
            {errorMessage && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-xs text-center">
                    {errorMessage}
                </div>
            )}
        </div>
    </Container>
  );
};