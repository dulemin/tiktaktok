import { motion } from 'framer-motion';
import type { MatchStats } from '../types/game';

interface ScoreboardProps {
  stats: MatchStats;
  player1Name: string;
  player2Name: string;
  matchMode: string;
}

export default function Scoreboard({ stats, player1Name, player2Name, matchMode }: ScoreboardProps) {
  const isMatchMode = matchMode !== 'single';

  return (
    <motion.div
      className="scoreboard"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="scoreboard-header">
        {isMatchMode && (
          <div className="round-indicator">
            Runde {stats.currentRound} / {stats.totalRounds}
          </div>
        )}
      </div>

      <div className="score-container">
        <motion.div
          className="player-score player-1"
          whileHover={{ scale: 1.05 }}
        >
          <div className="player-info">
            <div className="player-symbol">X</div>
            <div className="player-name">{player1Name}</div>
          </div>
          <div className="score">{stats.player1Wins}</div>
        </motion.div>

        <div className="score-divider">
          <div className="vs">VS</div>
          {stats.draws > 0 && (
            <div className="draws">
              {stats.draws} 🤝
            </div>
          )}
        </div>

        <motion.div
          className="player-score player-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="player-info">
            <div className="player-symbol">O</div>
            <div className="player-name">{player2Name}</div>
          </div>
          <div className="score">{stats.player2Wins}</div>
        </motion.div>
      </div>

      {isMatchMode && (
        <div className="match-progress">
          <div className="progress-dots">
            {Array.from({ length: stats.totalRounds }).map((_, i) => {
              let status = 'pending';
              if (i < stats.currentRound - 1) {
                status = 'completed';
              } else if (i === stats.currentRound - 1) {
                status = 'current';
              }

              return (
                <motion.div
                  key={i}
                  className={`progress-dot ${status}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
