import { create } from 'zustand';
import { sgbWords } from './words';
import answers from './answers.json';

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
  isDaily: boolean;
  usedLetters: Record<string, 'correct' | 'misplaced' | 'wrong' | 'none'>;
  glitchActive: boolean;
  
  // Actions
  initGame: (word?: string, forcePractice?: boolean) => void;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  tickTimer: () => void;
  triggerGlitch: () => void;
}

const getDailyWord = () => {
  const today = new Date().toISOString().split('T')[0];
  const word = (answers as Record<string, string>)[today];
  return word ? word.toUpperCase() : 'CYBER'; // Fallback
};

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
  timer: 300,
  isDaily: true,
  usedLetters: {},
  glitchActive: false,

  initGame: (word, forcePractice) => {
    const isDaily = !word && !forcePractice;
    const finalWord = word ? word.toUpperCase() : (isDaily ? getDailyWord() : getRandomWord());
    
    set({
      targetWord: finalWord,
      guesses: Array(6).fill(null).map(() => Array(finalWord.length).fill({ letter: '', status: 'none' })),
      currentRow: 0,
      currentInput: '',
      gameStatus: 'hacking',
      message: isDaily ? 'DAILY ENCRYPTION DETECTED. BYPASSING...' : 'CONNECTION ESTABLISHED. BYPASS ENCRYPTION.',
      timer: 300,
      isDaily,
      usedLetters: {},
      glitchActive: false
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

  triggerGlitch: () => {
    set({ glitchActive: true });
    setTimeout(() => set({ glitchActive: false }), 1000);
  },

  submitGuess: () => {
    const { currentInput, targetWord, currentRow, guesses, gameStatus, usedLetters, triggerGlitch } = get();
    if (gameStatus !== 'hacking') return;
    
    if (currentInput.length !== targetWord.length) {
      set({ message: 'INCOMPLETE DATA PACKET.' });
      triggerGlitch();
      return;
    }

    if (!sgbWords.includes(currentInput.toLowerCase())) {
      set({ message: 'INVALID DATA STRING. REJECTED.' });
      triggerGlitch();
      return;
    }

    // Precise Wordle logic for duplicate letters
    const targetArr = targetWord.split('');
    const inputArr = currentInput.split('');
    const result: NodeStatus[] = Array(5).fill(null).map((_, i) => ({ letter: inputArr[i], status: 'wrong' }));
    const targetCharCount: Record<string, number> = {};

    // First pass: find all "correct" matches
    targetArr.forEach((char, i) => {
      if (inputArr[i] === char) {
        result[i].status = 'correct';
        targetArr[i] = ''; // Mark as used
      } else {
        targetCharCount[char] = (targetCharCount[char] || 0) + 1;
      }
    });

    // Second pass: find all "misplaced" matches
    inputArr.forEach((char, i) => {
      if (result[i].status !== 'correct' && targetCharCount[char] > 0) {
        result[i].status = 'misplaced';
        targetCharCount[char]--;
      }
    });

    // Update keyboard mapping
    const newUsedLetters = { ...usedLetters };
    result.forEach(({ letter, status }) => {
      const currentStatus = newUsedLetters[letter];
      if (status === 'correct') {
        newUsedLetters[letter] = 'correct';
      } else if (status === 'misplaced' && currentStatus !== 'correct') {
        newUsedLetters[letter] = 'misplaced';
      } else if (status === 'wrong' && !currentStatus) {
        newUsedLetters[letter] = 'wrong';
      }
    });

    const newGuesses = [...guesses];
    newGuesses[currentRow] = result;

    if (currentInput === targetWord) {
      set({
        guesses: newGuesses,
        gameStatus: 'success',
        message: 'ENCRYPTION BYPASSED. ACCESS GRANTED.',
        usedLetters: newUsedLetters
      });
    } else if (currentRow === 5) {
      set({
        guesses: newGuesses,
        gameStatus: 'failed',
        message: `TRACE COMPLETED. ACCESS DENIED. KEY: ${targetWord}`,
        usedLetters: newUsedLetters
      });
    } else {
      set({
        guesses: newGuesses,
        currentRow: currentRow + 1,
        currentInput: '',
        message: 'NODE REJECTED. RETRYING...',
        usedLetters: newUsedLetters
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
