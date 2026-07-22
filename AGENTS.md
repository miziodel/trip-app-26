# AGENTS.md — Workspace Context for AI Coding Agents

## 1. IDENTITY & GOAL
This workspace contains a **100% Offline-First Progressive Web App (PWA)** built for a 24-day trip to Korea & Japan in Summer 2026.
- **Privacy Architecture**: Zero-Cloud architecture. No remote server or backend database is used. All trip data, PNRs, addresses, and user logs are stored locally in **IndexedDB** (`idb` library).
- **Primary Tech Stack**: React 19, TypeScript, Vite, TailwindCSS v4, Zustand, Lucide React, `vite-plugin-pwa`.

---

## 2. REPOSITORY LAYOUT

```
trip-app-26/
├── viaggio-sample.json       # Anonymized sample trip schema (NO REAL PERSONAL DATA)
├── docs/                     # Living Documentation
│   ├── SPECIFICA_FUNZIONALE.md
│   ├── ARCHITETTURA_TECNICA.md
│   ├── BDD_SCENARIOS.md
│   ├── ADR.md
│   └── ROADMAP.md
└── app/                      # Main React PWA application
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx
    │   ├── types/viaggio.ts
    │   ├── store/
    │   │   ├── db.ts         # IndexedDB async methods
    │   │   └── store.ts      # Zustand global state
    │   ├── components/       # Layout, UI, TaxiCard, CurrencyModal, ScheduleCard
    │   └── tabs/             # 5 Main Tabs (Oggi, Itinerario, Trasporti, Guida, Emergenze)
    └── tests/                # Vitest unit tests
```

---

## 3. KEY ARCHITECTURAL RULES

1. **Zero-Cloud & Privacy First**:
   - NEVER add remote fetch calls or cloud database sync for trip data.
   - All state mutations (notes, 1-tap reactions, custom todos, custom currency rates) MUST persist in IndexedDB (`src/store/db.ts`).
2. **First Launch Behavior**:
   - On first launch (when IndexedDB is empty), `App.tsx` MUST render `WelcomeScreen`.
   - Users can load a `.json` trip database file or reset existing data from the SOS/Emergenze tab.
3. **Data Anonymization**:
   - In documentation (`docs/`), tests, and public files, ALWAYS refer to `viaggio-sample.json` or mock placeholders.
   - DO NOT commit files containing private PNRs, actual passports, or real personal addresses to git tracking.
4. **UI/UX Guidelines**:
   - Touch targets must be at least 48px/52px for single-hand mobile use.
   - Color palette: Native dark theme (`bg-slate-950`, `bg-slate-900`) with accent badges (`amber-400`, `sky-400`, `purple-400`, `rose-400`).

---

## 4. COMMAND CHEATSHEET

From the `app/` directory:
- **Dev Server**: `npm run dev`
- **Production Build**: `npm run build`
- **Run Unit Tests**: `npm test`
- **Preview Production PWA**: `npm run preview`
