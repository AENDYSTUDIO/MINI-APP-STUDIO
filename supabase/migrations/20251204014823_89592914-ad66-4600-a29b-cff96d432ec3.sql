-- Create artist_subscriptions table for tracking followed artists
CREATE TABLE public.artist_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, artist_name)
);

-- Enable RLS
ALTER TABLE public.artist_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own subscriptions"
  ON public.artist_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.artist_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.artist_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Add UPDATE policy for playlist_tracks to allow reordering
CREATE POLICY "Users can update tracks in own playlists"
  ON public.playlist_tracks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_tracks.playlist_id
    AND playlists.user_id = auth.uid()
  ));