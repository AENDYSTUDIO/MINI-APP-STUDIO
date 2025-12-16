/*
  # Fix Security and Performance Issues

  This migration addresses several critical security and performance issues:

  ## 1. Missing Indexes on Foreign Keys
  - Add indexes for all foreign key columns to improve query performance
  - Covers: favorites, playlist_tracks, playlists, queue, tracks tables

  ## 2. RLS Policy Optimization
  - Replace auth.uid() with (select auth.uid()) in all RLS policies
  - This prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale

  ## 3. Function Security
  - Fix search_path for handle_updated_at function to prevent injection attacks

  ## 4. Index Cleanup
  - Remove unused indexes that are not being utilized
*/

-- 1. Add missing indexes on foreign key columns for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_track_id ON public.favorites(track_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track_id ON public.playlist_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_track_id ON public.queue(track_id);
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON public.tracks(user_id);

-- 2. Drop and recreate RLS policies with optimized auth function calls

-- Profiles table policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = id);

-- Tracks table policies
DROP POLICY IF EXISTS "Users can insert own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can update own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can delete own tracks" ON public.tracks;

CREATE POLICY "Users can insert own tracks"
  ON public.tracks
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tracks"
  ON public.tracks
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tracks"
  ON public.tracks
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- Favorites table policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites"
  ON public.favorites
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- Playlists table policies
DROP POLICY IF EXISTS "Users can view own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can create own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can update own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can delete own playlists" ON public.playlists;

CREATE POLICY "Users can view own playlists"
  ON public.playlists
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own playlists"
  ON public.playlists
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own playlists"
  ON public.playlists
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own playlists"
  ON public.playlists
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- Playlist tracks table policies
DROP POLICY IF EXISTS "Users can view tracks in own playlists" ON public.playlist_tracks;
DROP POLICY IF EXISTS "Users can add tracks to own playlists" ON public.playlist_tracks;
DROP POLICY IF EXISTS "Users can remove tracks from own playlists" ON public.playlist_tracks;
DROP POLICY IF EXISTS "Users can update tracks in own playlists" ON public.playlist_tracks;

CREATE POLICY "Users can view tracks in own playlists"
  ON public.playlist_tracks
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM playlists 
    WHERE playlists.id = playlist_tracks.playlist_id 
    AND playlists.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can add tracks to own playlists"
  ON public.playlist_tracks
  FOR INSERT
  TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM playlists 
    WHERE playlists.id = playlist_tracks.playlist_id 
    AND playlists.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can remove tracks from own playlists"
  ON public.playlist_tracks
  FOR DELETE
  TO public
  USING (EXISTS (
    SELECT 1 FROM playlists 
    WHERE playlists.id = playlist_tracks.playlist_id 
    AND playlists.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update tracks in own playlists"
  ON public.playlist_tracks
  FOR UPDATE
  TO public
  USING (EXISTS (
    SELECT 1 FROM playlists 
    WHERE playlists.id = playlist_tracks.playlist_id 
    AND playlists.user_id = (select auth.uid())
  ));

-- Artist subscriptions table policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.artist_subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.artist_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.artist_subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON public.artist_subscriptions
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.artist_subscriptions
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.artist_subscriptions
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- Playback history table policies
DROP POLICY IF EXISTS "Users can view own playback history" ON public.playback_history;
DROP POLICY IF EXISTS "Users can insert own playback history" ON public.playback_history;
DROP POLICY IF EXISTS "Users can delete own playback history" ON public.playback_history;

CREATE POLICY "Users can view own playback history"
  ON public.playback_history
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own playback history"
  ON public.playback_history
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own playback history"
  ON public.playback_history
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- Queue table policies
DROP POLICY IF EXISTS "Users can view own queue" ON public.queue;
DROP POLICY IF EXISTS "Users can manage own queue" ON public.queue;
DROP POLICY IF EXISTS "Users can update own queue" ON public.queue;
DROP POLICY IF EXISTS "Users can remove from own queue" ON public.queue;

CREATE POLICY "Users can view own queue"
  ON public.queue
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can manage own queue"
  ON public.queue
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own queue"
  ON public.queue
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove from own queue"
  ON public.queue
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- Player settings table policies
DROP POLICY IF EXISTS "Users can view own player settings" ON public.player_settings;
DROP POLICY IF EXISTS "Users can update own player settings" ON public.player_settings;
DROP POLICY IF EXISTS "Users can insert own player settings" ON public.player_settings;

CREATE POLICY "Users can view own player settings"
  ON public.player_settings
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own player settings"
  ON public.player_settings
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own player settings"
  ON public.player_settings
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

-- 3. Fix function security by setting immutable search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Remove unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS public.idx_playback_history_user_date;
DROP INDEX IF EXISTS public.idx_playback_history_track;
DROP INDEX IF EXISTS public.idx_queue_user_position;