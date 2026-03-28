import { useEffect, useRef, useState } from 'react';
import { useGameStore, getColorScheme, ICE_MODIFIERS, getDailyICE } from '../../game/store';
import type { HistoryEntry } from '../../game/store';
import { VirtualKeyboard } from './VirtualKeyboard';
import { toPng } from 'html-to-image';
import { HelpCircle, X, Settings, Volume2, VolumeX, Keyboard, Play, History, Trash2, LayoutPanelTop, Eye, Shield, ShieldAlert, Info } from 'lucide-react';

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
  const virtualKeyboardEnabled = useGameStore(s => s.virtualKeyboardEnabled);
  const toggleVirtualKeyboard = useGameStore(s => s.toggleVirtualKeyboard);
  const colorBlindMode = useGameStore(s => s.colorBlindMode);
  const setColorBlindMode = useGameStore(s => s.setColorBlindMode);
  const isStarted = useGameStore(s => s.isStarted);
  const startGame = useGameStore(s => s.startGame);
  const history = useGameStore(s => s.history);
  const clearHistory = useGameStore(s => s.clearHistory);
  const activeICE = useGameStore(s => s.activeICE);
  const phantomColumn = useGameStore(s => s.phantomColumn);
  const timerDrain = useGameStore(s => s.timerDrain);
  const practiceICESelection = useGameStore(s => s.practiceICESelection);
  const togglePracticeICE = useGameStore(s => s.togglePracticeICE);

  const colors = getColorScheme(colorBlindMode);

  const [showHelp, setShowHelp] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hideGameOverModal, setHideGameOverModal] = useState(false);
  const [showPracticeSetup, setShowPracticeSetup] = useState(false);
  const [expandedICE, setExpandedICE] = useState<string | null>(null);
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
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.max(0, seconds) % 60;
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
  const dailyICEPreview = getDailyICE();

  // ─── ICE Badge Component ───────────────────────────────────────

  const ICEBadge = ({ iceId, compact = false }: { iceId: string; compact?: boolean }) => {
    const def = ICE_MODIFIERS.find(m => m.id === iceId);
    if (!def) return null;
    const isExpanded = expandedICE === iceId;

    return (
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setExpandedICE(isExpanded ? null : iceId); }}
          className={`pointer-events-auto flex items-center gap-2 border transition-all cursor-pointer ${
            compact
              ? 'px-3 py-1.5 border-amber-500/40 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40'
              : 'px-4 py-2 border-amber-500/50 bg-amber-950/40 text-amber-400 hover:bg-amber-900/50'
          }`}
        >
          <ShieldAlert size={compact ? 14 : 16} />
          <span className={`font-black tracking-wider ${compact ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'}`}>{def.name}</span>
          <Info size={compact ? 10 : 12} className="opacity-50" />
        </button>
        {isExpanded && (
          <div className="absolute top-full left-0 mt-1 z-[100] w-64 p-3 bg-black border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] pointer-events-auto">
            <div className="text-[10px] font-black text-amber-400 tracking-widest mb-1">{def.name}</div>
            <div className="text-[10px] text-amber-200/70 leading-relaxed lowercase">{def.description}</div>
          </div>
        )}
      </div>
    );
  };

  // ─── START SCREEN ──────────────────────────────────────────────

  if (!isStarted) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#050505] flex flex-col items-center justify-center p-4 font-mono">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_100%,100%_2px,3px_100%] opacity-40" />
        <div className="relative flex flex-col items-center gap-8 max-w-md w-full text-center">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-[0.2em] animate-pulse">NET_RUN</h1>
            <p className="text-cyan-500 text-xs md:text-sm tracking-[0.4em] opacity-70">ENCRYPTION_BYPASS_INTERFACE</p>
          </div>

          {/* Daily ICE Preview */}
          {dailyICEPreview.length > 0 ? (
            <div className="w-full space-y-3">
              <div className="w-full h-px bg-amber-900/50" />
              <div className="flex items-center justify-center gap-2 text-[10px] text-amber-500 tracking-[0.3em] font-bold">
                <Shield size={14} />
                <span>TODAY'S ICE COUNTERMEASURES</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {dailyICEPreview.map(iceId => {
                  const def = ICE_MODIFIERS.find(m => m.id === iceId);
                  if (!def) return null;
                  return (
                    <div key={iceId} className="flex flex-col items-center gap-2 p-4 border border-amber-500/30 bg-amber-950/20 max-w-[250px]">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-amber-500" />
                        <span className="text-xs font-black text-amber-400 tracking-widest">{def.name}</span>
                      </div>
                      <span className="text-[10px] text-amber-200/70 lowercase leading-relaxed">{def.description}</span>
                    </div>
                  );
                })}
              </div>
              <div className="w-full h-px bg-amber-900/50" />
            </div>
          ) : (
            <div className="w-full space-y-2">
              <div className="w-full h-px bg-cyan-900/50" />
              <div className="text-[10px] text-cyan-700 tracking-[0.3em]">NO ICE DETECTED — SECURITY MINIMAL</div>
              <div className="w-full h-px bg-cyan-900/50" />
            </div>
          )}

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

  // ─── PRACTICE SETUP MODAL ─────────────────────────────────────

  const PracticeSetupModal = () => (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPracticeSetup(false)} />
      <div className="relative bg-black border-2 border-cyan-500 p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.3)] custom-scrollbar">
        <button onClick={() => setShowPracticeSetup(false)} className="sticky top-0 float-right -mt-2 -mr-2 text-cyan-500 hover:text-white cursor-pointer z-10 bg-black/50 backdrop-blur-sm p-1"><X size={24} /></button>
        
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-amber-500" />
          <div className="text-2xl font-black tracking-widest text-white">ICE_LOADOUT</div>
        </div>
        <div className="text-[10px] text-cyan-500/60 mb-6 border-b border-cyan-900 pb-4 tracking-wider">SELECT COUNTERMEASURES FOR PRACTICE RUN. TAP TO TOGGLE.</div>

        <div className="space-y-3">
          {ICE_MODIFIERS.map(ice => {
            const isSelected = practiceICESelection.includes(ice.id);
            return (
              <button
                key={ice.id}
                onClick={() => togglePracticeICE(ice.id)}
                className={`w-full text-left p-4 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'border-cyan-900/30 bg-cyan-950/10 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className={isSelected ? 'text-amber-500' : 'text-cyan-700'} />
                    <span className={`text-sm font-black tracking-widest ${isSelected ? 'text-amber-400' : 'text-cyan-500'}`}>{ice.name}</span>
                  </div>
                  <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-amber-500 bg-amber-500' : 'border-cyan-700'
                  }`}>
                    {isSelected && <span className="text-black text-xs font-black">✓</span>}
                  </div>
                </div>
                <div className="text-[10px] text-cyan-100/50 leading-relaxed lowercase pl-6">{ice.description}</div>
                <div className={`mt-2 text-[8px] font-bold tracking-[0.2em] pl-6 ${isSelected ? 'text-amber-500/70' : 'text-cyan-700/50'}`}>{ice.shortDesc}</div>
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => { initGame(undefined, true); setShowPracticeSetup(false); }}
          className="mt-6 w-full bg-cyan-500 text-black py-4 font-black tracking-[0.2em] hover:bg-white transition-colors cursor-pointer text-lg flex items-center justify-center gap-3"
        >
          <Play size={20} fill="currentColor" />
          {practiceICESelection.length > 0 ? `START_HACK // ${practiceICESelection.length} ICE` : 'START_HACK // NO ICE'}
        </button>
      </div>
    </div>
  );

  // ─── MAIN HUD ─────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 pb-2 md:pb-8 font-mono text-cyan-500 uppercase overflow-hidden" onClick={() => setExpandedICE(null)}>
      {/* Top Section: Header & Detection */}
      <div className="flex flex-col">
        {/* Header (Hidden on Mobile) */}
        <div className="hidden md:flex justify-between items-start border-b border-cyan-900/50 pb-2 md:pb-4 bg-black/20 backdrop-blur-sm">
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
            {activeICE.includes('ENTROPY_DECAY') && timerDrain > 1 && (
              <div className="text-[8px] text-amber-500 font-bold animate-pulse">DRAIN ×{timerDrain}</div>
            )}
          </div>
        </div>

        {/* Active ICE Badges */}
        {activeICE.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            {activeICE.map(iceId => (
              <ICEBadge key={iceId} iceId={iceId} compact />
            ))}
          </div>
        )}

        {/* Detection Meter */}
        <div className="w-full flex flex-col items-center gap-1 mt-2 md:mt-4 px-6 md:px-0">
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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHelp(false)} />
          <div className="relative bg-black border-2 border-cyan-500 p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.3)] custom-scrollbar">
            <button onClick={() => setShowHelp(false)} className="sticky top-0 float-right -mt-2 -mr-2 text-cyan-500 hover:text-white cursor-pointer z-10 bg-black/50 backdrop-blur-sm p-1"><X size={24} /></button>
            <div className="text-2xl font-black mb-6 border-b border-cyan-900 pb-2 tracking-widest">HOW_TO_BYPASS</div>
            <div className="space-y-4 text-sm md:text-base lowercase font-light tracking-tight text-cyan-100/80">
              <p><span className="text-white font-bold uppercase tracking-wider underline">The Goal:</span> Guess the 5-letter encryption key in 6 attempts.</p>
              <div className="space-y-2 py-4 border-y border-cyan-900/50">
                <div className="flex items-center gap-3"><div className={`w-6 h-6 ${colors.correct.tw} border ${colors.correct.borderTw}`} /><span>Correct letter in the correct node.</span></div>
                <div className="flex items-center gap-3"><div className={`w-6 h-6 ${colors.misplaced.tw} border ${colors.misplaced.borderTw}`} /><span>Correct letter in the wrong node.</span></div>
                <div className="flex items-center gap-3"><div className={`w-6 h-6 ${colors.wrong.tw} border ${colors.wrong.borderTw}`} /><span>Letter does not exist in sequence.</span></div>
              </div>
              <div className="p-3 bg-red-900/20 border border-red-500/30">
                <p className="text-red-400 font-bold uppercase text-xs mb-1">Warning: Detection Meter</p>
                <p className="text-xs">Each wrong letter increases detection by 5%. Reaching 100% terminates connection immediately.</p>
              </div>

              {/* ICE Modifier Explanations */}
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-500" />
                  <p className="text-amber-400 font-bold uppercase text-xs">ICE COUNTERMEASURES</p>
                </div>
                <p className="text-xs text-amber-200/60">ICE (Intrusion Countermeasure Electronics) are security modifiers that change the rules of each hack. Daily sequences have forced ICE. Practice mode lets you choose.</p>
                <div className="space-y-2">
                  {ICE_MODIFIERS.map(ice => (
                    <div key={ice.id} className="flex items-start gap-2 pl-2 border-l-2 border-amber-500/30">
                      <div>
                        <div className="text-[10px] font-black text-amber-400 tracking-wider">{ice.name}</div>
                        <div className="text-[9px] text-amber-200/50 leading-relaxed">{ice.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
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
          <div className="relative bg-black border-2 border-cyan-500 p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.3)] custom-scrollbar">
            <button onClick={() => setShowOptions(false)} className="sticky top-0 float-right -mt-2 -mr-2 text-cyan-500 hover:text-white cursor-pointer z-10 bg-black/50 backdrop-blur-sm p-1"><X size={24} /></button>
            <div className="text-2xl font-black mb-6 border-b border-cyan-900 pb-2 tracking-widest">SYSTEM_OPTIONS</div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30 gap-3">
                <div className="flex items-center gap-3 text-white font-bold">{musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}<span>BACKGROUND_AUDIO</span></div>
                <button onClick={toggleMusic} className={`pointer-events-auto w-12 h-6 rounded-full transition-colors relative ${musicEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}><div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${musicEnabled ? 'translate-x-6' : ''}`} /></button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30 gap-3">
                <div className="flex items-center gap-3 text-white font-bold"><Keyboard size={20} /><span>TYPING_SENSORS</span></div>
                <button onClick={toggleTypingSounds} className={`pointer-events-auto w-12 h-6 rounded-full transition-colors relative ${typingSoundsEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}><div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${typingSoundsEnabled ? 'translate-x-6' : ''}`} /></button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30 gap-3">
                <div className="flex items-center gap-3 text-white font-bold"><Keyboard size={20} /><span>VIRTUAL_KEYBOARD</span></div>
                <button onClick={toggleVirtualKeyboard} className={`pointer-events-auto w-12 h-6 rounded-full transition-colors relative ${virtualKeyboardEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}><div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${virtualKeyboardEnabled ? 'translate-x-6' : ''}`} /></button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30 gap-3">
                <div className="flex items-center gap-3 text-white font-bold"><Eye size={20} /><span>COLOR_BLIND_MODE</span></div>
                <select 
                  value={colorBlindMode} 
                  onChange={(e) => setColorBlindMode(e.target.value as any)}
                  className="pointer-events-auto bg-black text-cyan-500 border border-cyan-500/50 px-2 py-1 text-xs font-bold focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[120px]"
                >
                  <option value="normal">NORMAL</option>
                  <option value="protanopia">PROTANOPIA</option>
                  <option value="deuteranopia">DEUTERANOPIA</option>
                  <option value="tritanopia">TRITANOPIA</option>
                </select>
              </div>
              
              {/* Color Scheme Legend */}
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-white/50 tracking-widest font-bold">SCHEME_LEGEND [{colorBlindMode.toUpperCase()}]</div>
                  <div className="text-[8px] text-cyan-500/50 italic">
                    {colorBlindMode === 'normal' && 'STANDARD_HIGH_CONTRAST'}
                    {colorBlindMode === 'protanopia' && 'OPTIMIZED_FOR_RED_BLINDNESS'}
                    {colorBlindMode === 'deuteranopia' && 'OPTIMIZED_FOR_GREEN_BLINDNESS'}
                    {colorBlindMode === 'tritanopia' && 'OPTIMIZED_FOR_BLUE_BLINDNESS'}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${colors.correct.tw} border ${colors.correct.borderTw}`} />
                    <span className="text-[10px] text-white font-bold">CORRECT_NODE // CORRECT POSITION</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${colors.misplaced.tw} border ${colors.misplaced.borderTw}`} />
                    <span className="text-[10px] text-white font-bold">MISPLACED_NODE // WRONG POSITION</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${colors.wrong.tw} border ${colors.wrong.borderTw}`} />
                    <span className="text-[10px] text-white font-bold">WRONG_NODE // NOT IN SEQUENCE</span>
                  </div>
                </div>
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
                  <div key={entry.date} className="flex flex-col p-3 bg-cyan-950/10 border border-cyan-900/30 hover:border-cyan-500/50 transition-colors gap-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xs text-white font-bold">{entry.date}</div>
                        <div className="text-[10px] opacity-60">TARGET: {entry.word}</div>
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
                        <div className={`px-3 py-1 text-[10px] font-black ${entry.status === 'success' ? `${colors.correct.tw} text-black` : 'bg-red-500 text-black'}`}>{entry.status === 'success' ? 'BYPASSED' : 'TERMINATED'}</div>
                      </div>
                    </div>
                    {entry.activeICE && entry.activeICE.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 border-t border-cyan-900/20">
                        <ShieldAlert size={10} className="text-amber-500/60" />
                        <span className="text-[8px] text-amber-400/60 font-bold tracking-wider">{entry.activeICE.join(' | ')}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowHistory(false)} className="mt-6 w-full bg-cyan-500 text-black py-3 font-bold hover:bg-white transition-colors cursor-pointer">CLOSE_LOGS</button>
          </div>
        </div>
      )}

      {/* Practice Setup Modal */}
      {showPracticeSetup && <PracticeSetupModal />}

      {/* Game Over Modal */}
      {isGameOver && !hideGameOverModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setHideGameOverModal(true)} />
           <div className="relative flex flex-col items-center gap-4 bg-black/90 p-6 md:p-8 border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto">
             <button onClick={() => setHideGameOverModal(true)} className="absolute top-2 right-2 text-cyan-500/50 hover:text-white cursor-pointer"><X size={20} /></button>
             <div className="text-white text-xs md:text-sm font-bold tracking-[0.2em] mb-2">HACK_SEQUENCE_TERMINATED</div>
             <div className="flex flex-col sm:flex-row gap-3 w-full">
               <button className="pointer-events-auto bg-white text-black px-6 py-3 font-black hover:bg-cyan-400 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] flex-1 text-center" onClick={handleShare}>DOWNLOAD_LOG</button>
               <button className="pointer-events-auto bg-cyan-500 text-black px-6 py-3 font-black hover:bg-white transition-colors cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.4)] flex-1 text-center" onClick={() => { setHideGameOverModal(true); setShowPracticeSetup(true); }}>NEW_INSTANCE</button>
             </div>
           </div>
        </div>
      )}

      <div className="flex flex-col-reverse md:flex-col items-center gap-4 md:gap-6">
        {virtualKeyboardEnabled && <VirtualKeyboard />}
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

      {/* Share Image (offscreen) */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={shareRef} 
          className="bg-[#050505] border-4 border-cyan-500/30" 
          style={{ 
            width: '500px', 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="text-3xl font-black text-white tracking-[0.3em] border-b-2 border-cyan-500 text-center flex flex-col"
            style={{ width: '100%', paddingBottom: '8px', marginBottom: '24px', gap: '8px' }}
          >
            <div>NET_RUN // LOG</div>
            {isDaily && <div className="text-lg tracking-[0.4em] text-cyan-500 font-bold bg-cyan-950/30 py-1">{new Date().toISOString().split('T')[0]}</div>}
          </div>
          {/* Active ICE in share image */}
          {activeICE.length > 0 && (
            <div style={{ width: '100%', marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {activeICE.map(iceId => {
                const def = ICE_MODIFIERS.find(m => m.id === iceId);
                return (
                  <div key={iceId} className="text-[10px] font-black text-amber-400 tracking-wider border border-amber-500/40 px-3 py-1 bg-amber-950/30">
                    {def?.name || iceId}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {guesses.map((row, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  marginBottom: i < guesses.length - 1 ? '12px' : '0' 
                }}
              >
                {row.map((node, j) => {
                  const isSubmitted = i < currentRow || (isGameOver && node.status !== 'none');
                  const isPhantomCol = activeICE.includes('PHANTOM_NODE') && j === phantomColumn && isSubmitted;
                  let colorStyle = { backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.05)', boxShadow: 'none' };
                  if (isPhantomCol) {
                    colorStyle = { backgroundColor: '#a855f7', borderColor: '#a855f7', boxShadow: '0 0 15px rgba(168,85,247,0.5)' };
                  } else if (isSubmitted) {
                    if (node.status === 'correct') colorStyle = { backgroundColor: colors.correct.hex, borderColor: colors.correct.hex, boxShadow: `0 0 15px ${colors.correct.shadowTw}` };
                    else if (node.status === 'misplaced') colorStyle = { backgroundColor: colors.misplaced.hex, borderColor: colors.misplaced.hex, boxShadow: `0 0 15px ${colors.misplaced.shadowTw}` };
                    else if (node.status === 'wrong') colorStyle = { backgroundColor: colors.wrong.hex, borderColor: colors.wrong.hex, boxShadow: 'none' };
                  }
                  return (
                    <div 
                      key={j} 
                      className="border-2" 
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        minWidth: '48px',
                        maxWidth: '48px',
                        minHeight: '48px',
                        maxHeight: '48px',
                        marginRight: j < row.length - 1 ? '12px' : '0',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        ...colorStyle
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div 
            className="text-cyan-500 font-mono text-sm tracking-widest opacity-70 flex justify-between items-center"
            style={{ width: '100%', marginTop: '32px' }}
          >
            <div className="flex flex-col"><span>DETECTION: {detectionLevel}%</span><span>MODE: {isDaily ? 'DAILY' : 'PRACTICE'}</span></div>
            <div className="text-2xl font-black text-white border-l-2 border-cyan-500 pl-4">{formatTime(timer)}</div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_100%,100%_2px,3px_100%] opacity-20" />
    </div>
  );
}
