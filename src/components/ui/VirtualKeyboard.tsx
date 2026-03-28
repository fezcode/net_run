import { useGameStore, getColorScheme } from '../../game/store';
import { Lock } from 'lucide-react';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

export function VirtualKeyboard() {
  const addLetter = useGameStore(s => s.addLetter);
  const removeLetter = useGameStore(s => s.removeLetter);
  const submitGuess = useGameStore(s => s.submitGuess);
  const usedLetters = useGameStore(s => s.usedLetters);
  const gameStatus = useGameStore(s => s.gameStatus);
  const colorBlindMode = useGameStore(s => s.colorBlindMode);
  const activeICE = useGameStore(s => s.activeICE);
  const deadZoneLetters = useGameStore(s => s.deadZoneLetters);

  const colors = getColorScheme(colorBlindMode);
  const hasDeadZone = activeICE.includes('DEAD_ZONE');

  const handleClick = (key: string) => {
    if (gameStatus !== 'hacking') return;
    if (key === 'ENT') submitGuess();
    else if (key === 'DEL') removeLetter();
    else addLetter(key);
  };

  const isDeadKey = (key: string) => hasDeadZone && deadZoneLetters.includes(key);

  const getKeyColor = (key: string) => {
    if (isDeadKey(key)) {
      return 'bg-zinc-900/80 text-zinc-700 border-zinc-800 cursor-not-allowed opacity-40';
    }
    const status = usedLetters[key];
    if (status === 'correct') return `${colors.correct.tw} text-black ${colors.correct.borderTw} shadow-[0_0_15px_${colors.correct.shadowTw}]`;
    if (status === 'misplaced') return `${colors.misplaced.tw} text-black ${colors.misplaced.borderTw} shadow-[0_0_15px_${colors.misplaced.shadowTw}]`;
    if (status === 'wrong') return `${colors.wrong.tw} text-black ${colors.wrong.borderTw}`;
    return 'bg-black/40 text-cyan-400 border-cyan-900/50 hover:border-cyan-400/50 hover:bg-cyan-900/20';
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-2 items-center w-full max-w-2xl pointer-events-auto select-none px-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1 md:gap-1.5 w-full justify-center">
          {row.map(key => (
            <button
              key={key}
              onClick={() => handleClick(key)}
              disabled={isDeadKey(key)}
              className={`
                ${getKeyColor(key)}
                border transition-all duration-200 font-bold rounded-sm
                flex items-center justify-center cursor-pointer relative
                ${key.length > 1 ? 'px-2 md:px-4 text-[10px] md:text-xs min-w-[45px] md:min-w-[60px]' : 'w-full max-w-[40px] aspect-[3/4] md:aspect-square text-xs md:text-base'}
                h-10 md:h-12
              `}
            >
              {isDeadKey(key) ? <Lock size={14} className="text-red-900" /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
