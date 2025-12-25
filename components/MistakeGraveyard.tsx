import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Input, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import { MistakeEntry } from '../types';
import TutorialOverlay from './TutorialOverlay';

const DEFAULT_TAGS = [
  'Calculation Error',
  'Formula Memory Gap',
  'Concept Misunderstanding',
  'Time Pressure',
  'Question Misread'
];

const DEFAULT_SUBJECTS = ['Physics', 'Chemistry', 'Maths'];

const TAG_COLOR_MAP: Record<string, string> = {
  'Calculation Error': 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
  'Formula Memory Gap': 'border-purple-500/50 text-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  'Concept Misunderstanding': 'border-red-500/50 text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  'Time Pressure': 'border-blue-500/50 text-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  'Question Misread': 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
};

const MistakeGraveyard: React.FC = () => {
  const [mistakes, setMistakes] = useLocalStorage<MistakeEntry[]>('lifeos_mistake_graveyard', []);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [hauntMistake, setHauntMistake] = useState<MistakeEntry | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<MistakeEntry>>({
    subject: 'Physics',
    chapter: '',
    tag: 'Calculation Error',
    correction: ''
  });

  // Unique lists for suggestions
  const subjects = useMemo(() => Array.from(new Set([...DEFAULT_SUBJECTS, ...mistakes.map(m => m.subject)])), [mistakes]);
  const tags = useMemo(() => Array.from(new Set([...DEFAULT_TAGS, ...mistakes.map(m => m.tag)])), [mistakes]);
  const chapters = useMemo(() => Array.from(new Set(mistakes.map(m => m.chapter).filter(Boolean))), [mistakes]);

  const buryMistake = () => {
    if (!formData.correction || !formData.subject || !formData.tag) return;
    const entry: MistakeEntry = {
      id: uuidv4(),
      subject: formData.subject,
      chapter: formData.chapter || 'Misc',
      tag: formData.tag,
      correction: formData.correction,
      isExorcised: false,
      createdAt: Date.now()
    };
    setMistakes(prev => [entry, ...prev]);
    setIsAdding(false);
    setFormData({ subject: entry.subject, chapter: '', tag: 'Calculation Error', correction: '' });
  };

  const deleteMistake = (id: string) => {
    if (confirm("Permanently erase this mistake from history?")) {
      setMistakes(prev => prev.filter(m => m.id !== id));
    }
  };

  const toggleExorcised = (id: string) => {
    setMistakes(prev => prev.map(m => m.id === id ? { ...m, isExorcised: !m.isExorcised } : m));
  };

  const handleHaunt = () => {
    if (mistakes.length === 0) return;
    const random = mistakes[Math.floor(Math.random() * mistakes.length)];
    setHauntMistake(random);
  };

  // Analytics
  const analytics = useMemo(() => {
    const counts: Record<string, number> = {};
    const causeCounts: Record<string, number> = {};
    
    mistakes.forEach(m => {
      counts[m.subject] = (counts[m.subject] || 0) + 1;
      causeCounts[m.tag] = (causeCounts[m.tag] || 0) + 1;
    });

    const deadliestSubject = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a, ['None', 0]);
    const commonCause = Object.entries(causeCounts).reduce((a, b) => b[1] > a[1] ? b : a, ['None', 0]);

    return { deadliestSubject, commonCause };
  }, [mistakes]);

  const filteredMistakes = mistakes.filter(m => {
    const matchesSearch = 
      m.correction.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || m.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const getTagStyle = (tag: string) => {
    return TAG_COLOR_MAP[tag] || 'border-slate-500/50 text-slate-400 bg-white/5 shadow-none';
  };

  const tutorialSteps = [
    { title: "Bury a Mistake", text: "Whenever you get a question wrong, document it. Categorize it by subject and exact chapter." },
    { title: "Cause of Death", text: "Tag the reason for the error. This helps identify if you have a conceptual gap or just time pressure issues." },
    { title: "Exorcism", text: "Re-solve the mistake later. When you've mastered the logic, toggle 'Exorcised' to dim the card and celebrate the win." },
    { title: "Haunt Mode", text: "Click 'Haunt Me' to see a random past mistake. It's a quick way to test if you still remember the correction." }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {showTutorial && (
        <TutorialOverlay 
           title="Error Analysis Protocol"
           description="Mistakes are the primary data source for improvement. Document, analyze, and eliminate them."
           steps={tutorialSteps}
           tip="Be brutally honest about the 'Cause of Death'. Solving a 'Concept' error is different from solving a 'Calculation' error."
           onClose={() => setShowTutorial(false)}
        />
      )}
      
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center py-10 bg-red-950/20 border-red-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-2 relative z-10">Deadliest Subject</div>
          <div className="text-4xl font-black text-white relative z-10">{analytics.deadliestSubject[0]}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 relative z-10">{analytics.deadliestSubject[1]} Fatalities</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10 bg-yellow-950/20 border-yellow-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-2 relative z-10">Common Cause</div>
          <div className="text-3xl font-black text-white relative z-10 text-center px-4">{analytics.commonCause[0]}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 relative z-10">{analytics.commonCause[1]} Incidents</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10 bg-emerald-950/20 border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2 relative z-10">Mistakes Buried</div>
          <div className="text-4xl font-black text-white relative z-10">{mistakes.length}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 relative z-10">Learning from Chaos</div>
        </Card>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
         <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" onClick={() => setIsAdding(true)} className="flex-1 md:flex-none shadow-[0_0_30px_rgba(34,211,238,0.2)]"><Icons.Plus /> Bury a Mistake</Button>
            <Button variant="glass" onClick={handleHaunt} className="flex-1 md:flex-none"><span className="mr-2">👻</span> Haunt Me</Button>
            <Button variant="ghost" onClick={() => setShowTutorial(true)}><Icons.Info /></Button>
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={filterSubject} 
              onChange={e => setFilterSubject(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 outline-none focus:border-cyan-500 transition-all"
            >
               <option value="All">All Subjects</option>
               {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="relative group">
               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               </div>
               <input 
                  placeholder="Search Cemetery..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-300 outline-none focus:border-cyan-500 transition-all md:w-64"
               />
            </div>
         </div>
      </div>

      {/* Bury Form Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-fade-in">
           <Card className="w-full max-w-2xl border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-black/80">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <span className="p-3 rounded-2xl bg-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"><Icons.Skull /></span>
                  Bury a New Mistake
                </h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Subject</label>
                    <div className="relative">
                       <input 
                          list="subject-list"
                          placeholder="Physics, Bio, History..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-all"
                          value={formData.subject}
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                       />
                       <datalist id="subject-list">
                          {subjects.map(s => <option key={s} value={s} />)}
                       </datalist>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Chapter / Context</label>
                    <div className="relative">
                       <input 
                          list="chapter-list"
                          placeholder="Calculus, WWII, Metabolism..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-all"
                          value={formData.chapter}
                          onChange={e => setFormData({...formData, chapter: e.target.value})}
                       />
                       <datalist id="chapter-list">
                          {chapters.map(c => <option key={c} value={c} />)}
                       </datalist>
                    </div>
                 </div>
              </div>

              <div className="mb-6 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Cause of Death (Tag)</label>
                 <div className="relative">
                    <input 
                       list="tag-list"
                       placeholder="Select or Type custom cause..."
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-all mb-4"
                       value={formData.tag}
                       onChange={e => setFormData({...formData, tag: e.target.value})}
                    />
                    <datalist id="tag-list">
                       {tags.map(t => <option key={t} value={t} />)}
                    </datalist>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {DEFAULT_TAGS.map(tag => (
                       <button 
                          key={tag}
                          type="button"
                          onClick={() => setFormData({...formData, tag})}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.tag === tag ? TAG_COLOR_MAP[tag] : 'bg-white/5 border-white/10 text-slate-500 hover:border-slate-400'}`}
                       >
                          {tag}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="mb-8 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Correction & Tactical Logic</label>
                 <textarea 
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-red-500 transition-all resize-none shadow-inner"
                    placeholder="Document the exact mental shift required to avoid this fatality again..."
                    value={formData.correction}
                    onChange={e => setFormData({...formData, correction: e.target.value})}
                 />
              </div>

              <div className="flex justify-end gap-3">
                 <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button onClick={buryMistake} className="bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20 px-8">Bury Forever</Button>
              </div>
           </Card>
        </div>
      )}

      {/* Haunt Me Overlay */}
      {hauntMistake && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-fade-in">
           <div className="relative w-full max-w-xl flex flex-col items-center">
              <div className="mb-8 text-8xl animate-float filter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">👻</div>
              <Card className="w-full text-center p-12 border-white/20 bg-white/5 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                 <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 mb-6">Past Failure Re-Emerged</div>
                 <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-slate-400 uppercase">{hauntMistake.subject}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-slate-400 uppercase">{hauntMistake.tag}</span>
                 </div>
                 <h3 className="text-xl font-bold mb-4 text-slate-300">{hauntMistake.chapter}</h3>
                 <div className="p-8 rounded-3xl bg-black/40 border border-white/5 mb-8">
                    <p className="text-2xl font-black italic text-white leading-relaxed tracking-tight">"{hauntMistake.correction}"</p>
                 </div>
                 <Button onClick={() => setHauntMistake(null)} className="w-full bg-cyan-500 text-black">Exorcise Ghost</Button>
              </Card>
           </div>
        </div>
      )}

      {/* Mistake List (Graveyard Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredMistakes.length === 0 ? (
           <div className="col-span-full py-40 text-center opacity-30">
              <div className="text-6xl mb-4 animate-float">🏰</div>
              <p className="text-xl font-bold">The Graveyard is empty. Pure perfection... for now.</p>
           </div>
         ) : (
           filteredMistakes.map(m => (
             <div 
               key={m.id}
               className={`
                 group relative p-8 rounded-[32px] border-2 transition-all duration-700 overflow-hidden flex flex-col h-full
                 ${m.isExorcised 
                    ? 'bg-white/5 border-white/5 opacity-30 scale-[0.97]' 
                    : 'bg-white/5 border-white/10 hover:border-red-500/50 hover:bg-white/10 hover:shadow-[0_0_50px_rgba(239,68,68,0.1)]'}
               `}
             >
                {/* Visual Accent */}
                {!m.isExorcised && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors" />
                )}
                
                <div className="flex justify-between items-start mb-6">
                   <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTagStyle(m.tag)}`}>
                      {m.tag}
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => toggleExorcised(m.id)}
                        className={`p-2 rounded-xl transition-all ${m.isExorcised ? 'text-emerald-500 bg-emerald-500/20' : 'text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                        title={m.isExorcised ? 'Undo Exorcism' : 'Exorcise Mistake'}
                      >
                         <Icons.Check />
                      </button>
                      <button 
                        onClick={() => deleteMistake(m.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                         <Icons.Trash />
                      </button>
                   </div>
                </div>

                <div className="mb-4">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{m.subject}</div>
                   <h4 className="text-xl font-black tracking-tighter leading-tight text-white">{m.chapter}</h4>
                </div>

                <div className="flex-1 mt-2">
                   <p className={`text-base font-medium italic leading-relaxed ${m.isExorcised ? 'line-through decoration-emerald-500/50 opacity-50' : 'text-slate-200'}`}>
                      "{m.correction}"
                   </p>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Recorded</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                   </div>
                   {m.isExorcised && (
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">Exorcised</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      </div>
                   )}
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

export default MistakeGraveyard;