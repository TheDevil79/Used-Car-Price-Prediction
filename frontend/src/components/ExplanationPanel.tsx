import React from 'react';
import { ExplanationResponse } from '../types';
import { Bot, CheckCircle, ShieldAlert, FileText, ClipboardCheck, Sparkles } from 'lucide-react';

interface ExplanationPanelProps {
  explanation: ExplanationResponse | null;
  isLoading: boolean;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ explanation, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6 shadow-xl border border-charcoal-700/60 flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-8 h-8 border-2 border-brand-copper/30 border-t-brand-copper rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Synthesizing grounded explanation & inspection guidelines...</p>
      </div>
    );
  }

  if (!explanation) return null;

  const isLLM = explanation.explanation_source.startsWith('llm_');

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-charcoal-700/60 space-y-5">
      
      {/* Header & Source Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-charcoal-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-copper/20 text-brand-copper flex items-center justify-center border border-brand-copper/30">
            {isLLM ? <Sparkles className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Valuation Analysis</h3>
            <p className="text-xs text-slate-400">Grounded in vehicle specs and historical model weights</p>
          </div>
        </div>

        {/* Source Badge */}
        <span
          className={`self-start sm:self-auto text-[11px] px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5 ${
            isLLM
              ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
              : 'bg-charcoal-800 text-slate-300 border-charcoal-700'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
          Source: {isLLM ? `LLM Synthesis (${explanation.explanation_source})` : 'Transparent Rule-Based Engine'}
        </span>
      </div>

      {/* Narrative Summary */}
      <div className="bg-charcoal-900/60 rounded-xl p-4 border border-charcoal-800 text-sm text-slate-200 leading-relaxed space-y-2 whitespace-pre-line">
        {explanation.summary}
      </div>

      {/* Key Factors List */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-brand-copper" />
          Primary Market Drivers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {explanation.key_factors.map((factor, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-charcoal-900/50 border border-charcoal-800 text-slate-300 flex items-start space-x-2">
              <span className="text-brand-copper font-bold">•</span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Due-Diligence Checklist */}
      <div className="pt-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ClipboardCheck className="w-4 h-4 text-emerald-400" />
          Practical Inspection & Verification Checklist
        </h4>
        <div className="space-y-2 text-xs">
          {explanation.practical_checks.map((check, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-charcoal-900/70 border border-charcoal-800/80 flex items-start space-x-2.5 text-slate-300"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistical Context & Non-Causal Distinction */}
      <div className="p-3.5 rounded-xl bg-charcoal-850/60 border border-charcoal-700/60 text-xs text-slate-400 leading-relaxed flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300 block mb-0.5">Statistical Correlation vs Causal Valuation</span>
          {explanation.valuation_context}
        </div>
      </div>
    </div>
  );
};
