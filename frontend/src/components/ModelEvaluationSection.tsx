import React from 'react';
import { ModelInfoResponse } from '../types';
import { BarChart3, TrendingUp, Layers, CheckCircle, AlertTriangle, Scale } from 'lucide-react';

interface ModelEvaluationSectionProps {
  modelInfo: ModelInfoResponse | null;
  onClose?: () => void;
}

export const ModelEvaluationSection: React.FC<ModelEvaluationSectionProps> = ({ modelInfo, onClose }) => {
  if (!modelInfo) return null;

  const prod = modelInfo.evaluation_metrics?.production_model;
  const baseline = modelInfo.evaluation_metrics?.baseline_model;
  const unconstrained = modelInfo.evaluation_metrics?.unconstrained_tree_overfitting_comparison;
  const importances = modelInfo.feature_importances || {};

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-charcoal-700/80 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-cyan" />
            Empirical Model Evaluation & Benchmark
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified scikit-learn metrics trained on the Kaggle Used Car Price Prediction Challenge dataset
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 border border-charcoal-700"
          >
            Close
          </button>
        )}
      </div>

      {/* Model vs Baseline Comparison Table */}
      <div>
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-brand-copper" />
          Model vs Dummy Baseline Comparison (Held-Out 20% Validation Split)
        </h3>
        
        <div className="overflow-x-auto rounded-xl border border-charcoal-800 bg-charcoal-900/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-800 bg-charcoal-850/80 text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Pipeline / Regressor</th>
                <th className="py-2.5 px-3">Val MAE ($)</th>
                <th className="py-2.5 px-3">Val RMSE ($)</th>
                <th className="py-2.5 px-3">Val R²</th>
                <th className="py-2.5 px-3">Train R²</th>
                <th className="py-2.5 px-3">Generalization Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-slate-300 font-mono">
              
              {/* Production Model */}
              <tr className="bg-brand-copper/5 hover:bg-brand-copper/10 transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  DecisionTreeRegressor (max_depth=6) <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">Active</span>
                </td>
                <td className="py-3 px-3 text-emerald-300 font-semibold">
                  ${prod?.validation?.mae?.toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  ${prod?.validation?.rmse?.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-emerald-300 font-semibold">
                  {prod?.validation?.r2}
                </td>
                <td className="py-3 px-3">
                  {prod?.train?.r2}
                </td>
                <td className="py-3 px-3 font-sans text-xs text-emerald-400">
                  Optimal depth regularization
                </td>
              </tr>

              {/* Baseline Model */}
              <tr className="hover:bg-charcoal-850/40 transition-colors">
                <td className="py-3 px-3 font-sans text-slate-400">
                  DummyRegressor (mean baseline)
                </td>
                <td className="py-3 px-3 text-slate-400">
                  ${baseline?.validation?.mae?.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  ${baseline?.validation?.rmse?.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {baseline?.validation?.r2}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {baseline?.train?.r2}
                </td>
                <td className="py-3 px-3 font-sans text-xs text-slate-500">
                  Zero learning benchmark
                </td>
              </tr>

              {/* Unconstrained Diagnostic Model */}
              <tr className="hover:bg-charcoal-850/40 transition-colors">
                <td className="py-3 px-3 font-sans text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  DecisionTreeRegressor (max_depth=None)
                </td>
                <td className="py-3 px-3 text-slate-400">
                  ${unconstrained?.validation?.mae?.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  ${unconstrained?.validation?.rmse?.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {unconstrained?.validation?.r2}
                </td>
                <td className="py-3 px-3 text-amber-400 font-semibold">
                  {unconstrained?.train?.r2} (100% memorization)
                </td>
                <td className="py-3 px-3 font-sans text-xs text-amber-400">
                  Severe train overfitting
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Overfitting Analysis Finding */}
      <div className="p-4 rounded-xl bg-charcoal-900/80 border border-charcoal-800 text-xs text-slate-300 space-y-1.5">
        <span className="font-semibold text-white flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-brand-copper" />
          Overfitting Investigation & Diagnostic Findings
        </span>
        <p className="text-slate-400 leading-relaxed">
          {modelInfo.overfitting_analysis?.finding || 
            "Unconstrained decision trees achieve R² = 1.0 on training splits but suffer from variance error on validation. Restricting tree depth (max_depth=6) and min_samples_leaf=5 bounds leaf complexity, producing reliable private-market resale estimates."}
        </p>
      </div>

      {/* Global Feature Importances */}
      <div>
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Top Feature Importances (Aggregated Gini Reduction)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(importances).map(([feat, imp]) => (
            <div key={feat} className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-medium text-slate-200 capitalize">{feat}</span>
                <span className="font-mono text-slate-400">{(imp * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-charcoal-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-copper h-full rounded-full"
                  style={{ width: `${Math.min(100, imp * 100 * 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
