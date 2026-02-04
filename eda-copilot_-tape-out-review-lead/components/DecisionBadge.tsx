
import React from 'react';
import { TapeOutDecision } from '../types';

interface DecisionBadgeProps {
  decision: TapeOutDecision | string;
}

const DecisionBadge: React.FC<DecisionBadgeProps> = ({ decision }) => {
  const configs: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
    'GO': {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      icon: '✓',
      label: 'GO FOR TAPE-OUT'
    },
    'CONDITIONAL GO': {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      icon: '!',
      label: 'CONDITIONAL GO'
    },
    'NO-GO': {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/50',
      text: 'text-rose-400',
      icon: '✕',
      label: 'TAPE-OUT BLOCKED'
    }
  };

  // Normalize the input to handle potential minor variations from AI output
  const normalizedDecision = (decision || '').toString().toUpperCase().trim();
  
  // Resolve the config, fallback to NO-GO if unknown to be safe in a hardware context
  const config = configs[normalizedDecision] || configs['NO-GO'];

  return (
    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-colors duration-300 ${config.bg} ${config.border} ${config.text}`}>
      <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-current/20 text-2xl font-bold">
        {config.icon}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Official Decision Status</div>
        <div className="text-2xl font-black">{config.label}</div>
      </div>
    </div>
  );
};

export default DecisionBadge;
