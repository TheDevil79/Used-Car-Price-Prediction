"""
AutoWise AI - Prediction Service
Handles data framing, pipeline execution, price formatting, and factor attribution.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from fastapi import HTTPException

from app.schemas import VehicleInput, PredictionResponse, ContributingFactor
from app.services.model_service import model_service


MEDIAN_YEAR = 2013
MEDIAN_ODOMETER = 110000.0


def compute_contributing_factors(vehicle: VehicleInput, predicted_price: float,
                                 feature_importances: Dict[str, float]) -> List[ContributingFactor]:
    """
    Compute grounded feature impact based on model's decision tree feature importances
    and the vehicle's specific attributes relative to market baselines.
    """
    factors = []

    # 1. Mileage / Odometer
    odo = vehicle.odometer
    odo_imp = feature_importances.get("odometer", 0.438) * 100
    if odo < 60000:
        odo_dir = "increases_value"
        odo_text = f"Low mileage ({odo:,.0f} miles vs ~110,000 avg) significantly preserves resale value."
    elif odo > 150000:
        odo_dir = "decreases_value"
        odo_text = f"High mileage ({odo:,.0f} miles) contributes substantially to vehicle depreciation."
    else:
        odo_dir = "neutral"
        odo_text = f"Moderate mileage ({odo:,.0f} miles) aligns with typical market expectations."
    factors.append(ContributingFactor(
        feature="odometer",
        display_name="Odometer Mileage",
        value=f"{odo:,.0f} mi",
        relative_importance_pct=round(odo_imp, 1),
        impact_direction=odo_dir,
        insight=odo_text
    ))

    # 2. Vehicle Age / Model Year
    yr = vehicle.year
    yr_imp = feature_importances.get("year", 0.291) * 100
    age = 2026 - yr
    if yr >= 2020:
        yr_dir = "increases_value"
        yr_text = f"Recent model year ({yr}) provides strong pricing support with modern tech and safety."
    elif yr < 2010:
        yr_dir = "decreases_value"
        yr_text = f"Vehicle is {age} years old ({yr}), where normal age-related depreciation applies."
    else:
        yr_dir = "neutral"
        yr_text = f"Mid-age vehicle ({yr}, ~{age} yrs old) reflects balanced lifecycle market value."
    factors.append(ContributingFactor(
        feature="year",
        display_name="Model Year",
        value=yr,
        relative_importance_pct=round(yr_imp, 1),
        impact_direction=yr_dir,
        insight=yr_text
    ))

    # 3. Engine / Cylinders
    cyl = vehicle.cylinders.lower() if vehicle.cylinders else "4 cylinders"
    cyl_imp = feature_importances.get("cylinders", 0.106) * 100
    if any(k in cyl for k in ["8", "10", "12"]):
        cyl_dir = "increases_value"
        cyl_text = f"Larger displacement engine ({cyl}) commands higher price tier for trucks/performance."
    elif "6" in cyl:
        cyl_dir = "neutral"
        cyl_text = f"V6 configuration ({cyl}) offers a standard balance of power and value."
    else:
        cyl_dir = "neutral"
        cyl_text = f"Efficient 4-cylinder engine ({cyl}) offers economy focus with standard valuation."
    factors.append(ContributingFactor(
        feature="cylinders",
        display_name="Engine Cylinders",
        value=vehicle.cylinders,
        relative_importance_pct=round(cyl_imp, 1),
        impact_direction=cyl_dir,
        insight=cyl_text
    ))

    # 4. Vehicle Condition
    cond = vehicle.condition.lower() if vehicle.condition else "good"
    cond_imp = feature_importances.get("condition", 0.064) * 100
    if cond in ["excellent", "like new", "new"]:
        cond_dir = "increases_value"
        cond_text = f"Rated '{cond}' condition protects vehicle from cosmetic/mechanical valuation markdowns."
    elif cond in ["fair", "salvage"]:
        cond_dir = "decreases_value"
        cond_text = f"Condition noted as '{cond}', reducing buyer willingness-to-pay."
    else:
        cond_dir = "neutral"
        cond_text = f"'{cond}' condition is standard for pre-owned transactions."
    factors.append(ContributingFactor(
        feature="condition",
        display_name="Condition Rating",
        value=vehicle.condition,
        relative_importance_pct=round(cond_imp, 1),
        impact_direction=cond_dir,
        insight=cond_text
    ))

    # 5. Title Status
    ts = vehicle.title_status.lower() if vehicle.title_status else "clean"
    ts_imp = feature_importances.get("title_status", 0.02) * 100
    if ts in ["salvage", "rebuilt", "parts only"]:
        ts_dir = "decreases_value"
        ts_text = f"Non-clean title status ('{ts}') historically carries major valuation discounts."
    else:
        ts_dir = "neutral"
        ts_text = f"Clean title status ensures standard unencumbered ownership transfer."
    factors.append(ContributingFactor(
        feature="title_status",
        display_name="Title Status",
        value=vehicle.title_status,
        relative_importance_pct=round(ts_imp, 1),
        impact_direction=ts_dir,
        insight=ts_text
    ))

    # Sort factors by relative importance descending
    factors.sort(key=lambda x: x.relative_importance_pct, reverse=True)
    return factors


def predict_price(vehicle: VehicleInput) -> PredictionResponse:
    """Predict vehicle resale price using fitted DecisionTree pipeline."""
    model = model_service.get_model()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Machine learning model artifact is not loaded. Ensure train.py has run successfully."
        )

    # Prepare DataFrame matching exact pipeline feature order
    row_data = {
        "make": str(vehicle.make).strip().lower(),
        "year": float(vehicle.year),
        "odometer": float(vehicle.odometer),
        "condition": str(vehicle.condition).strip().lower(),
        "cylinders": str(vehicle.cylinders).strip().lower(),
        "drive": str(vehicle.drive).strip().lower(),
        "fuel": str(vehicle.fuel).strip().lower(),
        "transmission": str(vehicle.transmission).strip().lower(),
        "type": str(vehicle.type).strip().lower(),
        "title_status": str(vehicle.title_status).strip().lower(),
        "paint_color": str(vehicle.paint_color).strip().lower()
    }
    input_df = pd.DataFrame([row_data])

    try:
        raw_pred = float(model.predict(input_df)[0])
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference pipeline execution error: {str(e)}"
        )

    # Clamp price to non-negative
    predicted_price = max(0.0, round(raw_pred, 2))
    formatted_price = f"${predicted_price:,.2f}"

    report = model_service.get_evaluation_report()
    feature_importances = report.get("feature_importances", {})

    contributing_factors = compute_contributing_factors(vehicle, predicted_price, feature_importances)

    vehicle_summary = {
        "make": vehicle.make.title(),
        "year": vehicle.year,
        "odometer": f"{vehicle.odometer:,.0f} miles",
        "condition": vehicle.condition.title(),
        "cylinders": vehicle.cylinders,
        "fuel": vehicle.fuel.capitalize(),
        "transmission": vehicle.transmission.capitalize(),
        "type": vehicle.type.upper(),
        "title_status": vehicle.title_status.title(),
        "paint_color": vehicle.paint_color.title()
    }

    return PredictionResponse(
        predicted_price=predicted_price,
        formatted_price=formatted_price,
        currency="USD ($)",
        model_version="1.0.0",
        algorithm="DecisionTreeRegressor (depth regularized)",
        vehicle_summary=vehicle_summary,
        top_contributing_factors=contributing_factors
    )
