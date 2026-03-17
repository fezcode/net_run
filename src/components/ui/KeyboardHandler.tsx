import { useEffect } from 'react';
import { useGameStore } from '../../game/store';

export function KeyboardHandler() {
  const addLetter = useGameStore(s => s.addLetter);
  const removeLetter = useGameStore(s => s.removeLetter);
  const submitGuess = useGameStore(s => s.submitGuess);
  const gameStatus = useGameStore(s => s.gameStatus);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'hacking') return;

      if (e.key === 'Enter') {
        submitGuess();
      } else if (e.key === 'Backspace') {
        removeLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        addLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, addLetter, removeLetter, submitGuess]);

  return null;
}
