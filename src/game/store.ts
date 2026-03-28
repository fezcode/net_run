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
  activeICE?: string[];
}

// ─── ICE MODIFIER DEFINITIONS ────────────────────────────────────

export interface ICEModifierDef {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
}

export const ICE_MODIFIERS: ICEModifierDef[] = [
  {
    id: 'GHOST_PROTOCOL',
    name: 'GHOST_PROTOCOL',
    description: 'Misplaced hints disabled. Nodes report CORRECT or WRONG only — no yellow feedback. Keyboard also hides misplaced status.',
    shortDesc: 'NO YELLOW HINTS',
  },
  {
    id: 'PHANTOM_NODE',
    name: 'PHANTOM_NODE',
    description: 'One random column is encrypted. That node always displays [?] regardless of actual result.',
    shortDesc: 'HIDDEN COLUMN',
  },
  {
    id: 'DEAD_ZONE',
    name: 'DEAD_ZONE',
    description: '3 random keyboard keys are permanently locked. Letters required for the solution are never disabled.',
    shortDesc: '3 KEYS LOCKED',
  },
  {
    id: 'ENTROPY_DECAY',
    name: 'ENTROPY_DECAY',
    description: 'Each incorrect guess permanently accelerates the trace timer. The clock drains faster with every failed attempt.',
    shortDesc: 'TIMER ACCELERATES',
  },
];

// ─── ICE SEEDING HELPERS ─────────────────────────────────────────

const hashDate = (dateStr: string): number => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getDailyICE = (): string[] => {
  const today = new Date().toISOString().split('T')[0];
  const seed = hashDate(today);
  const roll = seed % 100;
  let numICE: number;
  if (roll < 30) numICE = 0;
  else if (roll < 75) numICE = 1;
  else numICE = 2;

  if (numICE === 0) return [];

  const ids = ICE_MODIFIERS.map(m => m.id);
  const selected: string[] = [];
  let s = Math.floor(seed / 100);

  for (let i = 0; i < numICE; i++) {
    const remaining = ids.filter(id => !selected.includes(id));
    const idx = s % remaining.length;
    selected.push(remaining[idx]);
    s = Math.floor(s / remaining.length) + 17;
  }

  return selected;
};

const getDeadZoneLetters = (targetWord: string, seed: number): string[] => {
  const targetLetters = new Set(targetWord.split(''));
  const available = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => !targetLetters.has(l));
  const selected: string[] = [];
  let s = seed;
  for (let i = 0; i < 3 && available.length > selected.length; i++) {
    const remaining = available.filter(l => !selected.includes(l));
    const idx = Math.abs(s) % remaining.length;
    selected.push(remaining[idx]);
    s = Math.floor(s / 7) + 13;
  }
  return selected;
};

const getPhantomColumn = (seed: number): number => {
  return Math.abs(seed + 31) % 5;
};

// ─── GAME STATE ──────────────────────────────────────────────────

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

  // ICE state
  activeICE: string[];
  phantomColumn: number;
  deadZoneLetters: string[];
  timerDrain: number;
  practiceICESelection: string[];

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
  togglePracticeICE: (iceId: string) => void;
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

      // ICE defaults
      activeICE: [],
      phantomColumn: -1,
      deadZoneLetters: [],
      timerDrain: 1,
      practiceICESelection: [],

      startGame: () => {
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

        const activeICE = isDaily ? getDailyICE() : [...get().practiceICESelection];

        const today = new Date().toISOString().split('T')[0];
        const seed = isDaily ? hashDate(today) : Math.floor(Math.random() * 100000);

        const phantomColumn = activeICE.includes('PHANTOM_NODE') ? getPhantomColumn(seed) : -1;
        const deadZoneLetters = activeICE.includes('DEAD_ZONE') ? getDeadZoneLetters(finalWord, seed) : [];

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
          detectionLevel: 0,
          activeICE,
          phantomColumn,
          deadZoneLetters,
          timerDrain: 1,
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
        const { currentInput, targetWord, gameStatus, playTypingSound, activeICE, deadZoneLetters } = get();
        if (gameStatus !== 'hacking') return;

        if (activeICE.includes('DEAD_ZONE') && deadZoneLetters.includes(letter.toUpperCase())) {
          set({ message: `DEAD_ZONE: KEY [${letter.toUpperCase()}] IS LOCKED` });
          return;
        }

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

      togglePracticeICE: (iceId) => {
        set(state => {
          const current = state.practiceICESelection;
          if (current.includes(iceId)) {
            return { practiceICESelection: current.filter(id => id !== iceId) };
          } else {
            return { practiceICESelection: [...current, iceId] };
          }
        });
      },

      submitGuess: () => {
        const { currentInput, targetWord, currentRow, guesses, gameStatus, usedLetters, triggerGlitch, detectionLevel, playTypingSound, isDaily, history, timer, activeICE, timerDrain } = get();
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

        // ─── GHOST_PROTOCOL: convert misplaced → wrong ───
        if (activeICE.includes('GHOST_PROTOCOL')) {
          result.forEach(node => {
            if (node.status === 'misplaced') {
              node.status = 'wrong';
            }
          });
        }

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

        const isWin = currentInput === targetWord;

        // ─── ENTROPY_DECAY: accelerate timer on wrong guess ───
        const newTimerDrain = (!isWin && activeICE.includes('ENTROPY_DECAY'))
          ? timerDrain + 1
          : timerDrain;

        const updateHistory = (finalStatus: GameStatus) => {
          if (!isDaily) return;
          const today = new Date().toISOString().split('T')[0];
          const newHistory = { ...history };
          newHistory[today] = {
            date: today,
            word: targetWord,
            status: finalStatus,
            timer: 300 - timer,
            detectionLevel: newDetection,
            guesses: newGuesses,
            activeICE,
          };
          set({ history: newHistory });
        };

        if (isWin) {
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
            detectionLevel: 100,
            timerDrain: newTimerDrain,
          });
          updateHistory('failed');
        } else if (currentRow === 5) {
          set({
            guesses: newGuesses,
            gameStatus: 'failed',
            message: `TRACE COMPLETED. ACCESS DENIED. KEY: ${targetWord}`,
            usedLetters: newUsedLetters,
            detectionLevel: newDetection,
            timerDrain: newTimerDrain,
          });
          updateHistory('failed');
        } else {
          set({
            guesses: newGuesses,
            currentRow: currentRow + 1,
            currentInput: '',
            message: 'NODE REJECTED. RETRYING...',
            usedLetters: newUsedLetters,
            detectionLevel: newDetection,
            timerDrain: newTimerDrain,
          });
        }
      },

      tickTimer: () => {
        const { timer, gameStatus, isStarted, timerDrain } = get();
        if (!isStarted || gameStatus !== 'hacking') return;
        const newTimer = timer - timerDrain;
        if (newTimer <= 0) {
          set({ timer: 0, gameStatus: 'failed', message: 'CONNECTION TIMEOUT. TRACE COMPLETE.' });
        } else {
          set({ timer: newTimer });
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
        history: state.history,
        practiceICESelection: state.practiceICESelection,
      }),
    }
  )
);

export const getColorScheme = (mode: ColorBlindMode) => {
  switch (mode) {
    case 'protanopia':
    case 'deuteranopia':
      return {
        correct: { hex: '#3b82f6', tw: 'bg-blue-500', borderTw: 'border-blue-400', textTw: 'text-blue-500', shadowTw: 'rgba(59,130,246,0.5)', hexShadow: '#3b82f6' },
        misplaced: { hex: '#eab308', tw: 'bg-yellow-500', borderTw: 'border-yellow-400', textTw: 'text-yellow-500', shadowTw: 'rgba(234,179,8,0.5)', hexShadow: '#eab308' },
        wrong: { hex: '#ef4444', tw: 'bg-red-500', borderTw: 'border-red-400', textTw: 'text-red-500', shadowTw: 'rgba(239,68,68,0.3)', hexShadow: '#ff0000' }
      };
    case 'tritanopia':
      return {
        correct: { hex: '#06b6d4', tw: 'bg-cyan-500', borderTw: 'border-cyan-400', textTw: 'text-cyan-500', shadowTw: 'rgba(6,182,212,0.5)', hexShadow: '#06b6d4' },
        misplaced: { hex: '#a855f7', tw: 'bg-purple-500', borderTw: 'border-purple-400', textTw: 'text-purple-500', shadowTw: 'rgba(168,85,247,0.5)', hexShadow: '#a855f7' },
        wrong: { hex: '#ef4444', tw: 'bg-red-500', borderTw: 'border-red-400', textTw: 'text-red-500', shadowTw: 'rgba(239,68,68,0.3)', hexShadow: '#ff0000' }
      };
    default:
      return {
        correct: { hex: '#22c55e', tw: 'bg-green-500', borderTw: 'border-green-400', textTw: 'text-green-500', shadowTw: 'rgba(34,197,94,0.5)', hexShadow: '#00ff00' },
        misplaced: { hex: '#eab308', tw: 'bg-yellow-500', borderTw: 'border-yellow-400', textTw: 'text-yellow-500', shadowTw: 'rgba(234,179,8,0.5)', hexShadow: '#ffff00' },
        wrong: { hex: '#ef4444', tw: 'bg-red-500', borderTw: 'border-red-400', textTw: 'text-red-500', shadowTw: 'rgba(239,68,68,0.3)', hexShadow: '#ff0000' }
      };
  }
};
