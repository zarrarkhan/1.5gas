import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns

def main():
    input_path = "backend/public_data/step2_electricity_long.csv"
    output_path = "backend/public_data/step3_standardized.csv"
    modified_output = "backend/public_data/step3_modified_scenarios.csv"
    plot_dir = "backend/public_data"

    df = pd.read_csv(input_path)
    df["Year"] = df["Year"].astype(int)

    # Normalize variable names to handle variation
    df["Variable_clean"] = df["Variable"].str.strip().str.lower()
    var_map = {
        "secondary energy|electricity": "Electricity",
        "secondary energy|electricity|gas": "Electricity|Gas"
    }
    df["Variable_standardized"] = df["Variable_clean"].map(var_map)

    variables = ["Electricity", "Electricity|Gas"]

    # 🔄 Interpolation
    all_years = list(range(2010, 2101, 5))
    modified_rows = []


    def interpolate_group(group):
        # Only keep years in the target range
        group = group[(group["Year"] >= 2010) & (group["Year"] <= 2100)]
        group = group.drop_duplicates(subset="Year")

        # Build complete year index at 5-year steps
        full_years = pd.DataFrame({'Year': all_years})
        merged = pd.merge(full_years, group, on="Year", how="left")

        before = merged["Value"].isna().sum()
        merged["Value"] = (
            merged["Value"]
            .interpolate(method="linear", limit_direction="both")
            .ffill()
            .bfill()
        )
        after = merged["Value"].isna().sum()

        if before > 0:
            modified_rows.append(group.iloc[0]["Scenario_ID"])

        # Copy metadata columns
        for col in ["Scenario_ID", "Model", "Scenario", "Region", "Variable", "Unit", "Variable_clean", "Variable_standardized"]:
            merged[col] = group[col].iloc[0]
        return merged
    

    standardized = (
        df.groupby(["Scenario_ID", "Variable", "Region"], group_keys=False)
        .apply(interpolate_group)
    )
    standardized = standardized.reset_index(drop=True)

    os.makedirs("backend/public_data", exist_ok=True)
    standardized.to_csv(output_path, index=False)
    pd.DataFrame({"Scenario_ID": sorted(set(modified_rows))}).to_csv(modified_output, index=False)

    # Plot 1: Original + Harmonized Time Series
    fig, axs = plt.subplots(2, 2, figsize=(16, 10), sharey=True, sharex=True)
    datasets = [df, standardized]
    titles = ["Original", "Harmonized"]

    # Use this to extract handles and labels just once
    legend_ax = axs[0][0]
    legend_handles, legend_labels = None, None

    for row, data in enumerate(datasets):
        for col, var in enumerate(variables):
            ax = axs[row][col]
            subset = data[data["Variable_standardized"] == var]
            if not subset.empty:
                # Only keep legend for the first subplot temporarily
                show_legend = (ax == legend_ax)
                sns.lineplot(
                    data=subset,
                    x="Year", y="Value", hue="Model", ax=ax,
                    linewidth=0.8, alpha=0.6, legend=show_legend
                )

            ax.set_title(f"{titles[row]} - {var}")
            ax.set_xlabel("Year")
            if col == 0:
                ax.set_ylabel("Value")
            else:
                ax.set_ylabel("")

    # ✅ Extract handles and remove the local legend
    legend_handles, legend_labels = legend_ax.get_legend_handles_labels()
    legend_ax.legend_.remove()

    # ✅ Place single shared legend at bottom center
    fig.legend(
        legend_handles, legend_labels,
        loc="lower center", bbox_to_anchor=(0.5, -0.1),
        ncol=4, title="Model", fontsize=8, title_fontsize=9
    )

    plt.suptitle("Time Series by Variable – Before and After Harmonization", fontsize=16, y=1.02)
    plt.tight_layout(rect=[0, 0.05, 1, 1])  # add space for bottom legend
    plt.savefig(f"{plot_dir}/step3_diagnostics1_timeseries_by_variable.png", bbox_inches="tight")
    plt.close()

    # Plot 2: Original + Harmonized Timeline Heatmaps
    fig, axs = plt.subplots(2, 2, figsize=(18, 12), sharey=True, sharex=True)
    datasets = [df, standardized]
    titles = ["Original", "Harmonized"]

    # Build consistent model index
    all_models = sorted(set(df["Model"]).union(set(standardized["Model"])))

    # Separate year ranges for original vs harmonized
    full_years = list(range(2000, 2101, 5))


    for row, data in enumerate(datasets):
        timeline_df = data[data["Variable_standardized"].isin(variables)]
        year_list = full_years
        for col, var in enumerate(variables):
            ax = axs[row][col]
            subset = timeline_df[timeline_df["Variable_standardized"] == var]
            if subset.empty:
                continue

            pivot = (
                subset
                .groupby(["Model", "Year"])
                .size()
                .unstack(fill_value=0)
                .astype(bool)
                .astype(int)
            )

            # ✅ Ensure consistent axes by reindexing
            pivot = pivot.reindex(index=all_models, columns=year_list, fill_value=0)

            sns.heatmap(
                pivot,
                cmap=sns.color_palette(["white", "steelblue"], as_cmap=True),
                ax=ax,
                cbar=False,
                linewidths=0.5,
                linecolor="white"
            )

            ax.set_title(f"{titles[row]} - {var}")
            ax.set_xlabel("Year")
            if col == 0:
                ax.set_ylabel("Model")
            else:
                ax.set_ylabel("")

    plt.suptitle("Timeline Heatmap – Before and After Harmonization", fontsize=14)
    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.savefig(f"{plot_dir}/step3_diagnostics2_timeline_heatmap.png")
    plt.close()

    # 🔹 Plot 3: Histogram of number of scenarios by model
    count_df = df[["Model", "Scenario_ID"]].drop_duplicates()
    model_counts = count_df.groupby("Model")["Scenario_ID"].count().reset_index()
    model_counts = model_counts.sort_values(by="Scenario_ID", ascending=False)

    plt.figure(figsize=(12, 5))
    ax = sns.barplot(data=model_counts, x="Model", y="Scenario_ID", color="skyblue")
    plt.xticks(rotation=45, ha="right")
    plt.xlabel("Model")
    plt.ylabel("Number of Scenarios")
    plt.title("Number of Scenarios per Model")

    # Place labels above bars
    for bar, count in zip(ax.patches, model_counts["Scenario_ID"]):
        x = bar.get_x() + bar.get_width() / 2
        y = bar.get_height()
        ax.text(x, y + 0.5, str(count), ha='center', va='bottom', fontsize=8)

    # Force integer ticks on Y-axis
    ax.yaxis.set_major_locator(plt.MaxNLocator(integer=True))

    # Total scenario count
    total_scenarios = df["Scenario_ID"].nunique()
    plt.text(
        0.98, 0.95,
        f"Total Scenarios: {total_scenarios}",
        ha="right", va="top", transform=ax.transAxes,
        fontsize=10, bbox=dict(facecolor='white', edgecolor='black', boxstyle='round,pad=0.3')
    )

    plt.tight_layout()
    plt.savefig(f"{plot_dir}/step3_diagnostics3_model_scenario_histogram.png")
    plt.close()

    print("✅ Step 3 completed. Outputs and diagnostics saved.")

if __name__ == "__main__":
    main()
