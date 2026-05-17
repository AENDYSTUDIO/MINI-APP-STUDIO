ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS bpm INTEGER,
  ADD COLUMN IF NOT EXISTS musical_key TEXT,
  ADD COLUMN IF NOT EXISTS energy_level INTEGER,
  ADD COLUMN IF NOT EXISTS tg_file_id TEXT;

CREATE INDEX IF NOT EXISTS idx_tracks_bpm ON public.tracks(bpm);
CREATE INDEX IF NOT EXISTS idx_tracks_musical_key ON public.tracks(musical_key);
CREATE INDEX IF NOT EXISTS idx_tracks_energy_level ON public.tracks(energy_level);