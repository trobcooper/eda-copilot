import React, { useState } from 'react';
import { MultiLogAnalysisResult, LogAnalysis } from '../types';
import RiskMeter from './RiskMeter';
import DecisionBadge from './DecisionBadge';

interface AnalysisDashboardProps {
  result: MultiLogAnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const [selectedLog, setSelectedLog] = useState<LogAnalysis | null>(() => {
    if (!result?.logs || result.logs.length === 0) return null;
    return result.logs.find(l => l.decision === 'NO-GO' || (l.riskScore || 0) > 70) || result.logs[0];
  });

  if (!result || !result.logs) return <div className="p-20 text-center text-slate-500 font-mono">CRITICAL_SYSTEM_ERROR: NULL_RESULT</div>;
  if (!selectedLog) return <div className="p-20 text-center text-slate-500 font-mono">NULL_LOG_SELECTION</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* GLOBAL AUTHORITY HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-2xl border border-slate-800/50">
            <DecisionBadge decision={result.overallVerdict || 'NO-GO'} />
            <div className="pr-6 text-right hidden md:block">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Authority Token</div>
              <div className="text-xs font-mono text-slate-400">#{(Math.random() * 1000000).toFixed(0)}</div>
            </div>
          </div>
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <span className="text-8xl font-black">Σ</span>
            </div>
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Master Executive Summary</h3>
            <p className="text-xl text-slate-100 leading-relaxed font-semibold">
              {result.globalSummary || "Consolidated analysis summary pending."}
            </p>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <RiskMeter score={result.overallRiskScore || 0} />
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 grid grid-cols-4 gap-4">
            {Object.entries(result.tierCounts || { green: 0, yellow: 0, red: 0, critical: 0 }).map(([tier, count]) => (
              <div key={tier} className="text-center group">
                <div className={`text-2xl font-black transition-transform group-hover:scale-110 ${
                  tier === 'green' ? 'text-emerald-400' :
                  tier === 'yellow' ? 'text-amber-400' :
                  tier === 'red' ? 'text-rose-400' : 'text-purple-400'
                }`}>{count || 0}</div>
                <div className="text-[8px] uppercase font-black text-slate-600 tracking-tighter">{tier}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LOG INVENTORY SIDEBAR */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Design Assets</h3>
             <span className="text-[10px] font-mono text-slate-700">{result.logs.length} Artifacts</span>
          </div>
          <div className="max-h-[850px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {result.logs.map((log, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedLog(log)}
                className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                  selectedLog?.fileName === log.fileName 
                    ? 'bg-slate-800 border-slate-600 ring-2 ring-emerald-500/10' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {selectedLog?.fileName === log.fileName && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                    log.decision === 'GO' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.decision === 'NO-GO' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {log.decision || 'NO-GO'}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono">{(log.riskScore || 0)}% Risk</span>
                </div>
                <div className="font-bold text-xs text-slate-100 truncate group-hover:text-white transition-colors">{log.fileName || 'LOG_FILE'}</div>
                <div className="mt-1 text-[8px] text-slate-500 font-mono uppercase truncate opacity-60 tracking-widest">{log.tool || 'GENERIC'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 10-POINT INSPECTION PANEL */}
        <div className="xl:col-span-9">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 space-y-12 min-h-[800px] shadow-2xl">
            <div className="flex justify-between items-end border-b border-slate-800/50 pb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Log Inspection</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter">{selectedLog.fileName || 'Analysis Report'}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-slate-400 font-mono text-xs uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">{selectedLog.tool || 'EDA Tool'}</span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-slate-500 text-xs font-medium italic">Confidence: {Math.round((selectedLog.rootCauseAnalysis?.[0]?.confidence || 0.8) * 100)}%</span>
                </div>
              </div>
              <div className="text-right">
                 <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Risk Quotient</div>
                 <div className={`text-4xl font-black ${selectedLog.riskScore > 70 ? 'text-rose-500' : selectedLog.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {(selectedLog.riskScore || 0)}%
                 </div>
              </div>
            </div>

            {/* Points 03 - 05: The Core Logic */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-800"></span> 03. Executive Summary
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-xl italic font-medium selection:bg-emerald-500/40">
                    "{selectedLog.executiveSummary || 'No technical summary provided.'}"
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-px bg-rose-900/50"></span> 04. Critical Failure Points
                  </h3>
                  <div className="grid gap-3">
                    {(selectedLog.topIssues || []).length > 0 ? selectedLog.topIssues?.map((issue, i) => (
                      <div key={i} className="bg-slate-950/60 p-5 rounded-2xl border border-rose-500/10 hover:border-rose-500/30 transition-all">
                        <div className="text-sm font-bold text-slate-100">{issue.title || 'Artifact Error'}</div>
                        <div className="text-[10px] text-rose-500/70 mt-1 uppercase font-mono tracking-tight">{issue.impact || 'Critical Impact'}</div>
                      </div>
                    )) : <div className="text-xs text-slate-600 italic">Structural analysis complete. No violations detected.</div>}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-5 space-y-10">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-px bg-amber-900/50"></span> 05. Causal Traceability
                  </h3>
                  <div className="space-y-4">
                    {(selectedLog.rootCauseAnalysis || []).length > 0 ? selectedLog.rootCauseAnalysis?.map((rc, i) => (
                      <div key={i} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="text-[9px] font-mono text-emerald-500">{Math.round((rc.confidence || 0.5) * 100)}% Match</div>
                        </div>
                        <div className="text-xs text-slate-200 leading-relaxed">
                          <span className="text-amber-500 font-black uppercase text-[9px] mr-2 tracking-tighter">Root Cause:</span> 
                          {rc.cause || 'Under deterministic review'}
                        </div>
                        <div className="h-px bg-slate-800/50 w-full"></div>
                        <div className="text-xs text-slate-400 leading-relaxed">
                          <span className="text-slate-600 font-black uppercase text-[9px] mr-2 tracking-tighter">Downstream:</span> 
                          {rc.effect || 'Observational impact analysis'}
                        </div>
                      </div>
                    )) : <div className="text-xs text-slate-600 italic">Primary causal logic remains stable.</div>}
                  </div>
                </section>
              </div>
            </div>

            {/* RTL FIX SECTION (Optional) */}
            {selectedLog.verilogFix && (
              <section className="bg-blue-500/[0.03] border border-blue-500/20 p-10 rounded-[2rem] shadow-lg animate-in fade-in zoom-in-95 duration-700">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-8 h-px bg-blue-500/20"></span> RTL Modification (Synthesizable Verilog)
                  </h3>
                  <div className="text-[9px] font-mono text-blue-500/60 uppercase">Standard Horizontal RTL</div>
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-950/40 p-6 rounded-2xl border border-blue-500/10">
                    <div className="text-lg font-bold text-white mb-2">{selectedLog.verilogFix.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">{selectedLog.verilogFix.summary}</p>
                  </div>
                  <div className="relative group">
                    <div className="absolute top-4 right-4 text-[8px] font-black text-slate-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Source Code</div>
                    <pre className="bg-slate-950 p-8 rounded-3xl border border-slate-800/80 font-mono text-[11px] text-blue-100/90 leading-relaxed overflow-x-auto whitespace-pre custom-scrollbar shadow-inner selection:bg-blue-500/30">
                      <code>{selectedLog.verilogFix.code}</code>
                    </pre>
                  </div>
                </div>
              </section>
            )}

            {/* Points 06 & 08: Insights & Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <section className="bg-slate-950/30 p-8 rounded-3xl border border-slate-800/50">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">06. Counterfactual Analysis</h3>
                  <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">
                    {selectedLog.counterfactualInsights || "Metric delta estimation unavailable."}
                  </p>
               </section>
               <section className="bg-slate-950/30 p-8 rounded-3xl border border-slate-800/50">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">08. Predictive Outcome Modeling</h3>
                  <div className="flex items-start gap-4">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      (selectedLog.predictiveOutcomes || '').includes('PASS') ? 'bg-emerald-500/10 text-emerald-500' :
                      (selectedLog.predictiveOutcomes || '').includes('FAIL') ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      Next Run
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{selectedLog.predictiveOutcomes || "Predictive modeling engine offline."}</p>
                  </div>
               </section>
            </div>

            {/* Point 07: Implementation Strategy */}
            <section className="bg-emerald-500/[0.03] border border-emerald-500/10 p-10 rounded-[2rem] shadow-inner">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-emerald-500/20"></span> 07. Authorized Fix Strategy
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Architectural Recommendation</div>
                    <div className="text-lg font-bold text-slate-100 leading-tight bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      {selectedLog.fixStrategy?.recommendation || "Manual intervention required."}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Implementation Cost-Benefit</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{selectedLog.fixStrategy?.cost || "Undefined engineering cost."}</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] font-black text-rose-600/70 uppercase mb-2 tracking-widest">Execution Risk Assessment</div>
                    <div className="text-xs text-slate-400 leading-relaxed italic">{selectedLog.fixStrategy?.risk || "Risk profile undefined."}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-amber-600/70 uppercase mb-2 tracking-widest">Technical Debt Accumulation</div>
                    <div className="text-xs text-amber-400/60 leading-relaxed">{selectedLog.fixStrategy?.debt || "No secondary debt recorded."}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Point 09: Debug Playbook */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-4 h-px bg-purple-900/50"></span> 09. Debug Playbook (Level-3 Command)
              </h3>
              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap shadow-inner selection:bg-purple-500/20">
                {selectedLog.debugPlaybook || "Playbook generation skipped for non-critical artifacts."}
              </div>
            </section>

            {/* Point 10: Quantitative Value Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-800">
               <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-center group hover:border-emerald-500/30 transition-colors">
                  <div className="text-[9px] text-slate-600 font-black uppercase mb-1 tracking-widest">MTTD Reduction</div>
                  <div className="text-3xl font-black text-emerald-400 group-hover:scale-110 transition-transform">{selectedLog.valueMetrics?.debugTimeSavedHours || 0}h</div>
               </div>
               <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-center group hover:border-emerald-500/30 transition-colors">
                  <div className="text-[9px] text-slate-600 font-black uppercase mb-1 tracking-widest">Closed-Loop Savings</div>
                  <div className="text-3xl font-black text-emerald-400 group-hover:scale-110 transition-transform">{selectedLog.valueMetrics?.iterationsAvoided || 0}</div>
               </div>
               <div className="md:col-span-1 flex items-center justify-center italic text-[11px] text-slate-500 leading-snug px-6 border-l border-slate-800/50">
                  {selectedLog.valueMetrics?.valueStatement || "Efficiency optimized via autonomous review protocol."}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;