# Design Document: Runner Lean Bulking Engine & Skill (`/bulk-plan`)

- **Author**: FadhilAlif & AI Coach
- **Date**: 2026-11-12
- **Status**: Proposed / Pending Review
- **Target Audience / Athlete**: FadhilAlif (`i655618` | 180 cm | 61–64 kg | CP 241W | Jakarta Office Hours)
- **Framework Alignment**: Norwegian Singles Training Method, Steve Magness 5-Tool Framework, `writing-great-skills` guidelines

---

## 1. Problem Statement & Motivation

At 180 cm and 61–64 kg (BMI ~19.4), the athlete maintains high aerobic endurance (CP 241W, HM 2:25:00) but lacks functional upper-body lean mass and upper-body postural endurance. The goal is to reach **66–68 kg** (+4 to 5 kg lean mass, BMI ~20.7) in 12–16 weeks without deteriorating running economy or incurring lower-body delayed onset muscle soreness (DOMS) that disrupts sub-threshold Norwegian Singles running sessions.

Key challenges addressed:
1. **Caloric Drain**: Running burns 450–950 kcal/session; static meal plans fail because caloric expenditure fluctuates wildly between Rest, Easy, and Quality Sub-T days.
2. **Interference Effect (mTOR vs. AMPK)**: Excessive lower-body hypertrophy training causes leg fatigue and blunts mitochondrial signaling.
3. **Office Hours Reality**: Commuting and working 08:00–18:00 WIB in Jakarta requires practical, easily accessible whole foods paired with compact liquid calorie boosters.

---

## 2. Architecture & Components

```
┌────────────────────────────────────────────────────────┐
│               Antigravity Agent Skill                  │
│       .agents/skills/bulk-plan/SKILL.md                │
│    (User/Model Invoked, Deterministic Workflow)        │
└───────────┬────────────────────────────────┬───────────┘
            │ 1. Read Wellness & Events      │ 4. Optional Publish
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│     Intervals.icu     │        │     Intervals.icu     │
│   Existing MCP Tools  │        │   Events / Notes MCP  │
│  - get_wellness_data  │        │ - add_or_update_      │
│  - get_athlete_profile│        │   planned_workout     │
│  - get_events         │        │ - add_or_update_note  │
└───────────┬───────────┘        └───────────────────────┘
            │ Telemetry & Schedule Data
            ▼
┌────────────────────────────────────────────────────────┐
│            Pure Computation Engine                     │
│            src/utils/bulking.ts                        │
│   (BMR/TDEE Math, Dynamic Running Burn, Macros,        │
│    Power-to-Weight Guardrail, Gym Card Presets)        │
└───────────────────────────┬────────────────────────────┘
                            │ Exposed via
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MCP Tool Handler                     │
│               src/tools/intelligence.ts                │
│               `calculate_bulking_plan`                 │
└────────────────────────────────────────────────────────┘
```

### Component Breakdown
1. **Pure Engine (`src/utils/bulking.ts`)**:
   - Zero side-effects; 100% testable unit math.
   - Calculates dynamic TDEE based on day type (Rest, Easy Run, Sub-T Quality, Long Run).
   - Computes macro split: Protein (2.0–2.2 g/kg), Fat (1.0–1.2 g/kg), Carbohydrate (dynamic remainder).
   - Enforces Power-to-Weight safety: calculates minimum CP required at each weight step to preserve W/kg.
   - Generates Gym Sessions (Upper Push, Upper Pull, Upper Pump) with explicit leg volume safeguards.

2. **MCP Tool Registration (`src/tools/intelligence.ts`)**:
   - Tool `calculate_bulking_plan` with Zod validation.
   - Accepts weight, height, age, activity level, running burn calories, and returns structured JSON.

3. **Agent Skill (`.agents/skills/bulk-plan/SKILL.md`)**:
   - Built under `writing-great-skills` principles:
     - Clear leading words (*clean surplus*, *interference shield*, *liquid booster*).
     - Strict completion criteria for each step.
     - Single source of truth; concise model-invoked description.
     - Progressive disclosure: reference material for Jakarta meal combos separated from procedural steps.
   - Direct integration to Intervals.icu MCP: reads recent 14-day weight history and weekly running events; outputs actionable recommendations; optionally writes planned gym workouts and calorie target notes.

---

## 3. Mathematical & Physiological Specifications

### 3.1 Energy Expenditure Model
- **Basal Metabolic Rate (BMR)** (Mifflin-St Jeor):
  $$\text{BMR} = (10 \times \text{weightKg}) + (6.25 \times \text{heightCm}) - (5 \times \text{age}) + 5$$
  For 63 kg, 180 cm, 23 yo:
  $$\text{BMR} = 630 + 1125 - 115 + 5 = 1645 \text{ kcal/day}$$

- **Non-Exercise Activity Thermogenesis (NEAT) & Office Work**:
  $$\text{Baseline TDEE} = \text{BMR} \times 1.375 \approx 2260 \text{ kcal/day}$$

- **Dynamic Running Expenditure**:
  Extracted from scheduled/completed workout energy in Intervals.icu (`icu_joules` / 4184 or duration-based running metabolic cost $\approx 1.0 \times \text{weightKg} \times \text{km}$).
  - *Rest Day*: $+0\text{ kcal}$
  - *Easy Run (45m / ~7 km)*: $+440\text{ kcal}$
  - *Sub-Threshold Quality (55m / ~9 km)*: $+570\text{ kcal}$
  - *Long Run (75–90m / ~13 km)*: $+820\text{ kcal}$
  - *Gym Session (45m upper body)*: $+220\text{ kcal}$

- **Target Clean Surplus**:
  $$\text{Target Surplus} = +350 \text{ to } +450 \text{ kcal/day}$$
  Target weight gain rate: **$+0.25$ to $+0.35$ kg/week** (+1.0 to +1.4 kg/month).

### 3.2 Macro Partitioning
1. **Protein**: $2.0\text{–}2.2\text{ g/kg}$ (~126–140g at 63 kg) $\rightarrow$ maintains muscle protein synthesis amidst high endurance volume.
2. **Fat**: $1.0\text{–}1.2\text{ g/kg}$ (~63–75g at 63 kg) $\rightarrow$ hormonal support, testosterone synthesis, and joint lubrication.
3. **Carbohydrate**: Remainder of daily target ($5.5\text{–}7.5\text{ g/kg}$) $\rightarrow$ replenishes muscle glycogen for LT2 sub-threshold intervals.

### 3.3 Power-to-Weight Ratio Guardrail
- Baseline: $241\text{ W} / 63\text{ kg} = \mathbf{3.83\text{ W/kg}}$.
- At 65 kg: Target CP $\ge \mathbf{249\text{ W}}$ to preserve 3.83 W/kg.
- At 67 kg: Target CP $\ge \mathbf{256\text{ W}}$ to preserve 3.83 W/kg.
- Rule: If weight increases but running power at LT2 drops (>3% decoupling or RPE spike at lower watts), halt caloric surplus increase and consolidate aerobic fitness for 2 weeks.

---

## 4. Training Schedule & Gym Program

Strict adherence to Steve Magness's rule: **"Hard Days Hard, Easy Days Easy"**.

### Weekly Cadence (Office Hours 08:00–18:00 WIB)
- **Monday**: REST Day (Total recovery, baseline surplus +350 kcal).
- **Tuesday**:
  - *05:15–06:15 WIB*: Quality 1 Run (Short Sub-T 10x 3m).
  - *18:30–19:15 WIB*: **Gym Session A — Upper Push Hypertrophy + Lower Neural**.
    - Incline DB Press: 3 sets × 8–10 reps
    - Seated DB Overhead Press: 3 sets × 8–10 reps
    - DB Lateral Raise + Tricep Pushdown: 3 sets × 12–15 reps
    - *Magness Lower Neural*: Trap Bar Deadlift 3 sets × 4 reps @ RPE 7.5–8 (explosive concentric, crisp form, no failure)
    - *Spinal Armor*: McGill Big 3 (Descending Pyramid 6-4-2, 7s hold)
- **Wednesday**: 05:15 WIB Easy Run (45m) + Evening Rest.
- **Thursday**: 05:15 WIB Easy Run (40m) + Evening Rest.
- **Friday**:
  - *05:15–06:15 WIB*: Quality 2 Run (Medium Sub-T 5x 6m).
  - *18:30–19:15 WIB*: **Gym Session B — Upper Pull Hypertrophy (V-Taper) + Pelvic Armor**.
    - Lat Pulldown / Neutral Pull-Up: 3 sets × 8–10 reps
    - Chest-Supported Machine Row: 3 sets × 10–12 reps
    - Face Pulls + Incline DB Bicep Curl: 3 sets × 12–15 reps
    - *Pelvic Armor*: Single-Leg RDL (2 sets × 8 reps/leg) + Bent-Knee Calf Isometric Wall Hold (2 sets × 30s)
    - *Spinal Armor*: McGill Big 3
- **Saturday**:
  - *06:00 WIB*: Shakeout Recovery Run (30m).
  - *10:00 or 16:00 WIB*: **Gym Session C — Upper Hypertrophy Pump & Arms**.
    - Flat DB/Machine Chest Press: 3 sets × 10–12 reps
    - Seated Cable Row / Pullover: 3 sets × 10–12 reps
    - DB Hammer Curl + Overhead Tricep Extension: 3 sets × 12–15 reps
    - Lateral Raise dropset: 3 sets × 15 reps
    - *Zero lower-body loading*: preserves legs for Sunday Long Run.
- **Sunday**: 05:15 WIB Pure Aerobic Long Run (75–90m) + High Calorie Replenishment Day.

---

## 5. Practical Jakarta Nutrition Protocol

### 5-Meal Structure (3 Solid Meals + 2 Liquid Boosters)
1. **Pre-Run (04:45 WIB — ~200 kcal)**:
   - 1 Banana + 1 slice white bread with honey + 200ml water.
2. **Post-Run & Breakfast (07:15 WIB — ~700 kcal, 40g Protein)**:
   - **Liquid Booster #1**: 250ml Full Cream Milk + 1 scoop Whey Protein + 40g Instant Oats + 1 tbsp Peanut Butter + 1 Banana blended.
3. **Office Lunch (12:30 WIB — ~850 kcal, 45g Protein)**:
   - Warteg / Rumah Makan Padang / Ayam Bakar: 1.5 portions rice, Double Protein (e.g., 1 Grilled Chicken Breast/Thigh + 2 Eggs or Tempe Orek), Green Veggies.
4. **Pre-Gym / Afternoon Snack (16:45 WIB — ~400 kcal, 20g Protein)**:
   - Indomaret/Alfamart: 1 Onigiri / Sandwich + 250ml Ultra Milk / MilkLife / Cimory Protein + 1 Banana.
5. **Post-Gym Dinner (19:45 WIB — ~850 kcal, 45g Protein)**:
   - Rice + Meat/Fish/Chicken (Double portion) + Stir-fry veggies.
   - *Late Evening Top-Up (if target calories < plan)*: 1 glass warm milk + biscuits or whey shake.

---

## 6. Implementation Plan & Workflows

1. **Phase 1: Pure Engine & Tests**
   - Create `src/utils/bulking.ts` and test suite `src/utils/bulking.test.ts`.
   - Verify Mifflin-St Jeor math, macro calculations, weekly schedule generation, and edge cases.
2. **Phase 2: MCP Tool Integration**
   - Register `calculate_bulking_plan` in `src/tools/intelligence.ts`.
   - Rebuild MCP server (`pnpm run build`) and run test suite (`pnpm test`).
3. **Phase 3: Antigravity Skill Definition**
   - Author `.agents/skills/bulk-plan/SKILL.md` using `writing-great-skills` guidelines.
   - Provide clear triggers, step-by-step evaluation, and Intervals.icu calendar publishing via `add_or_update_planned_workout` and `add_or_update_note`.
4. **Phase 4: Docs & Guide Synchronization**
   - Update `docs/WORKFLOWS-GUIDE.md`, `.agents/README.md`, and `.agents/rules/project-context.md`.

---

## 7. Spec Self-Review Check

- **Placeholders**: Checked. No "TBD", "TODO", or vague parameters.
- **Internal Consistency**: Matches athlete biometrics (180 cm, 63 kg baseline, 23 yo, CP 241W) and Steve Magness's rules in `docs/references/steve-magness/05-strength-training-for-runners.md`.
- **Scope**: Single focused system: dynamic caloric calculation, hyper-targeted gym schedule, and calendar integration.
- **Ambiguity**: All macro formulas and progression steps explicitly stated.
