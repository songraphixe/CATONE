
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Gavel, 
  Terminal,
  AlertTriangle,
  Award,
  RefreshCw,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { GameState, GameStage, LogEntry, ValueEquation } from './types';
import { getConsultantFeedback } from './services/geminiService';

// --- Helper Components ---

const StatCard = ({ label, value, icon: Icon, color, suffix = "" }: { label: string, value: string | number, icon: any, color: string, suffix?: string }) => (
  <div className={`p-3 md:p-4 border border-${color}-900/50 bg-slate-900/80 rounded flex items-center gap-3 md:gap-4 terminal-glow transition-all duration-300`}>
    <div className={`p-2 bg-${color}-500/10 rounded`}>
      <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${color}-400`} />
    </div>
    <div>
      <p className="text-[10px] uppercase opacity-40 font-bold tracking-widest">{label}</p>
      <p className={`text-lg md:text-xl font-black text-${color}-400 tabular-nums`}>{value}{suffix}</p>
    </div>
  </div>
);

const LogViewer = ({ logs }: { logs: LogEntry[] }) => (
  <div className="bg-slate-950/80 border border-slate-800 rounded p-4 h-40 overflow-y-auto font-mono text-xs scrollbar-hide flex flex-col-reverse">
    {logs.map((log, i) => (
      <div key={i} className="mb-1 flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
        <span className="opacity-20 shrink-0">[{log.timestamp}]</span>
        <span className={
          log.type === 'success' ? 'text-green-400' : 
          log.type === 'error' ? 'text-red-400' : 
          log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
        }>
          {log.type === 'success' ? '>> ' : log.type === 'error' ? '!! ' : log.type === 'warning' ? '?? ' : ':: '} {log.message}
        </span>
      </div>
    ))}
  </div>
);

const TypewriterText = ({ text, speed = 30 }: { text: string, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <p className="leading-relaxed">{displayedText}<span className="inline-block w-1.5 h-4 ml-1 bg-purple-500 animate-pulse align-middle"></span></p>;
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<GameState & { introFinished: boolean }>({
    cash: 10000,
    brand: 0,
    stage: 0,
    status: 'playing',
    logs: [],
    isThinking: false,
    introFinished: false,
    consultantMessage: "STANDBY. BOOTING STRATEGY ENGINE..."
  });

  const [valueEq, setValueEq] = useState<ValueEquation>({
    dream: 5,
    likelihood: 5,
    timeDelay: 5,
    effort: 5
  });

  const [energy, setEnergy] = useState({
    warm: 25,
    cold: 25,
    content: 25,
    ads: 25
  });

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      logs: [{
        message,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }, ...prev.logs].slice(0, 50)
    }));
  }, []);

  const handleConsultantFeedback = async (choice: string, result: string) => {
    setState(prev => ({ ...prev, isThinking: true }));
    const feedback = await getConsultantFeedback(state.stage, choice, result);
    setState(prev => ({ ...prev, consultantMessage: feedback, isThinking: false }));
  };

  const updateStats = (cashChange: number, brandChange: number) => {
    setState(prev => {
      const newCash = prev.cash + cashChange;
      const newBrand = prev.brand + brandChange;
      
      let newStatus = prev.status;
      if (newCash <= 0) newStatus = 'lost';
      if (newBrand <= -50) newStatus = 'lost';
      if (prev.stage === 8 && newCash >= 100000 && newBrand >= 50) newStatus = 'won';

      return { ...prev, cash: newCash, brand: newBrand, status: newStatus };
    });
  };

  const nextStage = () => {
    setState(prev => ({ ...prev, stage: prev.stage + 1 }));
    addLog(`SYSTEM UPDATE: Advancing to Sector ${state.stage + 1}`, 'info');
  };

  const startGame = () => {
    setState(prev => ({ 
      ...prev, 
      stage: 1, 
      introFinished: true, 
      consultantMessage: "Welcome. You are a commodity. Let's fix that. Sector 1: Positioning."
    }));
    addLog("SIMULATION STARTED: INITIALIZING RUNWAY $10,000", "success");
  };

  const resetGame = () => {
    setState({
      cash: 10000,
      brand: 0,
      stage: 0,
      status: 'playing',
      logs: [],
      isThinking: false,
      introFinished: false,
      consultantMessage: "STANDBY. BOOTING STRATEGY ENGINE..."
    });
    setValueEq({ dream: 5, likelihood: 5, timeDelay: 5, effort: 5 });
    setEnergy({ warm: 25, cold: 25, content: 25, ads: 25 });
  };

  const renderStage = () => {
    if (state.stage === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <Cpu className="w-24 h-24 text-purple-500 animate-pulse" />
          <h2 className="text-4xl font-black text-white">CATEGORY OF ONE</h2>
          <p className="max-w-md text-slate-400 text-sm">
            In 8 sectors, you will either become Category King or be ground down into a commodity.
          </p>
          <button onClick={startGame} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 font-bold text-white rounded flex items-center gap-2">
            INITIALIZE RUNWAY <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    switch (state.stage) {
      case GameStage.POSITIONING:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Target className="text-purple-400" /> Sector 1: Positioning</h2>
            <p className="italic text-sm">A competitor launches a product 10% cheaper than yours.</p>
            <div className="grid gap-3">
              <button onClick={() => { updateStats(-2000, -15); handleConsultantFeedback("Price Drop", "Race to the bottom."); nextStage(); }} className="p-4 border border-slate-800 hover:bg-slate-900 rounded text-left">A: Lower prices to match.</button>
              <button onClick={() => { updateStats(-4000, 5); handleConsultantFeedback("More Features", "Complexity kills."); nextStage(); }} className="p-4 border border-slate-800 hover:bg-slate-900 rounded text-left">B: Add features to justify price.</button>
              <button onClick={() => { updateStats(0, 25); handleConsultantFeedback("Niche Down", "Blue Ocean Strategy."); nextStage(); }} className="p-4 border border-purple-500/50 bg-purple-900/10 rounded text-left">C: Niche down and rename category.</button>
            </div>
          </div>
        );
      case GameStage.OFFER:
        const score = (valueEq.dream * valueEq.likelihood) / (Math.max(1, valueEq.timeDelay) * Math.max(1, valueEq.effort));
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Zap className="text-yellow-400" /> Sector 2: The Offer</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px]">DREAM OUTCOME</label><input type="range" min="1" max="10" value={valueEq.dream} onChange={e => setValueEq({...valueEq, dream: +e.target.value})} className="w-full" /></div>
              <div><label className="text-[10px]">LIKELIHOOD</label><input type="range" min="1" max="10" value={valueEq.likelihood} onChange={e => setValueEq({...valueEq, likelihood: +e.target.value})} className="w-full" /></div>
              <div><label className="text-[10px]">TIME DELAY</label><input type="range" min="1" max="10" value={valueEq.timeDelay} onChange={e => setValueEq({...valueEq, timeDelay: +e.target.value})} className="w-full" /></div>
              <div><label className="text-[10px]">EFFORT</label><input type="range" min="1" max="10" value={valueEq.effort} onChange={e => setValueEq({...valueEq, effort: +e.target.value})} className="w-full" /></div>
            </div>
            <p className="text-center font-black text-2xl">SCORE: {score.toFixed(1)}</p>
            <button onClick={() => { updateStats(score >= 5 ? 7000 : -3000, score >= 5 ? 15 : -5); nextStage(); }} className="w-full py-4 bg-yellow-600 font-bold rounded">DEPLOY OFFER</button>
          </div>
        );
      case GameStage.MESSAGING:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold"><MessageSquare className="text-blue-400" /> Sector 3: Messaging</h2>
            <button onClick={() => { updateStats(-1500, -15); nextStage(); }} className="w-full p-4 border border-slate-800 hover:bg-slate-900 rounded">"We leverage synergistic paradigms."</button>
            <button onClick={() => { updateStats(4000, 10); nextStage(); }} className="w-full p-4 border border-blue-500/50 bg-blue-900/10 rounded">"We get your weekends back."</button>
          </div>
        );
      case GameStage.CONTENT:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold"><TrendingUp className="text-green-400" /> Sector 4: Content</h2>
            <button onClick={() => { updateStats(-1000, 0); nextStage(); }} className="w-full p-4 border border-slate-800 rounded">"Buy our great product."</button>
            <button onClick={() => { updateStats(3000, 20); nextStage(); }} className="w-full p-4 border border-green-500/50 bg-green-900/10 rounded">"The Insider's Guide to [Niche]."</button>
          </div>
        );
      case GameStage.HUNT:
        const totalEnergy = energy.warm + energy.cold + energy.content + energy.ads;
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold"><Briefcase className="text-orange-400" /> Sector 5: The Hunt</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(energy).map(k => <input key={k} type="number" value={energy[k as keyof typeof energy]} onChange={e => setEnergy({...energy, [k]: +e.target.value})} className="bg-slate-900 p-2 rounded" />)}
            </div>
            <button disabled={totalEnergy > 100} onClick={() => { updateStats((totalEnergy * 100) - (energy.ads * 200), 10); nextStage(); }} className="w-full py-4 bg-orange-600 rounded">HUNT ({totalEnergy}/100)</button>
          </div>
        );
      case GameStage.FORTRESS:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold"><ShieldCheck className="text-emerald-400" /> Sector 6: Money</h2>
            <button onClick={() => { updateStats(-20000, 20); nextStage(); }} className="w-full p-4 border border-slate-800 rounded">Buy a Rolex (Liabilities)</button>
            <button onClick={() => { updateStats(-10000, 10); nextStage(); }} className="w-full p-4 border border-emerald-500/50 bg-emerald-900/10 rounded">Reinvest in Ads (Assets)</button>
          </div>
        );
      case GameStage.HIRING:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold"><Users className="text-pink-400" /> Sector 7: Hiring</h2>
            <button onClick={() => { updateStats(-12000, -5); nextStage(); }} className="w-full p-4 border border-slate-800 rounded">The Mercenary ($150k, 9-5)</button>
            <button onClick={() => { updateStats(-6000, 20); nextStage(); }} className="w-full p-4 border border-pink-500/50 bg-pink-900/10 rounded">The Patriot (Mission-driven)</button>
          </div>
        );
      case GameStage.CLOSE:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold"><Gavel className="text-red-400" /> Sector 8: Closing</h2>
            <p className="italic">"It's too expensive."</p>
            <button onClick={() => { updateStats(-10000, -20); nextStage(); }} className="w-full p-4 border border-slate-800 rounded">"I'll give you a discount."</button>
            <button onClick={() => { updateStats(40000, 30); nextStage(); }} className="w-full p-4 border border-red-500/50 bg-red-900/10 rounded">"Money aside, does it solve the problem?"</button>
          </div>
        );
      default: return null;
    }
  };

  if (state.status === 'lost') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center space-y-6">
      <div className="max-w-md border-2 border-red-600 bg-red-950/20 p-8 rounded shadow-xl">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-4xl font-black text-red-500">BANKRUPT</h1>
        <p className="text-red-200">The market shows no mercy to commodities.</p>
        <button onClick={resetGame} className="w-full mt-6 py-4 bg-red-600 text-white font-bold rounded">REBOOT</button>
      </div>
    </div>
  );

  if (state.status === 'won') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center space-y-6">
      <div className="max-w-md border-2 border-green-500 bg-green-950/20 p-8 rounded shadow-xl">
        <Award className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-4xl font-black text-green-500">CATEGORY KING</h1>
        <p className="text-green-200">You are the only choice.</p>
        <button onClick={resetGame} className="w-full mt-6 py-4 bg-green-600 text-white font-bold rounded">NEW VENTURE</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="text-purple-500 w-8 h-8" />
          <h1 className="text-xl font-black text-white">CATEGORY <span className="text-purple-500">OF ONE</span></h1>
        </div>
        {state.introFinished && (
          <div className="flex gap-4">
            <StatCard label="Runway" value={`$${state.cash.toLocaleString()}`} icon={TrendingUp} color="green" />
            <StatCard label="Brand" value={state.brand} icon={Target} color="purple" />
          </div>
        )}
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 min-h-[500px] flex flex-col shadow-2xl backdrop-blur-md">
            {renderStage()}
          </div>
          {state.introFinished && <LogViewer logs={state.logs} />}
        </div>
        <div className="bg-slate-900/60 border border-purple-900/30 rounded-lg p-6 h-full flex flex-col shadow-2xl backdrop-blur-md min-h-[400px]">
          <h3 className="text-xs font-black text-purple-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <Users className="w-4 h-4" /> The Consultant
          </h3>
          <div className="flex-1 text-sm font-mono leading-loose">
            {state.isThinking ? <p className="animate-pulse">Analyzing...</p> : <TypewriterText text={state.consultantMessage} />}
          </div>
          {state.introFinished && (
            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(state.stage / 8) * 100}%` }}></div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
