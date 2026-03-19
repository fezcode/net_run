import { useEffect, useRef } from 'react';
import { useGameStore } from '../../game/store';

const PLAYLIST = [
  'music-vladislav_zavorin-space-ambient-433363.mp3',
  'music-the_mountain-space-438391.mp3'
].map(file => `${import.meta.env.BASE_URL}${file}`);

export function AudioPlayer() {
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const isStarted = useGameStore(s => s.isStarted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndex = useRef(Math.floor(Math.random() * PLAYLIST.length));

  // Pre-load all tracks when session is initiated
  useEffect(() => {
    if (isStarted) {
      PLAYLIST.forEach(track => {
        const audio = new Audio(track);
        audio.preload = 'auto';
        audio.load();
      });
    }
  }, [isStarted]);

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
