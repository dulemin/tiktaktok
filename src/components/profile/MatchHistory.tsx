import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import type { Tables } from '../../types/database';
import './MatchHistory.css';

type MatchHistoryRow = Tables<'match_history'>;

interface MatchHistoryProps {
  userId: string;
}

export default function MatchHistory({ userId }: MatchHistoryProps) {
  const [matches, setMatches] = useState<MatchHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ai' | 'pvp'>('all');

  useEffect(() => {
    loadMatchHistory();
  }, [userId, filter]);

  const loadMatchHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('match_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (filter !== 'all') {
        query = query.eq('opponent_type', filter);
      }

      const { data } = await query;
      setMatches(data || []);
    } catch (error) {
      console.error('Error loading match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win':
        return '🏆';
      case 'loss':
        return '💔';
      case 'draw':
        return '🤝';
      default:
        return '❓';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'win':
        return 'Sieg';
      case 'loss':
        return 'Niederlage';
      case 'draw':
        return 'Unentschieden';
      default:
        return 'Unbekannt';
    }
  };

  const getResultClass = (result: string) => {
    switch (result) {
      case 'win':
        return 'match-result-win';
      case 'loss':
        return 'match-result-loss';
      case 'draw':
        return 'match-result-draw';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="match-history-loading">
        <div className="loader"></div>
        <p>Lädt Spielhistorie...</p>
      </div>
    );
  }

  return (
    <div className="match-history">
      <div className="match-history-filters">
        <button
          onClick={() => setFilter('all')}
          className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : ''}`}
        >
          Alle
        </button>
        <button
          onClick={() => setFilter('ai')}
          className={`filter-btn ${filter === 'ai' ? 'filter-btn-active' : ''}`}
        >
          vs KI
        </button>
        <button
          onClick={() => setFilter('pvp')}
          className={`filter-btn ${filter === 'pvp' ? 'filter-btn-active' : ''}`}
        >
          vs Spieler
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="match-history-empty">
          <p>Noch keine Spiele in dieser Kategorie</p>
        </div>
      ) : (
        <div className="match-history-list">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              className={`match-card ${getResultClass(match.result)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="match-result-icon">{getResultIcon(match.result)}</div>

              <div className="match-details">
                <div className="match-header">
                  <span className="match-opponent">
                    {match.opponent_type === 'ai' ? '🤖 ' : '👤 '}
                    {match.opponent_name}
                    {match.ai_difficulty && (
                      <span className="match-difficulty">
                        {' '}({match.ai_difficulty === 'easy' ? 'Einfach' :
                           match.ai_difficulty === 'medium' ? 'Mittel' : 'Schwer'})
                      </span>
                    )}
                  </span>
                  <span className={`match-result-text ${getResultClass(match.result)}`}>
                    {getResultText(match.result)}
                  </span>
                </div>

                <div className="match-info">
                  <span className="match-info-item">
                    📊 {match.board_size}x{match.board_size}
                  </span>
                  <span className="match-info-item">
                    🎯 {match.win_condition} zum Sieg
                  </span>
                  <span className="match-info-item">
                    {match.match_mode === 'single' ? '⚡ Einzel' :
                     match.match_mode === 'best-of-3' ? '🔥 Best of 3' : '💪 Best of 5'}
                  </span>
                </div>

                <div className="match-score">
                  <span className="score-label">Punktestand:</span>
                  <span className="score-value">
                    {match.final_score_player} - {match.final_score_opponent}
                  </span>
                  {match.duration_seconds && (
                    <span className="match-duration">
                      ⏱️ {Math.floor(match.duration_seconds / 60)}m {match.duration_seconds % 60}s
                    </span>
                  )}
                </div>

                <div className="match-date">
                  {formatDate(match.created_at || '')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
