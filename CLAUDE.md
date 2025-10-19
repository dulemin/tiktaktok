# Tic Tac Toe - Technical Documentation

## Overview
An advanced Tic Tac Toe game built with React 19, TypeScript, and Framer Motion. Features AI opponent with minimax algorithm, multiple board sizes (3x3, 5x5, 7x7), match modes (single, best-of-3, best-of-5), 3D coin flip, sound effects, background music, and persistent statistics.

## Development Commands

```bash
npm run dev      # Start development server with HMR
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack
- **React 19.1.1** with TypeScript
- **Vite 7.1.10** for build tooling and HMR
- **Framer Motion** for animations
- **React Context** for music player state management
- **CSS3** with 3D transforms and gradients
- **LocalStorage** for stats persistence

## Architecture

### Application Flow
```
GameSetup → CoinFlip → Board → Square
     ↓         ↓         ↓       ↓
  Settings  Animation  Game    Cell
                       Logic  Animation
     ↓                   ↓
Scoreboard            WinLine
  Stats              SVG Line
     ↓
SettingsMenu
  MusicPlayer (Context)
  MusicControls (UI)
```

### Component Hierarchy

1. **App.tsx** - Root component
   - Wrapped in `MusicPlayerProvider` context
   - Manages game state and screen flow
   - Handles coin flip results and starting player
   - Coordinates between Setup, CoinFlip, Board, Scoreboard
   - Determines match winners
   - LocalStorage persistence

2. **GameSetup.tsx** - Configuration screen
   - Game mode selection (PvP or AI)
   - AI difficulty selection (easy, medium, hard)
   - Board size selection (3x3, 5x5, 7x7)
   - Match mode (single, best-of-3, best-of-5)
   - Player name inputs
   - Coin choice for PvP mode
   - Automatic win condition mapping

3. **CoinFlip.tsx** - Pre-game coin toss
   - 3D coin flip animation
   - Calculates final rotation based on result
   - Different behavior for AI vs PvP modes
   - Sound effect on flip
   - 2-second delay before revealing result

4. **Board.tsx** - Game logic core
   - Dynamic board rendering based on size
   - AI integration with move delays
   - Win detection algorithm (all directions)
   - Round state management
   - Sound effects for moves (X and O with different pitches)
   - Multiple useRef patterns for state tracking

5. **Square.tsx** - Individual cell
   - 3D hover effects
   - Pop & rotate animations on mark
   - Preview of next move
   - Winning square highlight

6. **SettingsMenu.tsx** - Audio settings panel
   - Fixed position top-left
   - Slide-in/out animation
   - Contains MusicControls component
   - Game sound volume slider

7. **MusicPlayer.tsx** - Music state management
   - React Context Provider
   - Audio element (always mounted)
   - Music playback state
   - Volume control
   - Song selection
   - 6 songs (3 Lofi, 3 Phonk)

8. **MusicControls.tsx** - Music UI
   - Play/pause button
   - Current song display
   - Song list (expandable)
   - Volume slider
   - Uses `useMusicPlayer` hook

9. **Scoreboard.tsx** - Match statistics
   - Player wins and draws
   - Round progress indicators
   - Match mode display

10. **WinLine.tsx** - Victory indicator
    - SVG-based line rendering
    - Dynamic coordinate calculation
    - Glow filter effect
    - Path animation

11. **Confetti.tsx** - Win celebration
    - 50 particle animation
    - Color-coded for winner
    - Physics-based motion

## Key Patterns & Systems

### AI System

Located in `src/utils/ai.ts`, implements minimax algorithm:

```typescript
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export function getAIMove(
  squares: BoardState,
  aiPlayer: Player,
  difficulty: AIDifficulty,
  boardSize: BoardSize,
  winCondition: number
): number
```

**Difficulty Levels:**
- **Easy**: Random valid move
- **Medium**: Minimax with depth 3 + alpha-beta pruning
- **Hard**: Minimax with depth 5 + alpha-beta pruning

**Optimizations:**
- Alpha-beta pruning cuts search tree
- Center square bonus in evaluation
- Works with all board sizes

**AI Move Timing:**
Board.tsx implements two useEffects for AI:

1. **First move (if AI starts):**
```typescript
useEffect(() => {
  const shouldAIStart = startingPlayer === 'O' && gameMode === 'ai';
  const isBoardEmpty = squares.every(s => s === null);

  if (shouldAIStart && isBoardEmpty && !winner && !aiStartedRef.current) {
    aiStartedRef.current = true;
    setIsAIThinking(true);

    setTimeout(() => {
      // Make AI move
      setIsAIThinking(false);
      playMoveSound('O');
    }, 2000);
  }
}, [startingPlayer, gameMode, ...]);
```

2. **Subsequent moves (after player):**
```typescript
useEffect(() => {
  const isAITurn = gameMode === 'ai' && !xIsNext;
  const canMove = !winner && !isDraw && !isAIThinking;
  const boardNotEmpty = squares.some(square => square !== null);

  if (isAITurn && canMove && boardNotEmpty) {
    setIsAIThinking(true);

    setTimeout(() => {
      // Make AI move
      setIsAIThinking(false);
    }, 2000);
  }
}, [squares, xIsNext, winner, ...]);
```

**Critical Bug Fix:** `aiStartedRef` prevents infinite loop
- Problem: `isAIThinking` in dependencies caused cleanup loops
- Solution: Use ref instead, reset on board changes

### Coin Flip System

Located in `CoinFlip.tsx`, implements 3D coin animation:

```typescript
const startFlip = () => {
  setIsFlipping(true);
  const coinResult: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';

  // Calculate final rotation BEFORE animation starts
  const finalRot = 1800 + (coinResult === 'tails' ? 180 : 0);
  setFinalRotation(finalRot);

  // Animation rotates to finalRot
  // 1800 = 5 full spins, +180 if tails
};
```

**Important:** Calculate `finalRotation` before animation to prevent showing wrong side first.

**Integration with game flow:**
```typescript
const handleCoinFlipComplete = (result: CoinSide) => {
  if (gameMode === 'ai') {
    // Heads = player starts, Tails = AI starts
    setStartingPlayer(result === 'heads' ? 'X' : 'O');
  } else {
    // PvP: if result matches choice, player1 starts
    const playerWon = result === playerCoinChoice;
    setStartingPlayer(playerWon ? 'X' : 'O');
  }
  setShowCoinFlip(false);
};
```

### Sound System

**Move Sounds (Board.tsx):**
```typescript
const soundXRef = useRef<HTMLAudioElement>(null);
const soundORef = useRef<HTMLAudioElement>(null);

// Both use same sound file, different playback rates
useEffect(() => {
  if (soundXRef.current) {
    soundXRef.current.volume = gameSoundVolume / 100;
    soundXRef.current.playbackRate = 1.0; // Normal
  }
  if (soundORef.current) {
    soundORef.current.volume = gameSoundVolume / 100;
    soundORef.current.playbackRate = 0.9; // Slightly lower/slower
  }
}, [gameSoundVolume]);

const playMoveSound = (player: Player) => {
  const soundRef = player === 'X' ? soundXRef : soundORef;
  if (soundRef.current) {
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch(error => {
      console.error(`Sound error:`, error);
    });
  }
};
```

**Background Music (MusicPlayer.tsx with Context):**

Key pattern: Audio element stays mounted, UI can unmount

```typescript
// MusicPlayer.tsx - Context Provider
export function MusicPlayerProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentSong, setCurrentSong] = useState(SONGS[0]);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <MusicContext.Provider value={{...}}>
      {/* Audio always mounted */}
      <audio ref={audioRef} loop src={currentSong.url} />
      {children}
    </MusicContext.Provider>
  );
}

// MusicControls.tsx - UI Component
export default function MusicControls() {
  const {
    isPlaying,
    volume,
    currentSong,
    togglePlay,
    setVolume,
    selectSong
  } = useMusicPlayer();

  // Render UI
}
```

**Why this pattern?**
- `AnimatePresence` unmounts children on exit
- Audio element must stay mounted to keep playing
- Context separates state from UI
- UI can mount/unmount without affecting audio

### Dynamic Board Size System
The game supports 3x3, 5x5, and 7x7 boards with automatic win conditions:
- 3x3 → 3 in a row
- 5x5 → 4 in a row
- 7x7 → 5 in a row

Board rendering uses dynamic grid:
```typescript
gridTemplateColumns: `repeat(${boardSize}, 1fr)`
```

Cell sizes adjust per board (App.css):
```css
.board-3x3 .square { width: 140px; height: 140px; }
.board-5x5 .square { width: 90px; height: 90px; }
.board-7x7 .square { width: 65px; height: 65px; }
```

### Win Detection Algorithm
Located in `Board.tsx:9-57`, the `calculateWinner` function checks:
1. Horizontal lines (all possible positions)
2. Vertical lines (all possible positions)
3. Top-left to bottom-right diagonals
4. Top-right to bottom-left diagonals

Returns `{ winner: Player | null, line: number[] | null }`

Algorithm uses sliding window approach for any board size:
```typescript
for (let row = 0; row < size; row++) {
  for (let col = 0; col <= size - winCondition; col++) {
    const line = Array.from({ length: winCondition }, (_, i) =>
      row * size + col + i
    );
    const values = line.map(i => squares[i]);
    if (values[0] && values.every(v => v === values[0])) {
      return { winner: values[0], line };
    }
  }
}
```

### Match Management
Match system in `App.tsx` tracks:
- Current round number
- Player wins (X and O)
- Draw count
- Match winner determination

Win conditions by mode:
- Best-of-3: First to 2 wins
- Best-of-5: First to 3 wins
- Single: One round only

### Critical useRef Patterns

**1. Round End Callback Prevention (Board.tsx:76,111-118):**
```typescript
const roundEndCalledRef = useRef(false);

useEffect(() => {
  if ((winner || isDraw) && !roundEndCalledRef.current) {
    roundEndCalledRef.current = true;
    setTimeout(() => {
      onRoundEnd?.(winner);
    }, 2000);
  }
}, [winner, isDraw, onRoundEnd]);
```

Without the ref, callback fires repeatedly, incrementing scores infinitely.

**2. AI Start Prevention (Board.tsx:77,136-161):**
```typescript
const aiStartedRef = useRef(false);

useEffect(() => {
  if (shouldAIStart && isBoardEmpty && !winner && !aiStartedRef.current) {
    aiStartedRef.current = true;
    setIsAIThinking(true);
    // ...
  }
}, [startingPlayer, gameMode, ...]);
```

Prevents multiple simultaneous AI move timers.

**Critical:** Always reset refs in `resetRound()`:
```typescript
function resetRound() {
  setSquares(Array(totalSquares).fill(null));
  setXIsNext(startingPlayer === 'X');
  setIsAIThinking(false);
  roundEndCalledRef.current = false;
  aiStartedRef.current = false; // CRITICAL
}
```

### SVG Win Line Rendering
Located in `WinLine.tsx`, uses SVG instead of CSS transforms for accuracy.

Coordinate calculation:
```typescript
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
```

**IMPORTANT:** Use numeric values directly in SVG:
```typescript
// CORRECT:
<motion.line x1={coords.x1} y1={coords.y1} ... />

// WRONG (will not render):
<motion.line x1={`${coords.x1}%`} y1={`${coords.y1}%`} ... />
```

### Animation System
Uses Framer Motion with these key patterns:

**Staggered Board Entrance:**
```typescript
const boardVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const squareItemVariants = {
  hidden: { scale: 0, rotateY: -180 },
  show: {
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring" as const, // TypeScript fix
      stiffness: 200,
      damping: 20
    }
  }
};
```

**3D Coin Flip:**
```typescript
<motion.div
  animate={{ rotateX: finalRotation }}
  transition={{ duration: 2, ease: "easeOut" }}
  style={{ transformStyle: "preserve-3d" }}
>
  <div className="coin-heads">H</div>
  <div className="coin-tails" style={{ transform: "rotateX(180deg)" }}>T</div>
</motion.div>
```

**Path Animation:**
```typescript
initial={{ pathLength: 0, opacity: 0 }}
animate={{ pathLength: 1, opacity: 1 }}
transition={{
  pathLength: { duration: 0.5, ease: "easeOut", delay: 0.3 },
  opacity: { duration: 0.2, delay: 0.3 }
}}
```

### TypeScript Type System
All types defined in `src/types/game.ts`:

```typescript
export type Player = 'X' | 'O';
export type BoardState = (Player | null)[];
export type BoardSize = 3 | 5 | 7;
export type MatchMode = 'single' | 'best-of-3' | 'best-of-5';
export type GameMode = 'pvp' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type CoinSide = 'heads' | 'tails';

export interface GameSettings {
  boardSize: BoardSize;
  matchMode: MatchMode;
  gameMode: GameMode;
  aiDifficulty?: AIDifficulty;
  winCondition: number;
  player1Name: string;
  player2Name: string;
  playerCoinChoice?: CoinSide;
}

export interface MatchStats {
  player1Wins: number;
  player2Wins: number;
  draws: number;
  currentRound: number;
  totalRounds: number;
}

export interface WinResult {
  winner: Player | null;
  line: number[] | null;
}
```

**IMPORTANT:** Always use type-only imports:
```typescript
// CORRECT:
import type { Player, BoardState } from '../types/game';

// WRONG (causes verbatimModuleSyntax error):
import { Player, BoardState } from '../types/game';
```

### LocalStorage Persistence
Stats are saved in `App.tsx:90-95`:
```typescript
// Save on round end
localStorage.setItem('ticTacToeStats', JSON.stringify({
  player1Wins: newStats.player1Wins,
  player2Wins: newStats.player2Wins,
  draws: newStats.draws,
}));

// Load on mount
useEffect(() => {
  const savedStats = localStorage.getItem('ticTacToeStats');
  if (savedStats) {
    const stats = JSON.parse(savedStats);
    setMatchStats(prev => ({
      ...prev,
      player1Wins: stats.player1Wins || 0,
      player2Wins: stats.player2Wins || 0,
      draws: stats.draws || 0,
    }));
  }
}, []);
```

## Common Issues & Solutions

### Issue: Score incrementing infinitely
**Symptom**: Round end callback fires repeatedly
**Solution**: Use `roundEndCalledRef` pattern (see "Critical useRef Patterns")

### Issue: AI not making moves / stuck on "KI denkt..."
**Symptom**: AI starts thinking but never plays
**Cause**: `isAIThinking` in useEffect dependencies causes cleanup loop
**Solution**: Use `aiStartedRef` instead (see "Critical useRef Patterns")

### Issue: AI makes move instantly after player
**Symptom**: No 2-second delay
**Solution**: Ensure `setTimeout` delay is 2000ms in both AI useEffects

### Issue: Coin shows heads first, then changes to tails
**Symptom**: Wrong side visible before animation
**Solution**: Calculate `finalRotation` BEFORE starting animation

### Issue: Music stops when closing settings panel
**Symptom**: Audio stops on AnimatePresence unmount
**Solution**: Use Context pattern with persistent audio element (see "Sound System")

### Issue: Win line not displaying or misaligned
**Symptom**: Line is invisible or doesn't follow winning squares
**Solution**: Use numeric values in SVG, not percentage strings

### Issue: TypeScript type import errors
**Symptom**: `'Type' is a type and must be imported using a type-only import`
**Solution**: Use `import type { Type }` instead of `import { Type }`

### Issue: Animation type errors
**Symptom**: `Type 'string' is not assignable to type 'AnimationGeneratorType'`
**Solution**: Add `as const` to type strings:
```typescript
type: "spring" as const
```

## File Structure
```
src/
├── types/
│   └── game.ts                # TypeScript type definitions
├── utils/
│   └── ai.ts                  # Minimax algorithm implementation
├── components/
│   ├── Board.tsx              # Game logic, AI integration, win detection
│   ├── Square.tsx             # Individual cell with animations
│   ├── GameSetup.tsx          # Configuration screen
│   ├── CoinFlip.tsx           # 3D coin flip animation
│   ├── Scoreboard.tsx         # Match statistics
│   ├── SettingsMenu.tsx       # Audio settings panel
│   ├── MusicPlayer.tsx        # React Context for audio state
│   ├── MusicControls.tsx      # Music UI component
│   ├── WinLine.tsx            # SVG win indicator
│   └── Confetti.tsx           # Particle effects
├── App.tsx                    # Root component & state management
├── App.css                    # Main styles with 3D effects
├── main.tsx                   # React entry point
└── index.css                  # Global styles
```

## Adding New Features

### To add a new AI difficulty level:
1. Update `AIDifficulty` type in `types/game.ts`
2. Add case in `getAIMove()` in `utils/ai.ts`
3. Add option in `GameSetup.tsx` aiDifficulty array

### To add a new board size (e.g., 9x9):
1. Update `BoardSize` type: `export type BoardSize = 3 | 5 | 7 | 9;`
2. Add option in `GameSetup.tsx` boardSizes array
3. Add CSS rules in `App.css` for `.board-9x9 .square`
4. Update win condition mapping in GameSetup
5. Ensure AI minimax can handle performance (may need depth adjustment)

### To add new match modes:
1. Update `MatchMode` type in `types/game.ts`
2. Add option in `GameSetup.tsx` matchModes array
3. Update match winner logic in `App.tsx` handleRoundEnd

### To add new music:
1. Add song object to `SONGS` array in `MusicPlayer.tsx`:
```typescript
{
  id: 7,
  title: 'Your Song',
  genre: 'Lofi', // or 'Phonk'
  url: 'https://cdn.example.com/song.mp3'
}
```

## Development Notes

- The game uses German text for UI ("gewinnt", "ist dran", "Spieler", etc.)
- Music and sounds from Pixabay
- All animations use spring physics for natural feel
- AI delay is hardcoded to 2 seconds
- Win conditions are hardcoded per board size
- Music player uses React Context to persist audio across panel open/close

## Performance Considerations

- **Minimax depth** is limited to prevent lag on larger boards
- **Alpha-beta pruning** significantly improves AI performance
- **useRef patterns** prevent unnecessary re-renders
- **Framer Motion** animations are GPU-accelerated
- **LocalStorage** operations are minimal (only on round end)

## Future Enhancement Ideas
- ✅ AI opponent with difficulty levels (IMPLEMENTED)
- ✅ Sound effects for moves (IMPLEMENTED)
- ✅ Coin flip to determine starting player (IMPLEMENTED)
- ✅ Background music player (IMPLEMENTED)
- Online multiplayer
- Custom themes/colors
- Replay system
- Tournament brackets
- Customizable win conditions
- More board sizes (4x4, 6x6, etc.)
- Undo/redo moves
- Game history tracking
- AI hint system
- Time limits per move

---

Last Updated: 2025-10-19
