import { VehicleInput, PredictionResponse, ExplanationResponse, ModelInfoResponse, HealthResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to retrieve model info' }));
    throw new Error(errorData.detail || `Server returned ${res.status}`);
  }
  return res.json();
}

export async function predictCarPrice(vehicle: VehicleInput): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Prediction request failed' }));
    throw new Error(errorData.detail || `Prediction failed (${res.status})`);
  }
  return res.json();
}

export async function explainPrediction(
  vehicle: VehicleInput,
  predictedPrice: number,
  userQuestion?: string
): Promise<ExplanationResponse> {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicle,
      predicted_price: predictedPrice,
      user_question: userQuestion || null
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Explanation request failed' }));
    throw new Error(errorData.detail || `Explanation failed (${res.status})`);
  }
  return res.json();
}
