export interface VehicleInput {
  make: string;
  year: number;
  odometer: number;
  condition: string;
  cylinders: string;
  drive: string;
  fuel: string;
  transmission: string;
  type: string;
  title_status: string;
  paint_color: string;
}

export interface ContributingFactor {
  feature: string;
  display_name: string;
  value: any;
  relative_importance_pct: number;
  impact_direction: 'increases_value' | 'decreases_value' | 'neutral';
  insight: string;
}

export interface PredictionResponse {
  predicted_price: number;
  formatted_price: string;
  currency: string;
  model_version: string;
  algorithm: string;
  vehicle_summary: Record<string, any>;
  top_contributing_factors: ContributingFactor[];
  disclaimer: string;
}

export interface ExplanationResponse {
  predicted_price: number;
  formatted_price: string;
  explanation_source: 'rule_based_engine' | 'llm_gemini' | 'llm_openai' | string;
  summary: string;
  key_factors: string[];
  valuation_context: string;
  practical_checks: string[];
  disclaimer: string;
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
}

export interface ModelInfoResponse {
  model_version: string;
  algorithm: string;
  dataset: string;
  target_column: string;
  currency: string;
  numeric_features: string[];
  categorical_features: string[];
  all_supported_features: string[];
  feature_value_domains: {
    common_makes?: string[];
    condition?: string[];
    cylinders?: string[];
    drive?: string[];
    fuel?: string[];
    transmission?: string[];
    type?: string[];
    title_status?: string[];
    paint_color?: string[];
    [key: string]: any;
  };
  evaluation_metrics: {
    production_model?: {
      train: ModelMetrics;
      validation: ModelMetrics;
    };
    baseline_model?: {
      train: ModelMetrics;
      validation: ModelMetrics;
    };
    unconstrained_tree_overfitting_comparison?: {
      train: ModelMetrics;
      validation: ModelMetrics;
    };
    [key: string]: any;
  };
  feature_importances: Record<string, number>;
  overfitting_analysis: {
    unconstrained_train_r2?: number;
    unconstrained_val_r2?: number;
    regularized_train_r2?: number;
    regularized_val_r2?: number;
    finding?: string;
  };
  license_notice: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  artifacts_available: boolean;
  llm_configured: boolean;
  llm_provider: string;
  app_version: string;
}
