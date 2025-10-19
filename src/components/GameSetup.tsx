import { useState } from 'react';
import { motion } from 'framer-motion';
import type { BoardSize, MatchMode, GameSettings, GameMode, AIDifficulty, CoinSide } from '../types/game';

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [boardSize, setBoardSize] = useState<BoardSize>(3);
  const [matchMode, setMatchMode] = useState<MatchMode>('single');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const playerCoinChoice: CoinSide = 'heads';
  const [player1Name, setPlayer1Name] = useState('Spieler 1');
  const [player2Name, setPlayer2Name] = useState('Spieler 2');

  const handleStart = () => {
    const winCondition = boardSize === 3 ? 3 : boardSize === 5 ? 4 : 5;

    onStartGame({
      boardSize,
      matchMode,
      winCondition,
      player1Name: player1Name.trim() || 'Spieler 1',
      player2Name: gameMode === 'ai' ? 'KI' : (player2Name.trim() || 'Spieler 2'),
      gameMode,
      aiDifficulty: gameMode === 'ai' ? aiDifficulty : undefined,
      playerCoinChoice: gameMode === 'pvp' ? playerCoinChoice : undefined,
    });
  };

  const boardSizes: { size: BoardSize; label: string; desc: string }[] = [
    { size: 3, label: 'Klassisch', desc: '3x3 • 3 in einer Reihe' },
    { size: 5, label: 'Fortgeschritten', desc: '5x5 • 4 in einer Reihe' },
    { size: 7, label: 'Profi', desc: '7x7 • 5 in einer Reihe' },
  ];

  const matchModes: { mode: MatchMode; label: string; desc: string }[] = [
    { mode: 'single', label: 'Einzelspiel', desc: 'Ein Spiel' },
    { mode: 'best-of-3', label: 'Best of 3', desc: 'Erstes zu 2 Siegen' },
    { mode: 'best-of-5', label: 'Best of 5', desc: 'Erstes zu 3 Siegen' },
  ];

  const gameModes: { mode: GameMode; label: string; desc: string }[] = [
    { mode: 'pvp', label: 'Spieler vs Spieler', desc: 'Lokales Multiplayer' },
    { mode: 'ai', label: 'Spieler vs KI', desc: 'Gegen den Computer' },
  ];

  const difficulties: { difficulty: AIDifficulty; label: string; desc: string }[] = [
    { difficulty: 'easy', label: 'Einfach', desc: 'Für Anfänger' },
    { difficulty: 'medium', label: 'Mittel', desc: 'Herausfordernd' },
    { difficulty: 'hard', label: 'Schwer', desc: 'Für Profis' },
  ];

  return (
    <motion.div
      className="game-setup"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2>Spiel Einstellungen</h2>

      <div className="setup-section">
        <h3>Gegner</h3>
        <div className="option-grid">
          {gameModes.map(({ mode, label, desc }) => (
            <motion.button
              key={mode}
              className={`option-card ${gameMode === mode ? 'selected' : ''}`}
              onClick={() => setGameMode(mode)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="option-label">{label}</div>
              <div className="option-desc">{desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {gameMode === 'ai' && (
        <motion.div
          className="setup-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3>KI-Schwierigkeit</h3>
          <div className="option-grid">
            {difficulties.map(({ difficulty, label, desc }) => (
              <motion.button
                key={difficulty}
                className={`option-card ${aiDifficulty === difficulty ? 'selected' : ''}`}
                onClick={() => setAIDifficulty(difficulty)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="option-label">{label}</div>
                <div className="option-desc">{desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="setup-section">
        <h3>Spielernamen</h3>
        <div className="player-inputs">
          <div className="input-group">
            <label>Spieler 1 (X)</label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Spieler 1"
              maxLength={20}
            />
          </div>
          {gameMode === 'pvp' && (
            <div className="input-group">
              <label>Spieler 2 (O)</label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Spieler 2"
                maxLength={20}
              />
            </div>
          )}
        </div>
      </div>

      <div className="setup-section">
        <h3>Spielfeld-Größe</h3>
        <div className="option-grid">
          {boardSizes.map(({ size, label, desc }) => (
            <motion.button
              key={size}
              className={`option-card ${boardSize === size ? 'selected' : ''}`}
              onClick={() => setBoardSize(size)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="option-label">{label}</div>
              <div className="option-desc">{desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="setup-section">
        <h3>Spielmodus</h3>
        <div className="option-grid">
          {matchModes.map(({ mode, label, desc }) => (
            <motion.button
              key={mode}
              className={`option-card ${matchMode === mode ? 'selected' : ''}`}
              onClick={() => setMatchMode(mode)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="option-label">{label}</div>
              <div className="option-desc">{desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        className="start-game-button"
        onClick={handleStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🎮 Spiel starten
      </motion.button>
    </motion.div>
  );
}
