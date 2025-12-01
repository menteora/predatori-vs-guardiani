export enum AppPhase {
  SETUP = 'SETUP',
  LOBBY = 'LOBBY',
  BRIEFING = 'BRIEFING',
  GAME = 'GAME',
  ENDED = 'ENDED'
}

export enum GamePhase {
  DAY = 'DAY',
  NIGHT = 'NIGHT'
}

export enum Winner {
  PREDATORS = 'PREDATORS',
  GUARDIANS = 'GUARDIANS',
  NONE = 'NONE'
}

export enum Role {
  PREDATOR = 'PREDATOR',
  GUARDIAN = 'GUARDIAN',
  UNKNOWN = 'UNKNOWN' // For when roles are hidden
}

export interface Player {
  id: string; // This is the client ID
  room_code: string;
  name: string;
  is_alive: boolean;
  role: Role;
  is_host: boolean;
  created_at?: string;
}

export interface Room {
  code: string;
  phase: AppPhase;
  game_phase: GamePhase;
  round_count: number;
  winner: Winner;
  created_at?: string;
}

export interface GameContextType {
  // State
  appPhase: AppPhase;
  gamePhase: GamePhase;
  players: Player[];
  currentPlayer: Player | null; // The user using this device
  roomCode: string | null;
  winner: Winner;
  roundCount: number;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  clientId: string;

  // Actions
  configureServer: (url: string, key: string) => void;
  createGame: (hostName: string) => Promise<void>;
  joinGame: (code: string, name: string) => Promise<void>;
  startGame: () => Promise<void>; // Triggers role assignment
  toggleGamePhase: () => Promise<void>;
  killPlayer: (playerId: string) => Promise<void>;
  revivePlayer: (playerId: string) => Promise<void>;
  endGame: (winner: Winner) => Promise<void>;
  resetGame: (keepPlayers: boolean) => Promise<void>;
  leaveGame: () => void;
  
  // Backwards compatibility for unused props (to prevent TS errors in old components if any)
  playerCount: number;
  setPlayerCount: (n: number) => void;
  setPlayerNames: (names: string[]) => void;
  predatorCount: number;
  guardianCount: number;
}