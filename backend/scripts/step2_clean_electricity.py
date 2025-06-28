import pandas as pd
import os

def main():
    # Paths
    input_path = "backend/data/scenario_data.xlsx"
    output_path = "backend/public_data/step2_electricity_long.csv"

    # Load electricity sheet
    df = pd.read_excel(input_path, sheet_name="electricity_data")

    # Add Scenario_ID
    df["Scenario_ID"] = df["Model"] + " - " + df["Scenario"]

    # Melt into long format
    year_cols = [col for col in df.columns if isinstance(col, int)]
    long_df = df.melt(
        id_vars=["Scenario_ID", "Model", "Scenario", "Region", "Variable", "Unit"],
        value_vars=year_cols,
        var_name="Year",
        value_name="Value"
    )

    # Drop rows with missing values
    long_df = long_df.dropna(subset=["Value"])

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    long_df.to_csv(output_path, index=False)

    print("✅ step2_electricity_long.csv written to backend/public_data/")

if __name__ == "__main__":
    main()
