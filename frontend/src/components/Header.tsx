import React from 'react';
import { Car, Sparkles, Activity, ShieldAlert, BarChart2 } from 'lucide-react';
import { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  onOpenMetrics: () => void;
  onOpenLimitations: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, onOpenMetrics, onOpenLimitations }) => {
  return (
    <header className="border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-copper to-amber-600 flex items-center justify-center shadow-lg shadow-brand-copper/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">AutoWise</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-copper/20 text-brand-copper rounded border border-brand-copper/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI ML
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Used Car Resale Price Estimator</p>
          </div>
        </div>

        {/* Status & Navigation Buttons */}
        <div className="flex items-center space-x-3">
          {health && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-charcoal-850 border border-charcoal-700 text-xs">
              <span className={`w-2 h-2 rounded-full ${health.model_loaded ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300">
                {health.model_loaded ? 'DecisionTree Pipeline Ready' : 'Model Degraded'}
              </span>
            </div>
          )}

          <button
            onClick={onOpenMetrics}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 hover:border-slate-600 rounded-lg transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Model Benchmark</span>
          </button>

          <button
            onClick={onOpenLimitations}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 hover:border-slate-600 rounded-lg transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Disclaimers</span>
          </button>
        </div>
      </div>
    </header>
  );
};
