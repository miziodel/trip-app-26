# Viaggio Corea & Giappone 2026 — PWA Offline-First

Progressive Web App (PWA) responsive e 100% Offline-First con **Architettura di Privacy Zero-Cloud** per la gestione di itinerari, trasporti, alloggi, check-in geolocalizzati, diario di bordo, frasario e informazioni di emergenza per viaggi in Corea del Sud e Giappone.

---

## 🌟 Caratteristiche Principali

- **Privacy Zero-Cloud**: Nessun database remoto obbligatorio o server cloud per i dati sensibili. Tutti i dati personali (PNR, indirizzi, polizze, diario e check-in) risiedono unicamente nella memoria locale protetta del dispositivo (**IndexedDB**).
- **Offline Engine**: Service Worker PWA (`vite-plugin-pwa`) per garantire il funzionamento completo anche in assenza di rete internet o in modalità aereo.
- **Sincronizzazione Opzionale GiPSigo (Feature 11)**: Integrazione offline-first per inviare i check-in e le foto (in Data URI Base64) a un'istanza esterna GiPSigo con sincronizzazione automatica su evento `online`, sync atomica per-item e fallback coordinate città.
- **5 Schede Mobile-First**:
  1. **📅 OGGI**: Dashboard dinamica con auto-date picker per la tappa del giorno, dual timezone clock (CET / UTC+9), toggle piano pioggia/caldo, card orarie espandibili con mappe Naver/Google, taxi card e diario di bordo serale a 5 stelle.
  2. **🗺️ ITINERARIO**: Selettore vista doppia tra **Itinerario Completo** (tappe filtrabili per città) e **Timeline Check-in** (cronologia foto e momenti geolocalizzati), con strumenti di esportazione JSON, GeoJSON, KML e Markdown.
  3. **<ctrl42> VIAGGI**: Voli con PNR copiabili, treni/bus, alloggi con Taxi Card fullscreen e sezione dedicata ai biglietti musei/eventi.
  4. **⛩️ GUIDA**: Frasario tascabile a 30 espressioni JP/KR con fonetica, toggle lingua e pulsanti anchor rapidi, protocolli culturali (Onsen, Monjayaki, Transito Pechino, Geta).
  5. **🆘 EMERGENZE**: Assicurazione sanitaria con chiamata rapida H24, numeri d'emergenza nazionali, contatti ambasciate, integrazione credenziali GiPSigo e funzione di reset del database locale.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: TailwindCSS v4 (Palette Indaco & Bamboo Zen, Zero-rosso-allarme) + Lucide Icons
- **Offline & Storage**: IndexedDB (libreria `idb`), Zustand, `vite-plugin-pwa` (Workbox)
- **Testing**: Vitest (45 test unitari e BDD Given-When-Then)

---

## 🚀 Guida Rapida allo Sviluppo

### Installazione e Avvio
```bash
# Entra nella cartella app
cd app

# Installa le dipendenze
npm install

# Avvia il server di sviluppo con hot reload (live preview)
npm run dev -- --host

# Esegui i test automatizzati
npm test

# Compila ed avvia la preview di produzione PWA
npm run build
npm run preview
```

### Struttura Dati Sample
Un file di esempio anonimizzato della struttura JSON `viaggio-sample.json` è disponibile nella radice del progetto per testare il caricamento del database al primo avvio.

---

## 📚 Documentazione Tecnica & Architettura

La documentazione completa del progetto si trova nella cartella `docs/`:
- [`SPECIFICA_FUNZIONALE.md`](docs/SPECIFICA_FUNZIONALE.md): Specifica PRD di tutte le schede, check-in, diario serale e modali.
- [`ARCHITETTURA_TECNICA.md`](docs/ARCHITETTURA_TECNICA.md): Flusso dei dati, schema IndexedDB, Service Worker e sync GiPSigo.
- [`BDD_SCENARIOS.md`](docs/BDD_SCENARIOS.md): Scenari di test Given-When-Then (11 Feature coperti).
- [`ROADMAP.md`](docs/ROADMAP.md): Registro delle funzionalità completate e backlog.
- [`ADR.md`](docs/ADR.md): Architectural Decision Records.
- [`AGENTS.md`](AGENTS.md): Guida di contesto per agenti AI.
