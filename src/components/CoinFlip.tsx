import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

type CoinSide = 'heads' | 'tails';

interface CoinFlipProps {
  onComplete: (result: CoinSide) => void;
  playerChoice?: CoinSide; // Nur für PvP
  showChoice?: boolean; // Zeigt Auswahl-UI für PvP
}

export default function CoinFlip({ onComplete, playerChoice, showChoice = false }: CoinFlipProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [selectedSide, setSelectedSide] = useState<CoinSide>(playerChoice || 'heads');
  const [finalRotation, setFinalRotation] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startFlip = () => {
    setIsFlipping(true);

    // Zufälliges Ergebnis sofort bestimmen
    const coinResult: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';

    // Finale Rotation berechnen: Viele Umdrehungen + Ergebnis
    // 1800 = 5 vollständige Umdrehungen, dann + 0 für heads oder + 180 für tails
    const finalRot = 1800 + (coinResult === 'tails' ? 180 : 0);
    setFinalRotation(finalRot);

    // Sound abspielen
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Sound konnte nicht abgespielt werden (z.B. Autoplay-Policy)
      });
    }

    // Ergebnis nach 2 Sekunden setzen
    setTimeout(() => {
      setResult(coinResult);
      setIsFlipping(false);

      // Nach weiteren 1.5 Sekunden Callback
      setTimeout(() => {
        onComplete(coinResult);
      }, 1500);
    }, 2000);
  };

  return (
    <motion.div
      className="coin-flip-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_7741e0b0e2.mp3"
        preload="auto"
      />

      <h2 className="coin-flip-title">Münzwurf</h2>

      {showChoice && !isFlipping && !result && (
        <motion.div
          className="coin-choice"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="choice-label">Wähle deine Seite:</p>
          <div className="choice-buttons">
            <motion.button
              className={`choice-btn ${selectedSide === 'heads' ? 'selected' : ''}`}
              onClick={() => setSelectedSide('heads')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="coin-preview heads">K</div>
              <span>Kopf</span>
            </motion.button>
            <motion.button
              className={`choice-btn ${selectedSide === 'tails' ? 'selected' : ''}`}
              onClick={() => setSelectedSide('tails')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="coin-preview tails">Z</div>
              <span>Zahl</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {!isFlipping && !result && (
        <motion.button
          className="flip-button"
          onClick={startFlip}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          🪙 Münze werfen
        </motion.button>
      )}

      {(isFlipping || result) && (
        <div className="coin-animation-area">
          <motion.div
            className={`coin ${result || 'flipping'}`}
            animate={
              isFlipping
                ? {
                    rotateX: [0, finalRotation],
                    rotateY: [0, 720],
                    y: [-50, -200, -50],
                  }
                : result === 'heads'
                ? { rotateX: 0, rotateY: 0 }
                : { rotateX: 180, rotateY: 0 }
            }
            transition={{
              duration: isFlipping ? 2 : 0.5,
              ease: isFlipping ? [0.25, 0.46, 0.45, 0.94] : 'easeOut',
            }}
          >
            <div className="coin-side coin-heads">
              <div className="coin-text">K</div>
            </div>
            <div className="coin-side coin-tails">
              <div className="coin-text">Z</div>
            </div>
          </motion.div>
        </div>
      )}

      {result && !isFlipping && (
        <motion.div
          className="coin-result"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <h3>
            {result === 'heads' ? '🎯 Kopf!' : '🎯 Zahl!'}
          </h3>
          {showChoice && (
            <p className="result-message">
              {result === selectedSide
                ? '✅ Du beginnst!'
                : '❌ Gegner beginnt!'}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
