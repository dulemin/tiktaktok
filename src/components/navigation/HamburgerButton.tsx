import { motion } from 'framer-motion';
import './HamburgerButton.css';

interface HamburgerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function HamburgerButton({ onClick, isOpen }: HamburgerButtonProps) {
  return (
    <motion.button
      className="hamburger-button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Menü"
    >
      <motion.span
        className="hamburger-line"
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 8 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="hamburger-line"
        animate={{
          opacity: isOpen ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="hamburger-line"
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -8 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
