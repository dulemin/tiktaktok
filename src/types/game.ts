export type Player = 'X' | 'O';
export type BoardState = (Player | null)[];

export type BoardSize = 3 | 5 | 7;
export type MatchMode = 'single' | 'best-of-3' | 'best-of-5';
export type GameMode = 'pvp' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type CoinSide = 'heads' | 'tails';

export interface GameSettings {
  boardSize: BoardSize;
  matchMode: MatchMode;
  winCondition: number; // how many in a row needed to win
  player1Name: string;
  player2Name: string;
  gameMode: GameMode;
  aiDifficulty?: AIDifficulty; // nur wenn gameMode === 'ai'
  playerCoinChoice?: CoinSide; // nur wenn gameMode === 'pvp'
}

export interface MatchStats {
  player1Wins: number;
  player2Wins: number;
  draws: number;
  currentRound: number;
  totalRounds: number;
}

export interface WinResult {
  winner: Player | null;
  line: number[] | null;
}
