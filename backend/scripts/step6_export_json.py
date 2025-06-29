import pandas as pd
import json
import os
import shutil

def main():
    path = "backend/public_data/"
    frontend_data_path = "frontend/public/data/"
    os.makedirs(frontend_data_path, exist_ok=True)

    # 1. Scenario Table JSON (from step5_scenario_gas_stats.csv)
    df_table = pd.read_csv(f"{path}step5_scenario_gas_stats.csv")
    table_records = df_table.to_dict(orient="records")
    with open(f"{path}step6_scenario_table.json", "w") as f:
        json.dump(table_records, f, indent=2)

    # 2. Country → Region Map JSON (optional but useful)
    region_map_path = "backend/data/country_region_map.csv"
    if os.path.exists(region_map_path):
        df_region_map = pd.read_csv(region_map_path)[["Country", "Region", "ISO_A3"]]
        with open(f"{path}step6_country_region_map.json", "w") as f:
            json.dump(df_region_map.to_dict(orient="records"), f, indent=2)
        print("✅ step6_country_region_map.json created.")
    else:
        print(f"⚠️ File not found: {region_map_path}")

    # 3. Copy key JSONs to frontend
    files_to_copy = [
        "step6_scenario_table.json",
        "step6_country_region_map.json",
        "step5_scenario_gas_stats.csv",
        "step5_region_summary.json",
        "step5_gas_share_paths.json",
        "step5_gas_share_summary.json",
        "step5_gas_timeseries_summary.json",
        "step3_standardized.csv"
    ]

    for fname in files_to_copy:
        src = os.path.join(path, fname)
        dst = os.path.join(frontend_data_path, fname)
        if os.path.exists(src):
            shutil.copyfile(src, dst)

    print("✅ Step 6 complete. Frontend JSONs updated.")

if __name__ == "__main__":
    main()
