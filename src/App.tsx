import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Board from './components/Board'
import SettingsMenu from './components/SettingsMenu'
import GameSetup from './components/GameSetup'
import Scoreboard from './components/Scoreboard'
import CoinFlip from './components/CoinFlip'
import { MusicPlayerProvider } from './components/MusicPlayer'
import type { GameSettings, MatchStats, Player, CoinSide } from './types/game'
import './App.css'

function App() {
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [matchStats, setMatchStats] = useState<MatchStats>({
    player1Wins: 0,
    player2Wins: 0,
    draws: 0,
    currentRound: 1,
    totalRounds: 1,
  })
  const [matchWinner, setMatchWinner] = useState<string | null>(null)
  const [showSetup, setShowSetup] = useState(true)
  const [showCoinFlip, setShowCoinFlip] = useState(false)
  const [startingPlayer, setStartingPlayer] = useState<Player>('X')
  const [gameSoundVolume, setGameSoundVolume] = useState(30) // 30% default

  useEffect(() => {
    const savedStats = localStorage.getItem('ticTacToeStats')
    if (savedStats) {
      const stats = JSON.parse(savedStats)
      // Only load wins, not current round/match state
      setMatchStats(prev => ({
        ...prev,
        player1Wins: stats.player1Wins || 0,
        player2Wins: stats.player2Wins || 0,
        draws: stats.draws || 0,
      }))
    }
  }, [])

  const handleStartGame = (settings: GameSettings) => {
    setGameSettings(settings)
    setShowSetup(false)
    setShowCoinFlip(true)

    const totalRounds = settings.matchMode === 'best-of-3' ? 3
      : settings.matchMode === 'best-of-5' ? 5
      : 1

    setMatchStats({
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      currentRound: 1,
      totalRounds,
    })
    setMatchWinner(null)
  }

  const handleCoinFlipComplete = (result: CoinSide) => {
    if (!gameSettings) return

    if (gameSettings.gameMode === 'ai') {
      // Heads = player starts first, Tails = AI starts first
      setStartingPlayer(result === 'heads' ? 'X' : 'O')
    } else {
      // PvP: if result matches player's choice, player1 starts
      const playerWon = result === gameSettings.playerCoinChoice
      setStartingPlayer(playerWon ? 'X' : 'O')
    }

    setShowCoinFlip(false)
  }

  const handleRoundEnd = (winner: Player | null) => {
    if (!gameSettings) return

    const newStats = { ...matchStats }

    if (winner === 'X') {
      newStats.player1Wins++
    } else if (winner === 'O') {
      newStats.player2Wins++
    } else {
      newStats.draws++
    }

    newStats.currentRound++

    // Save to localStorage
    localStorage.setItem('ticTacToeStats', JSON.stringify({
      player1Wins: newStats.player1Wins,
      player2Wins: newStats.player2Wins,
      draws: newStats.draws,
    }))

    setMatchStats(newStats)

    // Check match winner for best-of modes
    if (gameSettings.matchMode === 'best-of-3' && newStats.player1Wins === 2) {
      setMatchWinner(gameSettings.player1Name)
    } else if (gameSettings.matchMode === 'best-of-3' && newStats.player2Wins === 2) {
      setMatchWinner(gameSettings.player2Name)
    } else if (gameSettings.matchMode === 'best-of-5' && newStats.player1Wins === 3) {
      setMatchWinner(gameSettings.player1Name)
    } else if (gameSettings.matchMode === 'best-of-5' && newStats.player2Wins === 3) {
      setMatchWinner(gameSettings.player2Name)
    }
  }

  const handleBackToSetup = () => {
    setShowSetup(true)
    setGameSettings(null)
    setMatchWinner(null)
  }

  return (
    <MusicPlayerProvider>
      <div className="app">
        <SettingsMenu
          gameSoundVolume={gameSoundVolume}
          onGameSoundVolumeChange={setGameSoundVolume}
        />

        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Tic Tac Toe
        </motion.h1>

        <AnimatePresence mode="wait">
          {showSetup ? (
            <GameSetup key="setup" onStartGame={handleStartGame} />
          ) : showCoinFlip ? (
            <CoinFlip
              key="coinflip"
              onComplete={handleCoinFlipComplete}
              playerChoice={gameSettings?.playerCoinChoice}
              showChoice={gameSettings?.gameMode === 'pvp'}
            />
          ) : matchWinner ? (
            <motion.div
              key="winner"
              className="match-winner"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <h2>🏆 Match Gewinner</h2>
              <div className="winner-name">{matchWinner}</div>
              <motion.button
                className="back-button"
                onClick={handleBackToSetup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Zurück zum Menü
              </motion.button>
            </motion.div>
          ) : gameSettings && (
            <motion.div
              key="game"
              className="game-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Scoreboard
                stats={matchStats}
                player1Name={gameSettings.player1Name}
                player2Name={gameSettings.player2Name}
                matchMode={gameSettings.matchMode}
              />

              <Board
                boardSize={gameSettings.boardSize}
                winCondition={gameSettings.winCondition}
                player1Name={gameSettings.player1Name}
                player2Name={gameSettings.player2Name}
                gameMode={gameSettings.gameMode}
                aiDifficulty={gameSettings.aiDifficulty}
                startingPlayer={startingPlayer}
                gameSoundVolume={gameSoundVolume}
                onRoundEnd={handleRoundEnd}
              />

              <motion.button
                className="back-button"
                onClick={handleBackToSetup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Zurück zum Menü
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MusicPlayerProvider>
  )
}

export default App
