import { useEffect, useRef } from 'react';
import { useGameStore } from '../../game/store';

export function AudioPlayer() {
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music-vladislav_zavorin-space-ambient-433363.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }

    if (musicEnabled) {
      audioRef.current.play().catch(err => {
        console.warn('Audio play blocked by browser policy. User interaction required.', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled]);

  return null;
}
