import React from 'react';
import { DollarSign, ShieldCheck, Tag, Info, CheckCircle2 } from 'lucide-react';
import { PredictionResponse } from '../types';

interface PriceDisplayProps {
  prediction: PredictionResponse;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ prediction }) => {
  const price = prediction.predicted_price;
  // Valuation bandwidth derived from model's empirical validation MAE (~$9,485 or 15%)
  const lowerBound = Math.max(0, Math.round(price * 0.85));
  const upperBound = Math.round(price * 1.15);

  return (
    <div className="glass-panel-glow rounded-2xl p-6 relative overflow-hidden">
      {/* Background subtle ambient highlight */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-brand-copper/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Price Output */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-copper uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Estimated Resale Valuation</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {prediction.formatted_price}
            </span>
            <span className="text-sm font-medium text-slate-400">
              USD
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Estimated private-party trading range:
            <span className="text-slate-200 font-mono font-medium">
              ${lowerBound.toLocaleString()} – ${upperBound.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Algorithm & Trust Badge */}
        <div className="flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-charcoal-700/60 pt-3 md:pt-0 md:pl-6 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-medium">Direct ML Pipeline Inference</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            {prediction.algorithm} (v{prediction.model_version})
          </span>
        </div>
      </div>

      {/* Vehicle Summary Badges */}
      <div className="mt-5 pt-4 border-t border-charcoal-800 flex flex-wrap gap-2 text-xs">
        {Object.entries(prediction.vehicle_summary).map(([key, val]) => (
          <div
            key={key}
            className="px-2.5 py-1 rounded-lg bg-charcoal-900 border border-charcoal-800 text-slate-300 flex items-center space-x-1"
          >
            <span className="text-slate-500 uppercase text-[10px]">{key}:</span>
            <span className="font-medium text-white">{String(val)}</span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-[11px] text-slate-500 leading-relaxed italic border-l-2 border-charcoal-700 pl-2.5">
        {prediction.disclaimer}
      </p>
    </div>
  );
};
