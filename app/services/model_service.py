"""
AutoWise AI - Model Management Service
Loads and caches the fitted model pipeline, evaluation report, and metadata.
"""

import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import joblib
from sklearn.pipeline import Pipeline

from app.config import settings

logger = logging.getLogger(__name__)


class ModelService:
    def __init__(self):
        self.model: Optional[Pipeline] = None
        self.evaluation_report: Optional[Dict[str, Any]] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.is_loaded: bool = False

    def load_artifacts(self, force_reload: bool = False) -> bool:
        """Load fitted pipeline and metadata JSON files into memory."""
        if self.is_loaded and not force_reload:
            return True

        model_path = Path(settings.MODEL_PATH)
        report_path = Path(settings.REPORT_PATH)
        meta_path = Path(settings.METADATA_PATH)

        if not model_path.exists():
            logger.warning(f"Model file not found at: {model_path}")
            self.model = None
            self.is_loaded = False
            return False

        try:
            self.model = joblib.load(model_path)
            logger.info(f"Loaded trained pipeline from {model_path}")

            if report_path.exists():
                with open(report_path, "r", encoding="utf-8") as f:
                    self.evaluation_report = json.load(f)
            else:
                self.evaluation_report = {}

            if meta_path.exists():
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            else:
                self.metadata = {}

            self.is_loaded = True
            return True
        except Exception as e:
            logger.error(f"Failed to load model artifacts: {e}", exc_info=True)
            self.model = None
            self.is_loaded = False
            return False

    def get_model(self) -> Optional[Pipeline]:
        return self.model

    def get_evaluation_report(self) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_artifacts()
        return self.evaluation_report or {}

    def get_metadata(self) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_artifacts()
        return self.metadata or {}


# Global singleton instance
model_service = ModelService()
