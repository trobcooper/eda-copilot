
export type TapeOutDecision = 'GO' | 'CONDITIONAL GO' | 'NO-GO';

export interface Issue {
  title: string;
  impact: string;
}

export interface RootCauseEntry {
  cause: string;
  effect: string;
  confidence: number;
}

export interface FixStrategy {
  recommendation: string;
  cost: string;
  risk: string;
  debt: string;
}

export interface VerilogFix {
  title: string;
  summary: string;
  code: string;
}

export interface LogAnalysis {
  fileName: string;
  tool: string;
  decision: TapeOutDecision; 
  riskScore: number; 
  executiveSummary: string; 
  topIssues: Issue[]; 
  rootCauseAnalysis: RootCauseEntry[]; 
  counterfactualInsights: string; 
  fixStrategy: FixStrategy; 
  verilogFix?: VerilogFix; // New: RTL-level code fix
  predictiveOutcomes: string; 
  debugPlaybook: string; 
  valueMetrics: { 
    debugTimeSavedHours: number;
    iterationsAvoided: number;
    valueStatement: string;
  };
}

export interface MultiLogAnalysisResult {
  overallVerdict: TapeOutDecision;
  overallRiskScore: number;
  globalSummary: string;
  tierCounts: {
    green: number;
    yellow: number;
    red: number;
    critical: number;
  };
  logs: LogAnalysis[];
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  result: MultiLogAnalysisResult;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: MultiLogAnalysisResult | null;
  error: string | null;
  fileCount: number;
}
