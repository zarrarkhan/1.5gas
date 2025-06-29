import pandas as pd
import os
import json
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.offsetbox import AnchoredText
import math # For ceil and sqrt

def main():
    # Paths
    path = "backend/public_data/"
    # IMPORTANT: Changed output filename to reflect multiple regions
    output_plot_path = f"{path}step5_diagnostic1_gas_share_timeseries_all_regions.png"

    # Load data
    df = pd.read_csv(f"{path}step3_standardized.csv")
    df_type = pd.read_csv(f"{path}step1_scenario_type.csv")
    df_type.rename(columns={"BECCS_Type": "Scenario_Type"}, inplace=True)

    df = df.merge(df_type, on="Scenario_ID", how="left")

    # Filter for gas and total electricity
    gas = df[df["Variable_standardized"] == "Electricity|Gas"]
    total = df[df["Variable_standardized"] == "Electricity"]

    # 2020 & 2030 data (Region column is correctly maintained here)
    gas_2020 = gas[gas["Year"] == 2020][["Scenario_ID", "Region", "Value"]].rename(columns={"Value": "Gas_2020"})
    gas_2030 = gas[gas["Year"] == 2030][["Scenario_ID", "Region", "Value", "Scenario_Type"]].rename(columns={"Value": "Gas_2030"})
    total_2030 = total[total["Year"] == 2030][["Scenario_ID", "Region", "Value"]].rename(columns={"Value": "Total_2030"})

    merged = gas_2030.merge(gas_2020, on=["Scenario_ID", "Region"], how="inner")
    merged = merged.merge(total_2030, on=["Scenario_ID", "Region"], how="inner")

    # Metrics
    merged["Pct_Drop"] = 100 * (merged["Gas_2020"] - merged["Gas_2030"]) / merged["Gas_2020"]
    merged["Gas_Share_2030"] = 100 * merged["Gas_2030"] / merged["Total_2030"]

    # Prepare data for time series, still retaining ALL Regions
    df_filtered = df[df["Variable_standardized"].isin(["Electricity", "Electricity|Gas"])]
    df_pivot = df_filtered.pivot_table(
        index=["Scenario_ID", "Region", "Year", "Scenario_Type"],
        columns="Variable_standardized", # This pivots 'Variable_standardized' values to columns
        values="Value"
    ).reset_index()
    df_pivot = df_pivot[df_pivot["Electricity"] > 0]
    # Ensure 'Electricity|Gas' column exists before creating 'Gas_Share'
    if 'Electricity|Gas' in df_pivot.columns:
        df_pivot["Gas_Share"] = 100 * df_pivot["Electricity|Gas"] / df_pivot["Electricity"]
    else:
        # Handle cases where 'Electricity|Gas' might not be present for some Scenario_ID/Region combinations
        df_pivot["Gas_Share"] = float('nan') # Set to NaN if 'Electricity|Gas' column is missing

    df_pivot = df_pivot[df_pivot["Gas_Share"].notna()]
    
    # Compute gas phase-out years using thresholds: 2.5% (effective), 1.0% (total)
    thresholds = {"effective": 2.5, "total": 1.0}
    exit_years_by_scenario = {th: {} for th in thresholds}    # threshold → scenario_type → region → sid → year
    exit_years_summary = {th: {} for th in thresholds}        # threshold → scenario_type → region → median year

    for th_name, th_val in thresholds.items():
        for stype in ["Low-BECCS", "High-BECCS"]:
            if stype not in exit_years_by_scenario[th_name]:
                exit_years_by_scenario[th_name][stype] = {}
                exit_years_summary[th_name][stype] = {}
            stype_df = df_pivot[df_pivot["Scenario_Type"] == stype]

            for region, region_df in stype_df.groupby("Region"):
                sid_years = {}
                for sid, group in region_df.groupby("Scenario_ID"):
                    sorted_group = group.sort_values("Year")
                    below = sorted_group[sorted_group["Gas_Share"] <= th_val]
                    if not below.empty:
                        sid_years[sid] = int(below["Year"].iloc[0])  # first year below threshold
                exit_years_by_scenario[th_name][stype][region] = sid_years
                exit_years_summary[th_name][stype][region] = int(pd.Series(sid_years.values()).median()) if sid_years else None


    # --- Benchmark stats JSON (step5_benchmark_stats.json) ---
    # Group by Scenario_Type AND Region, then summarize
    def summarize_by_group(group, col):
        return {
            "min": group[col].min(),
            "mean": group[col].mean(),
            "median": group[col].median(),
            "max": group[col].max()
        }

    # Initialize a nested dictionary for scenario_type -> region -> metrics
    result_by_region = {}
    for (scenario_type, region), group in merged.groupby(["Scenario_Type", "Region"]):
        if scenario_type not in result_by_region:
            result_by_region[scenario_type] = {}
        result_by_region[scenario_type][region] = {
            "gas_2030_ej": summarize_by_group(group, "Gas_2030"),
            "pct_drop_2020_2030": summarize_by_group(group, "Pct_Drop"),
            "gas_share_2030_pct": summarize_by_group(group, "Gas_Share_2030"),
            "gas_phaseout_years": {
                "effective_2.5pct": exit_years_summary["effective"][scenario_type].get(region),
                "total_1pct": exit_years_summary["total"][scenario_type].get(region)
            }
        }

    with open(f"{path}step5_benchmark_stats.json", "w") as f:
        json.dump(result_by_region, f, indent=2)

    # This part is already good: merged_out retains Region column
    merged_out = merged[[ "Scenario_ID", "Region", "Scenario_Type", "Gas_2020", "Gas_2030", "Total_2030", "Pct_Drop", "Gas_Share_2030" ]].copy()

    # Add gas phaseout years
    def get_phaseout(threshold):
        def inner(row):
            return exit_years_by_scenario[threshold] \
                .get(row["Scenario_Type"], {}) \
                .get(row["Region"], {}) \
                .get(row["Scenario_ID"], None)
        return inner

    merged_out["Effective_Phaseout_Year"] = merged_out.apply(get_phaseout("effective"), axis=1)
    merged_out["Total_Phaseout_Year"] = merged_out.apply(get_phaseout("total"), axis=1)
    
    merged_out.to_csv(f"{path}step5_scenario_gas_stats.csv", index=False)

    # This part is already good: map_summary explicitly groups by Region
    map_summary = merged.groupby(["Region", "Scenario_Type"]).agg({
        "Pct_Drop": "median",             # Median % drop from 2020 to 2030
        "Gas_Share_2030": "median"        # Median gas share in 2030
    }).reset_index()

    # Convert to nested dictionary: Region → Scenario_Type → metrics
    region_data = {}
    for _, row in map_summary.iterrows():
        region = row["Region"]
        scenario_type = row["Scenario_Type"]
        if region not in region_data:
            region_data[region] = {}
        region_data[region][scenario_type] = {
            "pct_drop": round(row["Pct_Drop"], 2),
            "gas_share_2030": round(row["Gas_Share_2030"], 2),
            "gas_phaseout_years": {
                "effective_2.5pct": exit_years_summary["effective"][scenario_type].get(region),
                "total_1pct": exit_years_summary["total"][scenario_type].get(region)
            }
        }

    # Export to JSON
    with open(f"{path}step5_region_summary.json", "w") as f:
        json.dump(region_data, f, indent=2)

    # --- Absolute Gas EJ Time Series (step5_gas_timeseries_summary.json) ---
    ej_result = {}
    gas_data_all_regions = df_pivot.copy() # Contains 'Electricity|Gas' column directly

    for scenario_type in ["Low-BECCS", "High-BECCS"]:
        ej_result[scenario_type] = {} # Nested dictionary for regions
        subset_stype = gas_data_all_regions[gas_data_all_regions["Scenario_Type"] == scenario_type]

        for region_val, group_region in subset_stype.groupby("Region"): # Group by region first
            grouped = group_region.groupby("Year")["Electricity|Gas"] # Use the pivoted column name
            median = grouped.median()
            q25 = grouped.quantile(0.25)
            q75 = grouped.quantile(0.75)

            ej_result[scenario_type][region_val] = { # Store under region key
                "yearly": [
                    {
                        "year": int(year),
                        "q25": round(q25[year], 2),
                        "median": round(median[year], 2),
                        "q75": round(q75[year], 2),
                    }
                    for year in median.index
                ],
                "benchmark": round(median.loc[2030], 2) if 2030 in median.index else None,
                "ref_2020": round(median.loc[2020], 2) if 2020 in median.index else None,
                "reduction_pct": (
                    round(100 * (median.loc[2020] - median.loc[2030]) / median.loc[2020], 1)
                    if 2020 in median.index and 2030 in median.index and median.loc[2020] != 0
                    else None
                )
            }

    with open(f"{path}step5_gas_timeseries_summary.json", "w") as f:
        json.dump(ej_result, f, indent=2)

    # --- Gas Share Summary (step5_gas_share_summary.json) ---
    result_json = {}
    for scenario_type in ["Low-BECCS", "High-BECCS"]:
        result_json[scenario_type] = {} # Nested dictionary for regions
        subset_stype = df_pivot[df_pivot["Scenario_Type"] == scenario_type]

        for region_val, group_region in subset_stype.groupby("Region"): # Group by region first
            grouped = group_region.groupby("Year")["Gas_Share"] # This is correct as Gas_Share is a new column
            median = grouped.median()
            q25 = grouped.quantile(0.25)
            q75 = grouped.quantile(0.75)

            cross_val = median.loc[2030] if 2030 in median.index else None
            cross_year = median[median <= cross_val].index.min() if cross_val is not None else None

            result_json[scenario_type][region_val] = { # Store under region key
                "yearly": [
                    {
                        "year": int(y),
                        "q25": round(q25[y], 2),
                        "median": round(median[y], 2),
                        "q75": round(q75[y], 2),
                    }
                    for y in median.index
                ],
                "benchmark": round(cross_val, 2) if cross_val is not None else None,
                "crossYear": int(cross_year) if pd.notna(cross_year) and cross_year is not None else None
            }

    # Save to JSON
    with open(f"{path}step5_gas_share_summary.json", "w") as f:
        json.dump(result_json, f, indent=2)

    # This part (raw_paths) is already good, it explicitly includes Region
    raw_paths = []
    for (sid, region, stype), group in df_pivot.groupby(["Scenario_ID", "Region", "Scenario_Type"]):
    # Attempt to split Scenario_ID into model and scenario parts
        if " - " in sid:
            model, scenario_name = sid.split(" - ", 1)
        else:
            model = "Unknown"
            scenario_name = sid

        raw_paths.append({
            "model": model,
            "scenario": scenario_name,
            "region": region,
            "type": stype,
            "values": [
                {"year": int(row["Year"]), "value": round(row["Gas_Share"], 2)}
                for _, row in group.iterrows()
            ]
        })
    with open(f"{path}step5_gas_share_paths.json", "w") as f:
        json.dump(raw_paths, f, indent=2)

    
    with open(f"{path}step5_gas_phaseout_paths.json", "w") as f:
        json.dump(exit_years_by_scenario, f, indent=2)

    # --- Time series plotting for ALL Regions (Multiple Plots) ---

    all_regions = sorted(df_pivot["Region"].unique())
    if "World" in all_regions:
        all_regions.remove("World")
        all_regions.insert(0, "World")
    num_regions = len(all_regions)

    # Determine grid size for subplots
    cols = 3 # Let's aim for 3 columns per row
    rows = math.ceil(num_regions / cols)

    # Determine consistent Y-axis limits across all regions
    # Using a fixed range (0-80%) as per previous discussions to ensure comparability.
    y_min_global = 0
    y_max_global = 80

    # Determine consistent X-axis limits
    x_min_global = df_pivot["Year"].min()
    x_max_global = df_pivot["Year"].max()

    fig, axs = plt.subplots(rows, cols, figsize=(cols * 6, rows * 5), sharex=True, sharey=True) # sharex/sharey ensures consistent scales
    axs = axs.flatten() # Flatten the 2D array of axes for easy iteration

    colors = {"Low-BECCS": "blue", "High-BECCS": "red"}

    # Use this to extract handles and labels just once for a single legend
    legend_handles, legend_labels = [], []
    collected_labels = set()

    for i, region_to_plot in enumerate(all_regions):
        ax = axs[i] # Get the current subplot axis

        # Filter data for the current region
        df_region_plot = df_pivot[df_pivot["Region"] == region_to_plot].copy()

        # Medians at 2030 for the CURRENT region
        gas_share_2030_region = df_region_plot[df_region_plot["Year"] == 2030]
        low_beccs_median_region = gas_share_2030_region[gas_share_2030_region["Scenario_Type"] == "Low-BECCS"]["Gas_Share"].median()
        high_beccs_median_region = gas_share_2030_region[gas_share_2030_region["Scenario_Type"] == "High-BECCS"]["Gas_Share"].median()

        for scenario_type in ["Low-BECCS", "High-BECCS"]:
            subset_plot_stype = df_region_plot[df_region_plot["Scenario_Type"] == scenario_type].copy()

            # Faint scenario lines for the current region
            for sid_val in subset_plot_stype["Scenario_ID"].unique():
                 scenario_group = subset_plot_stype[subset_plot_stype["Scenario_ID"] == sid_val]
                 ax.plot(scenario_group["Year"], scenario_group["Gas_Share"],
                         color=colors[scenario_type], alpha=0.05, linewidth=0.5, zorder=1) # zorder to keep lines behind median

            # Group by year for median/IQR bands for the current region
            grouped_region_plot = subset_plot_stype.groupby("Year")["Gas_Share"]
            median_region_plot = grouped_region_plot.median()
            q25_region_plot = grouped_region_plot.quantile(0.25)
            q75_region_plot = grouped_region_plot.quantile(0.75)

            # Shaded band
            ax.fill_between(median_region_plot.index, q25_region_plot, q75_region_plot,
                            color=colors[scenario_type], alpha=0.2, zorder=2)

            # Median line - collect handles for the main legend
            line, = ax.plot(median_region_plot.index, median_region_plot.values,
                color=colors[scenario_type], linewidth=2.5, zorder=3)

            # Annotate cross point (using current region's median)
            cross_val = low_beccs_median_region if scenario_type == "Low-BECCS" else high_beccs_median_region

            if pd.notna(cross_val) and 2030 in median_region_plot.index:
                y_offset = 7 if scenario_type == "High-BECCS" else -7
                ax.annotate(
                    f"{cross_val:.1f}%",
                    xy=(2030, cross_val),
                    xytext=(2030 + 4, cross_val + y_offset),
                    arrowprops=dict(arrowstyle="->", lw=1.2, color=colors[scenario_type]),
                    fontsize=8,
                    color=colors[scenario_type],
                    bbox=dict(boxstyle="round,pad=0.2", fc="white", alpha=0.8, edgecolor=colors[scenario_type]),
                    zorder=10
                )

        # Benchmark lines - using current region's medians
        ax.axvline(2030, color="black", linestyle="--", linewidth=1.5, zorder=0) # Make it thinner

        # Phase-out year lines: effective (2.5%) and total (1.0%) in consistent stacked order
        phaseout_annotation_order = [
            ("Low-BECCS", "effective", "-", "Eff", 0),
            ("Low-BECCS", "total", ":", "Tot", 1),
            ("High-BECCS", "effective", "-", "Eff", 2),
            ("High-BECCS", "total", ":", "Tot", 3),
        ]

        for scenario_type, phase_type, linestyle, label_suffix, stack_idx in phaseout_annotation_order:
            color = colors[scenario_type]
            year = exit_years_summary[phase_type][scenario_type].get(region_to_plot)
            if year is not None and x_min_global <= year <= x_max_global:
                ax.axvline(year, color=color, linestyle=linestyle, linewidth=1.0, alpha=0.8, zorder=0)
                vertical_offset = y_max_global - 5 - (stack_idx * 8)  # 8 units apart
                ax.annotate(
                    f"{label_suffix}: {year}",
                    xy=(year, vertical_offset),
                    xytext=(year + 2, vertical_offset),
                    textcoords="data",
                    fontsize=7,
                    color=color,
                    arrowprops=dict(arrowstyle="->", lw=0.8, color=color),
                    bbox=dict(boxstyle="round,pad=0.2", fc="white", edgecolor=color, alpha=0.9),
                    zorder=10
                )
        
        # Collect benchmark line handles/labels only once for the overall legend
        if low_beccs_median_region is not None:
            label_text = f"Low-BECCS 2030 Median ({low_beccs_median_region:.1f}%)"
            if label_text not in collected_labels:
                collected_labels.add(label_text)
            ax.axhline(low_beccs_median_region, color="blue", linestyle="--", linewidth=1.2, zorder=0)

        if high_beccs_median_region is not None:
            label_text = f"High-BECCS 2030 Median ({high_beccs_median_region:.1f}%)"
            if label_text not in collected_labels:
                collected_labels.add(label_text)
            ax.axhline(high_beccs_median_region, color="red", linestyle="--", linewidth=1.2, zorder=0)


        ax.set_title(f"{region_to_plot}", fontsize=12)
        ax.set_xlabel("Year", fontsize=10)
        ax.set_ylabel("Gas Share (%)", fontsize=10)
        ax.grid(True, linestyle=':', alpha=0.7)
        ax.set_ylim(y_min_global, y_max_global) # Apply consistent Y limits
        ax.set_xlim(x_min_global, x_max_global) # Apply consistent X limits


    # Hide any unused subplots if the number of regions doesn't perfectly fill the grid
    for j in range(i + 1, len(axs)):
        fig.delaxes(axs[j])

    # Define dummy lines just once for legend
    from matplotlib.lines import Line2D

    legend_handles = [
        Line2D([0], [0], color="blue", linewidth=2.5, label="Low-BECCS Median"),
        Line2D([0], [0], color="red", linewidth=2.5, label="High-BECCS Median")
    ]
    legend_labels = ["Low-BECCS Median", "High-BECCS Median"]   

    # Add a single overall legend at the bottom
    fig.legend(
        handles=legend_handles,
        loc="lower center",
        bbox_to_anchor=(0.5, 0.01),  # Moved up from -0.05 to be visible
        ncol=2,                      # Only 2 labels now
        title="Scenario Type",
        fontsize=9,
        title_fontsize=10
    )

    # Add overall title
    plt.suptitle("Gas Share in Electricity Over Time by Scenario Type Across Regions", fontsize=16, y=0.98) # Adjust y for suptitle

    plt.tight_layout(rect=[0, 0.08, 1, 0.95]) # Adjust rect to make space for the overall legend and title
    plt.savefig(output_plot_path, dpi=150)
    plt.close()

if __name__ == "__main__":
    main()