# Phasing Out Fossil Gas in 1.5°C Pathways

[![AWS Amplify Deploy Status](https://img.shields.io/badge/deployed-AWS%20Amplify-4CAF50?logo=amazon-aws&logoColor=white)](https://main.d1n7nou6rui1bo.amplifyapp.com/)

> <a href="https://main.d1n7nou6rui1bo.amplifyapp.com/" target="_blank">View Live Dashboard →</a>

This project analyzes global least-cost 1.5°C-compatible scenarios to assess the role of fossil gas in the power sector. Outputs inform a joint NGO position on halting new gas-fired power investments, supported by a fully reproducible backend and interactive public dashboard.

### Table of Contents
---

- [Folder Structure](#folder-structure)
- [Backend: Data Processing, Cleaning & Harmonization](#backend-data-processing-cleaning--harmonization)
  - [Scripts Used](#scripts-used)
  - [Scenario Filtering and Harmonization](#scenario-filtering-and-harmonization)
  - [Reproduce our experiment](#reproduce-our-experiment)
- [Frontend: Dashboard and Visualization](#frontend-dashboard-and-visualization)
  - [Frontend Structure](#frontend-structure)
  - [Dashboard Inputs (auto-generated)](#dashboard-inputs-auto-generated)
- [Notes](#notes)
- [License & Citation](#license--citation)

## Folder Structure

```plaintext
1.5gas/
├── backend/                   → All data processing and automation
│   ├── data/                  → Raw input (e.g. scenario_data.xlsx)
│   ├── scripts/               → Data processing scripts
│   ├── outputs/               → (Optional) intermediate CSVs for inspection
│   └── public_data/           → Final JSONs (auto-copied to frontend)
│
├── frontend/                  → Next.js dashboard (deployed via AWS Amplify)
│   ├── public/data/           → Final data for dashboard (auto-synced)
│   └── src/                   → Pages, components, loaders
│
├── README.md
└── requirements.txt
```

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>

## Backend: Data Processing, Cleaning & Harmonization

This backend pipeline transforms raw scenario data into a harmonized, analysis-ready format. The input — a single Excel file of global power generation scenarios — goes through a structured series of preprocessing steps, including filtering, reshaping, interpolation, and metric calculation.

Each step is modular and reproducible. Intermediate outputs are saved to CSVs for inspection, and the final outputs are exported as JSONs for use in the frontend dashboard. Scenarios are never dropped; instead, we flag those that required interpolation to ensure full transparency. This process enables robust comparisons across models, regions, and assumptions.

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>

### Scripts Used
---
| Step | Script                          | Inputs                                                   | Outputs                                                                                 | Purpose                                                   |
|------|----------------------------------|----------------------------------------------------------|------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| 1    | `step1_filter_beccs.py`         | `backend/data/scenario_data.xlsx`                        | `step1_scenario_type.csv`                                                               | Tag scenarios as Low-/High-BECCS                          |
| 2    | `step2_clean_electricity.py`    | `backend/data/scenario_data.xlsx`                        | `step2_electricity_long.csv`                                                            | Reshape electricity & gas to long format                  |
| 3    | `step3_standardize_timeseries.py`| `step2_electricity_long.csv`                             | `step3_standardized.csv`, `step3_modified_scenarios.csv`                                | Ensure all scenarios have complete 2010–2100 data using linear interpolation |
| 4    | `step4_calculate_indicators.py` | `step3_standardized.csv`, `step1_scenario_type.csv`      | `step4_metrics.csv`, `step4_skipped_exit_years.csv`                                     | Calculate gas share, % drop, and gas phase-out year       |
| 5    | `step5_aggregate_outputs.py`    | `step4_metrics.csv`                                      | `step5_region_summary.json`, `step5_benchmark_stats.json`                               | Compute regional summaries and benchmarks                 |
| 6    | `step6_export_json.py`          | All `.csv`/`.json` from above                            | `step6_scenario_timeseries.json`, `step6_scenario_table.json`, `step6_map_data.json`, `step6_country_region_map.json` | Export dashboard-ready JSONs                             |

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>


### Scenario Filtering and harmonization
---

To ensure fair and consistent comparisons across all scenarios, we apply a standardization step to the raw time series data. The 86 input scenarios vary in their reporting—some start in different years, skip intermediate years, or only report every 10 years. To harmonize these:

- We restrict the time range to 2010–2100, dropping any values outside this window.
- We apply linear interpolation to fill in missing years, ensuring that every scenario has values for each 5-year step (e.g. 2010, 2015, ..., 2100).
- We retain all scenarios. Those that required interpolation are flagged in a separate CSV (step3_modified_scenarios.csv) for full transparency.

This preprocessing step preserves all available modeling insights, while enabling robust comparisons across regions, models, and BECCS assumptions.

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>


### Reproduce our experiment
---

```plaintext
# 1. Clone the repo
git clone https://github.com/your-org/1.5-gas-dashboard
cd 1.5-gas-dashboard

# 2. Set up Python environment
## (Linux/macOS)
python -m venv venv
source venv/bin/activate

## (Windows CMD)
venv\Scripts\activate.bat

## (Windows PowerShell)
.\venv\Scripts\Activate

pip install -r requirements.txt

# 3. Place scenario data
cp scenario_data.xlsx backend/data/

# 4. Run full backend pipeline
python backend/run.py

# 5. Start the dashboard
cd frontend
npm install
npm run dev
```

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>


## Frontend: Dashboard and Visualization
The frontend is a lightweight, nulti-page dashboard built with Next.js, React, and Tailwind CSS. It allows users to explore phase-out trajectories, benchmark metrics, and download data — all from a clean, interactive interface.

The dashboard reads static JSON files generated by the backend (no API required), ensuring fast load times and easy deployment via AWS Amplify. Users can filter scenarios, view time-series trends, inspect methods, and compare region-level summaries. The goal: make complex energy modeling insights accessible to both experts and non-specialists.

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>

### Frontend Structure
---
| Path                 | Purpose                                               |
|----------------------|--------------------------------------------------------|
| `pages/index.tsx`    | Landing page with narrative and visuals               |
| `pages/dashboard.tsx`| Interactive explorer (globe, toggles, charts)         |
| `pages/data.tsx`     | Downloadable data table                               |
| `pages/methods.tsx`  | Methods and caveats explanation                       |
| `components/`        | Reusable UI/chart components                          |
| `lib/data/`          | JSON data loaders                                     |
| `public/data/`       | Final synced data from backend                        |

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>


### Dashboard Inputs (auto-generated)
---
| File                      | Description                                                |
|---------------------------|------------------------------------------------------------|
| `scenario_timeseries.json`| Time series of gas share and gen by scenario/region        |
| `region_summary.json`     | Avg % drop and gas share by region                         |
| `benchmark_stats.json`    | 2030 gas share and exit year benchmarks                    |
| `scenario_table.json`     | Scenario-wise comparison table                             |
| `map_data.json`           | Regional reductions for maps                               |
| `country_region_map.json` | Country-to-region mapping for visualizations               |

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>


## Notes
- All scenarios are 1.5°C-aligned; filtered by BECCS use (< or ≥ 3000 MtCO₂ in 2050).
- Phase-out year is defined as when gas falls below 0.1 EJ.
- Outputs are structured for direct frontend use — no API needed.

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>


## License & Citation

MIT License. Please cite this repository or link to the dashboard when using these results in publications or campaigns.

<div align="right">
  <a href="#table-of-contents">
    <img src="https://img.shields.io/badge/↑ Back to TOC-blue?style=for-the-badge" alt="Back to TOC">
  </a>
</div>

