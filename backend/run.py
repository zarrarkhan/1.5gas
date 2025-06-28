import os
from pathlib import Path

def file_missing(path):
    return not Path(path).exists()

def main():
    print("🚦 Running backend pipeline...\n")

    # Step 1: Tagging BECCS Scenarios
    try:
        from scripts import step1_filter_beccs
        step1_out = "backend/public_data/step1_scenario_type.csv"
        if file_missing(step1_out):
            print("▶️ Step 1: Tagging BECCS Scenarios...")
            step1_filter_beccs.main()
        else:
            print(f"⏭️ Step 1 skipped – {step1_out} already exists.")
    except ImportError:
        print("⏭️ Step 1 skipped – script not yet available.")

    # Step 2: Cleaning Electricity Data
    try:
        from scripts import step2_clean_electricity
        step2_out = "backend/public_data/step2_electricity_long.csv"
        if file_missing(step2_out):
            print("▶️ Step 2: Cleaning Electricity Data...")
            step2_clean_electricity.main()
        else:
            print(f"⏭️ Step 2 skipped – {step2_out} already exists.")
    except ImportError:
        print("⏭️ Step 2 skipped – script not yet available.")

    # Step 3: Standardizing Time Series
    try:
        from scripts import step3_standardize_timeseries
        step3_outs = [
            "backend/public_data/step3_standardized.csv",
            "backend/public_data/step3_modified_scenarios.csv"
        ]
        if any(file_missing(p) for p in step3_outs):
            print("▶️ Step 3: Standardizing Time Series...")
            step3_standardize_timeseries.main()
        else:
            print("⏭️ Step 3 skipped – all outputs already exist.")
    except Exception as e:
        print(f"❌ Step 3 failed – {e}")

    # Step 4: Calculating Indicators
    try:
        from scripts import step4_calculate_indicators
        step4_outs = [
            "backend/public_data/step4_metrics.csv"
        ]
        if any(file_missing(p) for p in step4_outs):
            print("▶️ Step 4: Calculating Indicators...")
            step4_calculate_indicators.main()
        else:
            print("⏭️ Step 4 skipped – all outputs already exist.")
    except ImportError:
        print("⏭️ Step 4 skipped – script not yet available.")

    # Step 5: Aggregating Outputs
    try:
        from scripts import step5_aggregate_outputs
        step5_outs = [
            "backend/public_data/step5_region_summary.json",
            "backend/public_data/step5_benchmark_stats.json",
            "backend/public_data/step5_scenario_gas_stats.csv"
        ]
        if any(file_missing(p) for p in step5_outs):
            print("▶️ Step 5: Aggregating Outputs...")
            step5_aggregate_outputs.main()
        else:
            print("⏭️ Step 5 skipped – all outputs already exist.")
    except ImportError:
        print("⏭️ Step 5 skipped – script not yet available.")

    # Step 6: Exporting Final JSONs
    try:
        from scripts import step6_export_json
        step6_outs = [
            "backend/public_data/step6_scenario_timeseries.json",
            "backend/public_data/step6_scenario_table.json",
            "backend/public_data/step6_map_data.json",
            "backend/public_data/step6_country_region_map.json"
        ]
        if any(file_missing(p) for p in step6_outs):
            print("▶️ Step 6: Exporting Final JSONs...")
            step6_export_json.main()
        else:
            print("⏭️ Step 6 skipped – all outputs already exist.")
    except ImportError:
        print("⏭️ Step 6 skipped – script not yet available.")

    print("\n✅ Pipeline completed.")

if __name__ == "__main__":
    main()
