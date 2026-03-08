# Aligned — Product Requirements Document & Build Prompt

## Context for the Coding Agent

You are building **Aligned**, a mental health web app that helps users close the gap between their stated values and their actual behavior. The core insight: most people experience chronic low-grade dissatisfaction because their daily actions silently drift from their priorities. Aligned makes that drift visible, turns self-blame into system design, and helps users live deliberately rather than by default.

This is a **Next.js** app. Build it with the following stack and constraints.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | TypeScript throughout |
| UI | shadcn/ui + Tailwind CSS | All custom components built on Radix primitives via shadcn |
| Data Layer | IndexedDB via Dexie.js | All data local to the browser for now |
| Auth | None for MVP | Architecture should anticipate future Google OAuth + Supabase migration |
| Charts | Recharts | For the alignment dashboard visualizations |
| Layout | Desktop-first responsive | Must degrade gracefully to mobile for logging flows |

### Future Migration Note

The data layer will eventually migrate to Supabase (Postgres + Auth with Google OAuth). To make this painless:

- Abstract all data access behind a `DataService` interface (e.g., `src/lib/data/interface.ts`) with methods like `getValues()`, `logBehavior()`, `getWeeklyStats()`, etc.
- The MVP implements `IndexedDBDataService` against this interface.
- Later, a `SupabaseDataService` can be swapped in with no component changes.
- Do NOT scatter raw Dexie calls throughout components. All DB access goes through the service layer.

---

## Design System & Aesthetic

The aesthetic is **calming, modern, and sleek**. Think: the visual confidence of Linear meets the warmth of a therapy app. No gamification, no streaks, no guilt. The app should feel like a thoughtful tool, not a task manager.

### Color Palette

Use the following CSS custom properties as the foundation. Map them to Tailwind via `tailwind.config.ts`.

```css
:root {
  --falcon-50: #f4f0f1;
  --falcon-100: #e5d9dd;
  --falcon-200: #ceb7bf;
  --falcon-300: #bc99a6;
  --falcon-400: #ab7c8e;
  --falcon-500: #916677;
  --falcon-600: #7d5766;
  --falcon-700: #624450;
  --falcon-800: #452f37;
  --falcon-900: #28191f;
  --falcon-950: #180e12;
}
```

### Design Guidelines

- **Background**: `falcon-50` as primary background. White (`#ffffff`) for cards and elevated surfaces.
- **Text**: `falcon-950` for headings, `falcon-800` for body text, `falcon-500` for secondary/muted text.
- **Primary accent**: `falcon-600` for buttons, active states, and interactive elements. `falcon-700` for hover states.
- **Borders & dividers**: `falcon-100` for subtle borders, `falcon-200` for more prominent ones.
- **Dashboard bars/charts**: Use a gradient from `falcon-200` (low) through `falcon-400` (mid) to `falcon-600` (high) for data visualization. Never use red/green — this is not a scoreboard.
- **Typography**: Use `Inter` as the primary font. Clean, generous whitespace. Headings should be medium weight, not bold.
- **Spacing**: Generous padding. Nothing should feel cramped. Breathing room is part of the product's tone.
- **Animations**: Subtle, purposeful transitions only (fade-ins, gentle slides). No bouncing, no confetti, no celebration animations.
- **Tone of all copy**: Neutral, observational, non-judgmental. The app describes — it never praises or scolds. Example: "Health has been deprioritized for 12 days" not "You've been neglecting your health!"

---

## Information Architecture

```
/                     → Landing / onboarding (if no values set) or Dashboard
/discover             → Values Discovery flow
/log                  → Quick Behavior Log entry
/dashboard            → Alignment Dashboard (weekly view)
/review               → Weekly Reconciliation Review
/history              → Historical trends and patterns
/settings             → Value stack management, data export, season config
```

---

## Data Model

Define these as Dexie tables (IndexedDB) with TypeScript interfaces.

```typescript
interface Value {
  id: string;              // uuid
  label: string;           // e.g., "Family"
  definition: string;      // user's personal definition
  rank: number;            // position in the stack (1 = highest priority)
  createdAt: Date;
  updatedAt: Date;
}

interface BehaviorLog {
  id: string;              // uuid
  description: string;     // free text, short (e.g., "Skipped gym to help Sarah move")
  valueServed: string;     // Value.id — which value this behavior invested in
  valueCost: string | null;// Value.id — which value this came at the expense of (optional)
  intentional: boolean;    // was this a deliberate choice?
  timestamp: Date;
  seasonId: string | null; // Season.id if a season is active
}

interface WeeklyReview {
  id: string;              // uuid
  weekStartDate: Date;     // Monday of the review week
  satisfiedWithAllocation: boolean | null;
  focusValueId: string;    // Value.id — the value to invest in this week
  commitment: string;      // specific behavioral commitment (e.g., "Run Tue/Thu at 7am")
  commitmentMet: boolean | null; // filled in during NEXT week's review
  enabler: string | null;  // what helped (if commitment met)
  obstacle: string | null; // what got in the way (if commitment not met)
  obstacleCategory: string | null; // energy | time | social_pressure | emotional_state | logistical
  createdAt: Date;
}

interface Season {
  id: string;              // uuid
  label: string;           // e.g., "New job ramp-up"
  description: string;     // context for this season
  valueWeights: Record<string, number>; // Value.id → weight multiplier (0.5 = deprioritized, 1.5 = elevated)
  startDate: Date;
  endDate: Date | null;    // null = ongoing
  active: boolean;
}

interface TradeoffScenario {
  id: string;              // uuid
  scenarioText: string;    // the tradeoff question
  choiceA: string;         // option A description
  choiceB: string;         // option B description
  valueA: string;          // Value implied by choice A
  valueB: string;          // Value implied by choice B
}
```

---

## Feature Set: MVP vs. Full

### PHASE 1 — MVP (Build This Now)

The MVP covers the core loop: discover values, log behaviors, see alignment, and review weekly. These four features together deliver the primary user benefit.

---

#### Feature 1: Values Discovery & Calibration

**Purpose**: Help users identify their actual (not aspirational) core values through forced-choice tradeoff scenarios rather than picking from a list.

**Flow**:

1. User lands on `/discover` (redirected here if no values exist).
2. The app presents 12–15 tradeoff scenarios one at a time. Each scenario is a realistic dilemma with two options, each implicitly mapping to a different value. Examples:
   - "Your team needs you this weekend, but your kid has a school play. What do you do?" → Career vs. Family
   - "You have a free evening. Do you call a friend you haven't spoken to in weeks, or spend it on the side project you're excited about?" → Connection vs. Growth
   - "A colleague takes credit for your idea in a meeting. Do you address it publicly or let it go to keep the peace?" → Integrity vs. Harmony
3. After each choice, the user briefly explains WHY in a short text field (1–2 sentences). This is important — the reasoning reveals the value, not just the choice.
4. The app tallies which values surfaced most frequently and presents a ranked list of 5–7 derived values.
5. For each value, the user writes a personal definition in their own words. The app provides a placeholder prompt (e.g., "What does 'Family' mean to you specifically?") but the user must replace it.
6. The user can reorder the stack via drag-and-drop to finalize their ranking.
7. Values are saved and the user is redirected to the dashboard.

**Value Catalog & Scenario Bank**: See **Appendix A** at the end of this document for the complete value catalog (12 values with definitions and placeholder prompts) and all 20 seeded tradeoff scenarios with their mappings. The discovery flow should randomly select 12–15 of the 20 scenarios per session to add variety across recalibrations.

**Recalibration**: Accessible from `/settings`. Runs the same flow but shows previous answers for comparison. Surfaces how rankings shifted.

---

#### Feature 2: Behavior Logging (Quick Log)

**Purpose**: Capture behaviors and their value tradeoffs in under 10 seconds.

**Flow**:

1. User navigates to `/log` (or taps a persistent floating action button visible on all pages).
2. A clean, minimal form appears with four fields:
   - **What did I do?** — Free text input, short. Placeholder: "Skipped gym to help Sarah move." Max 200 characters.
   - **Which value did this serve?** — Tap to select from the user's value stack. Shows value labels as pill/chip selectors. Single select.
   - **Which value did this cost?** — Same selector, but optional. Can tap "No tradeoff" to skip. Cannot select the same value as above.
   - **Was this intentional?** — Toggle switch. Default: yes.
3. Submit saves immediately and shows a brief confirmation (subtle toast, not a modal). The form resets for another entry.
4. Below the form, show a scrollable feed of today's logs (most recent first) with the ability to tap-to-edit or swipe-to-delete.

**Design Notes**:
- The form must be extremely fast. No unnecessary animations, no confirmation dialogs, no multi-step flow.
- Value pills should be color-coded (assign each value a shade from the falcon palette, automatically distributed).
- The "cost" field is what makes this app different from a journal. Make it visually prominent but not required.

---

#### Feature 3: Alignment Dashboard

**Purpose**: Show the user where their attention is actually going vs. where they want it to go, on a weekly cadence.

**Location**: `/dashboard` — this is the app's home screen after onboarding.

**Components**:

1. **Week Selector**: Navigate between weeks. Default to current week. Show Mon–Sun date range.

2. **Value Alignment Bars**: For each value in the user's stack (ordered by rank), show a horizontal bar chart with two metrics:
   - **Investment** (behaviors that served this value) — bar extends right, filled in `falcon-400`.
   - **Sacrifice** (behaviors that cost this value) — bar extends right, filled in `falcon-200` with a subtle dashed outline.
   - **Net score** shown as a small number to the right: investment count minus sacrifice count.
   - No "good" or "bad" color coding. The bars are observational, not judgmental.

3. **Intentionality Ratio**: A single metric at the top of the dashboard — "X% of your decisions this week were intentional." Shown as a clean donut or arc chart. This is arguably more important than any individual value score.

4. **Default Sacrifice Callout**: If one value has been the "cost" value in 3+ logs this week, surface a neutral callout: "[Value] has been frequently deprioritized this week."

5. **Weekly Summary Stats**: Total logs this week, most invested value, most sacrificed value, intentionality percentage.

6. **Season Indicator**: If a season is active, show a small banner at the top: "Current season: [label] — [X] days in." Alignment scores should be presented in the context of the season's adjusted weights.

**Empty State**: If no logs exist for the current week, show a gentle prompt: "No behaviors logged this week. Tap the + button to start." No guilt, no streak-broken messaging.

---

#### Feature 4: Weekly Reconciliation Review

**Purpose**: A guided 5-minute ritual that closes the feedback loop between intention and action.

**Location**: `/review` — accessible anytime, but the app should surface a gentle nudge (e.g., a badge on the nav item) on Sundays if no review has been completed for the current week.

**Flow**:

1. **Look Back** (if a previous week's review exists):
   - Show last week's commitment: "[Commitment text]"
   - Ask: "Did you follow through?" → Yes / Partially / No
   - If Yes or Partially: "What helped?" → short text field. This is the **enabler**.
   - If Partially or No: "What got in the way?" → short text field. Then categorize the obstacle: Energy / Time / Social Pressure / Emotional State / Logistical → single select.

2. **Reflect**:
   - Show this week's alignment dashboard (compact version).
   - Ask: "Is this allocation what you want right now?" → Yes / No
   - If No: this is just acknowledged. No follow-up. The purpose is self-awareness, not optimization.

3. **Commit**:
   - "Which value do you want to invest in more this coming week?" → select from value stack.
   - "What's one specific thing you'll do?" → free text. Placeholder: "Be specific — 'Run Tuesday and Thursday at 7am' not 'exercise more'."
   - Save.

4. **Done**: Show a brief, warm confirmation: "Review complete. See you next week." No score, no grade, no celebration.

**Design Notes**:
- This should feel like a quiet conversation, not a form. Present each step one at a time (stepper/wizard pattern), not all at once.
- Progress indicator at the top (3 steps).
- Transitions between steps should be gentle fades, not slides.

---

### PHASE 2 — Full Feature Set (Build Later)

These features extend the MVP. Document them here for architectural awareness, but do NOT build them in Phase 1. The data model above already accommodates them.

---

#### Feature 5: Tradeoff Pattern Recognition

Analyzes logged behaviors over time to surface recurring tradeoff pairs. "You've chosen Career over Health 14 times this month, and Health over Career twice." Also distinguishes intentional vs. unintentional tradeoffs within each pair. Surfaces the user's "default sacrifice" — the value most consistently depleted when decisions are unintentional.

**Implementation notes**: This is a read-only analytics view that queries BehaviorLog entries grouped by `(valueServed, valueCost)` pairs over configurable time ranges. Display as a matrix or Sankey-style flow diagram.

---

#### Feature 6: Friction & Obstacle Library

Aggregates all obstacles captured during weekly reviews into a searchable, categorized library. Over months, this reveals which obstacle *types* most frequently derail the user's intentions. Reframes failure as an engineering problem: "80% of your missed commitments happened on days with 3+ hours of meetings before noon."

**Implementation notes**: Queries WeeklyReview entries where `commitmentMet === false`, groups by `obstacleCategory`, and surfaces frequency and patterns. Could include a simple timeline correlation with BehaviorLog density.

---

#### Feature 7: Context-Aware Nudges

Notification system that uses the user's own historical data to send targeted, non-generic nudges. Example: "You've sacrificed Creative Work for the last 8 days. Your past logs show Sunday mornings are when you most often invest in it. Tomorrow is Sunday."

**Implementation notes**: Requires a background process (service worker or scheduled check) that runs pattern detection against recent BehaviorLog and WeeklyReview data. Nudges are derived entirely from the user's own data — never generic motivational content. This feature will be significantly enhanced by the future AI agent layer.

---

#### Feature 8: Life Season Mode (Enhanced)

The MVP Season model supports basic season declaration. The full version adds: season comparison views (how did my allocation differ between "New Baby" and "Product Launch" seasons?), automatic season-adjusted alignment scoring, and suggested value reweighting based on the user's logging patterns during the season.

**Implementation notes**: Extends the Season model with richer analytics. Season transitions should prompt a mini-review: "You're ending [season]. Here's how your allocation looked during this period."

---

## Navigation & Layout

### Desktop Layout

- **Left sidebar** (240px, collapsible):
  - App logo ("Aligned") at top
  - Nav items: Dashboard, Log, Review, History, Settings
  - Active item highlighted with `falcon-600` background, `falcon-50` text
  - Bottom of sidebar: current season indicator (if active)
- **Main content area**: centered, max-width 800px for readability. Generous padding.
- **Floating Action Button**: Bottom-right corner, `falcon-600` circle with `+` icon. Always visible. Opens the Quick Log form as a modal overlay.

### Mobile Layout

- Sidebar collapses to bottom tab bar.
- FAB remains in bottom-right, above the tab bar.
- Quick Log opens as a full-screen sheet from bottom.

---

## Non-Functional Requirements

- **Performance**: IndexedDB operations should be async and non-blocking. Dashboard calculations should be memoized.
- **Data Export**: In Settings, provide a "Export All Data" button that generates a JSON file of all user data. This is critical for trust — users must feel they own their data.
- **No Telemetry**: Do not include any analytics, tracking, or telemetry in the MVP. This is a trust-first product.
- **Accessibility**: All interactive elements must be keyboard-navigable. Use proper ARIA labels. Color is never the only indicator of meaning.
- **Offline-First**: Since data is in IndexedDB, the app should work fully offline. Consider adding a service worker for PWA capability.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Dashboard (home)
│   ├── discover/
│   │   └── page.tsx            # Values Discovery flow
│   ├── log/
│   │   └── page.tsx            # Quick Log (full page, also used in modal)
│   ├── review/
│   │   └── page.tsx            # Weekly Reconciliation
│   ├── history/
│   │   └── page.tsx            # Historical trends (Phase 2, placeholder for now)
│   └── settings/
│       └── page.tsx            # Value management, seasons, export
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── FloatingActionButton.tsx
│   ├── values/
│   │   ├── ScenarioCard.tsx    # Single tradeoff scenario in discovery
│   │   ├── ValueRanker.tsx     # Drag-and-drop value ordering
│   │   └── ValuePill.tsx       # Colored value chip/pill
│   ├── logging/
│   │   ├── QuickLogForm.tsx    # The core logging form
│   │   └── LogFeed.tsx         # Scrollable list of today's logs
│   ├── dashboard/
│   │   ├── AlignmentBars.tsx   # Value investment/sacrifice bars
│   │   ├── IntentionalityArc.tsx # Donut/arc chart for intentionality %
│   │   ├── WeekSelector.tsx
│   │   └── SummaryStats.tsx
│   └── review/
│       ├── ReviewStepper.tsx   # Wizard container
│       ├── LookBackStep.tsx
│       ├── ReflectStep.tsx
│       └── CommitStep.tsx
├── lib/
│   ├── data/
│   │   ├── interface.ts        # DataService interface (abstract)
│   │   ├── indexeddb.ts        # Dexie-based implementation
│   │   └── scenarios.ts        # Seed data for tradeoff scenarios
│   ├── utils/
│   │   ├── dates.ts            # Week calculation helpers
│   │   ├── colors.ts           # Value-to-color mapping from falcon palette
│   │   └── stats.ts            # Dashboard computation helpers
│   └── hooks/
│       ├── useValues.ts        # CRUD for values
│       ├── useLogs.ts          # CRUD for behavior logs
│       ├── useReviews.ts       # CRUD for weekly reviews
│       └── useSeasons.ts       # CRUD for seasons
└── styles/
    └── globals.css             # Tailwind base + falcon palette CSS variables
```

---

## Build Order

1. **Scaffolding**: Next.js project, Tailwind config with falcon palette, shadcn/ui setup, Dexie database initialization, DataService interface + IndexedDB implementation.
2. **Values Discovery** (`/discover`): Scenario bank, scenario card component, results screen, value definition + ranking.
3. **Behavior Logging** (`/log` + FAB modal): QuickLogForm, LogFeed, value pill selector.
4. **Alignment Dashboard** (`/dashboard`): Week selector, alignment bars, intentionality arc, summary stats, default sacrifice callout.
5. **Weekly Review** (`/review`): Stepper, look-back step, reflect step, commit step.
6. **Settings** (`/settings`): Value stack editor, season management (basic), data export.
7. **Layout & Navigation**: Sidebar, mobile nav, FAB, routing guards (redirect to `/discover` if no values).
8. **Polish**: Empty states, loading states, transitions, responsive breakpoints, accessibility pass.

---

## Key Principles for the Build

- **Speed of logging is sacred.** If the Quick Log takes more than 10 seconds to complete an entry, the feature has failed. Optimize for minimal taps and instant saves.
- **No judgment in the UI.** The app describes patterns — it never evaluates them. Language is observational: "Health has been deprioritized" not "You're neglecting your health."
- **Tradeoffs, not failures.** Every behavior log captures what was served AND what it cost. This reframing is the product's core innovation.
- **The obstacle is the insight.** When commitments are missed, the "what got in the way" data is more valuable than the miss itself. Make obstacle capture feel like progress, not confession.
- **Seasons normalize imbalance.** Life is not balanced, and the app should never imply it should be. Seasons let users own their current priorities without guilt.

---

## Appendix A: Value Catalog & Seeded Tradeoff Scenarios

### Value Catalog

The app recognizes 12 core value categories. Each has a system-level label, a short description (used internally for scenario mapping), and a placeholder prompt shown to users during the definition step of Values Discovery.

Users will never see the internal descriptions — they only see the label and the placeholder prompt, then write their own definition.

```typescript
export const VALUE_CATALOG = [
  {
    key: "family",
    label: "Family",
    description: "Prioritizing the people you consider family — presence, support, and shared life.",
    placeholder: "What does showing up for your family actually look like day-to-day?"
  },
  {
    key: "career",
    label: "Career",
    description: "Professional ambition, mastery of your craft, and building something through work.",
    placeholder: "What does meaningful career progress mean to you — title, impact, craft, income, or something else?"
  },
  {
    key: "health",
    label: "Health",
    description: "Physical wellbeing — exercise, nutrition, sleep, and bodily care.",
    placeholder: "What does taking care of your body mean to you in practice?"
  },
  {
    key: "connection",
    label: "Connection",
    description: "Friendship, community, and maintaining meaningful relationships outside family.",
    placeholder: "What does being a good friend or community member look like for you?"
  },
  {
    key: "growth",
    label: "Growth",
    description: "Learning, intellectual curiosity, skill-building, and personal development.",
    placeholder: "What kind of growth matters most to you — skills, knowledge, self-understanding, or something else?"
  },
  {
    key: "creativity",
    label: "Creativity",
    description: "Self-expression, making things, artistic or imaginative pursuits.",
    placeholder: "What does creative expression mean in your life — art, writing, building, problem-solving?"
  },
  {
    key: "integrity",
    label: "Integrity",
    description: "Honesty, ethical consistency, standing by your principles even when costly.",
    placeholder: "What principles do you hold that you'd defend even when it's uncomfortable?"
  },
  {
    key: "rest",
    label: "Rest",
    description: "Recovery, downtime, stillness, and protecting space for doing nothing.",
    placeholder: "What does genuine rest look like for you — not just the absence of work?"
  },
  {
    key: "financial_security",
    label: "Financial Security",
    description: "Stability, saving, reducing financial stress, and building a safety net.",
    placeholder: "What does financial peace of mind mean to you specifically?"
  },
  {
    key: "adventure",
    label: "Adventure",
    description: "Novelty, exploration, risk-taking, and seeking new experiences.",
    placeholder: "What kind of experiences make you feel most alive?"
  },
  {
    key: "service",
    label: "Service",
    description: "Contributing to something larger — volunteering, mentoring, giving back.",
    placeholder: "What does contributing to others or to your community look like for you?"
  },
  {
    key: "autonomy",
    label: "Autonomy",
    description: "Independence, self-direction, freedom to choose how you spend your time and energy.",
    placeholder: "What does freedom mean to you — freedom from obligations, freedom to choose, or something else?"
  }
] as const;
```

### Value Coverage Matrix

Each of the 12 values appears in at least 3 scenarios to ensure reliable signal during discovery. The distribution:

| Value | Appears in scenarios |
|---|---|
| Family | 1, 5, 10, 17 |
| Career | 1, 6, 9, 14, 18 |
| Health | 2, 7, 12, 15 |
| Connection | 3, 8, 13, 19 |
| Growth | 3, 6, 11, 16 |
| Creativity | 4, 11, 14, 20 |
| Integrity | 9, 13, 17, 18 |
| Rest | 2, 4, 7, 15 |
| Financial Security | 5, 10, 16, 20 |
| Adventure | 8, 12, 19 |
| Service | 10, 16, 17 |
| Autonomy | 5, 9, 14, 20 |

### Seeded Tradeoff Scenarios

Each scenario presents a realistic, low-stakes dilemma with no obvious "right answer." Both choices are defensible. The scenario text is what the user sees; `choiceA`/`choiceB` are the button labels; `valueA`/`valueB` are the value keys used for scoring (not shown to the user).

**Design rule**: Neither option should feel morally superior. If a scenario has a "correct" answer, it's a bad scenario. The goal is to reveal preference, not test character.

```typescript
export const TRADEOFF_SCENARIOS: TradeoffScenario[] = [
  // --- Scenario 1: Family vs. Career ---
  {
    id: "scenario-01",
    scenarioText: "Your team is in crunch mode on a project that matters to your career. Your partner asks if you can take Friday off to handle a family obligation they can't reschedule. Missing Friday won't sink the project, but your absence will be noticed.",
    choiceA: "Take Friday off for the family obligation",
    choiceB: "Stay at work and ask your partner to find another solution",
    valueA: "family",
    valueB: "career"
  },
  // --- Scenario 2: Health vs. Rest ---
  {
    id: "scenario-02",
    scenarioText: "You had a brutal week and your body is exhausted. You'd planned to go to the gym this morning — a workout you've been consistent with. But you slept terribly and every part of you wants to stay in bed.",
    choiceA: "Go to the gym anyway — consistency matters",
    choiceB: "Sleep in and let your body recover",
    valueA: "health",
    valueB: "rest"
  },
  // --- Scenario 3: Connection vs. Growth ---
  {
    id: "scenario-03",
    scenarioText: "A close friend invites you to dinner on the same night as a workshop you've been looking forward to — a skill-building session directly relevant to something you're trying to learn. The workshop won't be offered again soon. The friend has been going through a hard time.",
    choiceA: "Go to dinner with your friend",
    choiceB: "Attend the workshop",
    valueA: "connection",
    valueB: "growth"
  },
  // --- Scenario 4: Creativity vs. Rest ---
  {
    id: "scenario-04",
    scenarioText: "It's Sunday evening. You've had a full weekend and you're tired, but you suddenly feel a spark of creative energy — an idea you've been meaning to explore. If you start now, you'll be up late and tomorrow will be harder. If you don't, the spark might not come back.",
    choiceA: "Follow the creative impulse tonight",
    choiceB: "Rest and trust the idea will return",
    valueA: "creativity",
    valueB: "rest"
  },
  // --- Scenario 5: Financial Security vs. Family ---
  {
    id: "scenario-05",
    scenarioText: "A family member asks to borrow a meaningful amount of money. You can afford it, but it would set back a savings goal you've been working toward for months. They haven't asked before, and you believe they'll pay it back — eventually.",
    choiceA: "Lend them the money",
    choiceB: "Explain that you can't right now and protect your savings goal",
    valueA: "family",
    valueB: "financial_security"
  },
  // --- Scenario 6: Career vs. Growth ---
  {
    id: "scenario-06",
    scenarioText: "You're offered a promotion at work that comes with more money and responsibility, but it would lock you into a specialization you're not passionate about. Alternatively, you could stay in your current role and spend the extra energy learning a new domain that genuinely excites you — but with no guarantee it leads anywhere.",
    choiceA: "Take the promotion and the security it provides",
    choiceB: "Stay put and invest in the new domain you're curious about",
    valueA: "career",
    valueB: "growth"
  },
  // --- Scenario 7: Rest vs. Health ---
  {
    id: "scenario-07",
    scenarioText: "You've committed to a meal prep routine that keeps your diet on track, but today you're mentally drained and the idea of spending an hour in the kitchen feels overwhelming. You could order takeout and spend the evening doing absolutely nothing.",
    choiceA: "Do the meal prep — your future self will thank you",
    choiceB: "Order takeout and give yourself the evening off",
    valueA: "health",
    valueB: "rest"
  },
  // --- Scenario 8: Adventure vs. Connection ---
  {
    id: "scenario-08",
    scenarioText: "You have a rare long weekend coming up. A friend suggests a low-key weekend together — catching up, cooking, nothing special. But you've also been eyeing a solo trip to a place you've never been, and the timing is perfect. The friend doesn't seem like they'd want to join.",
    choiceA: "Take the solo trip to somewhere new",
    choiceB: "Spend the weekend with your friend",
    valueA: "adventure",
    valueB: "connection"
  },
  // --- Scenario 9: Integrity vs. Career ---
  {
    id: "scenario-09",
    scenarioText: "Your manager asks you to present a project's results to leadership in a way that emphasizes the wins and downplays the problems. Nothing they're asking you to say is technically false, but the framing is misleading. Pushing back could create friction with someone who controls your trajectory.",
    choiceA: "Push back and present a more balanced picture",
    choiceB: "Go along with the framing your manager wants",
    valueA: "integrity",
    valueB: "career"
  },
  // --- Scenario 10: Service vs. Financial Security ---
  {
    id: "scenario-10",
    scenarioText: "A nonprofit you care about asks you to take on a meaningful volunteer commitment — 5 hours a week for three months. You have the time, but only because you'd be giving up freelance hours that bring in extra income you've been using to build your emergency fund.",
    choiceA: "Take the volunteer commitment",
    choiceB: "Keep the freelance hours and build your financial cushion",
    valueA: "service",
    valueB: "financial_security"
  },
  // --- Scenario 11: Growth vs. Creativity ---
  {
    id: "scenario-11",
    scenarioText: "You have a few free hours this weekend. You could use them to work through a structured online course you've been progressing through — it's challenging and you're learning a lot. Or you could spend the time on a personal project with no clear outcome — something you're making just because you want to.",
    choiceA: "Continue the structured course",
    choiceB: "Work on the personal creative project",
    valueA: "growth",
    valueB: "creativity"
  },
  // --- Scenario 12: Health vs. Adventure ---
  {
    id: "scenario-12",
    scenarioText: "Friends invite you on a spontaneous weekend trip — late nights, rich food, probably not much sleep. It sounds genuinely fun and you haven't done something like this in a while. But you've been on a good streak with your health routine, and this trip will definitely break it.",
    choiceA: "Protect your health routine and skip the trip",
    choiceB: "Go on the trip and enjoy the experience",
    valueA: "health",
    valueB: "adventure"
  },
  // --- Scenario 13: Integrity vs. Connection ---
  {
    id: "scenario-13",
    scenarioText: "A friend is excited about a decision they've made — a business idea, a relationship, a major purchase. You genuinely believe it's a mistake, and you have specific reasons. They didn't ask for your opinion, but they're clearly looking for validation. Saying nothing feels dishonest. Saying something might damage the friendship.",
    choiceA: "Share your honest concerns",
    choiceB: "Support their excitement and keep your doubts to yourself",
    valueA: "integrity",
    valueB: "connection"
  },
  // --- Scenario 14: Autonomy vs. Career ---
  {
    id: "scenario-14",
    scenarioText: "Your company wants you to relocate to a different city for a role that would be a clear step up in your career. The new city isn't somewhere you'd choose to live, and the move would mean giving up the daily life you've built — your routines, your neighborhood, the way you've set things up.",
    choiceA: "Decline the relocation and keep the life you've built",
    choiceB: "Take the role and adapt to the new city",
    valueA: "autonomy",
    valueB: "career"
  },
  // --- Scenario 15: Health vs. Rest (different framing from #2) ---
  {
    id: "scenario-15",
    scenarioText: "You've been pushing hard physically — training for something, cleaning up your diet, staying disciplined. You're seeing results but you're also running on fumes. A friend suggests you take a full week off from all of it. No gym, no tracking, no structure. Just exist.",
    choiceA: "Keep the momentum going — you'll rest when the goal is done",
    choiceB: "Take the full week off and reset",
    valueA: "health",
    valueB: "rest"
  },
  // --- Scenario 16: Financial Security vs. Growth ---
  {
    id: "scenario-16",
    scenarioText: "You're considering leaving a stable, well-paying job to go back to school for something you're deeply interested in. You have enough savings to make it work, but it would mean draining most of your financial cushion and accepting uncertainty for 1–2 years.",
    choiceA: "Go back to school and pursue what interests you",
    choiceB: "Stay in the stable job and find other ways to learn",
    valueA: "growth",
    valueB: "financial_security"
  },
  // --- Scenario 17: Family vs. Integrity ---
  {
    id: "scenario-17",
    scenarioText: "A family member says something at a gathering that you find genuinely wrong — not a small thing, but a real ethical or factual claim you disagree with. Challenging it will create tension at a family event. Letting it slide feels like silent agreement.",
    choiceA: "Respectfully challenge what they said",
    choiceB: "Let it go to preserve the peace at the gathering",
    valueA: "integrity",
    valueB: "family"
  },
  // --- Scenario 18: Career vs. Integrity (different framing from #9) ---
  {
    id: "scenario-18",
    scenarioText: "You discover that a competitor's key employee is open to being recruited to your team. Hiring them would give you a significant advantage and they're interested. But you have a casual personal relationship with someone at that company, and this move would likely feel like a betrayal to them even though it's standard practice in your industry.",
    choiceA: "Pursue the hire — it's a professional decision",
    choiceB: "Pass on it to preserve the personal relationship",
    valueA: "career",
    valueB: "integrity"
  },
  // --- Scenario 19: Connection vs. Adventure ---
  {
    id: "scenario-19",
    scenarioText: "You've been offered the chance to spend six months working remotely from a different country — something you've always wanted to do. But your closest friend group is in a particularly close chapter right now, with regular gatherings you'd miss. They'd understand, but you know the dynamic would shift without you.",
    choiceA: "Go — this is a rare opportunity",
    choiceB: "Stay — this chapter with your friends won't last forever either",
    valueA: "adventure",
    valueB: "connection"
  },
  // --- Scenario 20: Creativity vs. Financial Security ---
  {
    id: "scenario-20",
    scenarioText: "You have a side project — something creative you've been building in your spare time. It's starting to gain traction, but to take it seriously you'd need to cut back on paid work. The side project might eventually generate income, but right now it's a pure cost against your financial goals.",
    choiceA: "Cut back on paid work and invest in the creative project",
    choiceB: "Keep the creative project as a hobby and protect your income",
    valueA: "creativity",
    valueB: "financial_security"
  }
];
```

### Scoring Algorithm

During the discovery flow, the app tallies value frequency from the user's choices across the 12–15 randomly selected scenarios. The scoring works as follows:

1. For each scenario the user completes, increment the score for the chosen value by 1.
2. After all scenarios are complete, rank values by score (descending).
3. Present the top 5–7 values (those with score >= 1) to the user as their derived value stack.
4. If fewer than 5 values have non-zero scores (unlikely with 12–15 scenarios), include tied values and let the user break ties during the ranking step.
5. Values with a score of 0 (never chosen) are excluded from the user's stack but remain available in Settings if the user wants to manually add them later.
6. During recalibration, the app shows the user's previous choice for each scenario alongside the new choice, and highlights any values that entered or exited the top 7.
