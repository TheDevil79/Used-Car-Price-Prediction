import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VehicleForm } from './components/VehicleForm';
import { PriceDisplay } from './components/PriceDisplay';
import { FactorBreakdown } from './components/FactorBreakdown';
import { ExplanationPanel } from './components/ExplanationPanel';
import { AiChatAssistant } from './components/AiChatAssistant';
import { ModelEvaluationSection } from './components/ModelEvaluationSection';
import { LimitationsModal } from './components/LimitationsModal';

import {
  VehicleInput,
  PredictionResponse,
  ExplanationResponse,
  ModelInfoResponse,
  HealthResponse
} from './types';
import { fetchHealth, fetchModelInfo, predictCarPrice, explainPrediction } from './api';
import { Car, AlertCircle, ArrowUpRight, BarChart2, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [makes, setMakes] = useState<string[]>([]);

  const [currentVehicle, setCurrentVehicle] = useState<VehicleInput | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);

  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showMetricsModal, setShowMetricsModal] = useState<boolean>(false);
  const [showLimitationsModal, setShowLimitationsModal] = useState<boolean>(false);

  // Load initial health and model metadata on mount
  useEffect(() => {
    async function init() {
      try {
        const h = await fetchHealth();
        setHealth(h);
      } catch (e) {
        console.warn('Backend health check error:', e);
      }

      try {
        const info = await fetchModelInfo();
        setModelInfo(info);
        if (info.feature_value_domains?.common_makes) {
          setMakes(info.feature_value_domains.common_makes);
        }
      } catch (e) {
        console.warn('Model metadata fetch error:', e);
      }
    }
    init();
  }, []);

  const handleVehicleSubmit = async (vehicle: VehicleInput) => {
    setIsPredicting(true);
    setErrorMessage(null);
    setCurrentVehicle(vehicle);

    try {
      // 1. Get Prediction
      const pred = await predictCarPrice(vehicle);
      setPrediction(pred);
      setIsPredicting(false);

      // 2. Automatically trigger AI Explanation
      setIsExplaining(true);
      try {
        const expl = await explainPrediction(vehicle, pred.predicted_price);
        setExplanation(expl);
      } catch (explErr: any) {
        console.error('Explanation fetch failed:', explErr);
      } finally {
        setIsExplaining(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to estimate resale price. Please verify backend is running.');
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 text-slate-100">
      
      {/* Navigation Header */}
      <Header
        health={health}
        onOpenMetrics={() => setShowMetricsModal(true)}
        onOpenLimitations={() => setShowLimitationsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Valuation Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-8 border border-charcoal-800">
          <div className="max-w-3xl space-y-2 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-copper/10 border border-brand-copper/30 text-brand-copper text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trained on Kaggle Competition Dataset</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              AI-Powered Used Car Price Estimator
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Evaluate realistic used vehicle valuations with scikit-learn decision trees, inspect feature attributions, and consult our transparent AI explanation assistant with practical mechanical due-diligence checklists.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-copper/10 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Workspace Layout: Form on Left, Output & AI on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <VehicleForm
              onSubmit={handleVehicleSubmit}
              isLoading={isPredicting}
              makes={makes}
            />

            {/* Quick Benchmark Summary Card */}
            {modelInfo && (
              <div className="glass-panel rounded-2xl p-5 border border-charcoal-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-brand-cyan" />
                    Model Performance Highlights
                  </span>
                  <button
                    onClick={() => setShowMetricsModal(true)}
                    className="text-[11px] text-brand-copper hover:underline flex items-center gap-0.5"
                  >
                    Full Report <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-charcoal-900 border border-charcoal-800">
                    <div className="text-[10px] text-slate-500 uppercase">Val MAE</div>
                    <div className="font-mono text-emerald-400 font-bold mt-0.5">
                      ${modelInfo.evaluation_metrics?.production_model?.validation?.mae?.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-charcoal-900 border border-charcoal-800">
                    <div className="text-[10px] text-slate-500 uppercase">Val RMSE</div>
                    <div className="font-mono text-slate-300 font-bold mt-0.5">
                      ${modelInfo.evaluation_metrics?.production_model?.validation?.rmse?.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-charcoal-900 border border-charcoal-800">
                    <div className="text-[10px] text-slate-500 uppercase">Val R²</div>
                    <div className="font-mono text-emerald-400 font-bold mt-0.5">
                      {modelInfo.evaluation_metrics?.production_model?.validation?.r2}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Trained on 778 historical listings across 28 columns with held-out validation split.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Prediction, Explanation, Chat (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Empty State when no prediction has been executed */}
            {!prediction && !isPredicting && (
              <div className="glass-panel rounded-2xl p-10 text-center border border-charcoal-800/80 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-charcoal-850 border border-charcoal-700 mx-auto flex items-center justify-center text-slate-400 shadow-inner">
                  <Car className="w-8 h-8 text-brand-copper" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-white">No Vehicle Evaluated Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select a preset or input your car's make, year, mileage, and specifications in the form on the left, then click <strong>Estimate Resale Price</strong>.
                  </p>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-charcoal-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Real ML Pipeline</span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-charcoal-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-copper shrink-0 mt-0.5" />
                    <span>Feature Attribution</span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-charcoal-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                    <span>AI Assistant Q&A</span>
                  </div>
                </div>
              </div>
            )}

            {/* When prediction is available */}
            {prediction && (
              <div className="space-y-6 animate-fade-in">
                {/* 1. Price Display */}
                <PriceDisplay prediction={prediction} />

                {/* 2. Factor Attribution Breakdown */}
                {prediction.top_contributing_factors && (
                  <FactorBreakdown factors={prediction.top_contributing_factors} />
                )}

                {/* 3. AI Explanation Panel */}
                <ExplanationPanel
                  explanation={explanation}
                  isLoading={isExplaining}
                />

                {/* 4. Follow-up AI Assistant Q&A */}
                <AiChatAssistant
                  vehicle={currentVehicle}
                  predictedPrice={prediction.predicted_price}
                />
              </div>
            )}
          </div>
        </div>

        {/* Model Evaluation & Benchmarks Expanded Section */}
        <div className="pt-6">
          <ModelEvaluationSection modelInfo={modelInfo} />
        </div>
      </main>

      {/* Model Metrics Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ModelEvaluationSection
              modelInfo={modelInfo}
              onClose={() => setShowMetricsModal(false)}
            />
          </div>
        </div>
      )}

      {/* Legal Limitations & Disclaimers Modal */}
      <LimitationsModal
        isOpen={showLimitationsModal}
        onClose={() => setShowLimitationsModal(false)}
        licenseNotice={modelInfo?.license_notice}
      />

      {/* Footer */}
      <footer className="border-t border-charcoal-800 bg-charcoal-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} AutoWise AI — Academic Machine Learning College Assignment Project.</p>
          <p className="font-mono text-[11px] text-slate-500">
            DecisionTreeRegressor • FastAPI • React 18 • TypeScript • Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};
