import pandas as pd
import os
import json
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.offsetbox import AnchoredText

def main():
    # Load data
    path = "backend/public_data/"
    df = pd.read_csv(f"{path}step3_standardized.csv")
    df_type = pd.read_csv(f"{path}step1_scenario_type.csv")
    df_type.rename(columns={"BECCS_Type": "Scenario_Type"}, inplace=True)

    df = df.merge(df_type, on="Scenario_ID", how="left")

    # Filter for gas and total electricity
    gas = df[df["Variable_standardized"] == "Electricity|Gas"]
    total = df[df["Variable_standardized"] == "Electricity"]

    # 2020 & 2030 data
    gas_2020 = gas[gas["Year"] == 2020][["Scenario_ID", "Region", "Value"]].rename(columns={"Value": "Gas_2020"})
    gas_2030 = gas[gas["Year"] == 2030][["Scenario_ID", "Region", "Value", "Scenario_Type"]].rename(columns={"Value": "Gas_2030"})
    total_2030 = total[total["Year"] == 2030][["Scenario_ID", "Region", "Value"]].rename(columns={"Value": "Total_2030"})

    merged = gas_2030.merge(gas_2020, on=["Scenario_ID", "Region"], how="inner")
    merged = merged.merge(total_2030, on=["Scenario_ID", "Region"], how="inner")

    # Metrics
    merged["Pct_Drop"] = 100 * (merged["Gas_2020"] - merged["Gas_2030"]) / merged["Gas_2020"]
    merged["Gas_Share_2030"] = 100 * merged["Gas_2030"] / merged["Total_2030"]

    def summarize(group, col):
        return {
            "min": group[col].min(),
            "mean": group[col].mean(),
            "median": group[col].median(),
            "max": group[col].max()
        }

    result = {}
    for scenario_type, group in merged.groupby("Scenario_Type"):
        result[scenario_type] = {
            "gas_2030_ej": summarize(group, "Gas_2030"),
            "pct_drop_2020_2030": summarize(group, "Pct_Drop"),
            "gas_share_2030_pct": summarize(group, "Gas_Share_2030")
        }

    with open(f"{path}step5_benchmark_stats.json", "w") as f:
        json.dump(result, f, indent=2)

    merged_out = merged[[ "Scenario_ID", "Region", "Scenario_Type", "Gas_2020", "Gas_2030", "Total_2030", "Pct_Drop", "Gas_Share_2030" ]]
    merged_out.to_csv(f"{path}step5_scenario_gas_stats.csv", index=False)

    # Region-level summary for map (Low/High-BECCS comparison)
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
            "gas_share_2030": round(row["Gas_Share_2030"], 2)
        }

    # Export to JSON
    with open(f"{path}step5_region_summary.json", "w") as f:
        json.dump(region_data, f, indent=2)

    # Time series plotting
    df_filtered = df[df["Variable_standardized"].isin(["Electricity", "Electricity|Gas"])]
    df_pivot = df_filtered.pivot_table(
        index=["Scenario_ID", "Region", "Year", "Scenario_Type"],
        columns="Variable_standardized",
        values="Value"
    ).reset_index()
    df_pivot = df_pivot[df_pivot["Electricity"] > 0]
    df_pivot["Gas_Share"] = 100 * df_pivot["Electricity|Gas"] / df_pivot["Electricity"]
    df_pivot = df_pivot[df_pivot["Gas_Share"].notna()]

    # Medians at 2030
    gas_share_2030 = df_pivot[df_pivot["Year"] == 2030]
    low_beccs_median = gas_share_2030[gas_share_2030["Scenario_Type"] == "Low-BECCS"]["Gas_Share"].median()
    high_beccs_median = gas_share_2030[gas_share_2030["Scenario_Type"] == "High-BECCS"]["Gas_Share"].median()

    plt.figure(figsize=(14, 7))
    colors = {"Low-BECCS": "blue", "High-BECCS": "red"}

    for scenario_type in ["Low-BECCS", "High-BECCS"]:
        subset = df_pivot[df_pivot["Scenario_Type"] == scenario_type]

        # Faint scenario lines
        for (sid, region), group in subset.groupby(["Scenario_ID", "Region"]):
            plt.plot(group["Year"], group["Gas_Share"], color=colors[scenario_type], alpha=0.05, linewidth=0.5)

        grouped = subset.groupby("Year")["Gas_Share"]
        median = grouped.median()
        q25 = grouped.quantile(0.25)
        q75 = grouped.quantile(0.75)

        # Shaded band
        plt.fill_between(median.index, q25, q75, color=colors[scenario_type], alpha=0.2)

        # Median line
        plt.plot(median.index, median.values, color=colors[scenario_type], linewidth=2.5, label=f"{scenario_type} Median")

        # Annotate cross point
        cross_val = low_beccs_median if scenario_type == "Low-BECCS" else high_beccs_median
        cross_year = median[median <= cross_val].index.min()
        if pd.notna(cross_year):
        # High-BECCS should be higher (smaller offset)
            y_offset = 7 if scenario_type == "High-BECCS" else -7
            plt.annotate(
                f"{scenario_type} crosses 2030 median ({cross_val:.1f}%)",
                xy=(cross_year, median.loc[cross_year]),
                xytext=(cross_year + 4, median.loc[cross_year] + y_offset),
                arrowprops=dict(arrowstyle="->", lw=1.2, color=colors[scenario_type]),
                fontsize=9,
                color=colors[scenario_type],
                bbox=dict(boxstyle="round,pad=0.3", fc="white", alpha=0.8, edgecolor=colors[scenario_type])
            )

    # Benchmark lines
    plt.axvline(2030, color="black", linestyle="--", linewidth=2)
    plt.axhline(low_beccs_median, color="blue", linestyle="--", linewidth=1.2, label=f"Low-BECCS 2030 Median ({low_beccs_median:.1f}%)")
    plt.axhline(high_beccs_median, color="red", linestyle="--", linewidth=1.2, label=f"High-BECCS 2030 Median ({high_beccs_median:.1f}%)")

    # Legend and IQR explanation
    plt.legend(loc="upper right")

    # Add IQR annotation manually at ~70% height and aligned right
    plt.gca().text(
        0.99, 0.8,  # x=1.0 aligns with right edge; y=0.72 is ~70% up
        "Shaded area = Interquartile Range (25th–75th percentile)\nacross scenario pathways",
        fontsize=9,
        ha="right",
        va="top",
        transform=plt.gca().transAxes,  # <- THIS is key for axes alignment
        bbox=dict(boxstyle="round,pad=0.4", facecolor="white", edgecolor="gray", alpha=0.85)
    )

    plt.title("Gas Share in Electricity Over Time by Scenario Type", fontsize=14)
    plt.xlabel("Year")
    plt.ylabel("Gas Share (%)")
    plt.ylim(0, 80)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"{path}step5_diagnostic1_gas_share_timeseries.png", dpi=150)
    plt.close()

if __name__ == "__main__":
    main()
