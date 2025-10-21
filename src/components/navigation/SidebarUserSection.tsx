import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { Tables } from '../../types/database';
import './SidebarUserSection.css';

type UserProfile = Tables<'user_profiles'>;

interface SidebarUserSectionProps {
  onLogin: () => void;
  onProfileClick: () => void;
  onLogout?: () => void;
}

export function SidebarUserSection({ onLogin, onProfileClick, onLogout }: SidebarUserSectionProps) {
  const { user, signOut, isAuthenticated } = useAuth();
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
    if (onLogout) onLogout();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="sidebar-user-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-icon">👤</span>
          <h3>Konto</h3>
        </div>
        <button className="sidebar-menu-item" onClick={onLogin}>
          <span className="sidebar-item-icon">🔑</span>
          <span className="sidebar-item-label">Anmelden</span>
        </button>
      </div>
    );
  }

  const username = profile?.username || 'Nutzer';
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="sidebar-user-section">
      <div className="sidebar-section-header">
        <span className="sidebar-section-icon">👤</span>
        <h3>Konto</h3>
      </div>

      <div className="sidebar-user-info">
        <div className="sidebar-user-avatar">{initial}</div>
        <div className="sidebar-user-details">
          <div className="sidebar-user-name">{username}</div>
          <div className="sidebar-user-email">{user.email}</div>
        </div>
      </div>

      <div className="sidebar-menu-items">
        <button className="sidebar-menu-item" onClick={onProfileClick}>
          <span className="sidebar-item-icon">📊</span>
          <span className="sidebar-item-label">Profil anzeigen</span>
        </button>

        <button className="sidebar-menu-item sidebar-menu-item-danger" onClick={handleSignOut}>
          <span className="sidebar-item-icon">🚪</span>
          <span className="sidebar-item-label">Abmelden</span>
        </button>
      </div>
    </div>
  );
}
