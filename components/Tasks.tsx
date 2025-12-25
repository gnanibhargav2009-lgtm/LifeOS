import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Input, Button, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import { Task } from '../types';
import TutorialOverlay from './TutorialOverlay';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('lifeos_tasks', []);
  const [newTaskText, setNewTaskText] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: uuidv4(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  // Progress Calculation
  const total = tasks.length;
  const completedCount = completedTasks.length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const circumference = 2 * Math.PI * 24; // r=24
  const offset = circumference - (progress / 100) * circumference;

  const tutorialSteps = [
    { title: "One Focus at a Time", text: "Add your main tasks. Avoid cluttering the list; only keep what's essential for today." },
    { title: "Efficiency Metric", text: "The circular progress tracker at the top shows your daily completion ratio. Aim for 100% every day." },
    { title: "Task Interaction", text: "Click the checkbox to complete. Use the trash icon to remove tasks that are no longer relevant." },
    { title: "Completed History", text: "Review your completed items at the bottom to build confidence and track your output." }
  ];

  return (
    <Card 
        title="Task Command" 
        className="h-full min-h-[600px] relative overflow-hidden"
        action={
             <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 rounded-2xl p-2 pr-4 border border-slate-200 dark:border-white/5">
                <Button variant="ghost" size="sm" onClick={() => setShowTutorial(true)}><Icons.Info /></Button>
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-white/10" />
                        <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="4" 
                                className="text-emerald-500 transition-all duration-1000 ease-out"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-slate-700 dark:text-white">{progress}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{completedCount}/{total} Done</span>
                </div>
             </div>
        }
    >
      {showTutorial && (
        <TutorialOverlay 
           title="Objective Control"
           description="Manage your daily objectives. This is your list of non-negotiable targets."
           steps={tutorialSteps}
           tip="If a task takes less than 2 minutes, do it immediately instead of adding it to the list."
           onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Ambient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        {/* Input Area */}
        <form onSubmit={addTask} className="mb-10 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[20px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex gap-3">
             <Input 
                placeholder="What is your main focus?" 
                value={newTaskText} 
                onChange={(e) => setNewTaskText(e.target.value)}
                className="h-16 text-lg shadow-xl border-transparent focus:border-emerald-500/50"
             />
             <Button type="submit" variant="primary" className="h-16 w-16 rounded-[20px] bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                <Icons.Plus />
             </Button>
          </div>
        </form>

        <div className="space-y-8 pb-10">
          
          {/* Active Tasks */}
          <div className="space-y-4">
             {activeTasks.length === 0 && completedTasks.length === 0 && (
                 <div className="text-center py-10 opacity-40">
                    <p className="text-lg font-medium">Clear mind, empty list.</p>
                 </div>
             )}
             
             {activeTasks.map((task, index) => (
              <div 
                key={task.id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className="animate-slide-up group flex items-center p-5 rounded-[20px] bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
              >
                 <button 
                    onClick={() => toggleTask(task.id)}
                    className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-500 hover:border-emerald-500 dark:hover:border-emerald-400 mr-5 shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                 >
                 </button>
                 <span className="flex-1 text-lg font-medium text-slate-700 dark:text-slate-200">{task.text}</span>
                 <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2">
                    <Icons.Trash />
                 </button>
              </div
            ))}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="relative pt-6">
               <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Completed</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
               </div>

               <div className="space-y-3">
                 {completedTasks.map((task, index) => (
                    <div 
                        key={task.id}
                        className="flex items-center p-4 rounded-2xl bg-slate-50/50 dark:bg-black/20 border border-transparent hover:border-white/5 transition-all duration-300 group opacity-60 hover:opacity-100"
                    >
                        <button 
                            onClick={() => toggleTask(task.id)}
                            className="w-6 h-6 rounded-lg bg-emerald-500 border-2 border-emerald-500 text-white mr-5 shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <span className="flex-1 text-base font-medium text-slate-500 line-through decoration-slate-400/50 decoration-2">{task.text}</span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2">
                            <Icons.Trash />
                        </button>
                    </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </Card>
  );
};

export default Tasks;