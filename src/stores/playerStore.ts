import { create } from "zustand";

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  file_path: string;
  cover_color: string;
  cover_url?: string | null;
  bpm?: number | null;
  musical_key?: string | null;
  energy_level?: number | null;
}

interface PlayerState {
  queue: PlayerTrack[];
  currentIndex: number;
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: boolean;
  shuffle: boolean;
  visualizerStyle: "bars" | "wave" | "circle";

  playTrack: (track: PlayerTrack, queue?: PlayerTrack[], index?: number) => void;
  setQueue: (queue: PlayerTrack[], index?: number) => void;
  togglePlay: () => void;
  setIsPlaying: (v: boolean) => void;
  next: () => void;
  previous: () => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setVisualizerStyle: (s: "bars" | "wave" | "circle") => void;
  /** Request an explicit seek; consumed by the audio element. */
  seekRequest: number | null;
  requestSeek: (t: number) => void;
  clearSeekRequest: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  repeat: false,
  shuffle: false,
  visualizerStyle: "bars",
  seekRequest: null,

  playTrack: (track, queue, index) => {
    const q = queue && queue.length > 0 ? queue : [track];
    const i = typeof index === "number" ? index : q.findIndex((t) => t.id === track.id);
    set({
      queue: q,
      currentIndex: i >= 0 ? i : 0,
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
    });
  },

  setQueue: (queue, index = 0) => set({ queue, currentIndex: index }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setIsPlaying: (v) => set({ isPlaying: v }),

  next: () => {
    const { queue, currentIndex, shuffle } = get();
    if (queue.length === 0) return;
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = currentIndex + 1;
      if (nextIdx >= queue.length) return;
    }
    set({ currentIndex: nextIdx, currentTrack: queue[nextIdx], isPlaying: true, currentTime: 0 });
  },

  previous: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    const prevIdx = currentIndex - 1;
    if (prevIdx < 0) return;
    set({ currentIndex: prevIdx, currentTrack: queue[prevIdx], isPlaying: true, currentTime: 0 });
  },

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => set({ volume: v }),
  toggleRepeat: () => set((s) => ({ repeat: !s.repeat })),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  setVisualizerStyle: (s) => set({ visualizerStyle: s }),

  requestSeek: (t) => set({ seekRequest: t, currentTime: t }),
  clearSeekRequest: () => set({ seekRequest: null }),
}));
