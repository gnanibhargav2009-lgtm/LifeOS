import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, Button, Input, Icons } from './UI';
import TutorialOverlay from './TutorialOverlay';

// --- Clocks (Ethereal, Zen, Neumorphic, Solar, Word) omitted for brevity but they remain in full version ---
// [NOTE: The user's provided file content had them all, I will keep them in the final output content]

const EtherealAnalog = ({ h, m, s }: { h: number, m: number, s: number }) => {
  return (
    <div className="relative w-80 h-80 rounded-full border border-white/10 glass flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.05)] backdrop-blur-xl">
      <div className="absolute inset-4 rounded-full border border-white/5 opacity-50" />
      {[...Array(12)].map((_, i) => {
        const rotation = i * 30;
        return (
            <div key={i} className="absolute w-full h-full text-center" style={{ transform: `rotate(${rotation}deg)` }}>
                <div className={`mx-auto mt-4 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)] ${i % 3 === 0 ? 'w-1.5 h-4 bg-white/80' : 'w-1 h-1.5'}`} />
            </div>
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute bottom-1/2 left-1/2 w-1.5 h-20 bg-gradient-to-t from-white to-white/20 rounded-full origin-bottom shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10" 
            style={{ transform: `translateX(-50%) rotate(${h * 30 + m * 0.5}deg)` }} />
          <div className="absolute bottom-1/2 left-1/2 w-1 h-28 bg-gradient-to-t from-white to-white/20 rounded-full origin-bottom shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20" 
            style={{ transform: `translateX(-50%) rotate(${m * 6}deg)` }} />
          <div className="absolute bottom-1/2 left-1/2 w-[1px] h-32 bg-amber-400 rounded-full origin-bottom shadow-[0_0_15px_rgba(251,191,36,0.8)] z-30" 
            style={{ transform: `translateX(-50%) rotate(${s * 6}deg)` }} >
             <div className="absolute top-full left-1/2 w-[1px] h-6 bg-amber-400/50 -translate-x-1/2" />
          </div>
          <div className="absolute w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,1)] z-40 ring-4 ring-white/10" />
      </div>
    </div>
  );
};

const ZenDigital = ({ h, m }: { h: number, m: number }) => {
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden py-12">
       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent skew-y-12 opacity-20 pointer-events-none" />
       <div className="text-[9rem] md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-none tracking-tighter flex items-center relative z-10 drop-shadow-2xl">
         <span>{h.toString().padStart(2, '0')}</span>
         <span className="animate-pulse mx-2 text-white/20 relative -top-4">:</span>
         <span>{m.toString().padStart(2, '0')}</span>
       </div>
       <div className="text-sm font-bold tracking-[1em] text-white/30 uppercase mt-4">Preserve Calm</div>
    </div>
  );
};

const NeumorphicSoft = ({ h, m, s }: { h: number, m: number, s: number }) => {
  return (
    <div className="w-80 h-80 rounded-full bg-[#e0e5ec] dark:bg-[#252b36] flex items-center justify-center shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.05)] relative border border-white/5">
       <div className="absolute inset-4 rounded-full shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(255,255,255,0.05)]" />
       {[...Array(12)].map((_, i) => (
         <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
            <div className={`mx-auto mt-6 w-1 rounded-full bg-slate-400/30 dark:bg-slate-500/30 ${i % 3 === 0 ? 'h-3' : 'h-1.5'}`} />
         </div>
       ))}
       <div className="absolute inset-0 flex items-center justify-center">
         <div className="absolute bottom-1/2 left-1/2 w-2 h-20 bg-slate-500 dark:bg-slate-300 rounded-full origin-bottom -translate-x-1/2 shadow-lg" 
              style={{ transform: `translateX(-50%) rotate(${h * 30 + m * 0.5}deg)` }} />
         <div className="absolute bottom-1/2 left-1/2 w-1.5 h-28 bg-slate-400 dark:bg-slate-400 rounded-full origin-bottom -translate-x-1/2 shadow-lg" 
              style={{ transform: `translateX(-50%) rotate(${m * 6}deg)` }} />
         <div className="absolute bottom-1/2 left-1/2 w-1 h-32 bg-rose-500 rounded-full origin-bottom -translate-x-1/2 shadow-sm opacity-90" 
              style={{ transform: `translateX(-50%) rotate(${s * 6}deg)` }} />
         <div className="absolute w-5 h-5 bg-[#e0e5ec] dark:bg-[#252b36] rounded-full shadow-[5px_5px_10px_rgba(0,0,0,0.2),-5px_-5px_10px_rgba(255,255,255,0.05)] z-10 border border-white/5" />
       </div>
    </div>
  );
};

const SolarArc = ({ h, m, s }: { h: number, m: number, s: number }) => {
  const totalSeconds = h * 3600 + m * 60 + s;
  const percentage = totalSeconds / 86400; 
  const radius = 140;
  const circumference = Math.PI * radius; 
  const strokeDashoffset = circumference * (1 - percentage);
  return (
    <div className="relative w-[340px] h-[190px] overflow-hidden flex items-end justify-center pb-4">
       <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 340 190">
          <defs>
             <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="1" /></linearGradient>
             <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path d="M 30 170 A 140 140 0 0 1 310 170" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
          <path d="M 30 170 A 140 140 0 0 1 310 170" fill="none" stroke="url(#solarGradient)" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" filter="url(#glow)" />
       </svg>
       <div className="text-center z-10 mb-6">
          <div className="text-6xl font-bold text-white tracking-widest drop-shadow-2xl">{h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}</div>
          <div className="text-xs text-amber-400/60 uppercase tracking-[0.4em] mt-2 font-medium">Solar Cycle</div>
       </div>
    </div>
  );
};

const WordClock = ({ h, m }: { h: number, m: number }) => {
  const matrix = [["IT", "IS", "HALF", "TEN"], ["QUARTER", "TWENTY"], ["FIVE", "MINUTES", "TO"], ["PAST", "ONE", "TWO"], ["THREE", "FOUR", "FIVE"], ["SIX", "SEVEN", "EIGHT"], ["NINE", "TEN", "ELEVEN"], ["TWELVE", "O'CLOCK"]];
  const checkActive = (word: string, i: number) => {
    const mRound = Math.round(m / 5) * 5;
    let hDisp = h % 12 || 12;
    if (mRound > 30) hDisp = (h % 12) + 1 || 12;
    const hourMap: Record<number, string> = { 1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX", 7: "SEVEN", 8: "EIGHT", 9: "NINE", 10: "TEN", 11: "ELEVEN", 12: "TWELVE" };
    if (["IT", "IS"].includes(word)) return true;
    if (mRound === 0 && word === "O'CLOCK") return true;
    if (mRound === 5 || mRound === 55) { if (word === "FIVE" && (i === 6)) return true; } 
    if (mRound === 10 || mRound === 50) { if (word === "TEN" && (i === 3)) return true; }
    if (mRound === 15 || mRound === 45) { if (word === "QUARTER") return true; }
    if (mRound === 20 || mRound === 40) { if (word === "TWENTY") return true; }
    if (mRound === 30 && word === "HALF") return true;
    if (mRound > 0 && mRound <= 30 && word === "PAST") return true;
    if (mRound > 30 && word === "TO") return true;
    if (word === hourMap[hDisp]) {
        if (word === "FIVE" && i === 14) return true;
        if (word === "TEN" && i === 19) return true;
        if (word !== "FIVE" && word !== "TEN") return true;
    }
    return false;
  };
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-3xl border border-white/5 shadow-inner">
       <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-md text-center leading-relaxed">
         {matrix.flat().map((word, i) => {
           const active = checkActive(word, i);
           return <span key={i} className={`text-2xl font-bold transition-all duration-500 ${active ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] opacity-100' : 'text-slate-600 dark:text-slate-700 opacity-20 blur-[0.5px]'}`}>{word}</span>;
         })}
       </div>
    </div>
  );
};

const playZenChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); 
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.4, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.0001, now + 4); 
    gain2.gain.setValueAtTime(0, now); gain2.gain.linearRampToValueAtTime(0.1, now + 0.05); gain2.gain.exponentialRampToValueAtTime(0.0001, now + 3);
    osc.start(now); osc.stop(now + 4); osc2.start(now); osc2.stop(now + 4);
  } catch (e) { console.error(e); }
};

const FocusHub: React.FC = () => {
  const [clockIdx, setClockIdx] = useState(0);
  const [time, setTime] = useState(new Date());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Pomodoro State
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [workDur, setWorkDur] = useState(25);
  const [breakDur, setBreakDur] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  
  useEffect(() => {
    let frameId: number;
    const update = () => { setTime(new Date()); frameId = requestAnimationFrame(update); };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    let interval: number;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { playZenChime(); setIsRunning(false); return 0; } return t - 1; });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const tutorialSteps = [
    { title: "Clock Aesthetics", text: "Choose from 5 different clock styles (Ethereal, Zen, Neumorphic, Solar, Word) to match your current vibe." },
    { title: "Full Screen Focus", text: "Click the expand icon to enter immersive mode. This removes distractions and turns your device into a dedicated clock." },
    { title: "Pomodoro Protocol", text: "Use the Work/Break timer to segment study sessions. A 'Zen Chime' will signal when it's time to transition." },
    { title: "Time Customization", text: "Adjust work and break durations in the Timer Settings to suit your own cognitive endurance." }
  ];

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => { setIsRunning(false); setTimeLeft((mode === 'work' ? workDur : breakDur) * 60); };
  const switchMode = (m: 'work' | 'break') => { setMode(m); setIsRunning(false); setTimeLeft((m === 'work' ? workDur : breakDur) * 60); };
  const triggerFullScreen = () => {
    setIsFullScreen(true);
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
    else if ((elem as any).webkitRequestFullscreen) (elem as any).webkitRequestFullscreen();
  };
  const exitFullScreenMode = () => {
    setIsFullScreen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
  };

  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };
  const progress = timeLeft / ((mode === 'work' ? workDur : breakDur) * 60);

  const FullScreenOverlay = (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-1000 ${clockIdx === 2 ? 'bg-[#e0e5ec] dark:bg-[#252b36]' : 'bg-[#020617]'}`}>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${clockIdx === 2 ? 'opacity-0' : 'bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] opacity-100'}`} />
        </div>
        <button onClick={exitFullScreenMode} className={`absolute top-8 right-8 p-4 rounded-full backdrop-blur-md transition-all z-50 group border border-white/10 ${clockIdx === 2 ? 'bg-black/10 text-slate-800 dark:text-white' : 'bg-white/5 text-white/70'}`}><Icons.X /></button>
        <div className="transform scale-[1] md:scale-[1.5] lg:scale-[2] transition-all duration-700 z-10">
            {clockIdx === 0 && <EtherealAnalog h={time.getHours()} m={time.getMinutes()} s={time.getSeconds()} />}
            {clockIdx === 1 && <ZenDigital h={time.getHours()} m={time.getMinutes()} />}
            {clockIdx === 2 && <NeumorphicSoft h={time.getHours()} m={time.getMinutes()} s={time.getSeconds()} />}
            {clockIdx === 3 && <SolarArc h={time.getHours()} m={time.getMinutes()} s={time.getSeconds()} />}
            {clockIdx === 4 && <WordClock h={time.getHours()} m={time.getMinutes()} />}
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {showTutorial && (
        <TutorialOverlay 
           title="Focus Hub Guide"
           description="Transform your environment into a high-intensity study chamber. Control time, control focus."
           steps={tutorialSteps}
           tip="Try the 'Word Clock' for a more human feel, or 'Zen Digital' for absolute minimalism."
           onClose={() => setShowTutorial(false)}
        />
      )}
      {isFullScreen && createPortal(FullScreenOverlay, document.body)}
      <Card className="bg-[#0f172a] text-white overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center border-none shadow-2xl">
         <div className={`absolute inset-0 transition-opacity duration-1000 ${clockIdx === 2 ? 'bg-[#e0e5ec] dark:bg-[#1f2937]' : 'bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]'}`} />
         <button onClick={() => setShowTutorial(true)} className="absolute top-6 left-6 p-3 rounded-full bg-white/10 text-white/50 hover:text-white z-20"><Icons.Info /></button>
         <button onClick={triggerFullScreen} className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white/50 hover:text-white z-20"><Icons.Plus /></button>
         <div className="relative z-10 w-full flex flex-col items-center">
            <div className="h-[340px] w-full flex items-center justify-center transition-all duration-700">
               {clockIdx === 0 && <EtherealAnalog h={time.getHours()} m={time.getMinutes()} s={time.getSeconds()} />}
               {clockIdx === 1 && <ZenDigital h={time.getHours()} m={time.getMinutes()} />}
               {clockIdx === 2 && <NeumorphicSoft h={time.getHours()} m={time.getMinutes()} s={time.getSeconds()} />}
               {clockIdx === 3 && <SolarArc h={time.getHours()} m={time.getMinutes()} s={time.getSeconds()} />}
               {clockIdx === 4 && <WordClock h={time.getHours()} m={time.getMinutes()} />}
            </div>
            <div className={`flex gap-3 mt-10 p-2 backdrop-blur-md rounded-full border transition-colors duration-1000 ${clockIdx === 2 ? 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5' : 'bg-white/5 border-white/5'}`}>
              {[0, 1, 2, 3, 4].map(i => <button key={i} onClick={() => setClockIdx(i)} className={`w-4 h-4 rounded-full transition-all duration-300 ${clockIdx === i ? 'bg-amber-400 w-12 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-white/20 hover:bg-white/40'}`} />)}
            </div>
         </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Focus Timer" className="relative overflow-hidden">
           <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-72 h-72 flex items-center justify-center mb-10">
                 <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-white/5" /><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className={`${mode === 'work' ? 'text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'} transition-all duration-1000`} strokeDasharray="283" strokeDashoffset={283 * (1 - progress)} strokeLinecap="round" /></svg>
                 <div className="flex flex-col items-center"><div className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter z-10">{formatTime(timeLeft)}</div><div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">{isRunning ? 'Running' : 'Paused'}</div></div>
              </div>
              <div className="flex items-center gap-6 mb-8"><Button size="lg" onClick={toggleTimer} className={`w-40 shadow-xl ${mode === 'work' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'} text-white`}>{isRunning ? 'PAUSE' : 'START'}</Button><button onClick={resetTimer} className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"><Icons.Trash /></button></div>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5"><button onClick={() => switchMode('work')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'work' ? 'bg-white dark:bg-white/10 shadow-lg text-slate-900 dark:text-white' : 'text-slate-500'}`}>Work</button><button onClick={() => switchMode('break')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-white dark:bg-white/10 shadow-lg text-slate-900 dark:text-white' : 'text-slate-500'}`}>Break</button></div>
           </div>
        </Card>
        <Card title="Timer Settings" className="flex flex-col justify-center">
           <div className="space-y-8"><p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">Customize your session flow. Adjust durations to match your cognitive rhythm.</p><div className="space-y-6"><div><label className="text-xs font-bold uppercase text-rose-500 mb-2 block tracking-widest">Work Duration (min)</label><Input type="number" value={workDur} onChange={(e) => { setWorkDur(parseInt(e.target.value) || 0); if(mode==='work') setTimeLeft((parseInt(e.target.value)||0)*60); }} className="font-mono text-xl" /></div><div><label className="text-xs font-bold uppercase text-emerald-500 mb-2 block tracking-widest">Break Duration (min)</label><Input type="number" value={breakDur} onChange={(e) => { setBreakDur(parseInt(e.target.value) || 0); if(mode==='break') setTimeLeft((parseInt(e.target.value)||0)*60); }} className="font-mono text-xl" /></div></div></div>
        </Card>
      </div>
    </div>
  );
};

export default FocusHub;