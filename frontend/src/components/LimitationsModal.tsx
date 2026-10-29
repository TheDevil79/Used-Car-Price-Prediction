import React from 'react';
import { X, ShieldAlert, Database, AlertCircle, FileText } from 'lucide-react';

interface LimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseNotice?: string;
}

export const LimitationsModal: React.FC<LimitationsModalProps> = ({ isOpen, onClose, licenseNotice }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-charcoal-800 hover:bg-charcoal-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 pb-3 border-b border-charcoal-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Model Limitations & Legal Disclaimers</h3>
            <p className="text-xs text-slate-400">Responsible AI and dataset usage guidelines</p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          
          {/* Section 1: Non-Appraisal Statement */}
          <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-700/70 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-brand-copper" />
              Not a Certified Appraisal or Purchase Guarantee
            </div>
            <p className="text-slate-400">
              AutoWise AI outputs are statistical point-estimates derived from historical marketplace listings. They do not constitute a formal appraisal, guaranteed dealer trade-in quote, insurance value assessment, or binding purchase offer.
            </p>
          </div>

          {/* Section 2: Omitted Variables */}
          <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-700/70 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-cyan" />
              Unobserved Marketplace Variables
            </div>
            <p className="text-slate-400">
              The regression pipeline relies solely on tabular listing features. It cannot observe physical defects, frame rust, latent mechanical issues (e.g. transmission slip or head gasket leaks), aftermarket modifications, tire condition, smoker history, or pet odor—all of which heavily impact actual transactional prices.
            </p>
          </div>

          {/* Section 3: Dataset Licensing */}
          <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-700/70 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              Dataset Licensing & Competition Terms
            </div>
            <p className="text-slate-400">
              Trained on data from the <strong className="text-slate-200">Kaggle Used Car Price Prediction Challenge</strong>. The competition dataset is shared under Non-Commercial and Share-Alike conditions (CC BY-NC-SA 4.0 terms). This software is intended strictly for academic, educational, and personal evaluation. Any commercial deployment requires independent licensing review and verification.
            </p>
            {licenseNotice && (
              <p className="font-mono text-[11px] text-slate-500 pt-1 border-t border-charcoal-800">
                Notice: {licenseNotice}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-medium text-xs transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
