import type { BoardState, Player, BoardSize } from '../types/game';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface WinCheckResult {
  winner: Player | null;
  line: number[] | null;
}

// Hilfsfunktion: Gewinner berechnen
function checkWinner(squares: BoardState, boardSize: BoardSize, winCondition: number): WinCheckResult {
  const size = boardSize;

  // Horizontale Prüfung
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const line = Array.from({ length: winCondition }, (_, i) => row * size + col + i);
      const values = line.map(i => squares[i]);
      if (values[0] && values.every(v => v === values[0])) {
        return { winner: values[0], line };
      }
    }
  }

  // Vertikale Prüfung
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winCondition; row++) {
      const line = Array.from({ length: winCondition }, (_, i) => (row + i) * size + col);
      const values = line.map(i => squares[i]);
      if (values[0] && values.every(v => v === values[0])) {
        return { winner: values[0], line };
      }
    }
  }

  // Diagonale (top-left to bottom-right)
  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const line = Array.from({ length: winCondition }, (_, i) => (row + i) * size + col + i);
      const values = line.map(i => squares[i]);
      if (values[0] && values.every(v => v === values[0])) {
        return { winner: values[0], line };
      }
    }
  }

  // Diagonale (top-right to bottom-left)
  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = winCondition - 1; col < size; col++) {
      const line = Array.from({ length: winCondition }, (_, i) => (row + i) * size + col - i);
      const values = line.map(i => squares[i]);
      if (values[0] && values.every(v => v === values[0])) {
        return { winner: values[0], line };
      }
    }
  }

  return { winner: null, line: null };
}

// Hilfsfunktion: Leere Felder finden
function getEmptySquares(squares: BoardState): number[] {
  return squares.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
}

// EINFACH: Zufälliger Zug
function getEasyMove(squares: BoardState): number {
  const emptySquares = getEmptySquares(squares);
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
}

// MITTEL: Gewinn/Block-Strategie + Random
function getMediumMove(
  squares: BoardState,
  aiPlayer: Player,
  boardSize: BoardSize,
  winCondition: number
): number {
  const emptySquares = getEmptySquares(squares);
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Prüfe, ob AI gewinnen kann
  for (const square of emptySquares) {
    const testSquares = [...squares];
    testSquares[square] = aiPlayer;
    const { winner } = checkWinner(testSquares, boardSize, winCondition);
    if (winner === aiPlayer) {
      return square; // GEWINNEN!
    }
  }

  // 2. Prüfe, ob Gegner blockiert werden muss
  for (const square of emptySquares) {
    const testSquares = [...squares];
    testSquares[square] = humanPlayer;
    const { winner } = checkWinner(testSquares, boardSize, winCondition);
    if (winner === humanPlayer) {
      return square; // BLOCKIEREN!
    }
  }

  // 3. Nimm die Mitte (wenn verfügbar und Board ungerade)
  const center = Math.floor(boardSize * boardSize / 2);
  if (boardSize % 2 === 1 && squares[center] === null) {
    return center;
  }

  // 4. Zufälliger Zug
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
}

// SCHWER: Minimax-Algorithmus (mit Tiefenbegrenzung für Schlagbarkeit)
function getHardMove(
  squares: BoardState,
  aiPlayer: Player,
  boardSize: BoardSize,
  winCondition: number
): number {
  const emptySquares = getEmptySquares(squares);
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // Für größere Boards: stark begrenzte Tiefe für Performance
  const maxDepth = boardSize === 3 ? 9 : boardSize === 5 ? 3 : 2;

  function minimax(
    board: BoardState,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    const { winner } = checkWinner(board, boardSize, winCondition);

    // Terminal-Zustände
    if (winner === aiPlayer) return 10 - depth;
    if (winner === humanPlayer) return depth - 10;
    if (getEmptySquares(board).length === 0) return 0;
    if (depth >= maxDepth) return 0; // Tiefenbegrenzung

    const availableSpots = getEmptySquares(board);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const spot of availableSpots) {
        board[spot] = aiPlayer;
        const score = minimax(board, depth + 1, false, alpha, beta);
        board[spot] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const spot of availableSpots) {
        board[spot] = humanPlayer;
        const score = minimax(board, depth + 1, true, alpha, beta);
        board[spot] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return bestScore;
    }
  }

  // Performance-Optimierung: Bei vielen leeren Feldern nur Teilmenge prüfen
  let movesToCheck = emptySquares;
  if (emptySquares.length > 15) {
    // Bei vielen freien Feldern: nur zentrale und strategische Züge prüfen
    const strategic = emptySquares.filter(spot => {
      const row = Math.floor(spot / boardSize);
      const col = spot % boardSize;
      const centerRow = Math.floor(boardSize / 2);
      const centerCol = Math.floor(boardSize / 2);
      const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
      return distance <= 2; // Nur Felder nahe der Mitte
    });
    if (strategic.length > 0) {
      movesToCheck = strategic;
    } else {
      movesToCheck = emptySquares.slice(0, 10); // Maximal erste 10
    }
  }

  // Finde besten Zug
  let bestScore = -Infinity;
  let bestMove = movesToCheck[0];

  for (const spot of movesToCheck) {
    squares[spot] = aiPlayer;
    const score = minimax([...squares], 0, false, -Infinity, Infinity);
    squares[spot] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = spot;
    }
  }

  // 20% Chance für einen Fehler bei HARD (macht es schlagbar)
  if (Math.random() < 0.2 && emptySquares.length > 3) {
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  }

  return bestMove;
}

// Haupt-Funktion: AI-Zug berechnen
export function getAIMove(
  squares: BoardState,
  aiPlayer: Player,
  difficulty: AIDifficulty,
  boardSize: BoardSize,
  winCondition: number
): number {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(squares);
    case 'medium':
      return getMediumMove(squares, aiPlayer, boardSize, winCondition);
    case 'hard':
      return getHardMove(squares, aiPlayer, boardSize, winCondition);
    default:
      return getEasyMove(squares);
  }
}
