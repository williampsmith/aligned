# Aligned

A mental health web app that helps you close the gap between your stated values and your actual behavior.

Most people experience chronic low-grade dissatisfaction because their daily actions silently drift from their priorities. Aligned makes that drift visible, turns self-blame into system design, and helps you live deliberately rather than by default.

## Core Ideas

- **Tradeoffs, not failures.** Every behavior log captures what was served *and* what it cost. This reframing is central — life is a series of tradeoffs, not a pass/fail test.
- **No judgment in the UI.** The app describes patterns; it never evaluates them. Language is observational: *"Health has been deprioritized"* not *"You've been neglecting your health!"*
- **Seasons normalize imbalance.** Life isn't balanced and the app never implies it should be. Seasons let you own your current priorities without guilt.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Install & Run

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

On first launch you'll be guided through the **Values Discovery** flow — a series of tradeoff scenarios that surface your actual priorities.

### Seeded Mode (for development)

To skip onboarding and start with pre-populated test data (6 values, 15 behavior logs, 1 weekly review):

```bash
pnpm dev:seeded
```

The seed is idempotent — it only populates if no values exist. To re-seed, clear IndexedDB in your browser devtools (Application > IndexedDB > delete `AlignedDB`) and reload.

### Build & Production

```bash
pnpm build
pnpm start
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| Data | IndexedDB via Dexie.js (all data local to browser) |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Auth | None (MVP) — architecture anticipates future Google OAuth + Supabase |

## Features (MVP)

### 1. Values Discovery (`/discover`)

A forced-choice tradeoff quiz that surfaces your actual values rather than aspirational ones. 13 randomly selected scenarios from a bank of 20, each presenting a realistic dilemma with no right answer. After the quiz, you rank your derived values and write personal definitions.

### 2. Behavior Logging (`/log`)

Capture behaviors and their value tradeoffs in under 10 seconds. Four fields: what you did, which value it served, which value it cost (optional), and whether it was intentional. Also accessible via the floating action button on every page.

### 3. Alignment Dashboard (`/dashboard`)

Weekly view showing where your attention actually went. Includes:
- **Intentionality ratio** — what percentage of your decisions were deliberate
- **Value alignment bars** — investment vs. sacrifice per value
- **Summary stats** — total logs, most invested/sacrificed values
- **Default sacrifice callout** — flags values frequently deprioritized

### 4. Weekly Review (`/review`)

A guided 3-step ritual (Look Back → Reflect → Commit) that closes the feedback loop between intention and action. Captures what helped, what got in the way, and a specific commitment for next week.

### 5. Settings (`/settings`)

Reorder and redefine your value stack, manage life seasons, recalibrate values, and export all data as JSON.

### 6. History (`/history`)

Placeholder for Phase 2 pattern recognition and trend analysis.

## Architecture

### Data Layer

All data access is abstracted behind a `DataService` interface (`src/lib/data/interface.ts`). The MVP implements `IndexedDBDataService` against this interface. When the time comes to migrate to Supabase, a `SupabaseDataService` can be swapped in with no component changes. Raw Dexie calls never appear in components.

### Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout, Inter font, Toaster
│   ├── page.tsx                    # Redirects to /dashboard
│   ├── dashboard/page.tsx          # Alignment Dashboard
│   ├── discover/page.tsx           # Values Discovery flow
│   ├── log/page.tsx                # Behavior Logging
│   ├── review/page.tsx             # Weekly Reconciliation
│   ├── history/page.tsx            # Placeholder
│   └── settings/page.tsx           # Value stack, seasons, export
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── layout/
│   │   ├── AppShell.tsx            # Sidebar + FAB + mobile nav + routing guard
│   │   ├── Sidebar.tsx             # Desktop navigation (collapsible)
│   │   ├── MobileNav.tsx           # Bottom tab bar
│   │   └── FloatingActionButton.tsx
│   ├── values/
│   │   ├── ScenarioCard.tsx        # Tradeoff scenario in discovery
│   │   ├── ValueRanker.tsx         # Drag-and-drop value ordering
│   │   └── ValuePill.tsx           # Colored value chip
│   ├── logging/
│   │   ├── QuickLogForm.tsx        # Core logging form
│   │   └── LogFeed.tsx             # Scrollable log list
│   ├── dashboard/
│   │   ├── AlignmentBars.tsx       # Investment/sacrifice bars
│   │   ├── IntentionalityArc.tsx   # Donut chart
│   │   ├── WeekSelector.tsx        # Week navigation
│   │   └── SummaryStats.tsx        # Stat cards
│   └── review/
│       ├── ReviewStepper.tsx       # Step indicator
│       ├── LookBackStep.tsx        # Review previous commitment
│       ├── ReflectStep.tsx         # This week's allocation
│       └── CommitStep.tsx          # Next week's commitment
├── lib/
│   ├── data/
│   │   ├── interface.ts            # DataService interface
│   │   ├── indexeddb.ts            # Dexie implementation
│   │   ├── scenarios.ts            # Value catalog + 20 tradeoff scenarios
│   │   └── seed.ts                 # Test data seeder
│   ├── utils/
│   │   ├── dates.ts                # Week math, formatting
│   │   ├── colors.ts               # Falcon palette mapping
│   │   └── stats.ts                # Dashboard computation
│   ├── hooks/
│   │   ├── useValues.ts            # Value CRUD
│   │   ├── useLogs.ts              # Behavior log CRUD
│   │   ├── useReviews.ts           # Weekly review CRUD
│   │   └── useSeasons.ts           # Season CRUD
│   └── utils.ts                    # shadcn cn() helper
└── styles/
    └── globals.css                 # Tailwind base + falcon palette
```

### Design System

The **falcon** color palette — a warm mauve/plum progression — is used throughout:

| Token | Hex | Usage |
|---|---|---|
| `falcon-50` | `#f4f0f1` | Page background |
| `falcon-100` | `#e5d9dd` | Subtle borders |
| `falcon-200` | `#ceb7bf` | Sacrifice bars, prominent borders |
| `falcon-400` | `#ab7c8e` | Investment bars |
| `falcon-500` | `#916777` | Muted text |
| `falcon-600` | `#7d5766` | Primary buttons, active states |
| `falcon-700` | `#624450` | Hover states |
| `falcon-800` | `#452f37` | Body text |
| `falcon-950` | `#180e12` | Headings |

No red/green is used anywhere. The app is not a scoreboard.

### Data Model

| Table | Key Fields |
|---|---|
| `values` | label, definition, rank |
| `logs` | description, valueServed, valueCost, intentional, timestamp |
| `reviews` | weekStartDate, focusValueId, commitment, commitmentMet, obstacle |
| `seasons` | label, description, valueWeights, active |

## Layout

- **Desktop**: Collapsible left sidebar (240px) + centered content (max 800px) + floating action button
- **Mobile**: Bottom tab bar + FAB + bottom sheet for Quick Log

## Future (Phase 2)

These are designed for but not built:

- **Tradeoff Pattern Recognition** — surface recurring tradeoff pairs over time
- **Friction & Obstacle Library** — aggregate obstacles from weekly reviews
- **Context-Aware Nudges** — data-driven reminders from your own patterns
- **Enhanced Season Mode** — season comparison views and auto-adjusted scoring
- **Supabase migration** — swap `IndexedDBDataService` for `SupabaseDataService`

## Privacy

All data stays in your browser's IndexedDB. There is no server, no telemetry, no analytics. You can export everything as JSON from Settings at any time.

## License

Private — not yet licensed for distribution.
