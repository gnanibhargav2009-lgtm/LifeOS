import React, { useState } from 'react';
import { Card, Input, Icons, Button } from './UI';
import { useLocalStorage, clearAllData } from '../hooks/useStorage';
import { UserProfile } from '../types';

const Settings: React.FC = () => {
  const [profile, setProfile] = useLocalStorage<UserProfile>('lifeos_profile', { name: '', photo: null });
  const [vaultPin, setVaultPin] = useLocalStorage<string | null>('lifeos_vault_pin', null);
  
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) { 
          alert("File is too large. Please select an image under 2MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(p => ({ ...p, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePin = () => {
    if (!oldPin || !newPin) return;
    if (oldPin !== vaultPin) {
      alert("Old PIN is incorrect.");
      return;
    }
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      alert("New PIN must be 4 digits.");
      return;
    }
    setVaultPin(newPin);
    setIsChangingPin(false);
    setOldPin('');
    setNewPin('');
    alert("Vault PIN updated successfully.");
  };

  return (
    <Card title="Configuration" className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-12">
        
        {/* Developer Highlight: GNANESWAR */}
        <section className="animate-fade-in">
           <div className="relative p-8 rounded-[40px] overflow-hidden border border-primary/30 bg-primary/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(251,191,36,0.15)] group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-1000" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="w-24 h-24 rounded-[28px] bg-slate-900 dark:bg-primary flex items-center justify-center text-white dark:text-black font-black text-4xl shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  GN
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">GNANESWAR</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm self-center md:self-auto">Project Architect</span>
                  </div>
                  <p className="text-base font-bold text-slate-600 dark:text-slate-300 mb-4 italic leading-relaxed">
                    "A JEE Aspirant crafting digital fortresses for elite preparation."
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commissioned</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">End of 2025</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Focus Level</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">JEE Advanced</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">Full Privacy LifeOS</span>
                     </div>
                  </div>
                </div>
              </div>
           </div>
        </section>

        <section className="flex flex-col md:flex-row gap-8 items-start animate-fade-in">
           <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center border-4 border-white dark:border-white/10 shadow-2xl">
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-slate-300">?</span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity font-bold uppercase tracking-widest backdrop-blur-sm">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            
            <div className="flex-1 w-full space-y-4 pt-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Identity</h3>
              <Input label="Display Name" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Enter your name" className="max-w-md" />
              <p className="text-xs text-slate-500">This name will appear on your dashboard sidebar.</p>
            </div>
        </section>
        
        <section className="animate-slide-up">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-white/10 pb-4 flex items-center gap-2">
             <Icons.Shield /> Security & Privacy
           </h3>
           <div className="glass p-6 rounded-2xl border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                 <div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Vault Protection</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                       Your diary is protected by a local 4-digit PIN. No cloud storage used.
                       <span className="block mt-2 font-bold text-amber-600 dark:text-amber-400">If PIN is lost, data is irrecoverable.</span>
                    </p>
                 </div>
                 <div className="shrink-0">
                    {!isChangingPin ? (
                       <Button variant="outline" size="sm" onClick={() => setIsChangingPin(true)} disabled={!vaultPin}>Change Code</Button>
                    ) : (
                       <div className="flex flex-col gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
                          <Input type="password" placeholder="Current" maxLength={4} value={oldPin} onChange={(e) => setOldPin(e.target.value)} className="text-center tracking-[0.5em] font-mono" />
                          <Input type="password" placeholder="New" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value)} className="text-center tracking-[0.5em] font-mono" />
                          <div className="flex gap-2 justify-end">
                             <Button size="sm" variant="ghost" onClick={() => { setIsChangingPin(false); setOldPin(''); setNewPin(''); }}>Cancel</Button>
                             <Button size="sm" onClick={handleChangePin}>Update</Button>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </section>

        <section className="animate-slide-up">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-white/10 pb-4">Tactical Manual</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { i: <Icons.Book />, t: "Diary (The Vault)", d: "A private encrypted space. Click the 'Info' icon in the panel to learn about auto-lock and local-only storage." },
                { i: <Icons.Calendar />, t: "Timetable", d: "Block-based scheduling. Use the 'Copy Previous Day' feature to maintain a consistent routine." },
                { i: <Icons.List />, t: "Tasks", d: "Focus-oriented list. Tracks your efficiency ratio in real-time to gamify productivity." },
                { i: <Icons.Zap />, t: "Habits", d: "A 66-day journey to mastery. Level up from Spark to Phoenix by maintaining daily streaks." },
                { i: <Icons.Droplet />, t: "Water", d: "Volume-based hydration milestones. Essential for maintaining cognitive peak during long JEE blocks." },
                { i: <Icons.Strategy />, t: "Strategy Trees", d: "Visualize complex projects as nodes. Break down 30-day exam sprints into tactical daily purposes." },
                { i: <Icons.Skull />, t: "Graveyard", d: "The high-performance error log. Tag mistakes by 'Cause of Death' to prevent re-occurrences." },
                { i: <Icons.Utensils />, t: "Meal Tracker", d: "Precision macro tracking. Monitor your Brain Fuel (Carbs) and Strength (Protein) for long-term health." },
              ].map((item, idx) => (
                 <div key={idx} className="group p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3 text-slate-800 dark:text-white">
                      <span className="text-primary bg-primary/10 p-2 rounded-xl">{item.i}</span>
                      <h4 className="font-bold text-lg">{item.t}</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.d}</p>
                  </div>
              ))}
           </div>
        </section>

        <div className="pt-8 border-t border-slate-200 dark:border-white/10">
          <Button variant="danger" size="sm" onClick={() => { if(confirm("Wipe all local data?")) clearAllData(); }}>Reset All Local Systems</Button>
        </div>
      </div>
    </Card>
  );
};

export default Settings;