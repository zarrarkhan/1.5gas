# scripts/step4_calculate_indicators.py

import pandas as pd
import os

def main():
    input_path = "backend/public_data/step3_standardized.csv"
    output_metrics = "backend/public_data/step4_metrics.csv"

    df = pd.read_csv(input_path)
    df["Year"] = df["Year"].astype(int)

    # Filter to ensure Variable_standardized exists
    df = df[df["Variable_standardized"].notna()]

    # Calculate metrics by Scenario and Variable
    grouped = df.groupby(["Scenario_ID", "Variable_standardized"])

    summary = grouped.agg(
        Start_Year=("Year", "min"),
        End_Year=("Year", "max"),
        Min_Value=("Value", "min"),
        Max_Value=("Value", "max"),
        Mean_Value=("Value", "mean"),
        Trend=("Value", lambda x: x.iloc[-1] - x.iloc[0] if len(x) > 1 else None),
    ).reset_index()

    # Save output
    os.makedirs("backend/public_data", exist_ok=True)
    summary.to_csv(output_metrics, index=False)

    print("✅ Step 4 complete: Indicators calculated and saved.")
