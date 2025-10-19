import { motion } from 'framer-motion';
import { useState } from 'react';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinning?: boolean;
  nextPlayer?: string;
}

export default function Square({ value, onClick, isWinning = false, nextPlayer }: SquareProps) {
  const [isHovered, setIsHovered] = useState(false);

  const squareVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  };

  const hoverVariants = {
    hover: {
      scale: 1.05,
      rotateX: 5,
      rotateY: 5,
      z: 50,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.button
      className={`square ${isWinning ? 'winning' : ''}`}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      variants={hoverVariants}
      whileHover="hover"
      whileTap="tap"
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {value && (
        <motion.span
          className={`symbol symbol-${value.toLowerCase()}`}
          variants={squareVariants}
          initial="initial"
          animate="animate"
          key={value}
        >
          {value}
        </motion.span>
      )}

      {!value && isHovered && nextPlayer && (
        <motion.span
          className="preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.2 }}
        >
          {nextPlayer}
        </motion.span>
      )}
    </motion.button>
  );
}
