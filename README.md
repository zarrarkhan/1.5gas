# 📊 Phasing Out Fossil Gas in 1.5°C Pathways

This project analyzes global least-cost 1.5°C-compatible scenarios to assess the role of fossil gas in the power sector. Outputs inform a joint NGO position on halting new gas-fired power investments, supported by a fully reproducible backend and interactive public dashboard.

---

## 📁 Folder Structure

```plaintext
1.5gas/
├── backend/                   → All data processing and automation
│   ├── data/                  → Raw input (e.g. scenario_data.xlsx)
│   ├── scripts/               → Data processing scripts
│   ├── outputs/               → (Optional) intermediate CSVs for inspection
│   └── public_data/           → Final JSONs (auto-copied to frontend)
│
├── frontend/                  → Next.js dashboard
│   ├── public/data/           → Final data for dashboard (auto-synced)
│   └── src/                   → Pages, components, loaders
│
├── README.md
└── requirements.txt
```

## 🔁 Backend Data Processing Overview
| Step | Script                      | Inputs                                                   | Outputs                                                 | Purpose                                         |
|------|-----------------------------|----------------------------------------------------------|----------------------------------------------------------------------------------------------------|-------------------------------------------------|
| 1    | `1_filter_beccs.py`         | `backend/data/scenario_data.xlsx`                        | `scenario_type.csv`                                                                                | Tag scenarios as Low-/High-BECCS               |
| 2    | `2_clean_electricity.py`    | `backend/data/scenario_data.xlsx`                        | `electricity_long.csv`                                                                             | Reshape electricity & gas to long format       |
| 3    | `3_calculate_indicators.py` | `electricity_long.csv`, `scenario_type.csv`              | `metrics.csv`                                                                                      | Calculate gas share, % drop, phase-out year     |
| 4    | `4_aggregate_outputs.py`    | `metrics.csv`                                            | `region_summary.json`, `benchmark_stats.json`                                                      | Compute regional summaries and benchmarks       |
| 5    | `5_export_json.py`          | All above `.csv` and `.json` files from steps 1–4        | `scenario_timeseries.json`, `scenario_table.json`, `map_data.json`, `country_region_map.json`      | Export all dashboard-ready JSONs and sync them |


## 🧪 Reproducibility: From 0 to Dashboard

```plaintext
# 1. Clone the repo
git clone https://github.com/your-org/1.5-gas-dashboard
cd 1.5-gas-dashboard

# 2. Set up Python environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Place scenario data
cp scenario_data.xlsx backend/data/

# 4. Run full backend pipeline
python backend/scripts/1_filter_beccs.py
python backend/scripts/2_clean_electricity.py
python backend/scripts/3_calculate_indicators.py
python backend/scripts/4_aggregate_outputs.py
python backend/scripts/5_export_json.py  # Also copies to frontend

# 5. Start the dashboard
cd frontend
npm install
npm run dev
```

## 🖥️ Dashboard Overview
A lightweight Next.js + React + Tailwind app for exploring gas phase-out scenarios.

### 📁 Frontend Structure
| Path                 | Purpose                                               |
|----------------------|--------------------------------------------------------|
| `pages/index.tsx`    | Landing page with narrative and visuals               |
| `pages/dashboard.tsx`| Interactive explorer (globe, toggles, charts)         |
| `pages/data.tsx`     | Downloadable data table                               |
| `pages/methods.tsx`  | Methods and caveats explanation                       |
| `components/`        | Reusable UI/chart components                          |
| `lib/data/`          | JSON data loaders                                     |
| `public/data/`       | Final synced data from backend                        |


### 📦 Dashboard Inputs (auto-generated)
| File                      | Description                                                |
|---------------------------|------------------------------------------------------------|
| `scenario_timeseries.json`| Time series of gas share and gen by scenario/region        |
| `region_summary.json`     | Avg % drop and gas share by region                         |
| `benchmark_stats.json`    | 2030 gas share and exit year benchmarks                    |
| `scenario_table.json`     | Scenario-wise comparison table                             |
| `map_data.json`           | Regional reductions for maps                               |
| `country_region_map.json` | Country-to-region mapping for visualizations               |


## 📌 Notes
- All scenarios are 1.5°C-aligned; filtered by BECCS use (< or ≥ 3000 MtCO₂ in 2050).
- Phase-out year is defined as when gas falls below 0.1 EJ.
- Outputs are structured for direct frontend use — no API needed.

## 🧾 License & Citation
MIT License. Please cite this repository or link to the dashboard when using these results in publications or campaigns.

---