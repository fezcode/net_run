import { create } from 'zustand';
import { sgbWords } from './words';

export type GameStatus = 'idle' | 'hacking' | 'success' | 'failed';

interface NodeStatus {
  letter: string;
  status: 'none' | 'correct' | 'misplaced' | 'wrong';
}

interface GameState {
  targetWord: string;
  guesses: NodeStatus[][];
  currentRow: number;
  currentInput: string;
  gameStatus: GameStatus;
  message: string;
  timer: number;
  
  // Actions
  initGame: (word?: string) => void;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  tickTimer: () => void;
}

const getRandomWord = () => {
  return sgbWords[Math.floor(Math.random() * sgbWords.length)].toUpperCase();
};

export const useGameStore = create<GameState>((set, get) => ({
  targetWord: 'CYBER',
  guesses: Array(6).fill(null).map(() => Array(5).fill({ letter: '', status: 'none' })),
  currentRow: 0,
  currentInput: '',
  gameStatus: 'idle',
  message: 'SYSTEM READY. INITIATE HACK...',
  timer: 300, // 5 minutes

  initGame: (word) => {
    const finalWord = word ? word.toUpperCase() : getRandomWord();
    set({
      targetWord: finalWord,
      guesses: Array(6).fill(null).map(() => Array(finalWord.length).fill({ letter: '', status: 'none' })),
      currentRow: 0,
      currentInput: '',
      gameStatus: 'hacking',
      message: 'CONNECTION ESTABLISHED. BYPASS ENCRYPTION.',
      timer: 300,
    });
  },

  addLetter: (letter) => {
    const { currentInput, targetWord, gameStatus } = get();
    if (gameStatus !== 'hacking') return;
    if (currentInput.length < targetWord.length) {
      set({ currentInput: currentInput + letter.toUpperCase() });
    }
  },

  removeLetter: () => {
    const { currentInput, gameStatus } = get();
    if (gameStatus !== 'hacking') return;
    set({ currentInput: currentInput.slice(0, -1) });
  },

  submitGuess: () => {
    const { currentInput, targetWord, currentRow, guesses, gameStatus } = get();
    if (gameStatus !== 'hacking') return;
    
    if (currentInput.length !== targetWord.length) {
      set({ message: 'INCOMPLETE DATA PACKET.' });
      return;
    }

    if (!sgbWords.includes(currentInput.toLowerCase())) {
      set({ message: 'INVALID DATA STRING. REJECTED.' });
      return;
    }

    const newRow: NodeStatus[] = currentInput.split('').map((letter, i) => {
      if (letter === targetWord[i]) return { letter, status: 'correct' };
      if (targetWord.includes(letter)) return { letter, status: 'misplaced' };
      return { letter, status: 'wrong' };
    });

    const newGuesses = [...guesses];
    newGuesses[currentRow] = newRow;

    if (currentInput === targetWord) {
      set({
        guesses: newGuesses,
        gameStatus: 'success',
        message: 'ENCRYPTION BYPASSED. ACCESS GRANTED.',
      });
    } else if (currentRow === 5) {
      set({
        guesses: newGuesses,
        gameStatus: 'failed',
        message: `TRACE COMPLETED. ACCESS DENIED. KEY: ${targetWord}`,
      });
    } else {
      set({
        guesses: newGuesses,
        currentRow: currentRow + 1,
        currentInput: '',
        message: 'NODE REJECTED. RETRYING...',
      });
    }
  },

  tickTimer: () => {
    const { timer, gameStatus } = get();
    if (gameStatus !== 'hacking') return;
    if (timer <= 0) {
      set({ gameStatus: 'failed', message: 'CONNECTION TIMEOUT. TRACE COMPLETE.' });
    } else {
      set({ timer: timer - 1 });
    }
  }
}));
