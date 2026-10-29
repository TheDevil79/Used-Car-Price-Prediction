"""
AutoWise AI - AI Explanation Assistant Service
Generates grounded natural-language explanations of ML predictions with practical
buyer/seller checks, statistical distinction, and transparent fallback.
"""

import os
import logging
from typing import Optional, List, Dict, Any

from app.config import settings
from app.schemas import VehicleInput, ExplanationRequest, ExplanationResponse

logger = logging.getLogger(__name__)


def generate_rule_based_explanation(vehicle: VehicleInput, predicted_price: float,
                                    user_question: Optional[str] = None) -> ExplanationResponse:
    """
    Transparent, grounded rule-based explanation engine that operates without external API keys.
    """
    raw_make = vehicle.make.strip()
    if raw_make.lower() in ['bmw', 'gmc', 'vw']:
        make_cap = raw_make.upper()
    else:
        make_cap = raw_make.title()
    formatted = f"${predicted_price:,.2f}"
    age = 2026 - vehicle.year

    # 1. Primary Valuation Summary
    if vehicle.odometer < 50000 and vehicle.year >= 2019:
        tier_desc = "premium, late-model pre-owned bracket"
    elif vehicle.odometer > 140000 or vehicle.year < 2011:
        tier_desc = "budget/high-mileage utility tier"
    else:
        tier_desc = "core mid-market pre-owned segment"

    summary = (
        f"The AutoWise AI DecisionTree model estimated a resale valuation of {formatted} for this "
        f"{vehicle.year} {make_cap} ({vehicle.type.upper()}) with {vehicle.odometer:,.0f} miles. "
        f"This places the vehicle in the {tier_desc} relative to historical training transactions."
    )

    # 2. Key Statistical Factors
    key_factors = []

    # Mileage Factor
    if vehicle.odometer < 60000:
        key_factors.append(
            f"Favorable Mileage ({vehicle.odometer:,.0f} mi): Substantially below the ~110,000-mile dataset median, "
            f"strongly protecting against mechanical depreciation."
        )
    elif vehicle.odometer > 130000:
        key_factors.append(
            f"Elevated Mileage ({vehicle.odometer:,.0f} mi): Exceeds normal wear milestones, which statistically represents "
            f"the single largest downward pricing pressure in the model (43.8% model weight)."
        )
    else:
        key_factors.append(
            f"Moderate Mileage ({vehicle.odometer:,.0f} mi): Positioned in line with standard expected wear for a {age}-year-old vehicle."
        )

    # Model Year / Vintage
    if vehicle.year >= 2020:
        key_factors.append(
            f"Modern Production Vintage ({vehicle.year}): Benefits from recent safety engineering, infotainment standards, and lower wear risk (29.1% model weight)."
        )
    elif vehicle.year <= 2008:
        key_factors.append(
            f"Older Generation ({vehicle.year}, {age} years old): Age-driven market depreciation reduces valuation regardless of cosmetic upkeep."
        )
    else:
        key_factors.append(
            f"Established Model Year ({vehicle.year}): Stable market liquidity with predictable parts and maintenance expectations."
        )

    # Mechanical & Specification Factors
    cyl = vehicle.cylinders.lower() if vehicle.cylinders else "4 cylinders"
    if any(k in cyl for k in ["8", "10", "12"]):
        key_factors.append(
            f"High-Displacement Engine ({cyl}): Larger multi-cylinder configuration historically attracts a valuation premium in truck/performance categories."
        )
    elif "hybrid" in vehicle.fuel.lower() or "electric" in vehicle.fuel.lower():
        key_factors.append(
            f"Electrified Powertrain ({vehicle.fuel.capitalize()}): Fuel efficiency and modern propulsion provide positive pricing support."
        )

    # Title & Condition
    title_st = vehicle.title_status.lower() if vehicle.title_status else "clean"
    if title_st in ["salvage", "rebuilt"]:
        key_factors.append(
            f"Title Compromise ('{title_st}'): Severe downward valuation penalty applied due to prior structural or insurance write-off status."
        )
    elif vehicle.condition and vehicle.condition.lower() in ["excellent", "like new"]:
        key_factors.append(
            f"Superior Condition Rating ('{vehicle.condition.title()}'): Minimizes anticipated buyer reconditioning expenses."
        )

    # 3. Valuation Context (Statistical vs Causal Distinction)
    valuation_context = (
        "Statistical Association Note: This estimate reflects patterns across past listing transactions, "
        "not a deterministic causal guarantee. Factors such as regional salt exposure, maintenance rigor, "
        "and aftermarket modifications cause individual real-world sales to vary within +/- 15-20% of model estimates."
    )

    # 4. Practical Due-Diligence Checklist
    practical_checks = [
        "Independent Pre-Purchase Inspection (PPI): Have a certified third-party mechanic inspect drivetrain, suspension, steering, and underbody rust.",
        "Verified Vehicle History Report: Confirm no undeclared structural accidents, odometer rollbacks, flood damage, or outstanding liens (e.g., CARFAX / AutoCheck).",
        "Documented Service Records: Verify scheduled maintenance history, including oil intervals, transmission flushes, timing belt/chain service, and recall completions.",
        "Physical Wear Consistency: Ensure steering wheel, brake pedals, seat bolsters, and tire tread depth match the stated odometer mileage.",
        "Local Market Comparison: Cross-reference this estimate with local active listings in your area to account for regional seasonal demand (e.g., 4WD winter premiums)."
    ]

    # Handle user follow-up question if provided
    if user_question:
        q_lower = user_question.lower()
        if any(w in q_lower for w in ["mileage", "odometer", "miles", "km"]):
            summary += f"\n\nRegarding your question on mileage: At {vehicle.odometer:,.0f} miles, odometer reading accounts for approximately 43.8% of the decision tree's pricing weights. Keeping complete maintenance logs can help justify the higher end of the valuation range."
        elif any(w in q_lower for w in ["accident", "damage", "clean title", "salvage", "rebuilt"]):
            summary += f"\n\nRegarding title & accident history: Vehicles with reported salvage or rebuilt titles typically trade at a 25% to 45% discount compared to clean-title comps due to resale and insurance hurdles."
        elif any(w in q_lower for w in ["negotiat", "offer", "discount", "price"]):
            summary += f"\n\nNegotiation Strategy: Use the {formatted} estimate as a midpoint anchor. Inspect tire wear, brake pad thickness, and cosmetic scratches to negotiate reasonable concessions toward the lower valuation bound."
        elif any(w in q_lower for w in ["service", "inspection", "mechanic"]):
            summary += f"\n\nMechanical Inspection Tip: An independent inspection costing $150-$250 can uncover latent transmission slippage or oil leaks that could cost thousands to repair after purchase."
        else:
            summary += f"\n\nRegarding '{user_question}': AutoWise AI estimates reflect historical market trends for similar {make_cap} models with comparable mileage and vintage. Real-world purchase prices should always be validated through thorough physical inspection and local dealer comps."

    return ExplanationResponse(
        predicted_price=predicted_price,
        formatted_price=formatted,
        explanation_source="rule_based_engine",
        summary=summary,
        key_factors=key_factors,
        valuation_context=valuation_context,
        practical_checks=practical_checks,
        disclaimer="AutoWise AI is a decision-support demonstration tool. Predictions are statistical estimates and do not represent a formal appraisal or guarantee of transaction value."
    )


def generate_llm_explanation(vehicle: VehicleInput, predicted_price: float,
                             user_question: Optional[str] = None) -> Optional[ExplanationResponse]:
    """
    Optional LLM explanation using Google Gemini API or OpenAI API if configured.
    Falls back gracefully if not configured or on network/API failure.
    """
    # 1. Check Gemini
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)

            prompt = f"""You are the AutoWise AI Automotive Valuation Assistant.
Explain the following used car price prediction generated by a trained scikit-learn DecisionTreeRegressor model:
- Vehicle: {vehicle.year} {vehicle.make.title()} ({vehicle.type.upper()})
- Odometer: {vehicle.odometer:,.0f} miles
- Condition: {vehicle.condition}
- Cylinders: {vehicle.cylinders}
- Drive: {vehicle.drive}
- Fuel: {vehicle.fuel}
- Transmission: {vehicle.transmission}
- Title Status: {vehicle.title_status}
- Exterior Color: {vehicle.paint_color}
- Predicted Price: ${predicted_price:,.2f} USD
- Top Model Feature Weights: Odometer (~43.8%), Year (~29.1%), Cylinders (~10.6%), Condition (~6.4%).
{f'- User Question: {user_question}' if user_question else ''}

Guidelines:
1. Provide a concise, professional explanation grounded strictly in the vehicle specifications and model weights.
2. Clearly distinguish statistical association from causal certainty.
3. Suggest practical due-diligence checks (mechanical inspection, title history, maintenance records).
4. Never claim you have physically seen or inspected the vehicle.
5. If the user asked a question, answer it directly and professionally.
Return your response structured into clear paragraphs.
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            text = response.text.strip()
            if text:
                rule_base = generate_rule_based_explanation(vehicle, predicted_price, user_question)
                return ExplanationResponse(
                    predicted_price=predicted_price,
                    formatted_price=f"${predicted_price:,.2f}",
                    explanation_source="llm_gemini",
                    summary=text,
                    key_factors=rule_base.key_factors,
                    valuation_context=rule_base.valuation_context,
                    practical_checks=rule_base.practical_checks,
                    disclaimer=rule_base.disclaimer
                )
        except Exception as e:
            logger.warning(f"Gemini API explanation attempt failed: {e}. Falling back to rule-based engine.")

    # 2. Check OpenAI if configured
    openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            import httpx
            headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are the AutoWise AI Automotive Valuation Assistant. Explain used car price predictions grounded in model features."},
                    {"role": "user", "content": f"Explain valuation for {vehicle.year} {vehicle.make} with {vehicle.odometer} miles priced at ${predicted_price:,.2f}. {user_question or ''}"}
                ],
                "temperature": 0.4
            }
            resp = httpx.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=8.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data["choices"][0]["message"]["content"].strip()
                rule_base = generate_rule_based_explanation(vehicle, predicted_price, user_question)
                return ExplanationResponse(
                    predicted_price=predicted_price,
                    formatted_price=f"${predicted_price:,.2f}",
                    explanation_source="llm_openai",
                    summary=text,
                    key_factors=rule_base.key_factors,
                    valuation_context=rule_base.valuation_context,
                    practical_checks=rule_base.practical_checks,
                    disclaimer=rule_base.disclaimer
                )
        except Exception as e:
            logger.warning(f"OpenAI API explanation attempt failed: {e}. Falling back to rule-based engine.")

    return None


def get_explanation(request: ExplanationRequest) -> ExplanationResponse:
    """
    Main explanation orchestrator: tries LLM if configured; seamlessly falls back
    to transparent rule-based engine.
    """
    # Attempt LLM if enabled
    if settings.LLM_PROVIDER != "none":
        try:
            llm_resp = generate_llm_explanation(
                vehicle=request.vehicle,
                predicted_price=request.predicted_price,
                user_question=request.user_question
            )
            if llm_resp is not None:
                return llm_resp
        except Exception as e:
            logger.warning(f"LLM provider failed with error: {e}. Falling back to rule-based engine.")

    # Transparent rule-based fallback
    return generate_rule_based_explanation(
        vehicle=request.vehicle,
        predicted_price=request.predicted_price,
        user_question=request.user_question
    )
