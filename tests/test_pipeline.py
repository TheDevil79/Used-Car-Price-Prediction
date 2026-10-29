"""
Tests for ML training pipeline, leakage prevention, and preprocessing reproducibility.
"""

import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

from train import (
    build_preprocessor,
    extract_year,
    extract_make,
    NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    ALL_FEATURES,
    TARGET_COLUMN
)


def test_target_excluded_from_features():
    """Ensure target variable 'price' is not present in feature definitions."""
    assert TARGET_COLUMN not in ALL_FEATURES
    assert TARGET_COLUMN not in NUMERIC_FEATURES
    assert TARGET_COLUMN not in CATEGORICAL_FEATURES


def test_preprocessor_leakage_safety():
    """Verify preprocessor can fit on train and transform unseen test data without errors or leakage."""
    preprocessor = build_preprocessor()

    # Synthetic training batch
    train_data = pd.DataFrame({
        "year": [2015.0, 2018.0, 2020.0, np.nan],
        "odometer": [80000.0, 45000.0, 20000.0, 100000.0],
        "make": ["toyota", "ford", "bmw", "honda"],
        "condition": ["good", "excellent", "good", "fair"],
        "cylinders": ["4 cylinders", "6 cylinders", "4 cylinders", "8 cylinders"],
        "drive": ["fwd", "4wd", "rwd", "fwd"],
        "fuel": ["gas", "gas", "hybrid", "diesel"],
        "transmission": ["automatic", "automatic", "automatic", "manual"],
        "type": ["sedan", "suv", "sedan", "truck"],
        "title_status": ["clean", "clean", "clean", "rebuilt"],
        "paint_color": ["white", "black", "silver", "blue"]
    })

    # Fit ONLY on train
    preprocessor.fit(train_data)

    # Test batch with unseen category and missing values
    test_data = pd.DataFrame({
        "year": [np.nan, 2022.0],
        "odometer": [np.nan, 15000.0],
        "make": ["unseen_brand_xyz", "toyota"],
        "condition": ["mint_condition", "excellent"],
        "cylinders": ["unknown_cyl", "4 cylinders"],
        "drive": ["unknown_drive", "fwd"],
        "fuel": ["solar_electric", "gas"],
        "transmission": ["continuously_variable", "automatic"],
        "type": ["futuristic_pod", "suv"],
        "title_status": ["foreign_import", "clean"],
        "paint_color": ["iridescent_gold", "black"]
    })

    transformed = preprocessor.transform(test_data)
    assert transformed.shape[0] == 2
    # Ensure no NaN produced in final numeric matrix
    assert not np.isnan(transformed).any()


def test_extract_year_logic():
    """Test year extraction handles various formats and dirty text."""
    row1 = pd.Series({"year": 2017, "title": "Ford Mustang"})
    assert extract_year(row1) == 2017.0

    # Scraped title with year
    row2 = pd.Series({"year": np.nan, "title": "2021 Ford Bronco Sport"})
    assert extract_year(row2) == 2021.0

    # Unreasonable vintage filtered
    row3 = pd.Series({"year": 1820, "title": "Vintage wagon"})
    assert np.isnan(extract_year(row3))


def test_extract_make_logic():
    """Test make extraction standardizes aliases and title text."""
    assert extract_make(pd.Series({"make": "Chevy", "title": ""})) == "chevrolet"
    assert extract_make(pd.Series({"make": "VW", "title": ""})) == "volkswagen"
    assert extract_make(pd.Series({"make": np.nan, "title": "2007 Honda Crv ex"})) == "honda"
    assert extract_make(pd.Series({"make": np.nan, "title": "Unidentified custom car"})) == "other"
