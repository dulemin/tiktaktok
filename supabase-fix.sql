-- Schritt 1: RLS deaktivieren (damit jeder zugreifen kann)
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;

-- Schritt 2: Realtime aktivieren (für Live-Updates)
-- Hinweis: Falls Fehler kommt, ignoriere ihn
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
