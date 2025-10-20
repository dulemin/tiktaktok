import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { Tables } from '../../types/database';
import './UserMenu.css';

type UserProfile = Tables<'user_profiles'>;

interface UserMenuProps {
  onLogin: () => void;
  onProfileClick: () => void;
}

export default function UserMenu({ onLogin, onProfileClick }: UserMenuProps) {
  const { user, signOut, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onProfileClick();
  };

  if (!isAuthenticated || !user) {
    return (
      <motion.button
        className="login-button"
        onClick={onLogin}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="login-icon">👤</span>
        Anmelden
      </motion.button>
    );
  }

  const username = profile?.username || 'Nutzer';
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="user-menu">
      <motion.button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="user-avatar">{initial}</div>
        <span className="user-name">{username}</span>
        <motion.span
          className="dropdown-arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="dropdown-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="user-menu-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="dropdown-header">
                <div className="dropdown-avatar">{initial}</div>
                <div className="dropdown-info">
                  <div className="dropdown-username">{username}</div>
                  <div className="dropdown-email">{user.email}</div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item" onClick={handleProfileClick}>
                <span className="dropdown-item-icon">👤</span>
                Profil anzeigen
              </button>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item dropdown-item-danger" onClick={handleSignOut}>
                <span className="dropdown-item-icon">🚪</span>
                Abmelden
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
