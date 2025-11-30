export const MIN_PLAYERS = 6;
export const MAX_PLAYERS = 16;

export const calculateRoles = (totalPlayers: number) => {
  // Logic: Roughly 1 predator for every 3-4 players, or standard specific breakdown
  // 6-8 players: 2 Predators
  // 9-12 players: 3 Predators
  // 13+ players: 4 Predators
  let predators = 2;
  if (totalPlayers >= 9) predators = 3;
  if (totalPlayers >= 13) predators = 4;
  
  return {
    predators,
    guardians: totalPlayers - predators
  };
};

export const DAWN_STEPS = [
  "Tutti chiudono gli occhi e abbassano la testa.",
  "Il narratore conta da 1 a 5 ad alta voce.",
  "Conta da 6 a 15 in silenzio: in questo momento SOLO i Predatori aprono gli occhi e si riconoscono.",
  "Conta da 16 a 20 ad alta voce.",
  "Al 20, tutti aprono gli occhi: inizia il primo Giorno."
];