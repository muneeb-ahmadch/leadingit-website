/** Static catalogues used inside the LIT Home demo. Display only — not real device data. */

export type Source = { id: string; name: string };

/** Audio sources for the "Select Source" inside the Audio detail. */
export const AUDIO_SOURCES: Source[] = [
  { id: 'spotify', name: 'Spotify' },
  { id: 'tidal', name: 'TIDAL' },
  { id: 'roon', name: 'Roon' },
  { id: 'airplay', name: 'AirPlay' },
];

/** Cinema/Video sources — rendered as a grid of monogrammed tiles. */
export const CINEMA_SOURCES: Source[] = [
  { id: 'apple-tv', name: 'Apple TV' },
  { id: 'blu-ray', name: 'Blu-ray' },
  { id: 'prime', name: 'Prime Video' },
  { id: 'nvidia', name: 'NVIDIA Shield' },
  { id: 'roku', name: 'Roku' },
  { id: 'etisalat', name: 'Etisalat' },
  { id: 'fire-tv', name: 'Fire TV' },
  { id: 'xbox', name: 'Xbox' },
  { id: 'netflix', name: 'Netflix' },
  { id: 'apple-music', name: 'Apple Music' },
  { id: 'cambridge', name: 'Cambridge Audio' },
  { id: 'generic-video', name: 'Video' },
];

export const NOW_PLAYING = {
  album: 'Dystopia',
  artist: 'Artist Name',
  song: 'Song Name',
  // Procedurally generated placeholder (scripts/build-images.mjs
  // buildSyntheticAssets) — a soft gold radial gradient tile in the site's own
  // palette, not sourced photography, since this is display-only UI chrome for
  // the demo, not real album art.
  artUrl: '/lithome/now-playing-art.jpg',
};

export const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${ss}`;
};
