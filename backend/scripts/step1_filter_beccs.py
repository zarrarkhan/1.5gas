import pandas as pd
import os

def main():
    # Paths
    input_path = "backend/data/scenario_data.xlsx"
    output_path = "backend/public_data/step1_scenario_type.csv"

    # Load BECCS deployment sheet
    beccs_df = pd.read_excel(input_path, sheet_name="beccs_deployment")

    # Classify based on BECCS deployment in 2050
    threshold = 3000  # MtCO₂
    beccs_2050 = beccs_df[["Model", "Scenario", "Variable", 2050]].copy()
    beccs_2050["Scenario_ID"] = beccs_2050["Model"] + " - " + beccs_2050["Scenario"]
    beccs_2050["BECCS_Type"] = beccs_2050[2050].apply(
        lambda x: "Low-BECCS" if x < threshold else "High-BECCS"
    )

    # Save just ID and classification
    tags = beccs_2050[["Scenario_ID", "BECCS_Type"]]
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    tags.to_csv(output_path, index=False)

    print("✅ step1_scenario_type.csv written to backend/public_data/")

if __name__ == "__main__":
    main()
