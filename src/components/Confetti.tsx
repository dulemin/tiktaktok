import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  winner: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
}

export default function Confetti({ winner }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = winner === 'X'
      ? ['#646cff', '#535bf2', '#4248d4', '#818cf8']
      : ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'];

    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 10 + 5,
      });
    }
    setParticles(newParticles);
  }, [winner]);

  return (
    <div className="confetti-container">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="confetti-particle"
          initial={{
            x: `${particle.x}vw`,
            y: '-10vh',
            rotate: particle.rotation,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: particle.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: 'easeIn',
          }}
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
        />
      ))}
    </div>
  );
}
