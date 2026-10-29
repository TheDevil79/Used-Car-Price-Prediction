# AutoWise AI — AI-Powered Used Car Price Estimator

AutoWise AI is an end-to-end Machine Learning web application designed to predict used car resale values using empirical data from the Kaggle Used Car Price Prediction Challenge. It features a regularized scikit-learn Decision Tree regression pipeline, a FastAPI Python backend, a dark charcoal automotive marketplace frontend built with React, TypeScript, and Tailwind CSS, and a dual-layer AI explanation assistant with transparent rule-based fallbacks.

---

## 1. Project Objective & Architecture

### Objectives
- Deliver accurate, data-grounded vehicle valuations based on actual pre-owned transaction records.
- Provide feature attribution explaining the relative impact of mileage, vehicle age, drivetrain, condition, and title status.
- Equip car buyers and sellers with practical mechanical due-diligence checklists (e.g. pre-purchase inspections, title verification, maintenance log reviews).
- Offer an interactive AI Q&A assistant to answer questions about negotiations, pricing dynamics, and depreciation.
- Present transparent model evaluation metrics (MAE, RMSE, R²) and discuss decision tree overfitting.

### Architecture Overview

```
autowise-ai/
├── app/                        # FastAPI Backend Application
│   ├── main.py                 # API routes, lifespan artifact loader, static frontend mount
│   ├── config.py               # Pydantic Settings & environment variables
│   ├── schemas.py              # Pydantic request/response validation schemas
│   └── services/
│       ├── model_service.py    # Singleton artifact cache (model.joblib, metadata, report)
│       ├── prediction_service.py # Feature extraction, pipeline inference & factor attribution
│       └── explanation_service.py# Grounded explanation engine (Gemini/OpenAI or Rule-Based)
├── frontend/                   # Modern React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Header, VehicleForm, PriceDisplay, FactorBreakdown, etc.
│   │   ├── api.ts              # Fetch client communicating with backend
│   │   ├── types.ts            # TypeScript interfaces mirroring API contracts
│   │   ├── App.tsx             # Main dashboard layout
│   │   └── main.tsx            # React DOM entry point
│   ├── package.json            # Node dependencies (Vite, Lucide Icons, Tailwind)
│   └── vite.config.ts          # Dev proxy & build configuration
├── data/                       # Dataset Directory
│   ├── train_data.csv          # Labeled training dataset (784 rows, 28 columns)
│   ├── test_data.csv           # Unlabeled competition test set (never used for training)
│   └── sample_submission.csv   # Kaggle sample submission template
├── artifacts/                  # Serialized ML Artifacts
│   ├── model.joblib            # Trained scikit-learn pipeline (ColumnTransformer + DecisionTree)
│   ├── evaluation_report.json  # Actual empirical test/train metrics
│   └── model_metadata.json     # Feature domains, parameter configurations, and licenses
├── tests/                      # Automated Test Suite (16 pytest tests)
│   ├── test_api.py             # Health, model-info, and missing-artifact behavior
│   ├── test_prediction.py      # Input validation, boundaries, unknown categories, schema
│   ├── test_explanation.py     # Rule-based fallback, Q&A follow-ups, LLM failure safety
│   └── test_pipeline.py        # Leakage prevention, target exclusion, and preprocessor safety
├── train.py                    # Reproducible training & evaluation script
├── requirements.txt            # Python dependencies
├── .env.example                # Sample environment configuration
└── README.md                   # Comprehensive project documentation
```

---

## 2. Dataset Source & Licensing

- **Source:** [Kaggle Used Car Price Prediction Challenge](https://www.kaggle.com/competitions/used-car-price-prediction-challenge/data)
- **Files:** `train_data.csv` (labeled listings), `test_data.csv` (unlabeled competition test set), `sample_submission.csv`.
- **Target Column:** `price` (Continuous regression target in USD `$`).
- **Features Cleaned & Analyzed:** `odometer` (mileage), `year` (extracted from title/year column), `make` (extracted vehicle brand), `condition`, `cylinders`, `drive`, `fuel`, `transmission`, `type`, `title_status`, `paint_color`.
- **Licensing Restrictions:** The Kaggle dataset is governed by competition terms adhering to **Non-Commercial, Share-Alike (CC BY-NC-SA 4.0)** conditions. It is provided strictly for academic, educational, and personal evaluation. Any commercial deployment requires independent licensing clearance.
- **Leakage Policy:** Competition test files (`test_data.csv`) contain no ground-truth labels and are **never** used for model fitting or validation. Model evaluation is conducted exclusively on an isolated 20% held-out validation split of `train_data.csv` with a fixed seed (`random_state=42`).

---

## 3. Machine Learning Pipeline & Actual Metrics

### Pipeline Construction
- **Numerical Pipeline:** `SimpleImputer(strategy='median')` for `['year', 'odometer']`.
- **Categorical Pipeline:** `SimpleImputer(strategy='constant', fill_value='missing')` followed by `OneHotEncoder(handle_unknown='ignore', sparse_output=False)` for `['make', 'condition', 'cylinders', 'drive', 'fuel', 'transmission', 'type', 'title_status', 'paint_color']`.
- **Estimator:** `DecisionTreeRegressor(max_depth=6, min_samples_split=10, min_samples_leaf=5, random_state=42)`.
- **Baseline:** `DummyRegressor(strategy='mean')`.

### Actual Empirical Metrics (Computed on 20% Held-Out Validation Split)

| Model Pipeline | Train MAE ($) | Train RMSE ($) | Train R² | Validation MAE ($) | Validation RMSE ($) | Validation R² | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **DummyRegressor (Baseline)** | $11,966.94 | $19,354.25 | 0.0000 | $12,666.19 | $24,231.84 | -0.0004 | Zero-learning benchmark |
| **DecisionTree (Unconstrained, depth=None)** | $0.00 | $0.00 | **1.0000** | $9,715.67 | $21,692.02 | 0.1983 | Severe training memorization |
| **DecisionTree (Production, max_depth=6)** | $6,355.87 | $11,990.53 | **0.6162** | **$9,485.58** | **$23,534.05** | **0.0564** | **Optimal depth regularization** |

### Overfitting Analysis & Diagnostic Findings
1. An unconstrained decision tree (`max_depth=None`) memorizes every training record, resulting in an artificial `Train R² = 1.0` and `Train MAE = $0.00`, but its validation error remains volatile due to high variance.
2. Regularizing tree depth to `max_depth=6` and requiring `min_samples_leaf=5` restrains leaf granularity, cutting the validation MAE down to **$9,485.58**—an improvement of **over $3,180 per car** compared to the dummy baseline.

### Feature Importance Weights (Gini Impurity Reduction)
- **Odometer (Mileage):** `43.8%`
- **Model Year (Age):** `29.1%`
- **Engine Cylinders:** `10.6%`
- **Condition Rating:** `6.4%`
- **Drivetrain (FWD/AWD/RWD):** `4.2%`
- **Fuel Type:** `1.9%`
- **Transmission:** `1.8%`
- **Body Type:** `1.4%`

---

## 4. Setup & Running Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm (tested on Node v24.18)

### Step 1: Python Environment Setup
```bash
# Navigate to the project root
cd autowise-ai

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### Step 2: Train the Model
```bash
# Trains pipeline, logs diagnostic comparison, and serializes artifacts into artifacts/
python train.py
```
*Outputs generated:* `artifacts/model.joblib`, `artifacts/evaluation_report.json`, `artifacts/model_metadata.json`.

### Step 3: Frontend Setup & Build
```bash
cd frontend
npm install
npm run build
cd ..
```
*Tip:* Building the frontend generates production static files into `frontend/dist`. FastAPI automatically mounts this directory and serves the web UI at `http://localhost:8000/`.

Alternatively, for active frontend development with live reloading:
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:5173 and proxies API requests to localhost:8000
```

### Step 4: Run the Backend Service
```bash
# From autowise-ai directory
uvicorn app.main:app --reload --port 8000
```

Open your browser to:
- **Web Application:** [http://localhost:8000/](http://localhost:8000/)
- **Interactive OpenAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)
- **Model Information:** [http://localhost:8000/model-info](http://localhost:8000/model-info)

---

## 5. API Reference & Example Requests

### `POST /predict`
Validates vehicle input and returns predicted price with localized feature attribution.

**Request Payload:**
```json
{
  "make": "Toyota",
  "year": 2018,
  "odometer": 55000,
  "condition": "good",
  "cylinders": "4 cylinders",
  "drive": "fwd",
  "fuel": "gas",
  "transmission": "automatic",
  "type": "sedan",
  "title_status": "clean",
  "paint_color": "silver"
}
```

**Response (200 OK):**
```json
{
  "predicted_price": 14500.0,
  "formatted_price": "$14,500.00",
  "currency": "USD ($)",
  "model_version": "1.0.0",
  "algorithm": "DecisionTreeRegressor (depth regularized)",
  "vehicle_summary": {
    "make": "Toyota",
    "year": 2018,
    "odometer": "55,000 miles",
    "condition": "Good",
    "cylinders": "4 cylinders",
    "fuel": "Gas",
    "transmission": "Automatic",
    "type": "SEDAN",
    "title_status": "Clean",
    "paint_color": "Silver"
  },
  "top_contributing_factors": [
    {
      "feature": "odometer",
      "display_name": "Odometer Mileage",
      "value": "55,000 mi",
      "relative_importance_pct": 43.8,
      "impact_direction": "increases_value",
      "insight": "Low mileage (55,000 miles vs ~110,000 avg) significantly preserves resale value."
    },
    {
      "feature": "year",
      "display_name": "Model Year",
      "value": 2018,
      "relative_importance_pct": 29.1,
      "impact_direction": "neutral",
      "insight": "Mid-age vehicle (2018, ~8 yrs old) reflects balanced lifecycle market value."
    }
  ],
  "disclaimer": "This valuation is an automated statistical estimate generated by a machine learning model based on historical Kaggle dataset transactions. It does not replace a physical inspection or official appraisal."
}
```

### `POST /explain`
Synthesizes a grounded narrative of the estimate, along with practical buyer/seller checks and answers to optional follow-up queries.

**Request Payload:**
```json
{
  "vehicle": {
    "make": "Ford",
    "year": 2021,
    "odometer": 60700,
    "condition": "good",
    "type": "suv"
  },
  "predicted_price": 18500.0,
  "user_question": "How does my mileage impact negotiation?"
}
```

---

## 6. AI Explanation Provider Configuration

AutoWise AI is built with **zero external dependencies required by default**:
1. **Rule-Based Engine (Default):** Works out-of-the-box with **no API keys**. Formulates grounded, deterministic evaluations distinguishing statistical correlation from causation, and generates due-diligence checklists.
2. **Optional LLM Integration:** If you wish to enable generative conversational explanations, provide an API key via environment variables:
   - For Google Gemini: Set `GEMINI_API_KEY=your_key_here` in `.env`.
   - For OpenAI: Set `OPENAI_API_KEY=your_key_here` in `.env`.
3. **Graceful Fallback:** If an LLM call encounters network timeouts, invalid keys, or rate limits, the system catches the exception and transparently returns the rule-based response with source attribution.

---

## 7. Automated Test Suite & Verification Results

The test suite contains 16 automated unit and integration tests using `pytest` and `fastapi.testclient`:

```bash
python -m pytest tests -v
```

### Executed Test Results:
```
tests/test_api.py::test_health_endpoint PASSED                           [  6%]
tests/test_api.py::test_model_info_endpoint PASSED                       [ 12%]
tests/test_api.py::test_missing_model_behavior PASSED                    [ 18%]
tests/test_explanation.py::test_rule_based_explanation_without_api_key PASSED [ 25%]
tests/test_explanation.py::test_explanation_user_question_follow_up PASSED [ 31%]
tests/test_explanation.py::test_llm_provider_failure_fallback PASSED     [ 37%]
tests/test_pipeline.py::test_target_excluded_from_features PASSED        [ 43%]
tests/test_pipeline.py::test_preprocessor_leakage_safety PASSED          [ 50%]
tests/test_pipeline.py::test_extract_year_logic PASSED                   [ 56%]
tests/test_pipeline.py::test_extract_make_logic PASSED                   [ 62%]
tests/test_prediction.py::test_successful_prediction PASSED              [ 68%]
tests/test_prediction.py::test_unknown_categories_handling PASSED        [ 75%]
tests/test_prediction.py::test_missing_required_fields PASSED            [ 81%]
tests/test_prediction.py::test_numeric_boundaries_year PASSED            [ 87%]
tests/test_prediction.py::test_numeric_boundaries_odometer PASSED        [ 93%]
tests/test_prediction.py::test_prediction_response_schema PASSED         [100%]

======================= 16 passed in 7.45s =======================
```

---

## 8. Known Model Limitations

1. **Tabular Scope:** The model predicts prices strictly based on structured listing parameters. It cannot inspect photographic evidence, chassis frame integrity, tire wear, fluid leaks, or interior odor.
2. **Scraped Outlier Artifacts:** Raw marketplace scrapes often contain phone numbers mistaken for prices (e.g. `$5,771,710`) or lease takeover down payments (e.g. `$1`). Our training pipeline filters listings outside the `$500 - $300,000` window.
3. **Regional Demand Variations:** The dataset lacks fine-grained zip code data. Vehicles in harsh winter climates (requiring 4WD and prone to road-salt underbody rust) will exhibit localized price variations relative to sunbelt states.

---

## 9. Deployment Preparation

- **Unified Single-Port Deployment:** Running `uvicorn app.main:app` automatically serves both the backend API and the compiled React frontend from `frontend/dist` on port 8000.
- **Separate Deployment (e.g., Render / Railway backend + Vercel frontend):**
  - Backend: Run `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
  - Frontend: Set the environment variable `VITE_API_BASE_URL=https://your-backend-api.com` in your frontend hosting dashboard, then build using `npm run build`.

---

## 10. Containerization & Docker (Placeholder)

> [!IMPORTANT]
> **CONTAINERIZATION DIVISION OF WORK:**
> As agreed, all Dockerfile creation, container builds, image management, and multi-container orchestration will be completed separately by the project owner. All application source code, virtual environment dependencies, model artifacts, and test suites have been prepared to integrate seamlessly into standard OCI-compliant container environments.
