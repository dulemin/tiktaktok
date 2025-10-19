import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MusicControls from './MusicControls';

interface SettingsMenuProps {
  gameSoundVolume: number;
  onGameSoundVolumeChange: (volume: number) => void;
}

export default function SettingsMenu({ gameSoundVolume, onGameSoundVolumeChange }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="settings-menu">
      <motion.button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? '✕' : '⚙️'} Musik & Lautstärke
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - Klick außerhalb schließt Panel */}
            <motion.div
              className="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="settings-panel"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>🎵 Musik & Lautstärke</h3>

              <div className="settings-section">
                <h4>Hintergrundmusik</h4>
                <MusicControls />
              </div>

              <div className="settings-section">
                <h4>Spielzug Lautstärke</h4>
                <div className="volume-control">
                  <span className="volume-icon">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gameSoundVolume}
                    onChange={(e) => onGameSoundVolumeChange(Number(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="volume-icon">🔊</span>
                  <span className="volume-value">{gameSoundVolume}%</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
