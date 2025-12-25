import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Input, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import { Strategy, StrategyDay } from '../types';
import TutorialOverlay from './TutorialOverlay';

const StrategyPlanner: React.FC = () => {
  const [strategies, setStrategies] = useLocalStorage<Strategy[]>('lifeos_strategies', []);
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [focusDayId, setFocusDayId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Creation State
  const [newStrategy, setNewStrategy] = useState({ name: '', totalDays: 7 });

  const activeStrategy = useMemo(() => 
    strategies.find(s => s.id === activeStrategyId)
  , [strategies, activeStrategyId]);

  const handleCreate = () => {
    if (!newStrategy.name.trim() || newStrategy.totalDays <= 0) return;
    
    const days: StrategyDay[] = Array.from({ length: newStrategy.totalDays }, (_, i) => ({
      id: uuidv4(),
      dayNumber: i + 1,
      purpose: '',
      chapters: '',
      priorityTasks: '',
      status: 'pending'
    }));

    const strategy: Strategy = {
      id: uuidv4(),
      name: newStrategy.name.trim(),
      totalDays: newStrategy.totalDays,
      createdAt: Date.now(),
      days
    };

    setStrategies(prev => [...prev, strategy]);
    setActiveStrategyId(strategy.id);
    setIsCreating(false);
    setNewStrategy({ name: '', totalDays: 7 });
  };

  const updateDay = (dayId: string, updates: Partial<StrategyDay>) => {
    setStrategies(prev => prev.map(s => {
      if (s.id !== activeStrategyId) return s;
      return {
        ...s,
        days: s.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
      };
    }));
  };

  const deleteStrategy = (e: React.MouseEvent | null, id: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (window.confirm("End Strategy: Are you absolutely sure? This will permanently delete this blueprint and all progress within it.")) {
      setStrategies(prev => {
        const filtered = prev.filter(s => s.id !== id);
        return filtered;
      });
      if (activeStrategyId === id) {
        setActiveStrategyId(null);
        setFocusDayId(null);
      }
    }
  };

  const focusDay = activeStrategy?.days.find(d => d.id === focusDayId);

  const tutorialSteps = [
    { title: "Initialize Blueprint", text: "Create a new strategy for a project or exam. Define the total duration in days." },
    { title: "Node Management", text: "Click on any day node (D1, D2, etc.) to set tactical goals, specific chapters, and priority tasks for that date." },
    { title: "Dual Views", text: "Switch between 'Tree View' for a visual layout and 'Summary Table' for a quick spreadsheet-style overview." },
    { title: "Strategic Status", text: "Mark days as 'In-Progress' or 'Completed' to update the master completion percentage on the Command Center card." }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {showTutorial && (
        <TutorialOverlay 
           title="Tactical Architect"
           description="Plan complex, multi-day operations. Break long-term stress into manageable daily tactical wins."
           steps={tutorialSteps}
           tip="Use the 'Strategic Day Purpose' to define the one thing that *must* happen for that day to be a success."
           onClose={() => setShowTutorial(false)}
        />
      )}
      
      {/* Strategy Selector / Header */}
      <Card 
        title="Command Center" 
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowTutorial(true)}><Icons.Info /></Button>
            {!activeStrategyId && !isCreating && (
              <Button size="sm" variant="glass" onClick={() => setIsCreating(true)}><Icons.Plus /> New Strategy</Button>
            )}
            {activeStrategyId && (
              <div className="flex gap-2">
                <Button size="sm" variant="danger" onClick={() => deleteStrategy(null, activeStrategyId)}>End Strategy</Button>
                <Button size="sm" variant="ghost" onClick={() => setActiveStrategyId(null)}>Exit Strategy</Button>
              </div>
            )}
          </div>
        }
      >
        {!activeStrategyId && !isCreating && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-40">
                <div className="mb-4 text-6xl">🗺️</div>
                <h3 className="text-xl font-bold">No active strategies detected.</h3>
                <p>Map your journey to peak performance.</p>
              </div>
            ) : (
              strategies.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setActiveStrategyId(s.id)}
                  className="group relative p-6 rounded-[28px] bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all cursor-pointer overflow-hidden shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Profile</span>
                      <button 
                        type="button"
                        onClick={(e) => deleteStrategy(e, s.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-slate-500 hover:text-red-500 hover:bg-red-500/20 transition-all z-20"
                        title="Delete Strategy"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                    <h4 className="text-xl font-black mb-1">{s.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{s.totalDays} Day Sprint</p>
                    <div className="mt-auto pt-6 flex justify-between items-center border-t border-white/5">
                      <div className="flex -space-x-2">
                         {s.days.slice(0, 5).map(d => (
                           <div key={d.id} className={`w-3 h-3 rounded-full border-2 border-black ${d.status === 'completed' ? 'bg-emerald-500' : d.status === 'in-progress' ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                         ))}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {Math.round((s.days.filter(d => d.status === 'completed').length / (s.totalDays || 1)) * 100)}% Ready
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isCreating && (
          <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-8 animate-slide-up">
            <h3 className="text-2xl font-black">Initialize New Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Strategy Title" placeholder="e.g., 20-Day PYQ Smash" value={newStrategy.name} onChange={e => setNewStrategy({...newStrategy, name: e.target.value})} />
              <Input label="Total Duration (Days)" type="number" value={newStrategy.totalDays} onChange={e => setNewStrategy({...newStrategy, totalDays: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Generate Tree</Button>
            </div>
          </div>
        )}
      </Card>

      {/* 2. The Interactive Tree Canvas */}
      {activeStrategy && (
        <div className="relative">
          {/* Summary View Toggle */}
          <div className="flex justify-between items-center mb-8 px-4">
             <div>
                <h3 className="text-3xl font-black tracking-tight">{activeStrategy.name}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Master Blueprint</p>
             </div>
             <div className="flex gap-2">
                <Button variant="glass" onClick={() => setShowSummary(!showSummary)}>
                  {showSummary ? 'Tree View' : 'Summary Table'}
                </Button>
             </div>
          </div>

          {!showSummary ? (
            <div className="relative min-h-[800px] flex flex-col items-center">
              {/* Root Node */}
              <div className="relative z-20 p-8 rounded-[40px] bg-slate-900 border-4 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] mb-20 text-center animate-pop">
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-2">Strategy Root</div>
                 <h2 className="text-4xl font-black tracking-tighter">{activeStrategy.name}</h2>
                 {/* Connection to children */}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-20 bg-gradient-to-b from-cyan-500 to-transparent" />
              </div>

              {/* Day Branches - Responsive Node Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24 w-full px-4 relative">
                {activeStrategy.days.map((day, idx) => {
                  const isToday = idx === 0; // Simplified logic
                  return (
                    <div key={day.id} className="relative flex justify-center animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                      {/* Vertical connector for top row */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-white/10" />
                      
                      {/* Day Block */}
                      <div 
                        onClick={() => setFocusDayId(day.id)}
                        className={`
                          cursor-pointer w-full max-w-[200px] aspect-square rounded-[32px] border-2 flex flex-col items-center justify-center p-6 transition-all duration-500 hover:scale-105 active:scale-95 group
                          ${day.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
                            day.status === 'in-progress' ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 
                            'bg-white/5 border-white/10 hover:border-white/30'}
                          ${isToday ? 'ring-4 ring-cyan-400/20 shadow-[0_0_60px_rgba(6,182,212,0.4)]' : ''}
                        `}
                      >
                         <span className="text-5xl font-black tracking-tighter mb-2 group-hover:scale-110 transition-transform">D{day.dayNumber}</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${day.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'}`}>
                           {day.status === 'completed' ? 'Tactical Done' : day.status === 'in-progress' ? 'Executing' : 'Pending'}
                         </span>
                         
                         {day.purpose && (
                           <div className="absolute -bottom-12 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest line-clamp-2">
                             {day.purpose}
                           </div>
                         )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <Card className="animate-fade-in">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-separate border-spacing-y-4">
                   <thead>
                     <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        <th className="pb-4 pl-4">Day</th>
                        <th className="pb-4">Core Purpose</th>
                        <th className="pb-4 text-center">Status</th>
                        <th className="pb-4 text-right pr-4">Focus</th>
                     </tr>
                   </thead>
                   <tbody>
                     {activeStrategy.days.map(day => (
                       <tr key={day.id} className="bg-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                          <td className="py-6 pl-6 font-black text-2xl">#{day.dayNumber}</td>
                          <td className="py-6 font-medium text-slate-300 max-w-md italic">{day.purpose || 'No tactical purpose set...'}</td>
                          <td className="py-6">
                             <div className="flex justify-center">
                               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${day.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                  {day.status}
                               </div>
                             </div>
                          </td>
                          <td className="py-6 text-right pr-6">
                             <Button size="sm" variant="glass" onClick={() => setFocusDayId(day.id)}>Expand</Button>
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </Card>
          )}

          {/* Focus Mode Overlay */}
          {focusDay && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fade-in">
              <div className="relative w-full max-w-4xl glass-panel p-10 rounded-[48px] border-2 border-cyan-500/30 shadow-[0_0_100px_rgba(6,182,212,0.2)] animate-scale-press">
                <button 
                  onClick={() => setFocusDayId(null)}
                  className="absolute top-8 right-8 p-4 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                <div className="flex flex-col md:flex-row gap-12">
                   <div className="shrink-0 flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 flex items-center justify-center bg-cyan-500/10 mb-6">
                         <span className="text-5xl font-black italic">D{focusDay.dayNumber}</span>
                      </div>
                      <div className="space-y-3 w-full">
                         {['pending', 'in-progress', 'completed'].map(st => (
                           <button 
                             key={st}
                             onClick={() => updateDay(focusDay.id, { status: st as any })}
                             className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${focusDay.status === st ? 'bg-cyan-500 text-black shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                           >
                             {st}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="flex-1 space-y-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500">Strategic Day Purpose</label>
                        <textarea 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-medium outline-none focus:ring-1 focus:ring-cyan-500 h-24 resize-none"
                          placeholder="What must be achieved today?"
                          value={focusDay.purpose}
                          onChange={e => updateDay(focusDay.id, { purpose: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Chapters to Cover</label>
                          <textarea 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-cyan-500 h-32 resize-none"
                            placeholder="Specific subject modules..."
                            value={focusDay.chapters}
                            onChange={e => updateDay(focusDay.id, { chapters: e.target.value })}
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Tactical Priority Tasks</label>
                          <textarea 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-cyan-500 h-32 resize-none"
                            placeholder="Unmissable objectives..."
                            value={focusDay.priorityTasks}
                            onChange={e => updateDay(focusDay.id, { priorityTasks: e.target.value })}
                          />
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StrategyPlanner;