import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Input, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import { MealEntry, MealType } from '../types';
import TutorialOverlay from './TutorialOverlay';

interface MealTrackerProps {
  selectedDate: string;
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const MealTracker: React.FC<MealTrackerProps> = ({ selectedDate }) => {
  const [entries, setEntries] = useLocalStorage<MealEntry[]>('lifeos_meals', []);
  const [isAdding, setIsAdding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [formData, setFormData] = useState<Partial<MealEntry>>({
    type: 'Breakfast',
    time: '08:00',
    food: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  const dayEntries = useMemo(() => 
    entries.filter(e => e.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time))
  , [entries, selectedDate]);

  const totals = useMemo(() => {
    return dayEntries.reduce((acc, curr) => ({
      calories: acc.calories + (Number(curr.calories) || 0),
      protein: acc.protein + (Number(curr.protein) || 0),
      carbs: acc.carbs + (Number(curr.carbs) || 0),
      fats: acc.fats + (Number(curr.fats) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [dayEntries]);

  const handleAdd = () => {
    if (!formData.food) return;
    const newEntry: MealEntry = {
      id: uuidv4(),
      date: selectedDate,
      type: formData.type as MealType,
      time: formData.time || '00:00',
      food: formData.food,
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fats: Number(formData.fats) || 0,
    };
    setEntries(prev => [...prev, newEntry]);
    setIsAdding(false);
    setFormData({ type: 'Breakfast', time: '08:00', food: '', calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const tutorialSteps = [
    { title: "Select Meal Category", text: "Choose between Breakfast, Lunch, Snack, or Dinner to categorize your ingestion." },
    { title: "Log Macros", text: "Input Calories, Protein, Carbs, and Fats. This helps you maintain peak cognitive and physical performance." },
    { title: "Review Dashboard", text: "The top dashboard aggregates your daily intake. Use it to balance your energy levels throughout the day." },
    { title: "Time Tracking", text: "Set the exact time of each meal to visualize your metabolic windows." }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {showTutorial && (
        <TutorialOverlay 
           title="Fueling & Nutrition"
           description="Monitor your fuel intake to sustain the high-pressure demands of competitive preparation."
           steps={tutorialSteps}
           tip="Consistent protein intake is essential for memory consolidation and sustained focus during long study blocks."
           onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-none flex flex-col items-center justify-center py-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 relative z-10">Total Calories</div>
          <div className="text-4xl font-black text-white relative z-10">{totals.calories}</div>
          <div className="text-[10px] text-slate-500 font-bold mt-1 relative z-10">KCAL / DAY</div>
        </Card>
        <Card className="bg-blue-950/20 border-blue-500/20 flex flex-col items-center justify-center py-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2 relative z-10">Protein</div>
          <div className="text-4xl font-black text-white relative z-10">{totals.protein}g</div>
          <div className="text-[10px] text-slate-500 font-bold mt-1 relative z-10">STRENGTH</div>
        </Card>
        <Card className="bg-amber-950/20 border-amber-500/20 flex flex-col items-center justify-center py-10 relative overflow-hidden group">
           <div className="absolute inset-0 bg-amber-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-2 relative z-10">Carbs</div>
          <div className="text-4xl font-black text-white relative z-10">{totals.carbs}g</div>
          <div className="text-[10px] text-slate-500 font-bold mt-1 relative z-10">BRAIN FUEL</div>
        </Card>
        <Card className="bg-purple-950/20 border-purple-500/20 flex flex-col items-center justify-center py-10 relative overflow-hidden group">
           <div className="absolute inset-0 bg-purple-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2 relative z-10">Fats</div>
          <div className="text-4xl font-black text-white relative z-10">{totals.fats}g</div>
          <div className="text-[10px] text-slate-500 font-bold mt-1 relative z-10">HORMONAL BALANCE</div>
        </Card>
      </div>

      <Card 
        title="Fueling Log" 
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="glass" onClick={() => setShowTutorial(true)}><Icons.Info /></Button>
            <Button size="sm" variant="primary" onClick={() => setIsAdding(true)}><Icons.Plus /> Log Meal</Button>
          </div>
        }
      >
        {isAdding && (
          <div className="mb-10 p-8 rounded-[32px] bg-white/5 border border-white/10 animate-slide-up space-y-6">
            <h3 className="text-xl font-black">Register Nutrients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                      >
                        {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <Input label="Time" type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                 </div>
                 <Input label="Food Description" placeholder="e.g. Oats with Almonds" value={formData.food} onChange={e => setFormData({...formData, food: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Calories (kcal)" type="number" value={formData.calories} onChange={e => setFormData({...formData, calories: Number(e.target.value)})} />
                 <Input label="Protein (g)" type="number" value={formData.protein} onChange={e => setFormData({...formData, protein: Number(e.target.value)})} />
                 <Input label="Carbs (g)" type="number" value={formData.carbs} onChange={e => setFormData({...formData, carbs: Number(e.target.value)})} />
                 <Input label="Fats (g)" type="number" value={formData.fats} onChange={e => setFormData({...formData, fats: Number(e.target.value)})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Bury Data</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {MEAL_TYPES.map(type => {
            const meals = dayEntries.filter(m => m.type === type);
            return (
              <div key={type} className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 pl-2 mt-4">{type}</h4>
                {meals.length === 0 ? (
                  <div className="p-6 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    No {type} registered
                  </div>
                ) : (
                  meals.map(meal => (
                    <div key={meal.id} className="group p-6 rounded-[32px] bg-white/5 border border-white/10 flex flex-col md:flex-row gap-6 items-center transition-all hover:bg-white/10">
                       <div className="shrink-0 flex flex-col items-center">
                          <span className="text-xs font-black text-primary mb-1">{meal.time}</span>
                          <div className="w-1 h-8 bg-primary/20 rounded-full" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <h5 className="text-lg font-black text-white mb-2">{meal.food}</h5>
                          <div className="flex flex-wrap justify-center md:justify-start gap-4">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kcal</span>
                                <span className="text-sm font-bold text-white">{meal.calories}</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">P</span>
                                <span className="text-sm font-bold text-blue-400">{meal.protein}g</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">C</span>
                                <span className="text-sm font-bold text-amber-400">{meal.carbs}g</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">F</span>
                                <span className="text-sm font-bold text-purple-400">{meal.fats}g</span>
                             </div>
                          </div>
                       </div>
                       <button onClick={() => deleteEntry(meal.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all">
                          <Icons.Trash />
                       </button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default MealTracker;