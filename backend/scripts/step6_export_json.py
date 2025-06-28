import pandas as pd
import json
import os
import shutil

def main():
    path = "backend/public_data/"

    # 1. Scenario Timeseries JSON
    df_timeseries = pd.read_csv(f"{path}step3_standardized.csv")
    df_type = pd.read_csv(f"{path}step1_scenario_type.csv")
    df_timeseries = df_timeseries.merge(df_type, on="Scenario_ID", how="left")

    # Pivot to structure for frontend (Scenario → Region → Variable → {year: value})
    scenario_data = {}
    for (scenario, region, s_type), group in df_timeseries.groupby(["Scenario_ID", "Region", "BECCS_Type"]):
        key = f"{scenario} | {region}"
        if key not in scenario_data:
            scenario_data[key] = {
                "Scenario_ID": scenario,
                "Region": region,
                "Scenario_Type": s_type,
                "Timeseries": {}
            }
        for variable in group["Variable_standardized"].unique():
            df_var = group[group["Variable_standardized"] == variable]
            scenario_data[key]["Timeseries"][variable] = {
                int(row["Year"]): row["Value"] for _, row in df_var.iterrows()
            }

    with open(f"{path}step6_scenario_timeseries.json", "w") as f:
        json.dump(list(scenario_data.values()), f, indent=2)

    # 2. Scenario Table JSON
    df_table = pd.read_csv(f"{path}step5_scenario_gas_stats.csv")
    table_records = df_table.to_dict(orient="records")
    with open(f"{path}step6_scenario_table.json", "w") as f:
        json.dump(table_records, f, indent=2)

    # 3. Map Data JSON (from region summary already created in step5)
    with open(f"{path}step5_region_summary.json", "r") as f:
        region_summary = json.load(f)
    with open(f"{path}step6_map_data.json", "w") as f:
        json.dump(region_summary, f, indent=2)

    # 4. Country → Region Map JSON (from final mapping file)
    region_map_path = "backend/data/country_region_map.csv"
    if os.path.exists(region_map_path):
        df_region_map = pd.read_csv(region_map_path)
        df_region_map = df_region_map[["Country", "Region"]]
        country_map = df_region_map.to_dict(orient="records")
        
        with open(f"{path}step6_country_region_map.json", "w") as f:
            json.dump(country_map, f, indent=2)
        
        print("✅ step6_country_region_map.json created.")
    else:
        print(f"⚠️ Skipping country-region map — file not found: {region_map_path}")                    

    print("✅ Step 6 JSONs exported.")

    # 5. Copy final JSONs to frontend
    frontend_data_path = "frontend/public/data/"
    os.makedirs(frontend_data_path, exist_ok=True)

    files_to_copy = [
        "step6_scenario_timeseries.json",
        "step6_scenario_table.json",
        "step6_map_data.json",
        "step6_country_region_map.json"
    ]

    for fname in files_to_copy:
        src = os.path.join(path, fname)
        dst = os.path.join(frontend_data_path, fname)
        shutil.copyfile(src, dst)

    print("📁 Final JSONs copied to frontend/public/data/")

if __name__ == "__main__":
    main()
