import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message === 'Invalid login credentials'
            ? 'Ungültige E-Mail oder Passwort'
            : 'Fehler beim Anmelden');
        } else {
          onClose();
        }
      } else {
        if (!username.trim()) {
          setError('Benutzername erforderlich');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Diese E-Mail ist bereits registriert');
          } else {
            setError('Fehler bei der Registrierung');
          }
        } else {
          setError('');
          onClose();
        }
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError('Fehler bei Google-Anmeldung');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="auth-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="auth-modal-close" onClick={onClose}>
              ✕
            </button>

            <h2 className="auth-modal-title">
              {isLogin ? 'Anmelden' : 'Registrieren'}
            </h2>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="auth-input-group">
                  <label htmlFor="username">Benutzername</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Wähle einen Benutzernamen"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="auth-input-group">
                <label htmlFor="email">E-Mail</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-input-group">
                <label htmlFor="password">Passwort</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
                {!isLogin && (
                  <span className="auth-input-hint">Mindestens 6 Zeichen</span>
                )}
              </div>

              {error && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={loading}
              >
                {loading ? 'Lädt...' : isLogin ? 'Anmelden' : 'Registrieren'}
              </button>
            </form>

            <div className="auth-divider">
              <span>oder</span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="auth-button auth-button-google"
              disabled={loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Mit Google {isLogin ? 'anmelden' : 'registrieren'}
            </button>

            <div className="auth-toggle">
              {isLogin ? 'Noch kein Konto?' : 'Bereits registriert?'}
              <button
                type="button"
                onClick={toggleMode}
                className="auth-toggle-button"
                disabled={loading}
              >
                {isLogin ? 'Registrieren' : 'Anmelden'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
