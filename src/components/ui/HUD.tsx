import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/store';
import type { HistoryEntry } from '../../game/store';
import { VirtualKeyboard } from './VirtualKeyboard';
import { toPng } from 'html-to-image';
import { HelpCircle, X, Settings, Volume2, VolumeX, Keyboard, Play, History, Trash2, LayoutPanelTop } from 'lucide-react';

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
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const toggleMusic = useGameStore(s => s.toggleMusic);
  const typingSoundsEnabled = useGameStore(s => s.typingSoundsEnabled);
  const toggleTypingSounds = useGameStore(s => s.toggleTypingSounds);
  const isStarted = useGameStore(s => s.isStarted);
  const startGame = useGameStore(s => s.startGame);
  const history = useGameStore(s => s.history);
  const clearHistory = useGameStore(s => s.clearHistory);

  const [showHelp, setShowHelp] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hideGameOverModal, setHideGameOverModal] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  useEffect(() => {
    if (gameStatus === 'hacking') {
      setHideGameOverModal(false);
    }
  }, [gameStatus]);

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

  if (!isStarted) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#050505] flex flex-col items-center justify-center p-4 font-mono">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_100%,100%_2px,3px_100%] opacity-40" />
        <div className="relative flex flex-col items-center gap-8 max-w-md w-full text-center">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-[0.2em] animate-pulse">NET_RUN</h1>
            <p className="text-cyan-500 text-xs md:text-sm tracking-[0.4em] opacity-70">ENCRYPTION_BYPASS_INTERFACE</p>
          </div>
          <div className="w-full h-px bg-cyan-900/50" />
          <button 
            onClick={() => startGame()}
            className="group pointer-events-auto relative px-12 py-4 bg-transparent border-2 border-cyan-500 text-cyan-500 font-bold tracking-[0.3em] overflow-hidden hover:text-black transition-colors cursor-pointer"
          >
            <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center gap-3">
              <Play size={18} fill="currentColor" />
              INITIATE_SESSION
            </span>
          </button>
          <div className="text-[10px] text-cyan-900 space-y-1 mt-4">
            <div>AUTHORIZED ACCESS ONLY</div>
            <div>STAY WITHIN TRACE THRESHOLD</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 pb-2 md:pb-8 font-mono text-cyan-500 uppercase overflow-hidden">
      {/* Top Section: Header & Detection (Hidden on Mobile) */}
      <div className="space-y-4 hidden md:block">
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
      </div>

      {/* Spacer for mobile to push content down if needed, but flex-col justify-between handles it */}
      <div className="md:hidden" />

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHelp(false)} />
          <div className="relative bg-black border-2 border-cyan-500 p-6 md:p-8 max-w-lg w-full pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-cyan-500 hover:text-white cursor-pointer"><X size={24} /></button>
            <div className="text-2xl font-black mb-6 border-b border-cyan-900 pb-2 tracking-widest">HOW_TO_BYPASS</div>
            <div className="space-y-4 text-sm md:text-base lowercase font-light tracking-tight text-cyan-100/80">
              <p><span className="text-white font-bold uppercase tracking-wider underline">The Goal:</span> Guess the 5-letter encryption key in 6 attempts.</p>
              <div className="space-y-2 py-4 border-y border-cyan-900/50">
                <div className="flex items-center gap-3"><div className="w-6 h-6 bg-green-500 border border-green-400" /><span>Correct letter in the correct node.</span></div>
                <div className="flex items-center gap-3"><div className="w-6 h-6 bg-yellow-500 border border-yellow-400" /><span>Correct letter in the wrong node.</span></div>
                <div className="flex items-center gap-3"><div className="w-6 h-6 bg-zinc-800 border border-zinc-700" /><span>Letter does not exist in sequence.</span></div>
              </div>
              <div className="p-3 bg-red-900/20 border border-red-500/30">
                <p className="text-red-400 font-bold uppercase text-xs mb-1">Warning: Detection Meter</p>
                <p className="text-xs">Each wrong letter increases detection by 5%. Reaching 100% terminates connection immediately.</p>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-8 w-full bg-cyan-500 text-black py-3 font-bold hover:bg-white transition-colors cursor-pointer">UNDERSTOOD</button>
          </div>
        </div>
      )}

      {/* Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowOptions(false)} />
          <div className="relative bg-black border-2 border-cyan-500 p-6 md:p-8 max-w-lg w-full pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <button onClick={() => setShowOptions(false)} className="absolute top-4 right-4 text-cyan-500 hover:text-white cursor-pointer"><X size={24} /></button>
            <div className="text-2xl font-black mb-6 border-b border-cyan-900 pb-2 tracking-widest">SYSTEM_OPTIONS</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30">
                <div className="flex items-center gap-3 text-white font-bold">{musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}<span>BACKGROUND_AUDIO</span></div>
                <button onClick={toggleMusic} className={`pointer-events-auto w-12 h-6 rounded-full transition-colors relative ${musicEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}><div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${musicEnabled ? 'translate-x-6' : ''}`} /></button>
              </div>
              <div className="flex items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30">
                <div className="flex items-center gap-3 text-white font-bold"><Keyboard size={20} /><span>TYPING_SENSORS</span></div>
                <button onClick={toggleTypingSounds} className={`pointer-events-auto w-12 h-6 rounded-full transition-colors relative ${typingSoundsEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}><div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${typingSoundsEnabled ? 'translate-x-6' : ''}`} /></button>
              </div>
              <div className="space-y-4 pt-4 border-t border-cyan-900/50 text-center">
                <div className="text-[10px] text-cyan-500/60 uppercase tracking-widest">Credits</div>
                <div className="bg-black/40 p-3 border border-cyan-900/30 text-[10px] lowercase leading-relaxed text-cyan-100/60 space-y-2 text-left">
                  <div>Music by ВЛАДИСЛАВ ЗАВОРИН from Pixabay</div>
                  <div>Music by Dmitrii Kolesnikov from Pixabay</div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs pt-2"><span className="opacity-40 tracking-widest">DEVELOPED_BY</span><a href="https://fezcode.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-bold hover:text-white transition-colors">FEZCODE.COM</a></div>
              </div>
            </div>
            <button onClick={() => setShowOptions(false)} className="mt-8 w-full bg-cyan-500 text-black py-3 font-bold hover:bg-white transition-colors cursor-pointer">EXIT_OPTIONS</button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHistory(false)} />
          <div className="relative bg-black border-2 border-cyan-500 p-6 md:p-8 max-w-2xl w-full max-h-[80vh] flex flex-col pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <button onClick={() => setShowHistory(false)} className="absolute top-4 right-4 text-cyan-500 hover:text-white cursor-pointer"><X size={24} /></button>
            <div className="flex justify-between items-center mb-6 border-b border-cyan-900 pb-2">
              <div className="text-2xl font-black tracking-widest text-cyan-500">HACK_LOG_HISTORY</div>
              {Object.keys(history).length > 0 && (
                <button onClick={() => { if(confirm('WIPE_HISTORY_BUFFER?')) clearHistory(); }} className="flex items-center gap-2 text-red-500 hover:text-white transition-colors text-[10px] font-bold cursor-pointer"><Trash2 size={12} />WIPE_BUFFER</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {Object.keys(history).length === 0 ? (<div className="text-center py-10 opacity-40 italic">NO_LOGS_FOUND_IN_BUFFER</div>) : (
                Object.values(history).sort((a, b) => b.date.localeCompare(a.date)).map((entry: HistoryEntry) => (
                  <div key={entry.date} className="flex items-center justify-between p-3 bg-cyan-950/10 border border-cyan-900/30 hover:border-cyan-500/50 transition-colors">
                    <div className="space-y-1">
                      <div className="text-xs text-white font-bold">{entry.date}</div>
                      <div className="text-[10px] opacity-60">TARGET: {entry.status === 'success' ? entry.word : 'XXXXX'}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] opacity-50">DETECTION</div>
                        <div className={`text-xs font-bold ${entry.detectionLevel > 70 ? 'text-red-500' : 'text-cyan-500'}`}>{entry.detectionLevel}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] opacity-50">TIME</div>
                        <div className="text-xs font-bold text-white">{formatTime(entry.timer)}</div>
                      </div>
                      <div className={`px-3 py-1 text-[10px] font-black ${entry.status === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}`}>{entry.status === 'success' ? 'BYPASSED' : 'TERMINATED'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowHistory(false)} className="mt-6 w-full bg-cyan-500 text-black py-3 font-bold hover:bg-white transition-colors cursor-pointer">CLOSE_LOGS</button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && !hideGameOverModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setHideGameOverModal(true)} />
           <div className="relative flex flex-col items-center gap-4 bg-black/90 p-6 md:p-8 border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto">
             <button onClick={() => setHideGameOverModal(true)} className="absolute top-2 right-2 text-cyan-500/50 hover:text-white cursor-pointer"><X size={20} /></button>
             <div className="text-white text-xs md:text-sm font-bold tracking-[0.2em] mb-2">HACK_SEQUENCE_TERMINATED</div>
             <div className="flex flex-col sm:flex-row gap-3 w-full">
               <button className="pointer-events-auto bg-white text-black px-6 py-3 font-black hover:bg-cyan-400 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] flex-1 text-center" onClick={handleShare}>DOWNLOAD_LOG</button>
               <button className="pointer-events-auto bg-cyan-500 text-black px-6 py-3 font-black hover:bg-white transition-colors cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.4)] flex-1 text-center" onClick={() => initGame(undefined, true)}>NEW_INSTANCE</button>
             </div>
           </div>
        </div>
      )}

      <div className="flex flex-col-reverse md:flex-col items-center gap-4 md:gap-6">
        <VirtualKeyboard />
        <div className="flex justify-between items-end border-t border-cyan-900/50 pt-2 md:pt-4 bg-black/20 backdrop-blur-sm w-full">
          <div className="flex-1 flex flex-col justify-end h-full max-w-[40%]">
            <div className="text-[7px] md:text-[9px] opacity-50 mb-0.5 uppercase">{gameStatus === 'hacking' ? (isIdle ? 'AWAITING INPUT...' : 'PROCESSING...') : 'TERMINAL OUTPUT'}</div>
            <div className="text-[10px] md:text-sm tracking-widest font-bold text-white break-words line-clamp-2">{message}</div>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-40 px-2 flex-1 text-center">
            <div className={`text-sm font-bold md:hidden ${timer < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {formatTime(timer)}
            </div>
            <div className="text-[6px] md:text-[8px]">AES-256-R3F | PROTOCOL: DAILY-WORD-V1</div>
          </div>
          <div className="flex items-center flex-1 justify-end gap-2 md:gap-3">
            {isGameOver && hideGameOverModal && (
              <button onClick={() => setHideGameOverModal(false)} className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]"><LayoutPanelTop size={window.innerWidth < 768 ? 20 : 28} /></button>
            )}
            <button onClick={() => setShowHistory(true)} className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 bg-cyan-950/30 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]"><History size={window.innerWidth < 768 ? 20 : 28} /></button>
            <button onClick={() => setShowOptions(true)} className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 bg-cyan-950/30 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]"><Settings size={window.innerWidth < 768 ? 20 : 28} /></button>
            <button onClick={() => setShowHelp(true)} className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 bg-cyan-950/30 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]"><HelpCircle size={window.innerWidth < 768 ? 20 : 28} /></button>
          </div>
        </div>
      </div>

      <div className="fixed left-[-9999px] top-0">
        <div ref={shareRef} className="bg-[#050505] p-10 flex flex-col items-center gap-6 border-4 border-cyan-500/30" style={{ width: '500px' }}>
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
                  return <div key={j} className={`w-12 h-12 border-2 ${color} transition-all`} />;
                })}
              </div>
            ))}
          </div>
          <div className="mt-8 text-cyan-500 font-mono text-sm tracking-widest w-full flex justify-between opacity-70 items-center">
            <div className="flex flex-col"><span>DETECTION: {detectionLevel}%</span><span>MODE: {isDaily ? 'DAILY' : 'PRACTICE'}</span></div>
            <div className="text-2xl font-black text-white border-l-2 border-cyan-500 pl-4">{formatTime(timer)}</div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_100%,100%_2px,3px_100%] opacity-20" />
    </div>
  );
}
