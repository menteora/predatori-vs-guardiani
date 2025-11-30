import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from './GameContext';
import { SetupScreen } from './screens/SetupScreen';
import { NamesScreen } from './screens/NamesScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { BriefingScreen } from './screens/BriefingScreen';
import { GameScreen } from './screens/GameScreen';
import { EndScreen } from './screens/EndScreen';
import { AppPhase } from './types';

// Component to decide which screen to render
const AppContent: React.FC<{ initialCode: string }> = ({ initialCode }) => {
  const { appPhase } = useGame();

  switch (appPhase) {
    case AppPhase.SETUP:
      return <SetupScreen initialCode={initialCode} />;
    case AppPhase.LOBBY:
      return <LobbyScreen />;
    case AppPhase.BRIEFING:
      return <BriefingScreen />;
    case AppPhase.GAME:
      return <GameScreen />;
    case AppPhase.ENDED:
      return <EndScreen />;
    default:
      return <SetupScreen />;
  }
};

// Component to handle URL params for configuration and joining
const UrlListener: React.FC<{ onCodeFound: (code: string) => void }> = ({ onCodeFound }) => {
  const { configureServer } = useGame();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('u');
    const key = params.get('k');
    const room = params.get('room');

    if (url && key) {
      try {
        const decodedUrl = atob(url);
        const decodedKey = atob(key);
        configureServer(decodedUrl, decodedKey);
        
        // Clean URL after consuming params to avoid sensitive data in address bar
        const newUrl = window.location.pathname + (room ? `?room=${room}` : '');
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        console.error("Failed to decode config params", e);
      }
    }

    if (room) {
      onCodeFound(room);
      // If we didn't have config params, we still want to clean up eventually if we join, 
      // but let's leave it for now so the user can see the code if they refresh.
      // Or we can clean it now:
       window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [configureServer, onCodeFound]);

  return null;
};

const App: React.FC = () => {
  const [initialCode, setInitialCode] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <GameProvider>
        <UrlListener onCodeFound={setInitialCode} />
        <AppContent initialCode={initialCode} />
      </GameProvider>
    </div>
  );
};

export default App;