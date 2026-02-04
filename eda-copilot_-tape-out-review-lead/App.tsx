
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisState, HistoryEntry, MultiLogAnalysisResult } from './types';
import { analyzeEDALogs } from './geminiService';
import AnalysisDashboard from './components/AnalysisDashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
    fileCount: 0,
  });

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [context, setContext] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('eda_copilot_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (result: MultiLogAnalysisResult) => {
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: `Review of ${result.logs.length} files (${result.overallVerdict})`,
      result
    };
    const updated = [newEntry, ...history].slice(0, 50); // Keep last 50
    setHistory(updated);
    localStorage.setItem('eda_copilot_history', JSON.stringify(updated));
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('eda_copilot_history', JSON.stringify(updated));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      error: null, 
      fileCount: files.length 
    }));

    // Construct historical context from previous runs to help model find recurring issues
    // Fix: access existing properties on MultiLogAnalysisResult (globalSummary instead of executiveSummary, removed topRecurringCauses)
    const recentHistoryContext = history.slice(0, 3).map(h => 
      `DATE: ${new Date(h.timestamp).toLocaleDateString()}\nVERDICT: ${h.result.overallVerdict}\nEXECUTIVE: ${h.result.globalSummary}`
    ).join('\n---\n');

    try {
      const logs = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          content: await f.text()
        }))
      );
      
      const analysis = await analyzeEDALogs(logs, userQuestion, context || recentHistoryContext);
      setState(prev => ({ ...prev, isAnalyzing: false, result: analysis }));
      saveToHistory(analysis);
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: err.message || "An unexpected error occurred during batch processing." 
      }));
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setState({
      isAnalyzing: false,
      result: null,
      error: null,
      fileCount: 0
    });
    setUserQuestion('');
    setContext('');
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setState({
      isAnalyzing: false,
      result: entry.result,
      error: null,
      fileCount: entry.result.logs.length
    });
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-emerald-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-xl">Σ</div>
              <div>
                <h1 className="text-lg font-black tracking-tighter">EDA COPILOT</h1>
                <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Autonomous Batch Authority</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${showHistory ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                History {history.length > 0 && `(${history.length})`}
              </button>
              {state.result && (
                <button 
                  onClick={reset}
                  className="px-4 py-2 text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all uppercase tracking-widest"
                >
                  Reset System
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {showHistory && (
          <div className="absolute top-0 right-4 w-96 max-h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Analysis History</h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
              {history.length === 0 && <p className="text-center py-10 text-slate-600 text-xs uppercase tracking-widest">No history yet</p>}
              {history.map(entry => (
                <div 
                  key={entry.id}
                  onClick={() => loadFromHistory(entry)}
                  className="p-3 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                      entry.result.overallVerdict === 'GO' ? 'bg-emerald-500/20 text-emerald-400' :
                      entry.result.overallVerdict === 'NO-GO' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {entry.result.overallVerdict}
                    </span>
                    <button 
                      onClick={(e) => deleteHistoryEntry(entry.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 text-xs p-1"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="text-xs font-bold text-slate-200 line-clamp-1">{entry.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!state.result && !state.isAnalyzing ? (
          <div className="max-w-2xl mx-auto mt-12 space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="text-center space-y-6">
              <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
                Tiered Intelligence Protocol v4.0
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none">Scale Your <span className="text-emerald-500 underline decoration-slate-800 underline-offset-8">Review.</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto">
                Autonomous Senior VLSI CAD Agent. Analyze 100s of logs at speed. 
                Full root-cause for critical failures. Fast tier-1 summary for the rest.
              </p>
            </div>

            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8 backdrop-blur-sm">
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Focus specific blocks or issues? (Optional)" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                />
                <textarea 
                  placeholder="Additional context (Revision, historical failures, project stage...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-200 placeholder:text-slate-700 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-sm"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <div 
                onClick={triggerUpload}
                className="group cursor-pointer border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-[2rem] py-16 flex flex-col items-center justify-center transition-all bg-slate-950/50"
              >
                <div className="w-20 h-20 bg-slate-900 group-hover:bg-emerald-500 group-hover:text-slate-950 rounded-full flex items-center justify-center transition-all mb-6 shadow-xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-xl font-black text-slate-200">Load EDA Logs</div>
                <p className="text-sm text-slate-500 mt-2 font-mono">Select one or many files (.log, .out, .txt)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".log,.txt,.out"
                  multiple
                />
              </div>
            </div>

            <div className="flex justify-center items-center gap-12 pt-10 border-t border-slate-800/50 grayscale opacity-40">
               <div className="text-center font-black">SYNTHESIS</div>
               <div className="text-center font-black">P&R</div>
               <div className="text-center font-black">STA</div>
               <div className="text-center font-black">DRC/LVS</div>
               <div className="text-center font-black">POWER</div>
            </div>
          </div>
        ) : state.isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-48 space-y-12">
            <div className="relative">
              <div className="w-48 h-48 border-[6px] border-slate-900 border-t-emerald-500 rounded-full animate-spin duration-700"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black text-white animate-pulse">Σ</span>
              </div>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-white tracking-tighter">Processing Batch Analysis...</h3>
              <p className="text-slate-500 font-mono text-sm">
                Executing tiered intelligence strategy on <b>{state.fileCount} logs</b>.
              </p>
              <div className="flex justify-center gap-4 text-[10px] font-black uppercase text-slate-600 tracking-widest mt-8">
                <span className="animate-pulse">Parsing</span>
                <span className="animate-pulse [animation-delay:200ms]">Classifying</span>
                <span className="animate-pulse [animation-delay:400ms]">Reasoning</span>
                <span className="animate-pulse [animation-delay:600ms]">Aggregating</span>
              </div>
            </div>
          </div>
        ) : state.error ? (
          <div className="max-w-xl mx-auto mt-20 bg-rose-500/5 border border-rose-500/20 p-12 rounded-[2.5rem] text-center space-y-8">
            <div className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto text-4xl font-black shadow-lg shadow-rose-500/20">!</div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-rose-400 tracking-tight">System Halted</h3>
              <p className="text-rose-200/60 leading-relaxed font-medium">{state.error}</p>
            </div>
            <button 
              onClick={reset}
              className="px-10 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all uppercase tracking-widest text-sm"
            >
              Reboot Protocol
            </button>
          </div>
        ) : (
          <AnalysisDashboard result={state.result!} />
        )}
      </main>

      <footer className="border-t border-slate-900 py-10 bg-slate-950/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 grayscale">
          <div className="text-[10px] font-black uppercase tracking-[0.4em]">Autonomous Silicon Governance</div>
          <div className="text-[10px] font-mono tracking-widest">GEMINI-3 PRO • HIGH-SPEED TIERED STRATEGY</div>
          <div className="text-[10px] uppercase font-bold">2025 VLSI CAD ARCHITECTS</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
