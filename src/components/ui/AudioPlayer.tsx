import { useEffect, useRef } from 'react';
import { useGameStore } from '../../game/store';

const PLAYLIST = [
  '/music-vladislav_zavorin-space-ambient-433363.mp3',
  '/music-the_mountain-space-438391.mp3'
];

export function AudioPlayer() {
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndex = useRef(Math.floor(Math.random() * PLAYLIST.length));

  const playNext = () => {
    if (!audioRef.current) return;
    currentTrackIndex.current = (currentTrackIndex.current + 1) % PLAYLIST.length;
    audioRef.current.src = PLAYLIST[currentTrackIndex.current];
    audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(PLAYLIST[currentTrackIndex.current]);
      audioRef.current.volume = 0.4;
      audioRef.current.onended = playNext;
    }

    if (musicEnabled) {
      audioRef.current.play().catch(err => {
        console.warn('Audio play blocked. Waiting for interaction.', err);
        
        // Retry play on first user interaction if blocked
        const retryPlay = () => {
          if (useGameStore.getState().musicEnabled) {
            audioRef.current?.play().catch(() => {});
          }
          window.removeEventListener('click', retryPlay);
          window.removeEventListener('keydown', retryPlay);
        };
        window.addEventListener('click', retryPlay);
        window.addEventListener('keydown', retryPlay);
      });
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled]);

  return null;
}
