import React from 'react';
import { ContributingFactor } from '../types';
import { TrendingUp, TrendingDown, Minus, SlidersHorizontal } from 'lucide-react';

interface FactorBreakdownProps {
  factors: ContributingFactor[];
}

export const FactorBreakdown: React.FC<FactorBreakdownProps> = ({ factors }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-charcoal-700/60">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-charcoal-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-copper" />
            Decision Tree Feature Attribution
          </h3>
          <p className="text-xs text-slate-400">
            How individual vehicle parameters influenced this model estimate
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {factors.map((factor, index) => {
          const isUp = factor.impact_direction === 'increases_value';
          const isDown = factor.impact_direction === 'decreases_value';

          return (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-charcoal-900/70 border border-charcoal-800 hover:border-charcoal-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-slate-200">
                    {factor.display_name}
                  </span>
                  <span className="text-xs font-mono text-slate-400 px-1.5 py-0.5 rounded bg-charcoal-800">
                    {String(factor.value)}
                  </span>
                </div>

                {/* Impact Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-slate-400">
                    {factor.relative_importance_pct}% model weight
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                      isUp
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                        : isDown
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isUp && <TrendingUp className="w-3 h-3" />}
                    {isDown && <TrendingDown className="w-3 h-3" />}
                    {!isUp && !isDown && <Minus className="w-3 h-3" />}
                    <span>
                      {isUp ? 'Value Support' : isDown ? 'Depreciation Pressure' : 'Baseline'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Progress bar representing model feature weight */}
              <div className="w-full bg-charcoal-800 h-1.5 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full rounded-full ${
                    isUp ? 'bg-emerald-500' : isDown ? 'bg-rose-500' : 'bg-brand-copper'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, factor.relative_importance_pct * 2))}%` }}
                />
              </div>

              {/* Grounded Insight */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {factor.insight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
