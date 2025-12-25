import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Input, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import { TimetableEntry } from '../types';
import TutorialOverlay from './TutorialOverlay';

interface TimetableProps {
  selectedDate: string;
}

const Timetable: React.FC<TimetableProps> = ({ selectedDate }) => {
  const [allEntries, setAllEntries] = useLocalStorage<TimetableEntry[]>('lifeos_timetable', []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Form State for Adding/Editing
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    title: '', // Mapping to 'Activity'
    description: '' // Mapping to 'Goal and Method'
  });

  const dayEntries = allEntries
    .filter(e => e.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAdd = () => {
    if (!formData.startTime || !formData.title) return;
    const newEntry: TimetableEntry = {
      id: uuidv4(),
      date: selectedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      title: formData.title,
      description: formData.description
    };
    setAllEntries(prev => [...prev, newEntry]);
    resetForm();
    setIsAdding(false);
  };

  const handleUpdate = (id: string) => {
    setAllEntries(prev => prev.map(e => 
      e.id === id ? { ...e, ...formData } : e
    ));
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ startTime: '', endTime: '', title: '', description: '' });
  };

  const startEditing = (entry: TimetableEntry) => {
    setFormData({
      startTime: entry.startTime,
      endTime: entry.endTime,
      title: entry.title,
      description: entry.description
    });
    setEditingId(entry.id);
  };

  const handleDelete = (id: string) => {
    setAllEntries(prev => prev.filter(e => e.id !== id));
  };

  const copyPreviousDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    const yesterdayStr = current.toISOString().split('T')[0];
    
    const yesterdayEntries = allEntries.filter(e => e.date === yesterdayStr);
    
    if (yesterdayEntries.length === 0) {
      alert("No entries found for yesterday to copy.");
      return;
    }

    const clonedEntries = yesterdayEntries.map(e => ({
      ...e,
      id: uuidv4(),
      date: selectedDate
    }));

    setAllEntries(prev => [...prev, ...clonedEntries]);
  };

  const tutorialSteps = [
    { title: "Define Activities", text: "Break your day into focused blocks. Every session should have a clear start and end time." },
    { title: "Goal and Method", text: "Don't just write the subject. Specify the exact chapter and the method (e.g., Solving PYQs, Active Recall)." },
    { title: "Consistency Tool", text: "Use 'Copy Previous Day' to quickly replicate a successful routine and tweak as needed." },
    { title: "Timeline Visualization", text: "View your day as a continuous path. The visual line helps you see gaps in your schedule." }
  ];

  return (
    <Card 
      title={`Daily Timeline`} 
      action={
        <div className="flex gap-3">
          <Button size="sm" variant="ghost" onClick={() => setShowTutorial(true)}><Icons.Info /></Button>
          <Button 
            size="sm" 
            onClick={copyPreviousDay} 
            variant="outline" 
            className="hidden md:flex border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white"
          >
            📋 Copy Previous Day
          </Button>
          <Button 
            size="sm" 
            onClick={() => { resetForm(); setIsAdding(true); }} 
            variant="glass" 
            className="hover:bg-white/20"
          >
            <Icons.Plus /> Add Event
          </Button>
        </div>
      }
      className="min-h-[600px] relative overflow-hidden"
    >
      {showTutorial && (
        <TutorialOverlay 
           title="Daily Operations"
           description="Manage your time with military precision. A planned day is a conquered day."
           steps={tutorialSteps}
           tip="Schedule your hardest subjects during your biological peak (usually morning). Save light tasks for the afternoon slump."
           onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        
        {/* Add/Edit Form Overlay */}
        {(isAdding || editingId) && (
          <div className="glass-panel p-8 rounded-[32px] animate-slide-up border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.2)] space-y-6 relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />
            <div className="flex justify-between items-center relative z-10">
               <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                 <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"><Icons.Clock /></span>
                 {editingId ? 'Modify Session' : 'New Session'}
               </h3>
               <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">Close</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input type="time" label="Start Time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="font-mono text-lg" />
                  <Input type="time" label="End Time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="font-mono text-lg" />
                </div>
                <Input autoFocus label="Activity" placeholder="e.g. Mathematics - Integration" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="text-lg font-bold" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-2 text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Goal and Method</label>
                <textarea 
                  className="flex-1 w-full bg-white/30 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none backdrop-blur-md"
                  placeholder="Specific chapters, exercises, or methods to apply..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 relative z-10">
              <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
              <Button onClick={() => editingId ? handleUpdate(editingId) : handleAdd()} className="bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_10px_30px_rgba(6,182,212,0.4)]">
                {editingId ? 'Save Changes' : 'Confirm Schedule'}
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {dayEntries.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 animate-fade-in relative z-0">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/10">
               <div className="opacity-50">
                 <Icons.Calendar />
               </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Canvas is Empty</h3>
            <p className="text-sm opacity-60 text-center max-w-xs">Time is your most valuable asset.<br/>Plan it with intention.</p>
            <div className="mt-8 flex gap-3">
               <Button onClick={copyPreviousDay} variant="outline" size="sm">Copy Yesterday</Button>
               <Button onClick={() => setIsAdding(true)} variant="secondary" size="sm">Create First Event</Button>
            </div>
          </div>
        )}

        {/* Timeline List */}
        <div className="relative pl-0 md:pl-8 space-y-6">
          {/* Continuous Timeline Line (Desktop Only) */}
          {dayEntries.length > 0 && (
             <div className="hidden md:block absolute left-[11px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-transparent via-cyan-500/30 dark:via-cyan-400/20 to-transparent rounded-full" />
          )}

          {dayEntries.map((entry, index) => (
            <div 
              key={entry.id} 
              style={{ animationDelay: `${index * 0.1}s` }}
              className="animate-slide-up group relative"
            >
              {/* Timeline Node (Desktop Only) */}
              <div className="hidden md:flex absolute -left-[29px] top-12 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-[#0B0F19] border-4 border-white dark:border-white/10 shadow-lg z-10 group-hover:scale-125 group-hover:border-cyan-400 transition-all duration-300 items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* High Contrast Glow Event Card */}
              <div 
                onClick={() => startEditing(entry)}
                className="cursor-pointer p-6 rounded-[32px] bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-sm hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 backdrop-blur-xl group-hover:-translate-y-1 flex flex-col md:flex-row gap-6 overflow-hidden relative"
              >
                 {/* 1. Time Slot Heading */}
                 <div className="flex flex-col items-center justify-center min-w-[120px] shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 pb-4 md:pb-0 md:pr-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Time Slot</span>
                    <span className="font-mono font-black text-2xl text-slate-900 dark:text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">{entry.startTime}</span>
                    {entry.endTime && (
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-0.5 h-2 bg-slate-300 dark:bg-white/20 mb-1" />
                        <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{entry.endTime}</span>
                      </div>
                    )}
                 </div>

                 {/* 2 & 3. Activity and Goal Method */}
                 <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 block mb-1">Activity</span>
                           <h4 className="font-black text-2xl text-slate-900 dark:text-white leading-tight tracking-tight">
                               {entry.title}
                           </h4>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            title="Remove Event"
                        >
                            <Icons.Trash />
                        </button>
                    </div>

                    <div className="pl-4 border-l-4 border-cyan-500/40 dark:border-cyan-400/20 py-1 bg-cyan-500/5 rounded-r-xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Goal and Method</span>
                        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed italic font-medium">
                            {entry.description || "No specific method defined for this session."}
                        </p>
                    </div>
                 </div>

                 {/* Quick Edit Hint */}
                 <div className="absolute bottom-4 right-6 text-[10px] font-bold text-cyan-500/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit Session
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Timetable;