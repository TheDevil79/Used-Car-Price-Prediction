"""
AutoWise AI - FastAPI Application
Provides REST endpoints for used car price prediction, AI explanation, model info, and health monitoring.
"""

from contextlib import asynccontextmanager
import logging
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.schemas import (
    VehicleInput,
    PredictionResponse,
    ExplanationRequest,
    ExplanationResponse,
    HealthResponse,
    ModelInfoResponse
)
from app.services.model_service import model_service
from app.services.prediction_service import predict_price
from app.services.explanation_service import get_explanation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("autowise_ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model artifacts once on startup."""
    logger.info("Initializing AutoWise AI services...")
    success = model_service.load_artifacts()
    if success:
        logger.info("Model pipeline and metadata successfully loaded.")
    else:
        logger.warning("Model artifacts could not be loaded at startup. Run train.py to generate them.")
    yield
    logger.info("AutoWise AI shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Used Car Price Estimator using Kaggle Challenge dataset and DecisionTree regression pipeline.",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Report service health, model loading state, and LLM configuration."""
    model_loaded = model_service.is_loaded and (model_service.get_model() is not None)
    artifacts_exist = Path(settings.MODEL_PATH).exists() and Path(settings.REPORT_PATH).exists()
    llm_configured = bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
    llm_provider = "gemini" if settings.GEMINI_API_KEY else ("openai" if settings.OPENAI_API_KEY else "rule_based_fallback")

    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        model_loaded=model_loaded,
        artifacts_available=artifacts_exist,
        llm_configured=llm_configured,
        llm_provider=llm_provider,
        app_version=settings.APP_VERSION
    )


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model Info"])
async def get_model_info():
    """Return model version, algorithm, supported features, value domains, and actual evaluation metrics."""
    metadata = model_service.get_metadata()
    report = model_service.get_evaluation_report()

    if not metadata and not report:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metadata is unavailable. Please run train.py to train the model and generate artifacts."
        )

    return ModelInfoResponse(
        model_version=metadata.get("model_version", "1.0.0"),
        algorithm=metadata.get("algorithm", "DecisionTreeRegressor"),
        dataset=report.get("dataset", "Kaggle Used Car Price Prediction Challenge"),
        target_column=report.get("target_column", "price"),
        currency=report.get("currency", "USD ($)"),
        numeric_features=metadata.get("numeric_features", ["year", "odometer"]),
        categorical_features=metadata.get("categorical_features", [
            "make", "condition", "cylinders", "drive", "fuel", "transmission", "type", "title_status", "paint_color"
        ]),
        all_supported_features=metadata.get("all_supported_features", []),
        feature_value_domains=metadata.get("feature_value_domains", {}),
        evaluation_metrics=report.get("metrics", {}),
        feature_importances=report.get("feature_importances", {}),
        overfitting_analysis=report.get("overfitting_analysis", {}),
        license_notice=metadata.get("license_notice", "Kaggle Non-Commercial / CC BY-NC-SA 4.0 terms apply.")
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_car_price(vehicle: VehicleInput):
    """
    Predict the resale price of a used vehicle using the fitted DecisionTree regression pipeline.
    Validates all inputs, supports unknown categories via OneHotEncoder(handle_unknown='ignore'),
    and returns formatted price with top contributing factors.
    """
    return predict_price(vehicle)


@app.post("/explain", response_model=ExplanationResponse, tags=["AI Explanation"])
async def explain_prediction(request: ExplanationRequest):
    """
    Generate a grounded explanation of the predicted price.
    Uses LLM (Gemini / OpenAI) if configured; otherwise transparently falls back to the
    built-in rule-based explanation engine with verified vehicle factors and practical buyer checks.
    """
    return get_explanation(request)


# Serve built frontend if static dist folder exists
frontend_dist = Path(settings.FRONTEND_DIST)
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_spa(full_path: str):
        # Allow API routes to be handled by FastAPI
        file_path = frontend_dist / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/", tags=["Frontend"])
    async def root_placeholder():
        return {
            "message": "AutoWise AI Backend API is running.",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
            "model_info": "/model-info"
        }
