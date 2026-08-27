# WeAreFit • System Architecture & Product Guide

## 1. Executive Summary & Core Philosophy
**WeAreFit** is a subtractive health and biological habit companion built on the fundamental principle that every human wakes up with **100 Health Points (100 HP)** every single morning. Rather than using additive or vanity gamification points, WeAreFit treats daily health like a **financial balance sheet**: healthy behaviors defend your baseline score, lifestyle compromises deduct specific penalties, and same-day recovery protocols restore balance before debt compounds into chronic fatigue.

---

## 2. Core Feature Breakdown

### 🌿 1. Subtractive 100 HP Engine & Itemized Statements
- **Baseline Principle**: Every day starts at exactly 100 HP.
- **Deductive Penalties**: 
  - Ultra-processed snacks / sodas: `-14 HP`
  - Restaurant & outside dining: `-9 HP`
  - Low food quality rating: `-6 to -15 HP`
  - Sleep deprivation ($<6\text{h}$): `-8 to -22 HP`
  - Sedentary activity ($<3.5\text{k}$ steps): `-6 to -12 HP`
  - Dehydration ($<2.0\text{L}$): `-4 to -6 HP`
- **Authentic Thermal Statement Receipt**: 
  - Renders a clean itemized slip with bold `WEAREFIT • RX` branding, date stamp, exact point breakdown, and a verification barcode.

---

### 🎯 2. One Best Thing Today (Daily Focus)
- **Concept**: Prevents decision fatigue by eliminating bloated 20-item habit checklists.
- **Intelligent Habit Prioritization**: Analyzes biological state and highlights the single highest-impact priority for the day (e.g. *100% Single-Ingredient Whole Foods*, *8.5h Deep Sleep Catchup*, or *20-Min Morning Sunshine & Walk*).
- **Interactive Habit Momentum**: Tracks 7-day consistency with a responsive bar chart and live completion tracking.

---

### 🌱 3. Living Meadow Garden
- **Visual Ecosystem**: Your daily health choices sprout directly into an interactive visual meadow.
- **Flora vs. Weeds**:
  - Nutritious whole foods, deep sleep, and consistent movement bloom into vibrant flora (*Avocados, Broccoli, Strawberries, Forest Canopies*).
  - Junk food, late nights, and dehydration sprout weed gremlins (*Burger Gremlins, Wilted Stems*).
- **Interactive Inspection**: Tap any plant to inspect its sprouting date and open its historical daily statement receipt.
- **Clean Header**: Features a mini circular vitality gauge ($83\%$) and quick-filter button (*All Items, Living Blooms, Weeds*).

---

### 🔮 4. Instant "Should I...?" Decision Advisor
- **Pre-Commitment Intelligence**: Consult the advisor *before* ordering cheat meals, skipping workouts, or staying up late.
- **Real-Time HP Impact**: Calculates exact trade-offs (e.g. *Ordering Late Night Pizza $\rightarrow$ -12 HP*).
- **Compensatory Countermeasures**: Offers instant same-day recovery actions (e.g. *Take 20-min digestion walk $\rightarrow$ +5 HP*).
- **One-Tap Execution**: Tapping "I Did This" automatically itemizes the decision onto your daily statement and adds recovery tasks to your daily plan.

---

### ⚡ 5. Today's Recovery Plan & Yesterday's Debt Carryover
- **Same-Day Interventions**: Time-sensitive action cards with countdown timers (e.g. *Drink 2.0L Electrolyte Water (3h Left)*, *High-Protein Refuel Meal*, *20-Min Digestion Walk*).
- **Yesterday's Debt Carryover**: If yesterday had sleep debt or nutritional slip-ups, Today's Plan automatically carries forward actionable recovery tasks to pay off fatigue debt before it accumulates.
- **Tomorrow's Prescription Protocol**: Provides targeted prescriptions for the upcoming morning (*Zero Refined Sugar Protocol, 100% Home-Cooked Meals, 8.5h Deep Sleep*).

---

### 📊 6. Interactive Calendar & Historical Health Logs
- **Day-by-Day Historical View**: Monthly calendar matrix color-coded by vitality score ($\ge 80\text{ HP}$ Green, $65-79\text{ HP}$ Amber, $<65\text{ HP}$ Rose).
- **Direct Historical Editing**: Select any historical date (e.g., August 12) and tap **"Edit Day Log"** to inspect or modify past entries.

---

### ⚙️ 7. Profile & Target Metrics Customizer
- **Visual Icon Range Sliders**: Smooth interactive sliders with dedicated icons for **Weight (kg)**, **Height (cm)**, **Daily Calories (kcal)**, **Sleep Target (hrs)**, and **Step Target**.
- **Data Privacy & Portability**: 100% client-side `localStorage` data persistence with 1-click JSON backup export.

---

## 3. Technology Stack & Deployment
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling**: Material 3 Design Tokens + Tailwind CSS with dark-green/sand biological palette.
- **Animation**: Framer Motion for spring physics and layout transitions.
- **State Management**: Zustand persisted client-side.
- **Hosting Ready**: Includes `netlify.toml` with `@netlify/plugin-nextjs` and Node 20 runtime.
