import { useState } from 'react';
import { motion } from 'framer-motion';
import { createGame, joinGame } from '../lib/gameService';
import type { BoardSize, OnlineGame } from '../types/game';

interface OnlineGameSetupProps {
  boardSize: BoardSize;
  winCondition: number;
  onGameReady: (game: OnlineGame) => void;
  onBack: () => void;
}

export default function OnlineGameSetup({ boardSize, winCondition, onGameReady, onBack }: OnlineGameSetupProps) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Bitte gib deinen Namen ein');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createGame({
      boardSize,
      winCondition,
      playerName: playerName.trim(),
    });

    setLoading(false);

    if ('error' in result) {
      setError(result.error);
    } else {
      // Warte auf den zweiten Spieler - wird in separater Komponente behandelt
      onGameReady(result.game);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Bitte gib deinen Namen ein');
      return;
    }

    if (!gameCode.trim()) {
      setError('Bitte gib den Spielcode ein');
      return;
    }

    setLoading(true);
    setError('');

    const result = await joinGame({
      gameCode: gameCode.trim(),
      playerName: playerName.trim(),
    });

    setLoading(false);

    if ('error' in result) {
      setError(result.error);
    } else {
      onGameReady(result.game);
    }
  };

  if (mode === 'choose') {
    return (
      <motion.div
        className="game-setup"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>🌐 Online Multiplayer</h2>

        <div className="setup-section">
          <h3>Was möchtest du tun?</h3>
          <div className="option-grid">
            <motion.div
              className="option-card"
              onClick={() => setMode('create')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="option-label">🎮 Spiel erstellen</div>
              <div className="option-desc">Erstelle ein neues Spiel und teile den Code</div>
            </motion.div>

            <motion.div
              className="option-card"
              onClick={() => setMode('join')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="option-label">🔗 Spiel beitreten</div>
              <div className="option-desc">Tritt einem Spiel mit einem Code bei</div>
            </motion.div>
          </div>
        </div>

        <motion.button
          className="back-button"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Zurück zum Menü
        </motion.button>
      </motion.div>
    );
  }

  if (mode === 'create') {
    return (
      <motion.div
        className="game-setup"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>🎮 Spiel erstellen</h2>

        <div className="setup-section">
          <h3>Dein Name</h3>
          <div className="input-group">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="z.B. Max"
              maxLength={20}
              disabled={loading}
            />
          </div>
        </div>

        <div className="setup-section">
          <h3>Spieleinstellungen</h3>
          <div className="option-desc" style={{ marginBottom: '0.5rem' }}>
            Board: {boardSize}x{boardSize} • {winCondition} in einer Reihe
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <motion.button
          className="start-game-button"
          onClick={handleCreateGame}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? '⏳ Erstelle Spiel...' : '🎮 Spiel erstellen'}
        </motion.button>

        <motion.button
          className="back-button"
          onClick={() => setMode('choose')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ marginTop: '1rem' }}
        >
          ← Zurück
        </motion.button>
      </motion.div>
    );
  }

  // Join Mode
  return (
    <motion.div
      className="game-setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2>🔗 Spiel beitreten</h2>

      <div className="setup-section">
        <h3>Dein Name</h3>
        <div className="input-group">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="z.B. Anna"
            maxLength={20}
            disabled={loading}
          />
        </div>
      </div>

      <div className="setup-section">
        <h3>Spielcode</h3>
        <div className="input-group">
          <input
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="z.B. ABC123"
            maxLength={6}
            disabled={loading}
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <motion.button
        className="start-game-button"
        onClick={handleJoinGame}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? '⏳ Trete bei...' : '🚀 Spiel beitreten'}
      </motion.button>

      <motion.button
        className="back-button"
        onClick={() => setMode('choose')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ marginTop: '1rem' }}
      >
        ← Zurück
      </motion.button>
    </motion.div>
  );
}
