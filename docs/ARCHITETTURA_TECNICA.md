# Architettura Tecnica — PWA "Viaggio Corea & Giappone 2026"

## 1. Stack Tecnologico

- **Core**: React 19 + TypeScript 6.0
- **Build Tool**: Vite 8.1
- **Styling**: TailwindCSS v4 con accenti tematici (`slate-950`, `amber-400`, `sky-400`, `rose-400`, `purple-400`)
- **Icons**: Lucide React
- **PWA Engine**: `vite-plugin-pwa` 1.3 (Workbox Service Worker Generator)
- **Storage Layer**: `idb` 8.0 (IndexedDB Promise-based wrapper)
- **State Management**: Zustand 5.0

---

## 2. Architettura Offline-First & Storage Data Flow

### 2.1 Flusso dei Dati & Data Pipeline

```
┌─────────────────────────┐
│ database-app-v4.md      │ (Documentazione sorgente in Markdown)
└───────────┬─────────────┘
            │  (Prompt LLM: docs/PROMPT_GENERA_JSON.md)
            ▼
┌─────────────────────────┐
│  viaggio-2026-v2.json   │ (JSON 4.0 generato con dati reali privati)
└───────────┬─────────────┘
            │  (Script: scripts/anonymize-sample-json.mjs)
            ▼
┌─────────────────────────┐
│  viaggio-sample.json    │ (JSON 4.0 anonimizzato per repo/test)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  IndexedDB (viaggio-db) │ (Persistenza offline locale PWA)
│   - config (Data/Todos) │
│   - logs (diario note)  │
│   - customRates         │
│   - customTodos         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Zustand Global Store  │ (State reattivo in memoria)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     Componenti UI       │ (Oggi, Itinerario, Viaggi, Guida, SOS)
└─────────────────────────┘
```

### 2.2 Schema IndexedDB (`viaggio-db-v2`)
Database: `viaggio-db-v2` (Versione 1)
- Store **`config`**:
  - Key `'data'`: Oggetto `ViaggioData` completo.
  - Key `'todos'`: Record `{ [giornoId: number]: boolean[] }` per lo stato delle spunte.
  - Key `'custom_todos'`: Record `{ [giornoId: number]: string[] }` per i promemoria aggiunti.
  - Key `'custom_rates'`: Oggetto `{ JPY_EUR: number, KRW_EUR: number }`.
- Store **`logs`**:
  - Key `'logs'`: Record `{ [itemKey: string]: { reaction?: string, note?: string, updatedAt: number } }`.

### 2.3 Service Worker & Caching Strategy
- Generato da `vite-plugin-pwa` in modalità `generateSW`.
- Pre-cache automatica di tutti gli asset statici (`index.html`, bundle JS/CSS, webmanifest e icone).
- **Strategia Network-First** con fallback a cache per le mappe e i link esterni.

---

## 3. Struttura del Progetto (`src/`)

```
src/
├── App.tsx                     # Container principale SPA
├── main.tsx                    # Entry point React
├── index.css                   # Tailwind Base & CSS Custom
├── types/
│   └── viaggio.ts              # Tipizzazione TypeScript completa del schema dati
├── store/
│   ├── db.ts                   # Layer di accesso asincrono IndexedDB via `idb`
│   └── store.ts                # Zustand store globale
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx          # Dual Timezone clock, wifi indicator, convertitore button
│   │   └── BottomNav.tsx       # Bottom bar a 5 schede (min target 52px)
│   ├── ui/
│   │   ├── ScheduleCard.tsx    # Card oraria espandibile con Mappa/Search/Tabelog/Ticket
│   │   ├── TaxiCard.tsx        # Overlay fullscreen Kanji/Hangul ad alto contrasto
│   │   ├── CurrencyModal.tsx   # Modal convertitore EUR ↔ JPY/KRW editabile
│   │   ├── CopyableText.tsx    # Wrapper per copia negli appunti 1-tap
│   │   └── Toast.tsx           # Floating toast notification
│   └── welcome/
│       └── WelcomeScreen.tsx   # Schermata di caricamento JSON al primo avvio
└── tabs/
    ├── Oggi.tsx                # Tab 1: Dashboard dinamica giorno corrente
    ├── Itinerario.tsx          # Tab 2: Overview città, diario express & export
    ├── Trasporti.tsx           # Tab 3: Voli, treni/bus, alloggi & biglietti musei
    ├── Guida.tsx               # Tab 4: Frasario (30 espressioni) & protocolli
    └── Emergenze.tsx           # Tab 5: Assicurazione, emergenze & reset DB

---

## 4. Workflow Generali di Progetto

1. **Automated CI (Quality Gate)**: Workflow GitHub Actions (`.github/workflows/ci.yml`) che esegue linter, `tsc`, test unitari/BDD e build PWA ad ogni push/PR.
2. **Schema Validation Workflow**: Validazione rigorosa dei file JSON di viaggio (`app/src/utils/schemaValidator.ts`, eseguibile via `npm run validate-schema`).
3. **BDD / Spec-Driven Development Flow**: Test trasparenti Given-When-Then in `app/tests/bdd/` allineati agli scenari BDD (`docs/BDD_SCENARIOS.md`).
4. **Offline-First E2E Testing Workflow**: Verification suite (`app/tests/unit/offline-pwa.spec.ts`) per testare il caricamento del Service Worker, IndexedDB e reazioni offline.
5. **Living Documentation Workflow**: Mantenimento attivo e aggiornato della Single Source of Truth in `docs/` (`maintain_living_documentation`).
6. **Cleanup-Session Workflow**: Procedura di fine sessione in 3 fasi (Roadmap & Walkthrough Sync → Knowledge Check `/knowledge-check` → Git & Data Hygiene).

```
