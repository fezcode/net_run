import { useEffect } from 'react';
import { useGameStore } from '../../game/store';

export function HUD() {
  const message = useGameStore(s => s.message);
  const timer = useGameStore(s => s.timer);
  const gameStatus = useGameStore(s => s.gameStatus);
  const currentInput = useGameStore(s => s.currentInput);
  const tickTimer = useGameStore(s => s.tickTimer);
  const initGame = useGameStore(s => s.initGame);
  const isDaily = useGameStore(s => s.isDaily);

  useEffect(() => {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isIdle = currentInput.length === 0;

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 font-mono text-cyan-500 uppercase">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-cyan-900/50 pb-2 md:pb-4 bg-black/20 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="text-lg md:text-2xl font-bold tracking-widest text-white">NET_RUN v1.0.4</div>
          <div className="text-[10px] md:text-xs opacity-70 flex flex-col md:flex-row md:gap-2">
            <span>TERMINAL: 0x77-ALPHA</span>
            {isDaily && <span className="text-yellow-500 font-bold animate-pulse">[DAILY_SEQUENCE]</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] md:text-xs opacity-70 mb-1">TRACE</div>
          <div className={`text-xl md:text-3xl font-bold ${timer < 60 ? 'text-red-500 animate-pulse' : ''}`}>
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* Center Actions */}
      <div className="flex flex-col items-center justify-center flex-1">
        {gameStatus !== 'hacking' && (
           <div className="flex flex-col items-center gap-4 bg-black/40 p-6 backdrop-blur-xl border border-cyan-500/20">
             <div className="text-white text-xs md:text-sm opacity-80 mb-2">SEQUENCE COMPLETED</div>
             <button 
               className="pointer-events-auto bg-cyan-500 text-black px-6 md:px-8 py-2 font-bold hover:bg-white transition-colors animate-bounce cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.5)]"
               onClick={() => initGame(undefined, true)} 
             >
               PRACTICE HACK
             </button>
           </div>
        )}
      </div>

      {/* Bottom Message & Footer */}
      <div className="space-y-2 md:space-y-4">
        {/* Status Message moved to bottom */}
        <div className="flex justify-center">
          <div className="bg-black/60 border border-cyan-500/30 p-3 md:p-4 min-w-[280px] md:min-w-[500px] text-center backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="text-[8px] md:text-[10px] opacity-50 mb-1 h-3">
              {gameStatus === 'hacking' ? (isIdle ? 'AWAITING INPUT...' : 'PROCESSING...') : 'TERMINAL OUTPUT'}
            </div>
            <div className="text-sm md:text-lg tracking-widest font-bold text-white break-words">
              {message}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-cyan-900/50 pt-2 md:pt-4 bg-black/20 backdrop-blur-sm">
          <div className="text-[8px] md:text-[10px] space-y-1 opacity-60">
            <div className="hidden md:block">IP: 192.168.0.1</div>
            <div>LOC: NEO_TOKYO</div>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            {isIdle && (
              <div className="text-[8px] md:text-[10px] font-bold text-cyan-400 mb-1">
                KEYS: [A-Z] [DEL] [ENT]
              </div>
            )}
            <div className="text-[6px] md:text-[8px] opacity-40">AES-256-R3F | PROTOCOL: DAILY-WORD-V1</div>
          </div>

          <div className="text-[8px] md:text-[10px] text-right space-y-1 opacity-60">
            <div className="hidden md:block">SIGNAL: STABLE</div>
            <div>LAT: 12ms</div>
          </div>
        </div>
      </div>

      {/* CRT Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_100%,100%_2px,3px_100%] opacity-20" />
    </div>
  );
}
