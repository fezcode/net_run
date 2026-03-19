import { useGameStore, getColorScheme } from '../../game/store';

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

  const colors = getColorScheme(colorBlindMode);

  const handleClick = (key: string) => {
    if (gameStatus !== 'hacking') return;
    if (key === 'ENT') submitGuess();
    else if (key === 'DEL') removeLetter();
    else addLetter(key);
  };

  const getKeyColor = (key: string) => {
    const status = usedLetters[key];
    if (status === 'correct') return `${colors.correct.tw} text-black ${colors.correct.borderTw} shadow-[0_0_15px_${colors.correct.shadowTw}]`;
    if (status === 'misplaced') return `${colors.misplaced.tw} text-black ${colors.misplaced.borderTw} shadow-[0_0_15px_${colors.misplaced.shadowTw}]`;
    if (status === 'wrong') return `${colors.wrong.tw} ${colors.wrong.textTw} ${colors.wrong.borderTw} opacity-50`;
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
              className={`
                ${getKeyColor(key)}
                border transition-all duration-200 font-bold rounded-sm
                flex items-center justify-center cursor-pointer
                ${key.length > 1 ? 'px-2 md:px-4 text-[10px] md:text-xs min-w-[45px] md:min-w-[60px]' : 'w-full max-w-[40px] aspect-[3/4] md:aspect-square text-xs md:text-base'}
                h-10 md:h-12
              `}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
