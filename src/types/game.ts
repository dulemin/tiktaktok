export type Player = 'X' | 'O';
export type BoardState = (Player | null)[];

export type BoardSize = 3 | 5 | 7;
export type MatchMode = 'single' | 'best-of-3' | 'best-of-5';
export type GameMode = 'pvp' | 'ai' | 'online';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type CoinSide = 'heads' | 'tails';
export type OnlineGameStatus = 'waiting' | 'playing' | 'finished';

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

// Online Multiplayer Types
export interface OnlineGame {
  id: string;
  game_code: string;
  board_state: BoardState;
  board_size: BoardSize;
  win_condition: number;
  current_player: Player;
  player1_id: string;
  player1_name: string;
  player2_id: string | null;
  player2_name: string | null;
  status: OnlineGameStatus;
  winner: Player | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGameParams {
  boardSize: BoardSize;
  winCondition: number;
  playerName: string;
}

export interface JoinGameParams {
  gameCode: string;
  playerName: string;
}
