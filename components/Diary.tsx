import React, { useEffect, useState, useRef } from 'react';
import { Card, TextArea, Button, Icons } from './UI';
import { useLocalStorage } from '../hooks/useStorage';
import TutorialOverlay from './TutorialOverlay';

interface DiaryProps {
  selectedDate: string; // YYYY-MM-DD
}

const DIARY_VAULT_KEY = 'lifeos_vault_pin';

const Diary: React.FC<DiaryProps> = ({ selectedDate }) => {
  const [entries, setEntries] = useLocalStorage<Record<string, string>>('lifeos_diary_entries', {});
  const [vaultPin, setVaultPin] = useLocalStorage<string | null>(DIARY_VAULT_KEY, null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // State for content management
  const [content, setContent] = useState('');
  
  // State for Vault Security
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Track previous date to trigger lock on change
  const prevDateRef = useRef(selectedDate);
  
  // Determine if we need to show setup or unlock screen
  const isSetupMode = !vaultPin;

  // Sync content with date changes
  useEffect(() => {
    setContent(entries[selectedDate] || '');
  }, [selectedDate, entries]);

  // Lock diary when date changes
  useEffect(() => {
    if (prevDateRef.current !== selectedDate) {
       // Only lock if a PIN is actually set. 
       if (vaultPin) {
           setIsUnlocked(false);
           setInputPin('');
           setIsSuccess(false);
       }
       prevDateRef.current = selectedDate;
    }
  }, [selectedDate, vaultPin]);

  // Handle PIN input
  const handlePinInput = (digit: string) => {
    if (inputPin.length < 4 && !isSuccess) {
      const newPin = inputPin + digit;
      setInputPin(newPin);
      setIsError(false);

      if (newPin.length === 4) {
        // Validate immediately
        setTimeout(() => {
          if (isSetupMode) {
             setVaultPin(newPin);
             setIsSuccess(true);
             setTimeout(() => {
                 setIsUnlocked(true);
                 setInputPin('');
                 setIsSuccess(false);
             }, 800);
          } else {
             if (newPin === vaultPin) {
               setIsSuccess(true);
               setTimeout(() => {
                   setIsUnlocked(true);
                   setInputPin('');
                   setIsSuccess(false);
               }, 800);
             } else {
               setIsError(true);
               setInputPin(''); // Clear input for retry
               setTimeout(() => setIsError(false), 500); 
             }
          }
        }, 300); // Wait slightly for the user to see the 4th dot fill
      }
    }
  };

  const handleBackspace = () => {
    if (!isSuccess) {
        setInputPin(prev => prev.slice(0, -1));
        setIsError(false);
    }
  };

  const handleManualLock = () => {
    setIsUnlocked(false);
    setInputPin('');
    setIsSuccess(false);
  };

  const handleSave = (newContent: string) => {
    setContent(newContent);
    setEntries((prev) => ({
      ...prev,
      [selectedDate]: newContent,
    }));
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const tutorialSteps = [
    { title: "Vault Setup", text: "Create a 4-digit PIN to encrypt your daily entries. This is stored locally and never leaves your device." },
    { title: "Date Navigation", text: "Each entry is tied to a specific calendar date. Change the date in the sidebar to review past thoughts." },
    { title: "Auto-Lock", text: "The vault automatically locks when you navigate away or change the date, ensuring complete privacy." },
    { title: "Word Counter", text: "Keep track of your reflective output with the character and word counters at the bottom." }
  ];

  // --- Premium Keypad Component ---
  const Keypad = () => (
     <div className={`relative z-20 flex flex-col items-center justify-center p-8 transition-transform duration-300 w-full max-w-sm mx-auto ${isError ? 'animate-shake' : ''}`}>
        
        {/* Status Header */}
        <div className="mb-8 flex flex-col items-center gap-3">
            <div className={`
                p-5 rounded-full bg-gradient-to-br shadow-2xl transition-all duration-700 relative overflow-hidden group
                ${isSuccess 
                    ? 'from-emerald-400 to-green-600 shadow-emerald-500/50 scale-110' 
                    : isSetupMode 
                        ? 'from-blue-500 to-indigo-600 shadow-blue-500/40' 
                        : 'from-amber-400 to-orange-600 shadow-amber-500/40'
                }
            `}>
                <div className="absolute inset-0 bg-white/30 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-white transform transition-transform duration-500">
                    {isSuccess ? <Icons.Unlock /> : isSetupMode ? <Icons.Shield /> : <Icons.Lock />}
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                    {isSuccess ? "Access Granted" : isSetupMode ? "Secure Vault" : "Vault Locked"}
                </h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] opacity-80">
                    {isSuccess ? "Welcome back" : isSetupMode ? "Create 4-Digit PIN" : "Enter Credentials"}
                </p>
            </div>
        </div>

        {/* Pin Dots */}
        <div className="mb-12 flex gap-4 h-4 items-center justify-center">
           {[...Array(4)].map((_, i) => (
             <div 
               key={i} 
               className={`
                  rounded-full transition-all duration-300 shadow-inner
                  ${i < inputPin.length 
                     ? isSuccess 
                        ? 'w-4 h-4 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-110' 
                        : isError
                            ? 'w-4 h-4 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                            : 'w-4 h-4 bg-slate-900 dark:bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110' 
                     : 'w-3 h-3 bg-slate-300 dark:bg-white/10'
                  }
               `} 
             />
           ))}
        </div>
        
        {/* Numpad Grid */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString())}
                className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none"
              >
                {/* Button Background & Border */}
                <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-sm group-hover:bg-white/50 dark:group-hover:bg-white/10 transition-colors shadow-sm" />
                
                {/* Number */}
                <span className="relative z-10 text-3xl font-light text-slate-800 dark:text-white font-sans group-hover:scale-110 transition-transform">
                    {num}
                </span>
              </button>
           ))}
           
           {/* Bottom Row */}
           <div /> {/* Spacer */}
           
           <button
             onClick={() => handlePinInput('0')}
             className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none"
           >
             <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-sm group-hover:bg-white/50 dark:group-hover:bg-white/10 transition-colors shadow-sm" />
             <span className="relative z-10 text-3xl font-light text-slate-800 dark:text-white font-sans group-hover:scale-110 transition-transform">0</span>
           </button>
           
           <button
             onClick={handleBackspace}
             className="w-20 h-20 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors active:scale-90 active:text-red-400 focus:outline-none"
             aria-label="Backspace"
           >
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>
           </button>
        </div>
     </div>
  );

  return (
    <Card 
      title={`Dear Diary,`} 
      action={
        <div className="flex items-center gap-4">
             <span className="hidden md:block text-slate-400 dark:text-slate-500 font-medium tracking-wide text-sm animate-fade-in">
                {formatDateDisplay(selectedDate)}
             </span>
             <Button variant="ghost" size="sm" onClick={() => setShowTutorial(true)} title="Tutorial">
                <Icons.Info />
             </Button>
             {isUnlocked && (
               <Button variant="ghost" size="sm" onClick={handleManualLock} title="Lock Diary">
                 <Icons.Lock />
               </Button>
             )}
        </div>
      }
      className="h-full flex flex-col min-h-[600px] relative overflow-hidden"
    >
      {showTutorial && (
        <TutorialOverlay 
          title="The Vault"
          description="Your absolute private space for daily reflections and psychological decompression."
          steps={tutorialSteps}
          tip="Mental exhaustion is often as critical as physical. Use this space to 'dump' your stresses before focused study sessions."
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Dynamic Animated Background Blobs for Atmosphere */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isUnlocked ? 'opacity-30' : 'opacity-100'}`}>
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000" />
         <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-pink-500/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000" />
      </div>

      {/* Vault Overlay Container */}
      {!isUnlocked && (
         <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 backdrop-blur-[20px] bg-slate-100/80 dark:bg-[#0B0F19]/90">
             {/* Glass Panel */}
             <div className="relative z-10 p-10 rounded-[40px] bg-white/10 dark:bg-black/20 border border-white/20 shadow-2xl backdrop-blur-xl animate-scale-press">
                <Keypad />
             </div>
         </div>
      )}

      {/* Actual Diary Content */}
      <div className={`flex-1 relative z-10 flex flex-col mt-4 transition-all duration-1000 transform ${!isUnlocked ? 'blur-xl opacity-0 scale-95 pointer-events-none' : 'blur-0 opacity-100 scale-100'}`}>
        
        <div className="flex-1 relative group rounded-[24px] bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/5 shadow-inner backdrop-blur-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
           {/* Editor Toolbar Visuals */}
           <div className="h-12 border-b border-white/20 dark:border-white/5 flex items-center px-4 gap-2 opacity-50">
               <div className="w-3 h-3 rounded-full bg-red-400/50" />
               <div className="w-3 h-3 rounded-full bg-amber-400/50" />
               <div className="w-3 h-3 rounded-full bg-green-400/50" />
           </div>

           <TextArea
              value={content}
              onChange={(e) => handleSave(e.target.value)}
              placeholder="What's on your mind today?"
              className="flex-1 w-full p-8 text-xl leading-9 bg-transparent focus:outline-none resize-none font-serif text-slate-800 dark:text-slate-200 placeholder-slate-400/40"
              spellCheck={false}
              disabled={!isUnlocked} 
            />
            
            <div className="h-8 flex items-center justify-end px-6 border-t border-white/20 dark:border-white/5 bg-white/10 dark:bg-white/5 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
               {content.length} Characters • {content.split(/\s+/).filter(w => w.length > 0).length} Words
            </div>
        </div>
      </div>
    </Card>
  );
};

export default Diary;