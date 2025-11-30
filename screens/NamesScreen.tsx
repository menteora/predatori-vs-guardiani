import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { ChevronRight, ArrowLeft, Contact } from 'lucide-react';

// Extend navigator interface for contact picker
declare global {
  interface Navigator {
    contacts?: {
      select: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ name: string[] }>>;
    };
  }
}

export const NamesScreen: React.FC = () => {
  const { playerCount, setPlayerNames } = useGame();
  
  // Local state to manage inputs before submitting to context
  const [localNames, setLocalNames] = useState<string[]>(Array(playerCount).fill(''));

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...localNames];
    newNames[index] = value;
    setLocalNames(newNames);
  };

  const handleBack = () => {
    window.location.reload(); 
  };

  const handleSubmit = () => {
    setPlayerNames(localNames);
  };

  const handleImportContacts = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert("L'importazione contatti non è supportata da questo browser. Prova su Android/Chrome Mobile.");
      return;
    }

    try {
      const contacts = await navigator.contacts!.select(['name'], { multiple: true });
      
      if (contacts.length > 0) {
        const newNames = [...localNames];
        let contactIdx = 0;
        
        // Fill empty slots or overwrite from the beginning depending on logic.
        // Here we try to fill empty slots first, then overwrite.
        for (let i = 0; i < newNames.length; i++) {
            if (contactIdx >= contacts.length) break;
            
            // Prioritize filling empty fields
            if (newNames[i].trim() === '') {
                const nameFromContact = contacts[contactIdx].name[0];
                if (nameFromContact) {
                    newNames[i] = nameFromContact;
                    contactIdx++;
                }
            }
        }
        setLocalNames(newNames);
      }
    } catch (err) {
      console.error("Error accessing contacts:", err);
    }
  };

  const isContactApiSupported = 'contacts' in navigator && 'ContactsManager' in window;

  return (
    <Container>
      <header className="flex items-center justify-between mb-4 pt-4">
        <Button variant="ghost" onClick={handleBack} className="!px-2">
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-xl font-bold text-slate-100">Inserisci Nomi</h2>
        <div className="w-10" /> 
      </header>

      {isContactApiSupported && (
        <div className="mb-4">
          <Button onClick={handleImportContacts} variant="secondary" fullWidth className="py-2 text-sm flex gap-2">
            <Contact size={18} /> Importa dalla Rubrica
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pb-6">
        {localNames.map((name, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
            <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-sm font-mono border border-slate-700">
              {idx + 1}
            </span>
            <input
              type="text"
              placeholder={`Giocatore ${idx + 1}`}
              value={name}
              onChange={(e) => handleNameChange(idx, e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              autoComplete="off"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950 sticky bottom-0 z-10">
        <Button onClick={handleSubmit} fullWidth>
          Assegna Ruoli <ChevronRight size={20} />
        </Button>
      </div>
    </Container>
  );
};