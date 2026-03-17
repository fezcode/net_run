import { useEffect } from 'react';
import { useGameStore } from '../../game/store';

export function HUD() {
  const message = useGameStore(s => s.message);
  const timer = useGameStore(s => s.timer);
  const gameStatus = useGameStore(s => s.gameStatus);
  const tickTimer = useGameStore(s => s.tickTimer);
  const initGame = useGameStore(s => s.initGame);

  useEffect(() => {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 font-mono text-cyan-500 uppercase">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-cyan-900/50 pb-4 bg-black/20 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-widest text-white">NET_RUN v1.0.4</div>
          <div className="text-xs opacity-70">TERMINAL: 0x77-ALPHA</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-70 mb-1">SECURITY TRACE</div>
          <div className={`text-3xl font-bold ${timer < 60 ? 'text-red-500 animate-pulse' : ''}`}>
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex flex-col items-center gap-4 mb-20">
        <div className="bg-black/60 border border-cyan-500/30 p-4 min-w-[400px] text-center backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="text-xs opacity-50 mb-2">{gameStatus === 'hacking' ? 'ANALYZING...' : 'STATUS REPORT'}</div>
          <div className="text-lg tracking-tight font-medium">{message}</div>
        </div>

        {gameStatus !== 'hacking' && (
           <button 
             className="pointer-events-auto bg-cyan-500 text-black px-8 py-2 font-bold hover:bg-white transition-colors animate-bounce cursor-pointer"
             onClick={() => initGame('MODERN')}
           >
             REBOOT SYSTEM
           </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-end border-t border-cyan-900/50 pt-4 bg-black/20 backdrop-blur-sm">
        <div className="text-[10px] space-y-1 opacity-60">
          <div>IP: 192.168.0.1</div>
          <div>LOC: UNDISCLOSED_NEO_TOKYO</div>
        </div>
        <div className="text-[10px] text-right space-y-1 opacity-60">
          <div>USE_KEYS: A-Z, ENTER, BACKSPACE</div>
          <div>ENCRYPTION: AES-256-R3F</div>
        </div>
      </div>

      {/* CRT Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_100%,100%_2px,3px_100%] opacity-20" />
    </div>
  );
}
