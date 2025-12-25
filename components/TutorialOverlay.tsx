import React from 'react';
import { Card, Button, Icons } from './UI';

interface TutorialOverlayProps {
  title: string;
  description: string;
  steps: { title: string; text: string }[];
  tip?: string;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ title, description, steps, tip, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel p-8 md:p-12 rounded-[40px] border-white/20 shadow-2xl animate-scale-press">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all"
        >
          <Icons.X />
        </button>

        <div className="mb-8">
           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Tactical Guide</div>
           <h2 className="text-3xl font-black tracking-tight mb-4">{title}</h2>
           <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
        </div>

        <div className="space-y-6 mb-10">
           {steps.map((step, i) => (
             <div key={i} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs">{i+1}</div>
                <div>
                   <h4 className="font-bold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                   <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.text}</p>
                </div>
             </div>
           ))}
        </div>

        {tip && (
           <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-8">
              <div className="flex gap-3">
                 <div className="text-amber-500 shrink-0"><Icons.Zap /></div>
                 <div>
                    <h5 className="font-black text-xs uppercase tracking-widest text-amber-600 mb-1">Pro Tip</h5>
                    <p className="text-sm text-amber-700/80 dark:text-amber-400/80 font-medium">{tip}</p>
                 </div>
              </div>
           </div>
        )}

        <Button onClick={onClose} className="w-full py-4 text-sm tracking-[0.2em] uppercase">Understood</Button>
      </div>
    </div>
  );
};

export default TutorialOverlay;