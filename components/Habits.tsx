
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Input, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import { Habit } from '../types';
import TutorialOverlay from './TutorialOverlay';

const Habits: React.FC = () => {
  const [habits, setHabits] = useLocalStorage<Habit[]>('lifeos_habits', []);
  const [newHabitName, setNewHabitName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // --- Gamification Logic ---
  const getHabitLevel = (streak: number) => {
    if (streak >= 66) return { label: 'PHOENIX', color: 'text-violet-400', bg: 'bg-violet-500', from: 'from-violet-500', to: 'to-fuchsia-500', shadow: 'shadow-violet-500/40', next: 100, icon: <Icons.Zap /> };
    if (streak >= 21) return { label: 'INFERNO', color: 'text-rose-400', bg: 'bg-rose-500', from: 'from-rose-500', to: 'to-orange-500', shadow: 'shadow-rose-500/40', next: 66, icon: <Icons.Fire /> };
    if (streak >= 7) return { label: 'BLAZE', color: 'text-amber-400', bg: 'bg-amber-500', from: 'from-amber-400', to: 'to-orange-500', shadow: 'shadow-amber-500/40', next: 21, icon: <Icons.Fire /> };
    return { label: 'SPARK', color: 'text-blue-400', bg: 'bg-blue-400', from: 'from-blue-400', to: 'to-cyan-400', shadow: 'shadow-blue-500/40', next: 7, icon: <Icons.Zap /> };
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: uuidv4(),
      name: newHabitName.trim(),
      streak: 0,
      lastCompletedDate: null
    };
    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setIsAdding(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const checkHabit = (id: string) => {
    // Trigger animations
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 1000); // Longer reset for burst

    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      
      const isAlreadyDoneToday = h.lastCompletedDate === today;
      if (isAlreadyDoneToday) return h; 

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (h.lastCompletedDate === yesterdayStr) {
        newStreak = h.streak + 1;
      } else if (h.lastCompletedDate === today) {
        newStreak = h.streak;
      } else {
        newStreak = 1;
      }

      return { ...h, streak: newStreak, lastCompletedDate: today };
    }));
  };

  const tutorialSteps = [
    { title: "Start a Protocol", text: "Add habits that align with your long-term goals. Each one is a 'Protocol' in your LifeOS." },
    { title: "66-Day Journey", text: "Science says it takes 66 days to form a permanent habit. Level up through Spark, Blaze, and Inferno to become a Phoenix." },
    { title: "Daily Check-In", text: "Check in every day to grow your streak. Miss a day, and the streak resets to zero." },
    { title: "Visual Progress", text: "The color-coded progress bars show how close you are to the next evolutionary tier." }
  ];

  // Stats for Hero Section
  const activeHabits = habits.length;
  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
  const perfectDay = habits.length > 0 && habits.every(h => h.lastCompletedDate === today);

  return (
    <Card 
      title="Habit Mastery" 
      action={
        <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowTutorial(true)}><Icons.Info /></Button>
            {!isAdding && <Button size="sm" variant="glass" onClick={() => setIsAdding(true)} className="hover:bg-white/20"><Icons.Plus /> New Protocol</Button>}
        </div>
      }
      className="min-h-[700px] relative overflow-hidden flex flex-col"
    >
       {showTutorial && (
        <TutorialOverlay 
           title="Evolution Protocol"
           description="Hardwire success into your neural pathways. Discipline equals freedom."
           steps={tutorialSteps}
           tip="Don't start more than 3 habits at once. Habit fatigue is real; focus on high-impact behaviors first."
           onClose={() => setShowTutorial(false)}
        />
       )}

       {/* Ambient Background Effects */}
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

       {/* Hero Stats Section */}
       <div className="grid grid-cols-3 gap-4 mb-10 relative z-10">
          {[
            { label: 'Active Protocols', val: activeHabits, icon: <Icons.List /> },
            { label: 'Total Streak', val: totalStreaks, icon: <Icons.Chart /> },
            { label: 'Daily Status', val: perfectDay ? 'Perfect' : 'Pending', icon: <Icons.Trophy />, color: perfectDay ? 'text-amber-400' : 'text-slate-400' }
          ].map((stat, i) => (
             <div key={i} className="glass p-4 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
                <div className={`mb-2 opacity-50 group-hover:opacity-100 transition-opacity ${stat.color || 'text-slate-500 dark:text-slate-400'}`}>{stat.icon}</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
             </div>
          ))}
       </div>

       {isAdding && (
          <div className="mb-10 flex flex-col md:flex-row gap-4 animate-slide-up bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl relative z-20">
            <Input 
              autoFocus
              placeholder="Name your new protocol..." 
              value={newHabitName} 
              // Fix: Changed setNewTaskName to setNewHabitName
              onChange={(e) => setNewHabitName(e.target.value)}
              className="bg-transparent border-slate-300 dark:border-white/10 text-lg"
            />
            <div className="flex gap-2 shrink-0">
               <Button onClick={addHabit} className="flex-1 md:flex-none">Initialize</Button>
               <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 relative z-10">
          {habits.map((habit, index) => {
            const isDoneToday = habit.lastCompletedDate === today;
            const level = getHabitLevel(habit.streak);
            const progress = Math.min((habit.streak / level.next) * 100, 100);
            
            return (
              <div 
                key={habit.id} 
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`
                  animate-slide-up relative flex flex-col justify-between p-6 rounded-[32px] 
                  bg-gradient-to-b from-white/80 to-white/40 dark:from-white/10 dark:to-[#0B0F19]/50
                  border border-white/50 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2
                  backdrop-blur-md overflow-hidden
                  ${isDoneToday ? 'dark:border-emerald-500/20 border-emerald-500/20' : ''}
                `}
              >
                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 dark:bg-white/5 w-full">
                   <div 
                      className={`h-full bg-gradient-to-r ${level.from} ${level.to} transition-all duration-1000 ease-out`} 
                      style={{ width: `${progress}%` }} 
                   />
                </div>

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                     <div className={`text-[10px] font-bold tracking-[0.2em] mb-1 flex items-center gap-1 ${level.color}`}>
                        {level.icon} {level.label}
                     </div>
                     <h3 className="font-bold text-xl text-slate-800 dark:text-white line-clamp-1 leading-tight tracking-tight">{habit.name}</h3>
                  </div>
                  <button onClick={() => deleteHabit(habit.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Icons.Trash />
                  </button>
                </div>
                
                {/* Middle: Streak Visualization */}
                <div className="flex-1 flex flex-col justify-end mb-6">
                   <div className="flex items-baseline gap-1">
                      <span className={`text-6xl font-black tracking-tighter transition-all duration-500 ${isDoneToday ? 'text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {habit.streak}
                      </span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days</span>
                   </div>
                   <div className="text-xs text-slate-400 font-medium mt-1">
                      Next Tier: <span className="text-slate-600 dark:text-slate-200">{level.next}</span>
                   </div>
                </div>
                
                {/* Action Footer */}
                <div className="relative">
                   <button
                    onClick={() => checkHabit(habit.id)}
                    disabled={isDoneToday}
                    className={`
                      w-full py-4 rounded-2xl flex items-center justify-center transition-all duration-500 font-bold tracking-widest text-sm uppercase
                      ${isDoneToday 
                        ? 'bg-emerald-500/10 text-emerald-500 cursor-default border border-emerald-500/20' 
                        : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                      }
                    `}
                   >
                     {isDoneToday ? (
                        <span className="flex items-center gap-2 animate-fade-in">
                           <Icons.Check /> Complete
                        </span>
                     ) : (
                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">Check In</span>
                     )}
                   </button>
                   
                   {/* Success Burst Animation Overlay */}
                   {animatingId === habit.id && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-full h-full absolute rounded-2xl animate-success-burst border-2 border-emerald-400 opacity-0" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             {[...Array(6)].map((_, i) => (
                                <div key={i} 
                                   className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                                   style={{
                                      transform: `rotate(${i * 60}deg) translateY(-40px)`,
                                      animation: 'pop 0.6s ease-out forwards'
                                   }}
                                />
                             ))}
                          </div>
                      </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
        
        {habits.length === 0 && !isAdding && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 animate-fade-in z-0">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-white/20">
               <div className="animate-pulse-slow">
                 <Icons.Zap />
               </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Zero Protocols</h3>
            <p className="text-base opacity-60 max-w-xs text-center leading-relaxed">Greatness is the sum of small, consistent actions. Begin now.</p>
            <div className="mt-8">
               <Button onClick={() => setIsAdding(true)} variant="primary" className="shadow-2xl shadow-primary/20">Start Journey</Button>
            </div>
          </div>
        )}
    </Card>
  );
};

export default Habits;
