import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppPhase, GamePhase, Player, Winner, Role, GameContextType, Room } from './types';
import { calculateRoles } from './constants';
import { supabase, getSupabaseConfig, reinitSupabaseClient } from './lib/supabase';
import { getClientId } from './utils/identity';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper to safely stringify errors
const safeErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Errore sconosciuto';
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomState, setRoomState] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Trigger to force effect re-run when config changes
  const [connectionId, setConnectionId] = useState(0);

  const clientId = getClientId();
  const currentPlayer = players.find(p => p.id === clientId) || null;
  const isHost = currentPlayer?.is_host || false;

  // Sync state from room object
  const appPhase = roomState?.phase || AppPhase.SETUP;
  const gamePhase = roomState?.game_phase || GamePhase.DAY;
  const roundCount = roomState?.round_count || 1;
  const winner = roomState?.winner || Winner.NONE;
  
  // Derived counts for display
  const playerCount = players.length;
  const { predators: predatorCount, guardians: guardianCount } = calculateRoles(playerCount);

  // ----------------------------------------------------------------------
  // Realtime Subscriptions
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!roomCode) return;

    const { url, key } = getSupabaseConfig();
    if (!url || !key) {
        setError("Supabase non configurato. Vai nelle impostazioni.");
        return;
    }

    console.log(`[Realtime] Subscribing to room ${roomCode}`);

    // Subscribe to Room updates
    const roomChannel = supabase
      .channel(`room:${roomCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` }, (payload) => {
        console.log('[Realtime] Room updated:', payload.new);
        setRoomState(payload.new as Room);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError("Errore connessione realtime");
        }
      });

    // Subscribe to Player updates
    const playerChannel = supabase
      .channel(`players:${roomCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${roomCode}` }, () => {
        console.log('[Realtime] Players table changed, refreshing list...');
        refreshPlayers(roomCode);
      })
      .subscribe();

    // Initial fetch
    fetchRoomData(roomCode);

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playerChannel);
    };
  }, [roomCode, connectionId]);

  const fetchRoomData = async (code: string) => {
    try {
      const { data: room, error } = await supabase.from('rooms').select('*').eq('code', code).single();
      if (error) throw error;
      if (room) setRoomState(room);
      refreshPlayers(code);
    } catch (e) {
      console.error(e);
      // Don't set global error here to avoid UI blocking, just log
    }
  };

  const refreshPlayers = async (code: string) => {
    try {
      const { data } = await supabase.from('players').select('*').eq('room_code', code).order('created_at', { ascending: true });
      if (data) setPlayers(data as Player[]);
    } catch (e) {
      console.error("Error fetching players", e);
    }
  };

  // ----------------------------------------------------------------------
  // Actions
  // ----------------------------------------------------------------------

  const configureServer = (url: string, key: string) => {
    reinitSupabaseClient(url, key);
    setError(null);
    setConnectionId(prev => prev + 1); // Trigger re-subscription if active
  };

  const createGame = async (hostName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      
      const { error: roomError } = await supabase.from('rooms').insert({
        code,
        phase: AppPhase.LOBBY
      });

      if (roomError) throw roomError;

      const { error: playerError } = await supabase.from('players').insert({
        id: clientId,
        room_code: code,
        name: hostName,
        is_host: true
      });

      if (playerError) throw playerError;

      setRoomCode(code);
    } catch (e: any) {
      console.error(e);
      setError(safeErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (code: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Check if room exists
      const { data: room, error: roomCheckError } = await supabase.from('rooms').select('code').eq('code', code).single();
      if (roomCheckError || !room) throw new Error("Stanza non trovata o connessione fallita");

      // 2. Check if I am ALREADY in the room (re-joining)
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('is_host, role, is_alive')
        .eq('room_code', code)
        .eq('id', clientId)
        .maybeSingle();

      // 3. Prepare payload: preserve host status/role if existing, otherwise default
      const playerPayload = {
        id: clientId,
        room_code: code,
        name: name,
        is_host: existingPlayer ? existingPlayer.is_host : false,
        role: existingPlayer ? existingPlayer.role : Role.UNKNOWN,
        is_alive: existingPlayer ? existingPlayer.is_alive : true
      };

      const { error: joinError } = await supabase.from('players').upsert(playerPayload);

      if (joinError) throw joinError;

      setRoomCode(code);
    } catch (e: any) {
      console.error(e);
      setError(safeErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = async () => {
    if (!roomCode || !isHost) return;

    // Logic: Assign Roles
    const { predators, guardians } = calculateRoles(players.length);
    const rolesPool = [
      ...Array(predators).fill(Role.PREDATOR),
      ...Array(players.length - predators).fill(Role.GUARDIAN)
    ];
    // Safety fill
    while(rolesPool.length < players.length) rolesPool.push(Role.GUARDIAN);
    
    const shuffledRoles = shuffleArray(rolesPool);

    // Update all players in DB
    const updates = players.map((p, idx) => ({
      ...p,
      role: shuffledRoles[idx]
    }));

    await supabase.from('players').upsert(updates);
    
    // Update Room Phase
    await supabase.from('rooms').update({
        phase: AppPhase.BRIEFING
    }).eq('code', roomCode);
  };

  const toggleGamePhase = async () => {
    if (!roomCode || !isHost) return;
    const nextPhase = gamePhase === GamePhase.DAY ? GamePhase.NIGHT : GamePhase.DAY;
    const nextRound = nextPhase === GamePhase.DAY ? roundCount + 1 : roundCount;

    await supabase.from('rooms').update({
        game_phase: nextPhase,
        round_count: nextRound
    }).eq('code', roomCode);
  };

  const killPlayer = async (playerId: string) => {
    if (!roomCode || !isHost) return;
    await supabase.from('players').update({ is_alive: false }).eq('id', playerId).eq('room_code', roomCode);
  };

  const revivePlayer = async (playerId: string) => {
    if (!roomCode || !isHost) return;
    await supabase.from('players').update({ is_alive: true }).eq('id', playerId).eq('room_code', roomCode);
  };

  const endGame = async (w: Winner) => {
    if (!roomCode || !isHost) return;
    await supabase.from('rooms').update({
        phase: AppPhase.ENDED,
        winner: w
    }).eq('code', roomCode);
  };

  const resetGame = async (keepPlayers: boolean) => {
    if (!roomCode || !isHost) return;

    if (keepPlayers) {
        // Reset Alive Status and Room Stats
        await supabase.from('players').update({ is_alive: true, role: Role.UNKNOWN }).eq('room_code', roomCode);
        await supabase.from('rooms').update({
            phase: AppPhase.LOBBY,
            game_phase: GamePhase.DAY,
            round_count: 1,
            winner: Winner.NONE
        }).eq('code', roomCode);
    } else {
        await supabase.from('rooms').update({
            phase: AppPhase.LOBBY,
            game_phase: GamePhase.DAY,
            round_count: 1,
            winner: Winner.NONE
        }).eq('code', roomCode);
    }
  };

  const leaveGame = () => {
    setRoomCode(null);
    setPlayers([]);
    setRoomState(null);
    setError(null);
  };

  return (
    <GameContext.Provider value={{
      appPhase,
      gamePhase,
      players,
      currentPlayer,
      roomCode,
      winner,
      roundCount,
      isHost,
      isLoading,
      error,
      clientId, // Exposed Client ID
      configureServer,
      createGame,
      joinGame,
      startGame,
      toggleGamePhase,
      killPlayer,
      revivePlayer,
      endGame,
      resetGame,
      leaveGame,
      // Compatibility props
      playerCount, 
      setPlayerCount: () => {}, 
      setPlayerNames: () => {},
      predatorCount, 
      guardianCount 
    }}>
      {children}
    </GameContext.Provider>
  );
};