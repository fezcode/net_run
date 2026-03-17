import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/store';
import { VirtualKeyboard } from './VirtualKeyboard';
import { toPng } from 'html-to-image';
import { HelpCircle, X } from 'lucide-react';

export function HUD() {
  const message = useGameStore(s => s.message);
  const timer = useGameStore(s => s.timer);
  const gameStatus = useGameStore(s => s.gameStatus);
  const currentInput = useGameStore(s => s.currentInput);
  const tickTimer = useGameStore(s => s.tickTimer);
  const initGame = useGameStore(s => s.initGame);
  const isDaily = useGameStore(s => s.isDaily);
  const detectionLevel = useGameStore(s => s.detectionLevel);
  const guesses = useGameStore(s => s.guesses);
  const currentRow = useGameStore(s => s.currentRow);

  const [showHelp, setShowHelp] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (!shareRef.current) return;
    try {
      const dataUrl = await toPng(shareRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `NETRUN_LOG_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const isIdle = currentInput.length === 0;
  const isGameOver = gameStatus === 'success' || gameStatus === 'failed';

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 font-mono text-cyan-500 uppercase overflow-hidden">
      {/* Top Section: Header & Message */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-cyan-900/50 pb-2 md:pb-4 bg-black/20 backdrop-blur-sm">
          <div className="space-y-1">
            <div className="text-lg md:text-2xl font-bold tracking-widest text-white">NET_RUN v1.0.4</div>
            <div className="text-[10px] md:text-xs opacity-70 flex items-center gap-2">
              <span>TERMINAL: 0x77-ALPHA</span>
              <button 
                onClick={() => setShowHelp(true)}
                className="pointer-events-auto hover:text-white transition-colors cursor-pointer"
              >
                <HelpCircle size={14} />
              </button>
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

        {/* Detection Meter */}
        <div className="w-full flex flex-col items-center gap-1">
          <div className="flex justify-between w-full max-w-[500px] text-[8px] md:text-[10px]">
            <span className={detectionLevel > 70 ? 'text-red-500 animate-pulse' : 'text-cyan-500'}>DETECTION_RISK</span>
            <span className={detectionLevel > 70 ? 'text-red-500' : 'text-cyan-500'}>{detectionLevel}%</span>
          </div>
          <div className="w-full max-w-[500px] h-1.5 md:h-2 bg-cyan-900/20 border border-cyan-500/30 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${detectionLevel > 70 ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-cyan-500 shadow-[0_0_15px_cyan]'}`}
              style={{ width: `${detectionLevel}%` }}
            />
          </div>
        </div>

        {/* Status Message at TOP */}
        <div className="flex justify-center">
          <div className="bg-black/60 border border-cyan-500/30 p-2 md:p-3 min-w-[200px] md:min-w-[350px] text-center backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="text-[7px] md:text-[9px] opacity-50 mb-0.5 h-3">
              {gameStatus === 'hacking' ? (isIdle ? 'AWAITING INPUT...' : 'PROCESSING...') : 'TERMINAL OUTPUT'}
            </div>
            <div className="text-xs md:text-sm tracking-widest font-bold text-white break-words">
              {message}
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHelp(false)} />
          <div className="relative bg-black border-2 border-cyan-500 p-6 md:p-8 max-w-lg w-full pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-cyan-500 hover:text-white cursor-pointer"
            >
              <X size={24} />
            </button>
            
            <div className="text-2xl font-black mb-6 border-b border-cyan-900 pb-2 tracking-widest">HOW_TO_BYPASS</div>
            
            <div className="space-y-4 text-sm md:text-base lowercase font-light tracking-tight text-cyan-100/80">
              <p><span className="text-white font-bold uppercase tracking-wider underline">The Goal:</span> Guess the 5-letter encryption key in 6 attempts.</p>
              
              <div className="space-y-2 py-4 border-y border-cyan-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 border border-green-400" />
                  <span>Correct letter in the correct node.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-500 border border-yellow-400" />
                  <span>Correct letter in the wrong node.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-zinc-800 border border-zinc-700" />
                  <span>Letter does not exist in sequence.</span>
                </div>
              </div>

              <div className="p-3 bg-red-900/20 border border-red-500/30">
                <p className="text-red-400 font-bold uppercase text-xs mb-1">Warning: Detection Meter</p>
                <p className="text-xs">Each wrong letter increases detection by 5%. Reaching 100% terminates connection immediately.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowHelp(false)}
              className="mt-8 w-full bg-cyan-500 text-black py-3 font-bold hover:bg-white transition-colors cursor-pointer"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}

      {/* Middle Section: Game Over Actions */}
      <div className="flex flex-col items-center justify-center flex-1">
        {isGameOver && (
           <div className="flex flex-col items-center gap-4 bg-black/80 p-6 md:p-8 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="text-white text-xs md:text-sm font-bold tracking-[0.2em] mb-2">HACK_SEQUENCE_TERMINATED</div>
             
             <div className="flex flex-col sm:flex-row gap-3 w-full">
               <button 
                 className="pointer-events-auto bg-white text-black px-6 py-3 font-black hover:bg-cyan-400 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] flex-1 text-center"
                 onClick={handleShare}
               >
                 DOWNLOAD_LOG
               </button>
               <button 
                 className="pointer-events-auto bg-cyan-500 text-black px-6 py-3 font-black hover:bg-white transition-colors cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.4)] flex-1 text-center"
                 onClick={() => initGame(undefined, true)} 
               >
                 NEW_INSTANCE
               </button>
             </div>
           </div>
        )}
      </div>

      {/* Bottom Section: Keyboard & Footer */}
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <VirtualKeyboard />

        <div className="flex justify-between items-end border-t border-cyan-900/50 pt-2 md:pt-4 bg-black/20 backdrop-blur-sm w-full">
          <div className="text-[8px] md:text-[10px] space-y-1 opacity-60">
            <div className="hidden md:block">IP: 192.168.0.1</div>
            <div>LOC: NEO_TOKYO</div>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-40">
            <div className="text-[6px] md:text-[8px]">AES-256-R3F | PROTOCOL: DAILY-WORD-V1</div>
          </div>
          <div className="text-[8px] md:text-[10px] text-right space-y-1 opacity-60">
            <div className="hidden md:block">SIGNAL: STABLE</div>
            <div>LAT: 12ms</div>
          </div>
        </div>
      </div>

      {/* Hidden Share Template */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={shareRef} 
          className="bg-[#050505] p-10 flex flex-col items-center gap-6 border-4 border-cyan-500/30"
          style={{ width: '500px' }}
        >
          <div className="text-3xl font-black text-white tracking-[0.3em] mb-4 border-b-2 border-cyan-500 pb-2 w-full text-center flex flex-col gap-2">
            <div>NET_RUN // LOG</div>
            {isDaily && <div className="text-lg tracking-[0.4em] text-cyan-500 font-bold bg-cyan-950/30 py-1">{new Date().toISOString().split('T')[0]}</div>}
          </div>
          
          <div className="grid gap-3">
            {guesses.map((row, i) => (
              <div key={i} className="flex gap-3">
                {row.map((node, j) => {
                  const isSubmitted = i < currentRow || (isGameOver && node.status !== 'none');
                  let color = 'bg-[#111] border-white/5';
                  if (isSubmitted) {
                    if (node.status === 'correct') color = 'bg-[#00ff00] shadow-[0_0_15px_#00ff00]';
                    else if (node.status === 'misplaced') color = 'bg-[#ffff00] shadow-[0_0_15px_#ffff00]';
                    else if (node.status === 'wrong') color = 'bg-[#333]';
                  }
                  return (
                    <div 
                      key={j} 
                      className={`w-12 h-12 border-2 ${color} transition-all`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-8 text-cyan-500 font-mono text-sm tracking-widest w-full flex justify-between opacity-70">
            <span>DETECTION: {detectionLevel}%</span>
            <span>{isDaily ? 'DAILY_MODE' : 'PRACTICE'}</span>
          </div>
          <div className="text-[10px] text-white/30 mt-2 font-mono">
            ACCESS_POINT: 0x77-ALPHA // AES-256-R3F
          </div>
        </div>
      </div>

      {/* CRT Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_100%,100%_2px,3px_100%] opacity-20" />
    </div>
  );
}
