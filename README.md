# Daily Athlete OS — Intervals.icu MCP Server & AI Running Coach

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Protocol-purple.svg)](https://modelcontextprotocol.io/)
[![Tests](https://img.shields.io/badge/Tests-94%20Passed-success.svg)](https://vitest.dev/)

**Daily Athlete OS** combines an Intervals.icu Model Context Protocol (MCP) server, a shared TypeScript physiology and nutrition engine, and a mobile-first Progressive Web App for endurance training and clean bulking.

The MCP server exposes 37 tools for activity telemetry, training load, physiology, and workout planning. The repository also includes 16 agent skills and a Next.js 16 web application backed by Neon PostgreSQL and Drizzle ORM. The PWA keeps business calculations and external API credentials on the server.

> This project is under active development. The web planner, race and lab pages are not fully connected to live backend workflows yet. See [Current implementation status](#-current-implementation-status).

---

## Contents

- [Capabilities](#-capabilities)
- [Architecture](#-architecture)
- [Quick start](#-quick-start)
- [Configuration and secrets](#-configuration-and-secrets)
- [Run the web PWA](#-run-the-web-pwa)
- [MCP client setup](#-mcp-client-setup)
- [Agent skills](#-agent-skills)
- [MCP tools](#-mcp-tools)
- [Current implementation status](#-current-implementation-status)
- [Development and verification](#-development-and-verification)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ Capabilities

- **Intervals.icu telemetry:** Read activities, intervals, streams, wellness records, athlete profile, training zones, power curves, and calendar events.
- **Training intelligence:** Calculate VDOT and pace zones, training load (CTL/ATL/TSB/ACWR), readiness, cardiac drift, weekly duration budgets, race predictions, taper plans, and fueling strategies.
- **Structured workout planning:** Generate Norwegian Singles weekly plans and publish structured workouts to Intervals.icu using its workout DSL.
- **Bulking and strength engine:** Calculate dynamic calorie and macro targets and provide Steve Magness / McGill Big 3 session presets.
- **Daily Athlete OS PWA:** Today Cockpit, athlete onboarding and Intervals sync, daily nutrition/gym logs, CSV export, gym presets, and a 7-second McGill timer.
- **Server-side calculations:** Shared pure functions in `src/utils/` power both MCP tools and web server services. The browser does not calculate nutrition or physiology targets.

## 🏗️ Architecture

```text
                         ┌─────────────────────────────┐
                         │ Shared TypeScript Engine    │
                         │ src/utils/ — pure functions │
                         └──────────────┬──────────────┘
                                        │
                    ┌───────────────────┴────────────────────┐
                    │                                        │
         ┌──────────▼─────────┐                    ┌─────────▼─────────┐
         │ MCP stdio server   │                    │ Next.js PWA       │
         │ 37 tools           │                    │ web/              │
         └──────────┬─────────┘                    └─────────┬─────────┘
                    │                                        │
         ┌──────────▼─────────┐                    ┌─────────▼─────────┐
         │ Intervals.icu API  │                    │ Neon PostgreSQL   │
         └────────────────────┘                    └───────────────────┘
```

- **MCP server:** TypeScript, Node.js, `@modelcontextprotocol/sdk`, JSON-RPC over stdio.
- **Web app:** Next.js App Router, React 19, Tailwind CSS, API route handlers, Drizzle ORM, Neon Serverless PostgreSQL.
- **Database:** `Database/schema.sql` defines the athlete and daily log tables. `Database/sp_get_daily_logs.sql` defines the daily-log summary view.
- **Shared engine:** Pure physiology and nutrition calculators live in `src/utils/` and are covered by the root Vitest suite.

## 🚀 Quick start

### Requirements

- Node.js `>=18` (Node.js 20 or newer recommended)
- pnpm
- Intervals.icu account and API key for live MCP telemetry and web sync
- Neon PostgreSQL database for the web application

### Install and verify the MCP server

```bash
git clone https://github.com/FadhilAlif/Daily-OS-Fadhil.git
cd Daily-OS-Fadhil
pnpm install
pnpm test
pnpm run build
```

### Configure credentials

For the MCP server, create a root `.env` from `.env.example`:

```bash
cp .env.example .env
```

Set the Intervals.icu credentials in that file:

```env
INTERVALS_API_KEY="your_intervals_api_key"
INTERVALS_ATHLETE_ID="i655618"
INTERVALS_API_BASE_URL="https://intervals.icu/api/v1"
```

The web app has separate environment configuration. See [Configuration and secrets](#-configuration-and-secrets).

## 🔐 Configuration and secrets

Create `web/.env.local` from `web/.env.example`. Configure the variables supported by that template, including:

- `DATABASE_URL`: Neon PostgreSQL connection string.
- `INTERVALS_API_KEY`: API key used only by server-side routes.
- `INTERVALS_ATHLETE_ID`: Intervals.icu athlete ID, such as `i655618`.
- `INTERVALS_API_BASE_URL`: Intervals.icu API base URL.
- `DEFAULT_ATHLETE_ID`: Optional database athlete ID for single-athlete mode.

Do not commit `.env`, `.env.local`, connection strings, or API keys. Do not expose Intervals.icu credentials or direct database access to browser code. Environment variable names and defaults are defined by `.env.example` and the server configuration; use that file as the source of truth.

## 🌐 Run the web PWA

```bash
cd web
cp .env.example .env.local
# Fill in DATABASE_URL and the required Intervals.icu credentials
pnpm install
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`.

To verify the production build:

```bash
cd web
pnpm typecheck
pnpm build
```

With pnpm 10/11, dependency lifecycle scripts may require approval. If `pnpm install` reports ignored `esbuild` build scripts, review and approve that dependency from the `web/` directory:

```bash
cd web
pnpm approve-builds esbuild
```

## 🔌 MCP client setup

Build the root MCP server first, then configure your client to run the absolute path to `dist/index.js`. Provide credentials through the MCP client environment or use the server's supported environment loading. Never commit credentials in client configuration files.

Example for Claude Desktop, Antigravity, Cursor, or VS Code MCP configuration:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/Daily-OS-Fadhil/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "YOUR_INTERVALS_API_KEY",
        "INTERVALS_ATHLETE_ID": "i655618"
      }
    }
  }
}
```

The configuration file location varies by MCP client and operating system. See [GUIDE.md](GUIDE.md) for platform-specific setup notes.

## 🤖 Agent skills

The repository contains 16 skills in `.agents/skills/`. They cover weekly planning, readiness, post-run analysis, training load, race strategy, bulking, and strength guidance. Slash command support depends on the agent host; the files can also be used as agent instructions.

| Skill | Purpose |
|---|---|
| `/bulk-plan` | Dynamic clean-bulking calories, macros, meal structure, and gym planning |
| `/plan-week` | Norwegian Singles weekly plan and optional Intervals.icu publishing |
| `/readiness-check` | Daily readiness score and training recommendation |
| `/run-report` | Post-run telemetry and execution analysis |
| `/cardiac-drift` | Aerobic decoupling analysis from activity streams |
| `/fitness-status` | Quick training-load and fitness status |
| `/training-load-analysis` | Detailed CTL, ATL, TSB, ACWR, and ramp-rate analysis |
| `/weekly-budget` | Weekly duration allocation and 75/25 guardrails |
| `/calc-nsa` | Norwegian Singles interval duration matrix |
| `/calc-vdot` | Jack Daniels VDOT and pace zones |
| `/check-workout` | Upcoming planned workout review |
| `/create-workout` | Publish a structured running workout |
| `/strength-guide` | Steve Magness and McGill Big 3 strength guidance |
| `/predict-race` | Race finish-time prediction and taper planning |
| `/race-strategy` | Race pacing, fueling, and hydration plan |
| `running-coach-analysis` | Foundation coaching methodology and athlete context (reference skill) |

For operational workflows, see [`docs/WORKFLOWS-GUIDE.md`](docs/WORKFLOWS-GUIDE.md).

## 🛠️ MCP tools

The server exposes 37 tools across these areas:

| Domain | Tools |
|---|---|
| Activities | `get_activities`, `get_activity_details`, `get_activity_intervals`, `get_activity_streams`, `get_activity_messages`, `add_activity_message` |
| Athlete | `get_athlete_profile`, `get_training_zones` |
| Calculators | `calculate_vdot`, `calculate_pace_zones`, `calculate_nsa_matrix`, `calculate_bulking_plan`, `calculate_readiness_score`, `analyze_cardiac_drift`, `calculate_race_fueling`, `predict_race_time`, `calculate_taper_plan`, `analyze_training_load`, `calculate_weekly_budget` |
| Calendar | `get_events`, `get_event_by_id`, `delete_event`, `add_or_update_planned_workout`, `add_or_update_note`, `get_workout_library`, `get_workout_by_id`, `create_running_workout`, `generate_weekly_plan` |
| Custom items | `get_custom_items`, `get_custom_item_by_id`, `create_custom_item`, `update_custom_item`, `delete_custom_item` |
| Gear & power curves | `get_gear_list`, `get_athlete_power_curves` |
| Wellness | `get_wellness_data`, `get_fitness_chart` |

See [GUIDE.md](GUIDE.md) for descriptions of every tool.

## ✅ Current implementation status

### Available

- Core MCP server and 37 registered tools.
- Shared engine test suite: 94 tests.
- Neon PostgreSQL schema, athlete seed, Drizzle repository and service layer.
- Web API routes for athlete profile, Intervals.icu profile synchronization, readiness, daily-log create/list/delete, CSV export, and gym session presets.
- Today Cockpit integration for live readiness, server-calculated calorie/protein summaries, log history, export, and delete confirmation.
- Bulking & Gym Studio integration for gym presets, server-provided meal plan, timer, and gym log entry.
- Onboarding page for athlete profile and Intervals.icu sync.

### In progress / limitations

- Planner, Lab, and Race pages are not fully integrated with backend services; planner publish endpoint is not implemented.
- The gym quick-log currently uses a placeholder load value for `GYM_SET`; do not treat it as actual per-exercise load data. Use the regular log form for accurate line-item values.
- Readiness may return an explicitly identified fallback estimate if Intervals.icu cannot be reached.
- `X-Api-Key` protection and the full offline PWA workflow are not implemented.
- Treat preset meal values as estimates; record actual intake through the log form.

## 🧪 Development and verification

From the repository root:

```bash
pnpm test
pnpm run build
```

From `web/`:

```bash
pnpm typecheck
pnpm build
```

The root suite currently contains 94 Vitest tests for the shared pure engine and MCP components. The web app has separate TypeScript and production-build checks.

## 📚 Documentation

- [`GUIDE.md`](GUIDE.md) — Full Indonesian installation, operations, API, MCP tools, and skills guide.
- [`docs/PRD.md`](docs/PRD.md) — Product requirements.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Architecture and data model.
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — Development tracker.
- [`docs/WORKFLOWS-GUIDE.md`](docs/WORKFLOWS-GUIDE.md) — AI coaching workflows.

## 📄 License

This project is licensed under the [MIT License](LICENSE) © Muhammad Hadid Wiransetyo.
