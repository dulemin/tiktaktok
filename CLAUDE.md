# Tic Tac Toe - Project Guide

## Tech Stack
React 19 + TypeScript + Vite + Framer Motion + Supabase. Features AI (minimax), dynamic boards (3x3/5x5/7x7), user authentication (email/password + Google OAuth), profile pages, match history, music player (Context), 3D animations.

## MCP Guidelines
**Use MCP servers proactively - never instruct user to check manually:**
- DevTools MCP: Inspect console, DOM, network, screenshots, interactions
- Supabase MCP: Run SQL, modify schemas, check tables
- Execute operations directly, report findings back

## Architecture
```
AuthProvider (Supabase auth context)
  → MusicPlayerProvider (music context)
    → App (root + state) → GameSetup → CoinFlip → Board (game logic) → Square
                         → Scoreboard
                         → SettingsMenu → MusicControls
                         → UserMenu → AuthModal / ProfilePage
```

## Critical Patterns

### 1. useRef Patterns (Board.tsx) - MUST USE
**Prevents infinite loops and duplicate callbacks:**
```typescript
const roundEndCalledRef = useRef(false);  // Prevent score incrementing infinitely
const aiStartedRef = useRef(false);       // Prevent multiple AI move timers

// ALWAYS reset in resetRound():
roundEndCalledRef.current = false;
aiStartedRef.current = false;
```

### 2. Music Context Pattern (MusicPlayer.tsx)
Audio element lives in Context Provider (always mounted), UI component (MusicControls) can unmount without stopping music. Required because AnimatePresence unmounts children.

### 3. AI Timing
Two separate useEffects: one for AI first move, one for subsequent moves. Both use 2000ms setTimeout. Use `aiStartedRef` to prevent cleanup loops.

### 4. Coin Flip
Calculate `finalRotation` BEFORE animation starts to prevent showing wrong side first.

### 5. TypeScript Imports
```typescript
// CORRECT:
import type { Player } from '../types/game';

// WRONG (verbatimModuleSyntax error):
import { Player } from '../types/game';
```

### 6. SVG Win Line (WinLine.tsx)
```typescript
// CORRECT:
<motion.line x1={coords.x1} y1={coords.y1} />

// WRONG (won't render):
<motion.line x1={`${coords.x1}%`} />
```

### 7. Framer Motion Types
```typescript
type: "spring" as const  // Add 'as const' to prevent type errors
```

### 8. Authentication System (Supabase)
**AuthContext provides global auth state:**
```typescript
const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth();
```

**Database trigger auto-creates profiles/stats for ALL users (email + OAuth):**
```sql
CREATE FUNCTION handle_new_user() RETURNS TRIGGER AS $
BEGIN
  INSERT INTO user_profiles (user_id, username, avatar_url)
  VALUES (NEW.id, generated_username, NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$ LANGUAGE plpgsql;
```

**Hybrid storage:** LocalStorage for guests, Supabase for authenticated users.

**Match tracking in Board.tsx:**
```typescript
const trackMatchToSupabase = async (matchWinner: Player | null) => {
  if (!user) return; // Skip if guest
  await supabase.from('match_history').insert({...});
  await supabase.from('user_stats').update({...});
};
```

## File Structure
```
src/
├── types/
│   ├── game.ts            # Game TypeScript types
│   └── database.ts        # Generated Supabase types
├── contexts/
│   └── AuthContext.tsx    # Auth state (user, signIn, signUp, signOut)
├── lib/
│   └── supabaseClient.ts  # Supabase client with type safety
├── utils/ai.ts            # Minimax algorithm
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx  # Login/Register modal (email + Google OAuth)
│   ├── profile/
│   │   ├── ProfilePage.tsx    # User stats & match history toggle
│   │   └── MatchHistory.tsx   # Last 20 matches with filters
│   ├── navigation/
│   │   └── UserMenu.tsx       # User dropdown (profile, logout)
│   ├── Board.tsx          # Game logic, AI, match tracking to Supabase
│   ├── Square.tsx         # Cell animations
│   ├── GameSetup.tsx      # Config screen
│   ├── CoinFlip.tsx       # 3D coin animation
│   ├── MusicPlayer.tsx    # Context provider (audio element)
│   ├── MusicControls.tsx  # Music UI
│   ├── SettingsMenu.tsx   # Audio settings panel
│   ├── Scoreboard.tsx     # Match stats
│   ├── WinLine.tsx        # SVG win indicator
│   └── Confetti.tsx       # Particle effects
├── App.tsx                # Root, wrapped with AuthProvider + MusicProvider
└── App.css                # Dynamic board sizes, 3D effects
.env                       # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

## Database Schema (Supabase)
**Tables:** user_profiles, user_stats, match_history, games
**All tables have RLS enabled** with policies for user-specific access.
**Trigger:** `on_auth_user_created` fires `handle_new_user()` to auto-create profile + stats for email and OAuth signups.

## Common Issues
| Issue | Cause | Solution |
|-------|-------|----------|
| Infinite score increment | Callback fires repeatedly | Use `roundEndCalledRef` |
| AI stuck thinking | `isAIThinking` in deps causes cleanup loop | Use `aiStartedRef` instead |
| Coin shows wrong side first | Animation starts before rotation calculated | Calculate `finalRotation` before `setIsFlipping(true)` |
| Music stops on panel close | AnimatePresence unmounts audio | Use Context pattern with persistent audio element |
| Win line not visible | Percentage strings in SVG | Use numeric values directly |
| Profile not loading (OAuth) | Trigger doesn't create profile for OAuth users | Ensure `handle_new_user()` creates profile for ALL auth methods |
| "Provider not enabled" error | Google OAuth not configured in Supabase | Add Google provider in Supabase Auth settings + OAuth credentials |

## Key Constants
- Board sizes: 3x3 (3 to win), 5x5 (4 to win), 7x7 (5 to win)
- AI depths: Easy (random), Medium (depth 3), Hard (depth 5)
- Match modes: single, best-of-3, best-of-5
- AI delay: 2000ms hardcoded
- Sound: Same file, different playback rates (X=1.0, O=0.9)

## Notes
- UI text is German
- Stats: LocalStorage for guests, Supabase for authenticated users
- All animations use GPU-accelerated Framer Motion
- Win detection uses sliding window algorithm for any board size
- Auth: Email/password requires confirmation, Google OAuth auto-redirects
- Database triggers ensure profiles/stats auto-created for all signup methods
