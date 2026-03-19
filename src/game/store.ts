import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sgbWords } from './words';
import answers from './answers.json';

export type GameStatus = 'idle' | 'hacking' | 'success' | 'failed';
export type ColorBlindMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface NodeStatus {
  letter: string;
  status: 'none' | 'correct' | 'misplaced' | 'wrong';
}

export interface HistoryEntry {
  date: string;
  word: string;
  status: GameStatus;
  timer: number;
  detectionLevel: number;
  guesses: NodeStatus[][];
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
  detectionLevel: number;
  musicEnabled: boolean;
  typingSoundsEnabled: boolean;
  virtualKeyboardEnabled: boolean;
  colorBlindMode: ColorBlindMode;
  isStarted: boolean;
  history: Record<string, HistoryEntry>;
  
  // Actions
  startGame: () => void;
  initGame: (word?: string, forcePractice?: boolean) => void;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  tickTimer: () => void;
  triggerGlitch: () => void;
  toggleMusic: () => void;
  toggleTypingSounds: () => void;
  toggleVirtualKeyboard: () => void;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  playTypingSound: () => void;
  clearHistory: () => void;
}

const getDailyWord = () => {
  const today = new Date().toISOString().split('T')[0];
  const word = (answers as Record<string, string>)[today];
  return word ? word.toUpperCase() : 'CYBER';
};

const getRandomWord = () => {
  return sgbWords[Math.floor(Math.random() * sgbWords.length)].toUpperCase();
};

const typeSounds = [
  'button-21.mp3',
  'button-22.mp3',
  'button-23.mp3',
  'button-24.mp3',
  'button-25.mp3'
].map(file => `${import.meta.env.BASE_URL}${file}`);

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
      detectionLevel: 0,
      musicEnabled: true,
      typingSoundsEnabled: true,
      virtualKeyboardEnabled: true,
      colorBlindMode: 'normal',
      isStarted: false,
      history: {},

      startGame: () => {
        // Pre-load all button sounds for immediate playback
        typeSounds.forEach(sound => {
          const audio = new Audio(sound);
          audio.preload = 'auto';
          audio.load();
        });
        set({ isStarted: true });
      },

      initGame: (word, forcePractice) => {
        const isDaily = !word && !forcePractice;
        const finalWord = word ? word.toUpperCase() : (isDaily ? getDailyWord() : getRandomWord());
        
        set({
          targetWord: finalWord,
          guesses: Array(6).fill(null).map(() => Array(5).fill({ letter: '', status: 'none' })),
          currentRow: 0,
          currentInput: '',
          gameStatus: 'hacking',
          message: isDaily ? 'DAILY ENCRYPTION DETECTED. BYPASSING...' : 'CONNECTION ESTABLISHED. BYPASS ENCRYPTION.',
          timer: 300,
          isDaily,
          usedLetters: {},
          glitchActive: false,
          detectionLevel: 0
        });
      },

      playTypingSound: () => {
        if (!get().typingSoundsEnabled) return;
        const soundPath = typeSounds[Math.floor(Math.random() * typeSounds.length)];
        const audio = new Audio(soundPath);
        audio.volume = 0.3;
        audio.play().catch(() => {});
      },

      addLetter: (letter) => {
        const { currentInput, targetWord, gameStatus, playTypingSound } = get();
        if (gameStatus !== 'hacking') return;
        if (currentInput.length < targetWord.length) {
          set({ currentInput: currentInput + letter.toUpperCase() });
          playTypingSound();
        }
      },

      removeLetter: () => {
        const { currentInput, gameStatus, playTypingSound } = get();
        if (gameStatus !== 'hacking') return;
        set({ currentInput: currentInput.slice(0, -1) });
        playTypingSound();
      },

      setColorBlindMode: (mode) => {
        set({ colorBlindMode: mode });
      },

      triggerGlitch: () => {
        set({ glitchActive: true });
        setTimeout(() => set({ glitchActive: false }), 1000);
      },

      toggleMusic: () => {
        set((state) => ({ musicEnabled: !state.musicEnabled }));
      },

      toggleTypingSounds: () => {
        set((state) => ({ typingSoundsEnabled: !state.typingSoundsEnabled }));
      },

      toggleVirtualKeyboard: () => {
        set((state) => ({ virtualKeyboardEnabled: !state.virtualKeyboardEnabled }));
      },

      clearHistory: () => {
        set({ history: {} });
      },

      submitGuess: () => {
        const { currentInput, targetWord, currentRow, guesses, gameStatus, usedLetters, triggerGlitch, detectionLevel, playTypingSound, isDaily, history, timer } = get();
        if (gameStatus !== 'hacking') return;
        
        playTypingSound();

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

        const targetArr = targetWord.split('');
        const inputArr = currentInput.split('');
        const result: NodeStatus[] = Array(5).fill(null).map((_, i) => ({ letter: inputArr[i], status: 'wrong' }));
        const targetCharCount: Record<string, number> = {};

        targetArr.forEach((char, i) => {
          if (inputArr[i] === char) {
            result[i].status = 'correct';
            targetArr[i] = ''; 
          } else {
            targetCharCount[char] = (targetCharCount[char] || 0) + 1;
          }
        });

        let wrongCount = 0;
        inputArr.forEach((char, i) => {
          if (result[i].status !== 'correct') {
            if (targetCharCount[char] > 0) {
              result[i].status = 'misplaced';
              targetCharCount[char]--;
            } else {
              wrongCount++;
            }
          }
        });

        const newDetection = Math.min(100, detectionLevel + (wrongCount * 5));

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

        const updateHistory = (finalStatus: GameStatus) => {
          if (!isDaily) return;
          const today = new Date().toISOString().split('T')[0];
          const newHistory = { ...history };
          newHistory[today] = {
            date: today,
            word: targetWord,
            status: finalStatus,
            timer: 300 - timer, // Time taken
            detectionLevel: newDetection,
            guesses: newGuesses
          };
          set({ history: newHistory });
        };

        if (currentInput === targetWord) {
          set({
            guesses: newGuesses,
            gameStatus: 'success',
            message: 'ENCRYPTION BYPASSED. ACCESS GRANTED.',
            usedLetters: newUsedLetters,
            detectionLevel: newDetection
          });
          updateHistory('success');
        } else if (newDetection >= 100) {
          set({
            guesses: newGuesses,
            gameStatus: 'failed',
            message: 'SYSTEM DETECTED. CONNECTION TERMINATED.',
            usedLetters: newUsedLetters,
            detectionLevel: 100
          });
          updateHistory('failed');
        } else if (currentRow === 5) {
          set({
            guesses: newGuesses,
            gameStatus: 'failed',
            message: `TRACE COMPLETED. ACCESS DENIED. KEY: ${targetWord}`,
            usedLetters: newUsedLetters,
            detectionLevel: newDetection
          });
          updateHistory('failed');
        } else {
          set({
            guesses: newGuesses,
            currentRow: currentRow + 1,
            currentInput: '',
            message: 'NODE REJECTED. RETRYING...',
            usedLetters: newUsedLetters,
            detectionLevel: newDetection
          });
        }
      },

      tickTimer: () => {
        const { timer, gameStatus, isStarted } = get();
        if (!isStarted || gameStatus !== 'hacking') return;
        if (timer <= 0) {
          set({ gameStatus: 'failed', message: 'CONNECTION TIMEOUT. TRACE COMPLETE.' });
        } else {
          set({ timer: timer - 1 });
        }
      }
    }),
    {
      name: 'netrun-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        musicEnabled: state.musicEnabled,
        typingSoundsEnabled: state.typingSoundsEnabled,
        virtualKeyboardEnabled: state.virtualKeyboardEnabled,
        colorBlindMode: state.colorBlindMode,
        history: state.history
      }),
    }
  )
);

export const getColorScheme = (mode: ColorBlindMode) => {
  switch (mode) {
    case 'protanopia':
    case 'deuteranopia':
      return {
        correct: { hex: '#3b82f6', tw: 'bg-blue-500', borderTw: 'border-blue-400', textTw: 'text-blue-500', shadowTw: 'rgba(59,130,246,0.5)', hexShadow: '#3b82f6' }, // Blue
        misplaced: { hex: '#eab308', tw: 'bg-yellow-500', borderTw: 'border-yellow-400', textTw: 'text-yellow-500', shadowTw: 'rgba(234,179,8,0.5)', hexShadow: '#eab308' }, // Yellow
        wrong: { hex: '#27272a', tw: 'bg-zinc-800', borderTw: 'border-zinc-700', textTw: 'text-gray-500', hexShadow: '#27272a' } // Dark gray
      };
    case 'tritanopia':
      return {
        correct: { hex: '#ef4444', tw: 'bg-red-500', borderTw: 'border-red-400', textTw: 'text-red-500', shadowTw: 'rgba(239,68,68,0.5)', hexShadow: '#ef4444' }, // Red
        misplaced: { hex: '#06b6d4', tw: 'bg-cyan-500', borderTw: 'border-cyan-400', textTw: 'text-cyan-500', shadowTw: 'rgba(6,182,212,0.5)', hexShadow: '#06b6d4' }, // Cyan
        wrong: { hex: '#27272a', tw: 'bg-zinc-800', borderTw: 'border-zinc-700', textTw: 'text-gray-500', hexShadow: '#27272a' } // Dark gray
      };
    default: // normal
      return {
        correct: { hex: '#22c55e', tw: 'bg-green-500', borderTw: 'border-green-400', textTw: 'text-green-500', shadowTw: 'rgba(34,197,94,0.5)', hexShadow: '#00ff00' }, // Green
        misplaced: { hex: '#eab308', tw: 'bg-yellow-500', borderTw: 'border-yellow-400', textTw: 'text-yellow-500', shadowTw: 'rgba(234,179,8,0.5)', hexShadow: '#ffff00' }, // Yellow
        wrong: { hex: '#27272a', tw: 'bg-zinc-800', borderTw: 'border-zinc-700', textTw: 'text-gray-500', hexShadow: '#333333' } // Dark gray
      };
  }
};
