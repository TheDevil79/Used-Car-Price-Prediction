import React, { useState } from 'react';
import { VehicleInput } from '../types';
import { Gauge, Calendar, Car, Fuel, Settings2, ShieldCheck, Palette, Sparkles } from 'lucide-react';

interface VehicleFormProps {
  onSubmit: (vehicle: VehicleInput) => void;
  isLoading: boolean;
  makes: string[];
}

const PRESETS: { label: string; vehicle: VehicleInput }[] = [
  {
    label: '2021 Ford Bronco (SUV, 60k mi)',
    vehicle: {
      make: 'ford',
      year: 2021,
      odometer: 60700,
      condition: 'good',
      cylinders: '4 cylinders',
      drive: '4wd',
      fuel: 'gas',
      transmission: 'automatic',
      type: 'suv',
      title_status: 'clean',
      paint_color: 'grey'
    }
  },
  {
    label: '2018 Toyota Camry (Sedan, 45k mi)',
    vehicle: {
      make: 'toyota',
      year: 2018,
      odometer: 45000,
      condition: 'excellent',
      cylinders: '4 cylinders',
      drive: 'fwd',
      fuel: 'gas',
      transmission: 'automatic',
      type: 'sedan',
      title_status: 'clean',
      paint_color: 'silver'
    }
  },
  {
    label: '2015 BMW 328i (Sedan, 75k mi)',
    vehicle: {
      make: 'bmw',
      year: 2015,
      odometer: 75000,
      condition: 'good',
      cylinders: '4 cylinders',
      drive: 'rwd',
      fuel: 'gas',
      transmission: 'automatic',
      type: 'sedan',
      title_status: 'clean',
      paint_color: 'black'
    }
  },
  {
    label: '2004 Ford Ranger (Truck, 288k mi)',
    vehicle: {
      make: 'ford',
      year: 2004,
      odometer: 288977,
      condition: 'fair',
      cylinders: '4 cylinders',
      drive: 'rwd',
      fuel: 'gas',
      transmission: 'manual',
      type: 'truck',
      title_status: 'clean',
      paint_color: 'brown'
    }
  }
];

export const VehicleForm: React.FC<VehicleFormProps> = ({ onSubmit, isLoading, makes }) => {
  const [formData, setFormData] = useState<VehicleInput>({
    make: 'toyota',
    year: 2018,
    odometer: 55000,
    condition: 'good',
    cylinders: '4 cylinders',
    drive: 'fwd',
    fuel: 'gas',
    transmission: 'automatic',
    type: 'sedan',
    title_status: 'clean',
    paint_color: 'black'
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'odometer' ? Number(value) : value
    }));
  };

  const handlePresetSelect = (preset: VehicleInput) => {
    setFormData(preset);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.make.trim()) {
      setValidationError('Please enter a vehicle make/brand.');
      return;
    }
    if (formData.year < 1950 || formData.year > 2026) {
      setValidationError('Model year must be between 1950 and 2026.');
      return;
    }
    if (formData.odometer < 0 || formData.odometer > 2000000) {
      setValidationError('Odometer mileage must be between 0 and 2,000,000 miles.');
      return;
    }

    setValidationError(null);
    onSubmit(formData);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-charcoal-700/60">
      
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-charcoal-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-copper" />
            Vehicle Details
          </h2>
          <p className="text-xs text-slate-400">Enter attributes or select a verified listing preset</p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-copper" /> Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(p.vehicle)}
              className="text-xs px-2.5 py-1 rounded-md bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white border border-charcoal-700 transition-all text-left"
            >
              {p.label.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {validationError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Row 1: Make, Year, Odometer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Make / Brand */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-brand-copper" />
              Make / Manufacturer
            </label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              list="makes-list"
              placeholder="e.g. Toyota, Ford, BMW"
              required
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <datalist id="makes-list">
              {makes.map((m, i) => (
                <option key={i} value={m.charAt(0).toUpperCase() + m.slice(1)} />
              ))}
            </datalist>
          </div>

          {/* Model Year */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
              Model Year
            </label>
            <input
              type="number"
              name="year"
              min={1950}
              max={2026}
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper rounded-xl px-3.5 py-2 text-sm text-white outline-none transition-all"
            />
          </div>

          {/* Odometer (Mileage) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Mileage (Miles)
            </label>
            <input
              type="number"
              name="odometer"
              min={0}
              max={2000000}
              step={100}
              value={formData.odometer}
              onChange={handleChange}
              required
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper rounded-xl px-3.5 py-2 text-sm text-white outline-none transition-all"
            />
            <div className="flex gap-1 mt-1.5">
              {[30000, 60000, 100000, 150000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, odometer: val }))}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-400 hover:text-slate-200"
                >
                  {val / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Condition, Body Type, Transmission */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Vehicle Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              <option value="like new">Like New (Mint)</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good (Standard)</option>
              <option value="fair">Fair (Wear evident)</option>
              <option value="salvage">Salvage / Damaged</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Body Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="pickup">Pickup</option>
              <option value="truck">Truck</option>
              <option value="coupe">Coupe</option>
              <option value="hatchback">Hatchback</option>
              <option value="convertible">Convertible</option>
              <option value="van">Van / Minivan</option>
              <option value="wagon">Wagon</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-slate-400" />
              Transmission
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual (Stick shift)</option>
              <option value="other">Other (CVT / Dual-Clutch)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Cylinders, Drivetrain, Fuel, Title, Color */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Cylinders</label>
            <select
              name="cylinders"
              value={formData.cylinders}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="4 cylinders">4 Cylinders</option>
              <option value="6 cylinders">6 Cylinders (V6)</option>
              <option value="8 cylinders">8 Cylinders (V8)</option>
              <option value="10 cylinders">10 Cylinders</option>
              <option value="other">Electric / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Drivetrain</label>
            <select
              name="drive"
              value={formData.drive}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="fwd">FWD (Front-Wheel)</option>
              <option value="4wd">4WD / AWD</option>
              <option value="rwd">RWD (Rear-Wheel)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Fuel className="w-3 h-3 text-amber-400" /> Fuel
            </label>
            <select
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="gas">Gasoline</option>
              <option value="hybrid">Hybrid</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric (EV)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Title
            </label>
            <select
              name="title_status"
              value={formData.title_status}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="clean">Clean Title</option>
              <option value="rebuilt">Rebuilt Title</option>
              <option value="salvage">Salvage Title</option>
              <option value="missing">Missing Title</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Palette className="w-3 h-3 text-purple-400" /> Paint Color
            </label>
            <select
              name="paint_color"
              value={formData.paint_color}
              onChange={handleChange}
              className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="silver">Silver</option>
              <option value="grey">Grey</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="brown">Brown</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-copper via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-copper/20 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Vehicle with DecisionTree Pipeline...</span>
              </>
            ) : (
              <>
                <span>Estimate Resale Price</span>
                <span className="text-white/70">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
