import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Square from './Square';
import Confetti from './Confetti';
import WinLine from './WinLine';
import { subscribeToGame, makeMove, finishGame, getCurrentPlayerId } from '../lib/gameService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Player, BoardState, WinResult, OnlineGame } from '../types/game';

function calculateWinner(squares: BoardState, boardSize: number, winCondition: number): WinResult {
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

interface OnlineBoardProps {
  initialGame: OnlineGame;
  gameSoundVolume?: number;
  onBack: () => void;
}

export default function OnlineBoard({ initialGame, gameSoundVolume = 30, onBack }: OnlineBoardProps) {
  const { user } = useAuth();
  const [game, setGame] = useState<OnlineGame>(initialGame);
  const [waitingForPlayer, setWaitingForPlayer] = useState(initialGame.status === 'waiting');

  const soundXRef = useRef<HTMLAudioElement>(null);
  const soundORef = useRef<HTMLAudioElement>(null);
  const gameFinishedRef = useRef(false);
  const matchStartTimeRef = useRef(Date.now());

  const playerId = getCurrentPlayerId();
  const isPlayer1 = game.player1_id === playerId;
  const mySymbol: Player = isPlayer1 ? 'X' : 'O';
  const opponentName = isPlayer1 ? game.player2_name : game.player1_name;
  const myName = isPlayer1 ? game.player1_name : game.player2_name;

  const { winner, line: winningLine } = calculateWinner(game.board_state, game.board_size, game.win_condition);
  const isBoardFull = game.board_state.every(square => square !== null);
  const isDraw = !winner && isBoardFull;
  const isMyTurn = game.current_player === mySymbol;

  // Lautstärke anwenden
  useEffect(() => {
    if (soundXRef.current) {
      soundXRef.current.volume = gameSoundVolume / 100;
      soundXRef.current.playbackRate = 1.0;
    }
    if (soundORef.current) {
      soundORef.current.volume = gameSoundVolume / 100;
      soundORef.current.playbackRate = 0.9;
    }
  }, [gameSoundVolume]);

  const playMoveSound = (player: Player) => {
    const soundRef = player === 'X' ? soundXRef : soundORef;
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch((error) => {
        console.error(`Sound für ${player} konnte nicht abgespielt werden:`, error);
      });
    }
  };

  // Track match to Supabase when user is logged in
  const trackMatchToSupabase = async (matchWinner: Player | null) => {
    if (!user) return;

    try {
      const durationSeconds = Math.floor((Date.now() - matchStartTimeRef.current) / 1000);

      // Determine result from player's perspective
      let result: 'win' | 'loss' | 'draw';
      if (!matchWinner) {
        result = 'draw';
      } else if (matchWinner === mySymbol) {
        result = 'win';
      } else {
        result = 'loss';
      }

      // Insert match history
      const { error: historyError } = await supabase.from('match_history').insert({
        user_id: user.id,
        opponent_type: 'pvp',
        opponent_name: opponentName || 'Unbekannt',
        ai_difficulty: null,
        board_size: game.board_size,
        win_condition: game.win_condition,
        match_mode: 'single',
        result,
        player_symbol: mySymbol,
        final_score_player: matchWinner === mySymbol ? 1 : 0,
        final_score_opponent: matchWinner && matchWinner !== mySymbol ? 1 : 0,
        total_rounds: 1,
        duration_seconds: durationSeconds,
      });

      if (historyError) {
        console.error('Error saving match history:', historyError);
        return;
      }

      // Update user stats
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError || !currentStats) {
        console.error('Error fetching user stats:', fetchError);
        return;
      }

      const statsUpdate = {
        games_played: (currentStats.games_played ?? 0) + 1,
        total_wins: result === 'win' ? (currentStats.total_wins ?? 0) + 1 : currentStats.total_wins,
        total_losses: result === 'loss' ? (currentStats.total_losses ?? 0) + 1 : currentStats.total_losses,
        total_draws: result === 'draw' ? (currentStats.total_draws ?? 0) + 1 : currentStats.total_draws,
        pvp_wins: result === 'win' ? (currentStats.pvp_wins ?? 0) + 1 : currentStats.pvp_wins,
        pvp_losses: result === 'loss' ? (currentStats.pvp_losses ?? 0) + 1 : currentStats.pvp_losses,
      };

      const { error: updateError } = await supabase
        .from('user_stats')
        .update(statsUpdate)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating user stats:', updateError);
      }
    } catch (error) {
      console.error('Error tracking match to Supabase:', error);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToGame(game.id, (updatedGame) => {
      setGame(updatedGame);

      if (updatedGame.status === 'playing' && waitingForPlayer) {
        setWaitingForPlayer(false);
      }

      // Play sound for opponent's move
      if (updatedGame.current_player !== mySymbol && updatedGame.current_player !== game.current_player) {
        playMoveSound(game.current_player);
      }
    });

    return unsubscribe;
  }, [game.id, mySymbol, waitingForPlayer]);

  // Handle game end
  useEffect(() => {
    if ((winner || isDraw) && !gameFinishedRef.current && game.status === 'playing') {
      gameFinishedRef.current = true;

      // Track match to Supabase if user is logged in
      trackMatchToSupabase(winner);

      setTimeout(() => {
        finishGame(game.id, winner);
      }, 1000);
    }
  }, [winner, isDraw, game.id, game.status]);

  async function handleClick(i: number) {
    if (game.board_state[i] || winner || !isMyTurn || waitingForPlayer || game.status !== 'playing') {
      return;
    }

    const nextSquares: BoardState = game.board_state.slice();
    nextSquares[i] = mySymbol;
    const nextPlayer: Player = mySymbol === 'X' ? 'O' : 'X';

    // Optimistic update
    setGame(prev => ({
      ...prev,
      board_state: nextSquares,
      current_player: nextPlayer,
    }));

    playMoveSound(mySymbol);

    // Send to server
    await makeMove(game.id, nextSquares, nextPlayer);
  }

  let status;
  let statusColor;

  if (waitingForPlayer) {
    status = `⏳ Warte auf Spieler... Code: ${game.game_code}`;
    statusColor = '#f59e0b';
  } else if (winner) {
    const winnerName = winner === mySymbol ? myName : opponentName;
    status = `🎉 ${winnerName} gewinnt!`;
    statusColor = winner === mySymbol ? '#4ade80' : '#ef4444';
  } else if (isDraw) {
    status = '🤝 Unentschieden!';
    statusColor = '#888';
  } else if (isMyTurn) {
    status = `Du bist dran (${mySymbol})`;
    statusColor = mySymbol === 'X' ? '#646cff' : '#f59e0b';
  } else {
    status = `${opponentName} ist dran...`;
    statusColor = '#888';
  }

  const boardVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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

      {/* Spieler Info */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '1rem' }}>
        <div style={{ color: mySymbol === 'X' ? '#646cff' : '#f59e0b' }}>
          Du: {myName} ({mySymbol})
        </div>
        {!waitingForPlayer && (
          <div style={{ color: mySymbol === 'X' ? '#f59e0b' : '#646cff' }}>
            Gegner: {opponentName} ({mySymbol === 'X' ? 'O' : 'X'})
          </div>
        )}
      </div>

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
          className={`board board-${game.board_size}x${game.board_size}`}
          variants={boardVariants}
          initial="hidden"
          animate="show"
          style={{
            gridTemplateColumns: `repeat(${game.board_size}, 1fr)`,
          }}
        >
          {game.board_state.map((square, i) => (
            <motion.div key={i} variants={squareItemVariants}>
              <Square
                value={square}
                onClick={() => handleClick(i)}
                isWinning={winningLine?.includes(i) || false}
                nextPlayer={mySymbol}
              />
            </motion.div>
          ))}
        </motion.div>

        <WinLine winningLine={winningLine} boardSize={game.board_size} />
      </motion.div>

      <motion.button
        className="back-button"
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ marginTop: '1rem' }}
      >
        ← Spiel verlassen
      </motion.button>

      <AnimatePresence>
        {winner && <Confetti winner={winner} />}
      </AnimatePresence>
    </div>
  );
}
