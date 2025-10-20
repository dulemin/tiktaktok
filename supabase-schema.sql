-- Erstelle die games Tabelle
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code TEXT NOT NULL UNIQUE,
  board_state JSONB NOT NULL,
  board_size INTEGER NOT NULL,
  win_condition INTEGER NOT NULL,
  current_player TEXT NOT NULL,
  player1_id TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player2_id TEXT,
  player2_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnelle Suche nach game_code
CREATE INDEX IF NOT EXISTS games_game_code_idx ON public.games (game_code);

-- Index für Status-Abfragen
CREATE INDEX IF NOT EXISTS games_status_idx ON public.games (status);

-- Trigger für automatisches Update von updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Lösche alten Trigger falls vorhanden und erstelle neu
DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- WICHTIG: Row Level Security (RLS) deaktivieren für öffentlichen Zugriff
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;

-- Alternativ: RLS aktivieren mit öffentlichen Policies (wenn du RLS nutzen willst)
-- ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Allow all access to games" ON public.games
-- FOR ALL USING (true) WITH CHECK (true);

-- Realtime für Live-Updates aktivieren
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
