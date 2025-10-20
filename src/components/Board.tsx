import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Square from './Square';
import Confetti from './Confetti';
import WinLine from './WinLine';
import type { Player, BoardState, WinResult, BoardSize, GameMode, AIDifficulty, MatchMode } from '../types/game';
import { getAIMove } from '../utils/ai';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

function calculateWinner(squares: BoardState, boardSize: BoardSize, winCondition: number): WinResult {
  const size = boardSize;

  // Check all possible lines
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const line = Array.from({ length: winCondition }, (_, i) => row * size + col + i);
      const values = line.map(i => squares[i]);
      if (values[0] && values.every(v => v === values[0])) {
        return { winner: values[0], line };
      }
    }
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winCondition; row++) {
      const line = Array.from({ length: winCondition }, (_, i) => (row + i) * size + col);
      const values = line.map(i => squares[i]);
      if (values[0] && values.every(v => v === values[0])) {
        return { winner: values[0], line };
      }
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const line = Array.from({ length: winCondition }, (_, i) => (row + i) * size + col + i);
      const values = line.map(i => squares[i]);
      if (values[0] && values.every(v => v === values[0])) {
        return { winner: values[0], line };
      }
    }
  }

  // Check diagonals (top-right to bottom-left)
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

interface BoardProps {
  boardSize: BoardSize;
  winCondition: number;
  player1Name: string;
  player2Name: string;
  gameMode: GameMode;
  aiDifficulty?: AIDifficulty;
  startingPlayer?: Player;
  gameSoundVolume?: number;
  matchMode?: MatchMode;
  onRoundEnd?: (winner: Player | null) => void;
}

export default function Board({ boardSize, winCondition, player1Name, player2Name, gameMode, aiDifficulty, startingPlayer = 'X', gameSoundVolume = 30, matchMode = 'single', onRoundEnd }: BoardProps) {
  const totalSquares = boardSize * boardSize;
  const [squares, setSquares] = useState<BoardState>(Array(totalSquares).fill(null));
  const [xIsNext, setXIsNext] = useState(startingPlayer === 'X');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const roundEndCalledRef = useRef(false);
  const aiStartedRef = useRef(false);
  const matchStartTimeRef = useRef<number>(Date.now());
  const { user } = useAuth();

  // Sound Refs für Spielzüge
  const soundXRef = useRef<HTMLAudioElement>(null);
  const soundORef = useRef<HTMLAudioElement>(null);

  // Lautstärke anwenden
  useEffect(() => {
    if (soundXRef.current) {
      soundXRef.current.volume = gameSoundVolume / 100;
      soundXRef.current.playbackRate = 1.0; // Normal
    }
    if (soundORef.current) {
      soundORef.current.volume = gameSoundVolume / 100;
      soundORef.current.playbackRate = 0.9; // Etwas tiefer/langsamer
    }
  }, [gameSoundVolume]);

  const { winner, line: winningLine } = calculateWinner(squares, boardSize, winCondition);
  const isBoardFull = squares.every(square => square !== null);
  const isDraw = !winner && isBoardFull;

  // Sound abspielen für Spielzüge
  const playMoveSound = (player: Player) => {
    const soundRef = player === 'X' ? soundXRef : soundORef;
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch((error) => {
        console.error(`Sound für ${player} konnte nicht abgespielt werden:`, error);
      });
    } else {
      console.warn(`Sound-Ref für ${player} nicht verfügbar`);
    }
  };

  // Track match to Supabase when user is logged in
  const trackMatchToSupabase = async (matchWinner: Player | null) => {
    if (!user) return;

    try {
      const durationSeconds = Math.floor((Date.now() - matchStartTimeRef.current) / 1000);
      const playerSymbol = startingPlayer;

      // Determine result from player's perspective (X is always the logged-in player)
      let result: 'win' | 'loss' | 'draw';
      if (!matchWinner) {
        result = 'draw';
      } else if (matchWinner === 'X') {
        result = 'win';
      } else {
        result = 'loss';
      }

      // Insert match history
      const { error: historyError } = await supabase.from('match_history').insert({
        user_id: user.id,
        opponent_type: gameMode === 'ai' ? 'ai' : 'pvp',
        opponent_name: gameMode === 'ai' ? 'KI' : player2Name,
        ai_difficulty: gameMode === 'ai' ? aiDifficulty : null,
        board_size: boardSize,
        win_condition: winCondition,
        match_mode: matchMode,
        result,
        player_symbol: playerSymbol,
        final_score_player: 1, // Single round
        final_score_opponent: matchWinner === 'O' ? 1 : 0,
        total_rounds: 1,
        duration_seconds: durationSeconds,
      });

      if (historyError) {
        console.error('Error inserting match history:', historyError);
        return;
      }

      // Update user stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (currentStats) {
        const updates: Record<string, number> = {
          games_played: (currentStats.games_played ?? 0) + 1,
        };

        if (result === 'win') {
          updates.total_wins = (currentStats.total_wins ?? 0) + 1;
          if (gameMode === 'ai') {
            updates.ai_wins = (currentStats.ai_wins ?? 0) + 1;
          } else {
            updates.pvp_wins = (currentStats.pvp_wins ?? 0) + 1;
          }
        } else if (result === 'loss') {
          updates.total_losses = (currentStats.total_losses ?? 0) + 1;
          if (gameMode === 'ai') {
            updates.ai_losses = (currentStats.ai_losses ?? 0) + 1;
          } else {
            updates.pvp_losses = (currentStats.pvp_losses ?? 0) + 1;
          }
        } else {
          updates.total_draws = (currentStats.total_draws ?? 0) + 1;
        }

        const { error: statsError } = await supabase
          .from('user_stats')
          .update(updates)
          .eq('user_id', user.id);

        if (statsError) {
          console.error('Error updating stats:', statsError);
        }
      }
    } catch (error) {
      console.error('Error tracking match:', error);
    }
  };

  useEffect(() => {
    if ((winner || isDraw) && !roundEndCalledRef.current) {
      roundEndCalledRef.current = true;

      // Track to Supabase if user is logged in
      trackMatchToSupabase(winner);

      setTimeout(() => {
        onRoundEnd?.(winner);
      }, 2000);
    }
  }, [winner, isDraw, onRoundEnd]);

  // Board Reset nur bei Größenänderung
  useEffect(() => {
    setSquares(Array(totalSquares).fill(null));
    setXIsNext(startingPlayer === 'X');
    setIsAIThinking(false);
    roundEndCalledRef.current = false;
    aiStartedRef.current = false;
  }, [boardSize, totalSquares]);

  // Startspieler setzen und AI-ersten-Zug vorbereiten
  useEffect(() => {
    const shouldAIStart = startingPlayer === 'O' && gameMode === 'ai';
    const isBoardEmpty = squares.every(s => s === null);

    // Wenn AI anfangen soll und Board leer ist, nach kurzer Verzögerung triggern
    if (shouldAIStart && isBoardEmpty && !winner && !aiStartedRef.current) {
      aiStartedRef.current = true;
      setIsAIThinking(true);

      // Verzögere Berechnung bis nächster Frame, damit UI update gerendert wird
      const frameId = requestAnimationFrame(() => {
        const startTime = Date.now();
        const aiMove = getAIMove(
          squares,
          'O',
          aiDifficulty || 'medium',
          boardSize,
          winCondition
        );

        // Warte mindestens 2 Sekunden ab Start (inkl. Berechnungszeit)
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);

        const timer = setTimeout(() => {
          const nextSquares: BoardState = squares.slice();
          nextSquares[aiMove] = 'O';
          setSquares(nextSquares);
          setXIsNext(true);
          setIsAIThinking(false);
          playMoveSound('O'); // Sound direkt abspielen
        }, remainingDelay);

        return () => clearTimeout(timer);
      });

      return () => {
        cancelAnimationFrame(frameId);
        aiStartedRef.current = false;
      };
    }
  }, [startingPlayer, gameMode, winner, aiDifficulty, boardSize, winCondition, squares]);

  // AI-Zug Logik - läuft wenn AI dran ist (nach Spielerzug)
  useEffect(() => {
    // Prüfen ob AI dran ist
    const isAITurn = gameMode === 'ai' && !xIsNext;
    const canMove = !winner && !isDraw && !isAIThinking;
    const boardHasSpace = squares.some(square => square === null);
    const boardNotEmpty = squares.some(square => square !== null);

    if (isAITurn && canMove && boardHasSpace && boardNotEmpty) {
      setIsAIThinking(true);

      // Verzögere Berechnung bis nächster Frame, damit UI update gerendert wird
      const frameId = requestAnimationFrame(() => {
        const startTime = Date.now();
        const aiMove = getAIMove(
          squares,
          'O', // AI spielt immer als O
          aiDifficulty || 'medium',
          boardSize,
          winCondition
        );

        // Warte mindestens 2 Sekunden ab Start (inkl. Berechnungszeit)
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);

        const aiMoveTimer = setTimeout(() => {
          const nextSquares: BoardState = squares.slice();
          nextSquares[aiMove] = 'O';
          setSquares(nextSquares);
          setXIsNext(true);
          setIsAIThinking(false);
          playMoveSound('O'); // Sound direkt abspielen
        }, remainingDelay);

        return () => clearTimeout(aiMoveTimer);
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [squares, xIsNext, winner, isDraw, gameMode, aiDifficulty, boardSize, winCondition]);

  function handleClick(i: number) {
    if (squares[i] || winner || isAIThinking) {
      return;
    }

    const currentPlayer = xIsNext ? 'X' : 'O';
    const nextSquares: BoardState = squares.slice();
    nextSquares[i] = currentPlayer;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    playMoveSound(currentPlayer); // Sound abspielen
  }

  function resetRound() {
    setSquares(Array(totalSquares).fill(null));
    setXIsNext(startingPlayer === 'X');
    setIsAIThinking(false);
    roundEndCalledRef.current = false;
    aiStartedRef.current = false;
    matchStartTimeRef.current = Date.now(); // Reset match start time
  }

  let status;
  let statusColor;
  if (winner) {
    const winnerName = winner === 'X' ? player1Name : player2Name;
    status = `🎉 ${winnerName} gewinnt!`;
    statusColor = winner === 'X' ? '#646cff' : '#f59e0b';
  } else if (isDraw) {
    status = '🤝 Unentschieden!';
    statusColor = '#888';
  } else if (isAIThinking) {
    status = '🤖 KI denkt...';
    statusColor = '#f59e0b';
  } else {
    const currentPlayerName = xIsNext ? player1Name : player2Name;
    status = `${currentPlayerName} ist dran (${xIsNext ? 'X' : 'O'})`;
    statusColor = xIsNext ? '#646cff' : '#f59e0b';
  }

  const boardVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const squareItemVariants = {
    hidden: { scale: 0, rotateY: -180 },
    show: {
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="game">
      {/* Sound Effekte */}
      <audio
        ref={soundXRef}
        src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3"
        preload="auto"
      />
      <audio
        ref={soundORef}
        src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3"
        preload="auto"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          className="status"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: statusColor }}
        >
          {status}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="board-container"
        style={{
          perspective: '1000px',
          position: 'relative',
        }}
      >
        <motion.div
          className={`board board-${boardSize}x${boardSize}`}
          variants={boardVariants}
          initial="hidden"
          animate="show"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          }}
        >
          {squares.map((square, i) => (
            <motion.div key={i} variants={squareItemVariants}>
              <Square
                value={square}
                onClick={() => handleClick(i)}
                isWinning={winningLine?.includes(i) || false}
                nextPlayer={xIsNext ? 'X' : 'O'}
              />
            </motion.div>
          ))}
        </motion.div>

        <WinLine winningLine={winningLine} boardSize={boardSize} />
      </motion.div>

      <motion.button
        className="reset-button"
        onClick={resetRound}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔄 Neue Runde
      </motion.button>

      <AnimatePresence>
        {winner && <Confetti winner={winner} />}
      </AnimatePresence>
    </div>
  );
}
