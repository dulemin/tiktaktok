import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { Tables } from '../../types/database';
import MatchHistory from './MatchHistory';
import './ProfilePage.css';

type UserProfile = Tables<'user_profiles'>;
type UserStats = Tables<'user_stats'>;

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);

      // Load stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setStats(statsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Lädt Profil...</p>
      </div>
    );
  }

  if (!user || !profile || !stats) {
    return (
      <div className="profile-error">
        <p>Fehler beim Laden des Profils</p>
      </div>
    );
  }

  const winRate = stats.games_played > 0
    ? ((stats.total_wins / stats.games_played) * 100).toFixed(1)
    : '0.0';

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="profile-container">
        <motion.div
          className="profile-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="profile-avatar">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="profile-logout-btn">
            Abmelden
          </button>
        </motion.div>

        <motion.div
          className="profile-stats-grid"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{stats.total_wins}</div>
            <div className="stat-label">Siege</div>
          </div>

          <div className="stat-card stat-card-danger">
            <div className="stat-icon">💔</div>
            <div className="stat-value">{stats.total_losses}</div>
            <div className="stat-label">Niederlagen</div>
          </div>

          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">🤝</div>
            <div className="stat-value">{stats.total_draws}</div>
            <div className="stat-label">Unentschieden</div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon">🎮</div>
            <div className="stat-value">{stats.games_played}</div>
            <div className="stat-label">Spiele</div>
          </div>
        </motion.div>

        <motion.div
          className="profile-details"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Statistiken</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Siegesrate</span>
              <span className="detail-value">{winRate}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">KI-Siege</span>
              <span className="detail-value">{stats.ai_wins}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">KI-Niederlagen</span>
              <span className="detail-value">{stats.ai_losses}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">PvP-Siege</span>
              <span className="detail-value">{stats.pvp_wins}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">PvP-Niederlagen</span>
              <span className="detail-value">{stats.pvp_losses}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="profile-history-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="history-toggle-btn"
          >
            {showHistory ? '📊 Statistiken anzeigen' : '📜 Spielhistorie anzeigen'}
          </button>

          {showHistory && <MatchHistory userId={user.id} />}
        </motion.div>
      </div>
    </motion.div>
  );
}
