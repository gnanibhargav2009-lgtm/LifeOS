import React, { useState, useEffect } from 'react';
import { UserProfile, AppView } from './types';
import { useLocalStorage } from './hooks/useStorage';
import { Icons, Button } from './components/UI';

import Dashboard from './components/Dashboard';
import Diary from './components/Diary';
import Timetable from './components/Timetable';
import Tasks from './components/Tasks';
import Habits from './components/Habits';
import FocusHub from './components/FocusHub';
import WaterTracker from './components/WaterTracker';
import StrategyPlanner from './components/StrategyPlanner';
import MistakeGraveyard from './components/MistakeGraveyard';
import MealTracker from './components/MealTracker';
import Settings from './components/Settings';

// --- Mini Calendar Component ---
const MiniCalendar = ({ selectedDate, onDateSelect }: { selectedDate: string, onDateSelect: (d: string) => void }) => {
  const date = new Date(selectedDate);
  const [viewDate, setViewDate] = useState(date);

  useEffect(() => {
    setViewDate(new Date(selectedDate));
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const isSelected = (d: number) => {
    const checkDate = new Date(year, month, d).toISOString().split('T')[0];
    return checkDate === selectedDate;
  };

  const isToday = (d: number) => {
    const checkDate = new Date(year, month, d).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return checkDate === today;
  }

  return (
    <div className="hidden lg:block w-full px-2 mb-8 animate-fade-in">
      <div className="bg-slate-50/50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200/50 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
             <button onClick={() => handleMonthChange(-1)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Icons.ChevronLeft /></button>
             <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{monthNames[month]} {year}</span>
             <button onClick={() => handleMonthChange(1)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Icons.ChevronRight /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
            {['S','M','T','W','T','F','S'].map(day => (
                <div key={day} className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{day}</div>
            ))}
            {days.map((d, i) => {
                if (d === null) return <div key={i} />;
                return (
                    <button
                        key={i}
                        onClick={() => onDateSelect(new Date(year, month, d as number).toISOString().split('T')[0])}
                        className={`
                            w-6 h-6 mx-auto flex items-center justify-center rounded-full text-[11px] font-medium transition-all duration-300
                            ${isSelected(d as number) 
                                ? 'bg-slate-900 dark:bg-primary text-white dark:text-slate-900 shadow-md scale-110' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}
                            ${isToday(d as number) && !isSelected(d as number) ? 'ring-1 ring-slate-300 dark:ring-slate-600' : ''}
                        `}
                    >
                        {d}
                    </button>
                )
            })}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('lifeos_theme', 'dark');
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSidebarHidden, setIsSidebarHidden] = useLocalStorage<boolean>('lifeos_sidebar_hidden', false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleSidebar = () => setIsSidebarHidden(prev => !prev);

  // High-Contrast Navigation Item for Absolute Visibility
  const NavItem = ({ target, icon, label, variant = 'standard' }: { target: AppView, icon: React.ReactNode, label: string, variant?: 'standard' | 'highlight' }) => {
    const isActive = view === target;
    return (
      <button 
        onClick={() => setView(target)}
        className={`
          relative flex items-center justify-center lg:justify-start gap-4 w-full px-4 lg:px-5 py-3.5 rounded-2xl transition-all duration-500 group overflow-hidden shrink-0
          ${isActive 
            ? 'bg-primary text-slate-900 shadow-[0_0_30px_rgba(251,191,36,0.4)] translate-x-1' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border border-transparent hover:border-white/5'}
        `}
        title={label}
      >
        <span className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-110 opacity-100 rotate-0' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-6'}`}>
          {icon}
        </span>
        <span className={`hidden lg:block text-[14px] font-black tracking-tight relative z-10 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100 uppercase text-[12px] tracking-widest font-bold'}`}>
           {label}
        </span>
        
        {/* Glow behind active item */}
        {isActive && (
           <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
        )}
      </button>
    );
  };

  const bgGradient = "bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFC] to-[#FEF3C7] dark:from-[#020617] dark:via-[#0B0F19] dark:to-[#171717]";

  return (
    <div className={`h-[100dvh] w-screen flex ${bgGradient} transition-colors duration-700 overflow-hidden relative`}>
      <button 
        onClick={toggleSidebar}
        className={`fixed top-6 left-6 z-[60] p-4 rounded-full glass border border-white/20 shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${isSidebarHidden ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0 pointer-events-none'}`}
      >
        <Icons.Menu />
      </button>

      <aside 
        className={`
          flex flex-col w-[80px] lg:w-72 m-2 lg:m-4 rounded-[28px] py-6 lg:px-2 glass border-none z-50 shadow-[0_8px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] shrink-0 transition-all duration-700 max-h-[calc(100dvh-16px)]
          ${isSidebarHidden ? '-translate-x-[calc(100%+32px)] absolute' : 'translate-x-0 relative'}
        `}
      >
        <div className="flex items-center justify-between gap-4 mb-6 px-4 mt-1 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center shrink-0">
                 <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white rounded-lg px-2 py-1">OS</span>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <h1 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight leading-none">LifeOS</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Tactical Command</p>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
            title="Hide Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
          </button>
        </div>

        <MiniCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar flex flex-col items-center lg:items-stretch min-h-0 px-2 pb-6">
          <NavItem target={AppView.DASHBOARD} icon={<Icons.Dashboard />} label="Dashboard" />
          <div className="h-4 border-t border-slate-200 dark:border-white/5 mx-4" /> 
          <NavItem target={AppView.DIARY} icon={<Icons.Book />} label="Diary" />
          <NavItem target={AppView.TIMETABLE} icon={<Icons.Calendar />} label="Timetable" />
          <NavItem target={AppView.TASKS} icon={<Icons.List />} label="Tasks" />
          <NavItem target={AppView.HABITS} icon={<Icons.Zap />} label="Habits" />
          <NavItem target={AppView.WATER} icon={<Icons.Droplet />} label="Water" />
          <NavItem target={AppView.STRATEGY} icon={<Icons.Strategy />} label="Strategy" />
          <NavItem target={AppView.GRAVEYARD} icon={<Icons.Skull />} label="Graveyard" />
          <NavItem target={AppView.MEALS} icon={<Icons.Utensils />} label="Meals" />
          <NavItem target={AppView.FOCUS} icon={<Icons.Focus />} label="Focus Hub" />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-white/5 flex flex-col items-center lg:items-stretch shrink-0 px-2 gap-4">
          <NavItem target={AppView.SETTINGS} icon={<Icons.Settings />} label="Settings" />
          <div className="flex justify-center w-full px-2 pb-2">
            <button onClick={toggleTheme} className="relative w-full max-w-[200px] h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between px-1.5 transition-all duration-300 group">
                <div className={`absolute left-1.5 top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-800 rounded-full shadow-md transform transition-transform duration-500 ${theme === 'dark' ? 'translate-x-[100%]' : 'translate-x-0'}`} />
                <div className={`flex-1 flex items-center justify-center z-20 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`}><Icons.Sun /></div>
                <div className={`flex-1 flex items-center justify-center z-20 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`}><Icons.Moon /></div>
            </button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 h-full overflow-hidden transition-all duration-700 ${isSidebarHidden ? 'w-full' : ''}`}>
          <div className="h-full w-full overflow-y-auto p-2 lg:p-4 lg:pl-0 no-scrollbar">
            <div className={`h-full w-full max-w-7xl mx-auto pb-24 lg:pb-0 transition-all duration-700 ${isSidebarHidden ? 'px-8 lg:px-12' : ''}`}>
                <div className="mb-8 mt-4 pl-4 animate-fade-in flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 drop-shadow-sm">
                            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                        </h1>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            LifeOS - Built by GNANESWAR
                        </p>
                    </div>
                </div>

                {view === AppView.DASHBOARD && <Dashboard onViewChange={setView} selectedDate={selectedDate} />}
                {view === AppView.DIARY && <Diary selectedDate={selectedDate} />}
                {view === AppView.TIMETABLE && <Timetable selectedDate={selectedDate} />}
                {view === AppView.TASKS && <Tasks />}
                {view === AppView.HABITS && <Habits />}
                {view === AppView.WATER && <WaterTracker />}
                {view === AppView.STRATEGY && <StrategyPlanner />}
                {view === AppView.GRAVEYARD && <MistakeGraveyard />}
                {view === AppView.MEALS && <MealTracker selectedDate={selectedDate} />}
                {view === AppView.FOCUS && <FocusHub />}
                {view === AppView.SETTINGS && <Settings />}
            </div>
          </div>
      </main>
    </div>
  );
};

export default App;