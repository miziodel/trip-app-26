# Architettura Tecnica — PWA "Viaggio Corea & Giappone 2026"

## 1. Stack Tecnologico

- **Core**: React 19 + TypeScript 6.0
- **Build Tool**: Vite 8.1
- **Styling**: TailwindCSS v4 — **Palette Opzione B (Indaco & Bamboo Zen)**: token CSS personalizzati (`--accent-torii: Indaco`, `--accent-bamboo: Verde Bamboo`, `--accent-gold: Zafferano`). Zero-rosso-allarme.
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
Database: `viaggio-db-v2` (Versione attuale con migration automatica)
- Store **`config`**:
  - Key `'data'`: Oggetto `ViaggioData` completo.
  - Key `'todos'`: Record `{ [giornoId: number]: boolean[] }` per lo stato delle spunte.
  - Key `'custom_todos'`: Record `{ [giornoId: number]: string[] }` per i promemoria aggiunti.
  - Key `'custom_rates'`: Oggetto `{ JPY_EUR: number, KRW_EUR: number }`.
  - Key `'gipsigo_config'`: Oggetto `GiPSigoConfig` con credenziali, endpoint e stato sync.
- Store **`logs`** (deprecato, in favore di `journals`):
  - Key `'logs'`: Record `{ [itemKey: string]: { reaction?: string, note?: string, updatedAt: number } }`.
- Store **`journals`**:
  - Key per `giornoId`: `DailyJournal` con rating, highlight, notes.
- Store **`checkins`**:
  - Oggetti `CheckIn` con ID univoco, timestamp, coordinate GPS, rating, commento, photoIds e flag `syncedToGiPSigo: boolean`.
- Store **`checkin_photos`**:
  - Oggetti `CheckInPhoto` con immagine compressa JPEG client-side (max 1200px, ~100KB).

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
├── index.css                   # Tailwind Base & CSS Custom (token Opzione B)
├── types/
│   └── viaggio.ts              # Tipizzazione TypeScript completa (incl. CheckIn, GiPSigoConfig)
├── store/
│   ├── db.ts                   # Layer di accesso asincrono IndexedDB via `idb`
│   └── store.ts                # Zustand store globale
├── services/
│   └── gipsigoService.ts       # Sync offline-first batch verso GiPSigo (POST JSON, BATCH_SIZE=500)
├── utils/
│   ├── dateUtils.ts            # Formatters date
│   ├── exportUtils.ts          # generateFullJournalMarkdown, exportCheckInsGeoJSON/KML, exportFullBackupJSON
│   ├── linkUtils.ts            # Deep-link mappe mobile
│   └── transitUtils.ts         # isTransitActiveNow, getTransitProgressPercent
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx          # Dual Timezone clock, pulsante Check-in, valuta, todo
│   │   └── BottomNav.tsx       # Bottom bar a 5 schede (min target 52px, senza dot indicator)
│   ├── ui/
│   │   ├── ScheduleCard.tsx    # Card oraria espandibile con Mappa/Search/Tabelog/Check-in
│   │   ├── TaxiCard.tsx        # Overlay fullscreen Kanji/Hangul ad alto contrasto
│   │   ├── CurrencyModal.tsx   # Modal convertitore EUR ↔ JPY/KRW editabile
│   │   ├── CopyableText.tsx    # Wrapper per copia negli appunti 1-tap
│   │   ├── Toast.tsx           # Floating toast notification
│   │   ├── CheckInCard.tsx     # Card singolo check-in con foto, rating, mappa e cancellazione
│   │   ├── CheckInTimeline.tsx # Timeline cronologica globale di tutti i check-in
│   │   ├── CheckInModal.tsx    # Modal per nuovo/modifica check-in con GPS e foto
│   │   ├── HeroProgressCard.tsx# Card progress per transiti attivi in tempo reale
│   │   └── NightlyJournalCard.tsx # Diario di bordo serale con stelle e highlight
│   └── welcome/
│       └── WelcomeScreen.tsx   # Schermata di caricamento JSON al primo avvio
└── tabs/
    ├── Oggi.tsx                # Tab 1: Dashboard dinamica giorno corrente
    ├── Itinerario.tsx          # Tab 2: Overview città, diario express, check-in, export & GiPSigo sync
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

---

## 5. Integrazione GiPSigo (Feature 11 — Sincronizzazione Opzionale)

L'integrazione GiPSigo è un layer di sincronizzazione **best-effort** e **non-bloccante** che NON viola il principio Zero-Cloud:

- I check-in sono **sempre scritti prima** in IndexedDB locale (`checkins` store).
- Se un check-in non possiede coordinate GPS trasmesse dal dispositivo, l'app assegna in automatico alla creazione/modifica le coordinate stimata della città dal giorno dell'itinerario via `resolveCheckInCoordinates()`.
- Il flag `syncedToGiPSigo: boolean` traccia cosa è già stato inviato.
- Il servizio `gipsigoService.ts` esegue POST JSON batch (max 500 item) all'endpoint `external_checkin.php` inviando `api_key`, `trip_token` e `checkins` direttamente nel body JSON.
- **Prima Foto allegata**: se il check-in possiede foto in IndexedDB, la prima foto viene convertita in Data URI Base64 ed inviata nel campo `image_base64`.
- **Sync Atomico per-item**: in caso di errori dal server su specifici item (es. immagine non valida), l'app segna come `syncedToGiPSigo: true` soltanto gli ID accettati/inseriti (`inserted_keys`), lasciando gli altri in coda per i successivi tentativi.
- **Auto-sync**: listener `window.addEventListener('online', ...)` attivato in `Itinerario.tsx` ed `App.tsx`.
- **Manual sync & Widget**: pulsante "🔗 Sync GiPSigo" e widget con contatore pendenti visibile sia nella Timeline dei check-in che nelle Impostazioni (Emergenze).
- **Selettore Vista Doppia**: in `Itinerario.tsx` è presente un selettore prominente tra la vista "Itinerario Completo" (tappe e tabelle orarie) e "Timeline Check-in" (cronologia foto e momenti).
- **Deduplicazione lato server**: ogni payload include `source_key = checkin.id` per prevenire duplicati.
- Le credenziali (`apiKey`, `tripToken`, `endpointUrl`) sono salvate in IndexedDB e **mai** in file sorgente o environment variables pubbliche.
