import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Input, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import TutorialOverlay from './TutorialOverlay';

interface WaterLog {
  amount: number;
  timestamp: number;
}

interface Milestone {
  id: string;
  label: string;
  amount: number;
}

interface WaterScheduleSlot {
  id: string;
  time: string;
  amount: number;
  label: string;
  completedDates: string[]; // YYYY-MM-DD
}

const DEFAULT_MILESTONES: Milestone[] = [
  { id: '1', label: 'Physics Fuel', amount: 1000 },
  { id: '2', label: 'Maths Stamina', amount: 3000 },
  { id: '3', label: 'Elite Focus', amount: 4000 }
];

const WaterTracker: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Data Persistence
  const [goal, setGoal] = useLocalStorage<number>('lifeos_water_goal', 4000);
  const [logs, setLogs] = useLocalStorage<WaterLog[]>('lifeos_water_logs', []);
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>('lifeos_water_milestones', DEFAULT_MILESTONES);
  const [schedule, setSchedule] = useLocalStorage<WaterScheduleSlot[]>('lifeos_water_schedule', []);
  
  // UI States
  const [lastSipTime, setLastSipTime] = useState<string>('Just now');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newMS, setNewMS] = useState({ label: '', amount: 1000 });
  const [newSlot, setNewSlot] = useState({ time: '08:00', amount: 250, label: 'Morning Sip' });
  const [showTutorial, setShowTutorial] = useState(false);

  const totalDrank = useMemo(() => logs.reduce((acc, log) => acc + log.amount, 0), [logs]);
  const progress = Math.min((totalDrank / goal) * 100, 100);
  const remaining = Math.max(goal - totalDrank, 0);

  // Timer Update
  useEffect(() => {
    const updateTimer = () => {
      if (logs.length === 0) {
        setLastSipTime('No sips today');
        return;
      }
      const last = logs[logs.length - 1].timestamp;
      const diff = Date.now() - last;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) setLastSipTime('Just now');
      else if (mins < 60) setLastSipTime(`${mins}m ago`);
      else setLastSipTime(`${Math.floor(mins / 60)}h ${mins % 60}m ago`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [logs]);

  const addWater = (amount: number, slotId?: string) => {
    const timestamp = Date.now();
    setLogs(prev => [...prev, { amount, timestamp }]);
    
    if (slotId) {
      setSchedule(prev => prev.map(s => 
        s.id === slotId ? { ...s, completedDates: [...(s.completedDates || []), today] } : s
      ));
    }
  };

  const resetToday = () => {
    if (confirm("Reset today's hydration data?")) {
      setLogs([]);
      setSchedule(prev => prev.map(s => ({ ...s, completedDates: s.completedDates.filter(d => d !== today) })));
    }
  };

  // Milestone Logic
  const handleAddMilestone = () => {
    if (!newMS.label) return;
    setMilestones(prev => [...prev, { ...newMS, id: uuidv4() }]);
    setNewMS({ label: '', amount: 1000 });
    setIsAddingMilestone(false);
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  // Schedule Logic
  const handleAddSlot = () => {
    setSchedule(prev => [...prev, { ...newSlot, id: uuidv4(), completedDates: [] }].sort((a,b) => a.time.localeCompare(b.time)));
    setIsAddingSlot(false);
  };

  const deleteSlot = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const ringRadius = 90;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const tutorialSteps = [
    { title: "Daily Goal", text: "Set your hydration target. For high-focus JEE prep, 3L-4L (3000ml-4000ml) is often recommended." },
    { title: "Hydration Schedule", text: "Add scheduled slots to prompt regular sips. Consistency prevents dehydration-induced headaches." },
    { title: "Command Milestones", text: "Associate hydration levels with your study subjects (e.g., 'Maths Stamina') to gamify the process." },
    { title: "Quick Hydrate", text: "Use the 250ml, 500ml, and 1000ml buttons for rapid entry without typing." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-20">
      {showTutorial && (
        <TutorialOverlay 
           title="Hydration Management"
           description="Fuel your biological computer. Water is critical for neural transmission and long-term memory."
           steps={tutorialSteps}
           tip="Drink water *before* you feel thirsty. Thirst is a late-stage signal of dehydration."
           onClose={() => setShowTutorial(false)}
        />
      )}

      {/* 1. Left: Main Visual Dashboard */}
      <div className="lg:col-span-7 space-y-8">
        <Card className="flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0f1e] text-white border-none shadow-2xl min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/10 pointer-events-none" />
          <button onClick={() => setShowTutorial(true)} className="absolute top-8 left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"><Icons.Info /></button>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-72 h-72 flex items-center justify-center mb-10">
              <div className="absolute inset-0 rounded-full border border-blue-500/5 shadow-[0_0_60px_rgba(59,130,246,0.1)]" />
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={ringRadius} fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                <circle 
                  cx="100" cy="100" r={ringRadius} fill="none" stroke="url(#blue_grad)" strokeWidth="12" 
                  className="transition-all duration-1000 ease-out"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="blue_grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-6xl font-black tracking-tighter">{Math.round(progress)}%</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 mt-1">Status</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 text-center">
              <div><div className="text-4xl font-black">{(totalDrank/1000).toFixed(2)}L</div><div className="text-[10px] uppercase tracking-widest text-slate-400">Total</div></div>
              <div><div className="text-4xl font-black">{(remaining/1000).toFixed(2)}L</div><div className="text-[10px] uppercase tracking-widest text-slate-400">Remaining</div></div>
            </div>
          </div>

          <button onClick={resetToday} className="absolute bottom-8 right-8 text-slate-500 hover:text-red-400 transition-colors p-2"><Icons.Trash /></button>
        </Card>

        {/* 2. Hydration Protocol (Water Timetable) */}
        <Card title="Hydration Protocol" action={
          <Button size="sm" variant="glass" onClick={() => setIsAddingSlot(true)}><Icons.Plus /> Add Time</Button>
        }>
          <div className="space-y-6">
            {isAddingSlot && (
              <div className="p-6 rounded-3xl bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-xl space-y-4 animate-slide-up mb-6 shadow-[0_0_40px_rgba(0,0,0,0.1)]">
                <div className="grid grid-cols-2 gap-4">
                  <Input type="time" label="Target Time" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} />
                  <Input type="number" label="Volume (ml)" value={newSlot.amount} onChange={e => setNewSlot({...newSlot, amount: Number(e.target.value)})} />
                </div>
                <Input label="Label" value={newSlot.label} onChange={e => setNewSlot({...newSlot, label: e.target.value})} />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingSlot(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddSlot}>Schedule Slot</Button>
                </div>
              </div>
            )}

            {schedule.length === 0 ? (
              <div className="text-center py-12 text-slate-500 italic">No hydration schedule planned.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedule.map(slot => {
                  const isDone = slot.completedDates?.includes(today);
                  return (
                    <div key={slot.id} className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${isDone ? 'bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/10 dark:bg-white/5 border-white/20 hover:border-cyan-500/40 hover:bg-cyan-500/5'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`text-sm font-mono font-bold ${isDone ? 'text-emerald-400' : 'text-cyan-400'}`}>{slot.time}</div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-white">{slot.label}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{slot.amount}ml</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isDone && <Button size="sm" variant="secondary" className="px-3 shadow-cyan-500/20" onClick={() => addWater(slot.amount, slot.id)}>Drink</Button>}
                        <button onClick={() => deleteSlot(slot.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Icons.Trash /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Right: Controls & Custom Milestones */}
      <div className="lg:col-span-5 space-y-8">
        
        {/* Quick Hydrate & Timer */}
        <Card title="Quick Ingestion">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[250, 500, 1000].map(amt => (
                <button key={amt} onClick={() => addWater(amt)} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all active:scale-95 shadow-sm hover:shadow-cyan-500/20">
                  <span className="text-lg mb-1">{amt >= 1000 ? '🧊' : '💧'}</span>
                  <span className="text-xs font-bold">{amt}ml</span>
                </button>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div><div className="text-[10px] font-bold uppercase text-slate-400">Last Sip</div><div className="text-lg font-black text-cyan-400">{lastSipTime}</div></div>
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500"><Icons.Clock /></div>
            </div>
          </div>
        </Card>

        {/* Milestone Management */}
        <Card title="Command Milestones" action={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setMilestones(DEFAULT_MILESTONES)}>JEE Mode</Button>
            <Button size="sm" variant="glass" onClick={() => setIsAddingMilestone(true)}><Icons.Plus /></Button>
          </div>
        }>
          <div className="space-y-4">
            <Input label="Daily Target (ml)" type="number" value={goal} onChange={e => setGoal(Number(e.target.value))} className="font-mono text-xl text-cyan-400 mb-6" />
            
            {isAddingMilestone && (
              <div className="p-4 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-xl space-y-4 animate-slide-up shadow-[0_0_30px_rgba(0,0,0,0.1)]">
                <Input label="Milestone Label" value={newMS.label} onChange={e => setNewMS({...newMS, label: e.target.value})} />
                <Input label="Volume Goal (ml)" type="number" value={newMS.amount} onChange={e => setNewMS({...newMS, amount: Number(e.target.value)})} />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingMilestone(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddMilestone}>Add</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {milestones.map(ms => {
                const reached = totalDrank >= ms.amount;
                return (
                  <div 
                    key={ms.id} 
                    className={`
                      relative group flex items-center justify-between p-5 rounded-[24px] border backdrop-blur-xl transition-all duration-700
                      ${reached 
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)] scale-[1.02]' 
                        : 'bg-white/5 border-white/10 opacity-60 hover:opacity-90 hover:border-white/30'}
                    `}
                  >
                    {reached && (
                        <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                    )}
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-3 rounded-xl transition-all duration-500 ${reached ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-white/5 text-slate-500'}`}>
                        {reached ? <Icons.Check /> : <Icons.Zap />}
                      </div>
                      <div>
                        <div className={`text-sm font-black tracking-tight ${reached ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{ms.label}</div>
                        <div className={`text-[10px] uppercase font-black tracking-[0.2em] ${reached ? 'text-cyan-500' : 'text-slate-500'}`}>{ms.amount}ml</div>
                      </div>
                    </div>
                    <button onClick={() => deleteMilestone(ms.id)} className="relative z-10 p-2 text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Icons.Trash /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WaterTracker;