import { motion, AnimatePresence } from 'framer-motion';
import type { Dispatch, SetStateAction, ReactNode } from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}

export function Sidebar({ isOpen, setIsOpen, children }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring' as const, damping: 25, stiffness: 200 }}
          >
            {/* Close Button */}
            <button
              className="sidebar-close"
              onClick={() => setIsOpen(false)}
              aria-label="Schließen"
            >
              ✕
            </button>

            {/* Content */}
            <div className="sidebar-content">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
