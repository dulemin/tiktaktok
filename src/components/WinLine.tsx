import { motion } from 'framer-motion';

interface WinLineProps {
  winningLine: number[] | null;
  boardSize: number;
}

export default function WinLine({ winningLine, boardSize }: WinLineProps) {
  if (!winningLine || winningLine.length === 0) return null;

  const getLineCoordinates = (line: number[], size: number) => {
    const first = line[0];
    const last = line[line.length - 1];

    const firstRow = Math.floor(first / size);
    const firstCol = first % size;
    const lastRow = Math.floor(last / size);
    const lastCol = last % size;

    // Calculate center points in percentage (0-100)
    const x1 = ((firstCol + 0.5) / size) * 100;
    const y1 = ((firstRow + 0.5) / size) * 100;
    const x2 = ((lastCol + 0.5) / size) * 100;
    const y2 = ((lastRow + 0.5) / size) * 100;

    return { x1, y1, x2, y2 };
  };

  const coords = getLineCoordinates(winningLine, boardSize);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      viewBox="0 0 100 100"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <motion.line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.5, ease: "easeOut", delay: 0.3 },
          opacity: { duration: 0.2, delay: 0.3 }
        }}
      />
    </svg>
  );
}
