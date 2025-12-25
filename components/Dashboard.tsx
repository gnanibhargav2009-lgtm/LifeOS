import React, { useMemo } from 'react';
import { Card, Button, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import { 
  Task, Habit, MistakeEntry, MealEntry, 
  TimetableEntry, Strategy, AppView 
} from '../types';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
  selectedDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, selectedDate }) => {
  // Pulling all data streams
  const [tasks] = useLocalStorage<Task[]>('lifeos_tasks', []);
  const [habits] = useLocalStorage<Habit[]>('lifeos_habits', []);
  const [waterLogs] = useLocalStorage<any[]>('lifeos_water_logs', []);
  const [waterGoal] = useLocalStorage<number>('lifeos_water_goal', 4000);
  const [meals] = useLocalStorage<MealEntry[]>('lifeos_meals', []);
  const [mistakes] = useLocalStorage<MistakeEntry[]>('lifeos_mistake_graveyard', []);
  const [timetable] = useLocalStorage<TimetableEntry[]>('lifeos_timetable', []);
  const [strategies] = useLocalStorage<Strategy[]>('lifeos_strategies', []);
  const [diaryEntries] = useLocalStorage<Record<string, string>>('lifeos_diary_entries', {});

  // 1. Operational Calculus
  const taskEfficiency = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const upcomingEvent = useMemo(() => {
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const todayEvents = timetable.filter(e => e.date === selectedDate);
    return todayEvents
      .filter(e => e.startTime > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
  }, [timetable, selectedDate]);

  // 2. Biological Calculus
  const waterProgress = useMemo(() => {
    const total = waterLogs.reduce((acc, l) => acc + l.amount, 0);
    return Math.min(Math.round((total / waterGoal) * 100), 100);
  }, [waterLogs, waterGoal]);

  const mealStats = useMemo(() => {
    const todayMeals = meals.filter(m => m.date === selectedDate);
    return todayMeals.reduce((acc, m) => ({
      cal: acc.cal + m.calories,
      p: acc.p + m.protein
    }), { cal: 0, p: 0 });
  }, [meals, selectedDate]);

  // 3. Growth Calculus
  const avgStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length);
  }, [habits]);

  const activeStrategy = useMemo(() => strategies[0], [strategies]);
  const strategyProgress = useMemo(() => {
    if (!activeStrategy) return 0;
    const done = activeStrategy.days.filter(d => d.status === 'completed').length;
    return Math.round((done / activeStrategy.totalDays) * 100);
  }, [activeStrategy]);

  // 4. Analysis Calculus
  const buriedToday = mistakes.length;
  const diaryStatus = diaryEntries[selectedDate] ? 'REFLECTED' : 'PENDING';

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Hero Welcome Section */}
      <section className="relative p-10 rounded-[40px] bg-slate-900 border border-primary/20 overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">System Active</span>
                  <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">{selectedDate}</span>
               </div>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2">Main Dashboard</h2>
               <p className="text-slate-400 font-medium max-w-md">Synchronized operational overview of all LifeOS subsystems for elite JEE preparation.</p>
            </div>
            <div className="flex gap-4">
               <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-3xl font-black text-primary mb-1">{taskEfficiency}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Efficiency</div>
               </div>
               <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-3xl font-black text-secondary mb-1">{waterProgress}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hydration</div>
               </div>
            </div>
         </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Operational Focus (Large) */}
        <div className="md:col-span-8 space-y-8">
           <Card className="bg-white/5 border-white/10" title="Immediate Objectives">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Next Session */}
                 <div onClick={() => onViewChange(AppView.TIMETABLE)} className="cursor-pointer group p-8 rounded-[32px] bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all relative overflow-hidden">
                    <div className="absolute top-4 right-6 text-cyan-500/30 group-hover:text-cyan-500 transition-colors"><Icons.Calendar /></div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-4">Next Tactical Block</div>
                    {upcomingEvent ? (
                       <>
                          <div className="text-3xl font-black text-white mb-2 tracking-tighter">{upcomingEvent.title}</div>
                          <div className="text-lg font-mono text-cyan-400">{upcomingEvent.startTime} - {upcomingEvent.endTime}</div>
                       </>
                    ) : (
                       <div className="text-2xl font-black text-slate-500">No Upcoming Events</div>
                    )}
                 </div>

                 {/* Active Strategy */}
                 <div onClick={() => onViewChange(AppView.STRATEGY)} className="cursor-pointer group p-8 rounded-[32px] bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all relative overflow-hidden">
                    <div className="absolute top-4 right-6 text-primary/30 group-hover:text-primary transition-colors"><Icons.Strategy /></div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Strategic Goal</div>
                    {activeStrategy ? (
                       <>
                          <div className="text-3xl font-black text-white mb-4 tracking-tighter line-clamp-1">{activeStrategy.name}</div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                             <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${strategyProgress}%` }} />
                          </div>
                          <div className="mt-2 text-right text-[10px] font-black text-primary uppercase">{strategyProgress}% Complete</div>
                       </>
                    ) : (
                       <div className="text-2xl font-black text-slate-500">No Active Blueprint</div>
                    )}
                 </div>
              </div>
           </Card>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Biological Fuel */}
              <Card onClick={() => onViewChange(AppView.MEALS)} className="cursor-pointer bg-white/5 border-white/10 hover:border-white/20 transition-all" title="Fueling Status">
                 <div className="space-y-6 pt-2">
                    <div className="flex justify-between items-end">
                       <div>
                          <div className="text-4xl font-black text-white">{mealStats.cal}</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kcal Ingested</div>
                       </div>
                       <div className="text-right">
                          <div className="text-2xl font-black text-blue-400">{mealStats.p}g</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protein Intake</div>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                       <span className="text-xs font-bold text-slate-400 italic">"Precision nutrition drives precision focus."</span>
                    </div>
                 </div>
              </Card>

              {/* Neural Evolution */}
              <Card onClick={() => onViewChange(AppView.HABITS)} className="cursor-pointer bg-white/5 border-white/10 hover:border-white/20 transition-all" title="Neural Growth">
                 <div className="flex items-center gap-8 pt-2">
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                       <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#dash_grad)" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 * (1 - (avgStreak/66))} strokeLinecap="round" />
                          <defs>
                             <linearGradient id="dash_grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                          </defs>
                       </svg>
                       <span className="text-2xl font-black text-white">{avgStreak}</span>
                    </div>
                    <div>
                       <div className="text-xl font-black text-white">Streak Mastery</div>
                       <p className="text-sm text-slate-500 font-medium">Avg Protocol Endurance across all habits.</p>
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        {/* Intelligence Column (Small) */}
        <div className="md:col-span-4 space-y-8">
           {/* Reflection Status */}
           <Card onClick={() => onViewChange(AppView.DIARY)} className="cursor-pointer group bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all">
              <div className="flex flex-col items-center text-center py-4">
                 <div className={`p-4 rounded-3xl mb-4 ${diaryStatus === 'REFLECTED' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white animate-pulse'}`}>
                    {diaryStatus === 'REFLECTED' ? <Icons.Check /> : <Icons.Book />}
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Vault Reflection</div>
                 <div className={`text-2xl font-black tracking-tighter ${diaryStatus === 'REFLECTED' ? 'text-emerald-500' : 'text-white'}`}>{diaryStatus}</div>
              </div>
           </Card>

           {/* Error Analysis */}
           <Card onClick={() => onViewChange(AppView.GRAVEYARD)} className="cursor-pointer group bg-red-500/5 border-red-500/20 hover:bg-red-500/10 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 rounded-2xl bg-red-500/20 text-red-500"><Icons.Skull /></div>
                 <div className="text-right">
                    <div className="text-3xl font-black text-white">{buriedToday}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Errors Buried</div>
                 </div>
              </div>
              <h4 className="text-lg font-bold text-slate-200">Mistake Cemetery</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Document and analyze every fatality to ensure JEE victory.</p>
           </Card>

           {/* Focus Launcher */}
           <Card onClick={() => onViewChange(AppView.FOCUS)} className="cursor-pointer group bg-slate-900 border-none relative overflow-hidden flex flex-col items-center justify-center py-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-4 text-primary animate-pulse-slow"><Icons.Focus /></div>
              <div className="text-xl font-black text-white uppercase tracking-[0.3em]">Ignite Focus</div>
              <div className="mt-2 text-[10px] font-bold text-slate-500">ENTER IMMERSIVE MODE</div>
           </Card>
        </div>

      </div>

      {/* Developer Signature - Dashboard Version */}
      <div className="pt-10 flex flex-col items-center justify-center opacity-30 group">
         <div className="flex items-center gap-4 mb-2">
            <div className="h-px w-20 bg-slate-500" />
            <span className="font-black tracking-[0.5em] text-[10px] uppercase">Architectural Excellence</span>
            <div className="h-px w-20 bg-slate-500" />
         </div>
         <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Built by <span className="text-primary tracking-[0.2em] group-hover:text-white transition-colors">GNANESWAR</span> • JEE Aspirant 2025
         </div>
      </div>

    </div>
  );
};

export default Dashboard;