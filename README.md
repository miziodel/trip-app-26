# Viaggio Corea & Giappone 2026 — PWA Offline-First

Progressive Web App (PWA) responsive e 100% Offline-First con **Architettura di Privacy Zero-Cloud** per la gestione di itinerari, trasporti, alloggi, frasario e informazioni di emergenza per viaggi in Corea del Sud e Giappone.

---

## 🌟 Caratteristiche Principali

- **Privacy Zero-Cloud**: Nessun database remoto o server esterno. I dati personali (PNR, indirizzi, polizze) vivono unicamente nella memoria locale protetta del dispositivo (**IndexedDB**).
- **Offline Engine**: Service Worker PWA con strategia Cache-First per garantire il funzionamento completo anche in assenza di rete internet o in modalità aereo.
- **5 Schede Mobile-First**:
  1. **📅 OGGI**: Dashboard dinamica con auto-date picker per la tappa del giorno, dual timezone clock (CET / UTC+9), toggle piano pioggia/caldo, card orarie espandibili con mappeNaver/Google e taxi card.
  2. **🗺️ ITINERARIO**: Vista completa del viaggio filtrabile per città, log di viaggio 1-tap (reazioni ❤️👍😐👎 e note), export diario JSON e navigazione diretta.
  3. **🚄 VIAGGI**: Voli con PNR copiabili, treni/bus, alloggi con Taxi Card fullscreen e sezione dedicata ai biglietti musei/eventi.
  4. **⛩️ GUIDA**: Frasario tascabile a 30 espressioni JP/KR con fonetica e pulsanti anchor rapidi, protocolli culturali (Onsen, Monjayaki, Transito Pechino, Geta).
  5. **🆘 EMERGENZE**: Assicurazione sanitaria con chiamata rapida H24, numeri d'emergenza nazionali, contatti ambasciate e funzione di reset del database locale.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: TailwindCSS v4 + Lucide Icons
- **Offline & Storage**: IndexedDB (libreria `idb`), Zustand, `vite-plugin-pwa` (Workbox)
- **Testing**: Vitest

---

## 🚀 Guida Rapida allo Sviluppo

### Installazione e Avvio
```bash
# Entra nella cartella app
cd app

# Installa le dipendenze
npm install

# Avvia il server di sviluppo con hot reload
npm run dev

# Avvia la preview di produzione con Service Worker PWA
npm run build
npm run preview
```

### Struttura Dati Sample
Un file di esempio anonimizzato della struttura JSON `viaggio-sample.json` è disponibile nella radice del progetto per testare il caricamento del database al primo avvio.

---

## 📚 Documentazione Tecnica & Architettura

La documentazione completa del progetto si trova nella cartella `docs/`:
- [`SPECIFICA_FUNZIONALE.md`](docs/SPECIFICA_FUNZIONALE.md): Specifica PRD di tutte le schede e componenti.
- [`ARCHITETTURA_TECNICA.md`](docs/ARCHITETTURA_TECNICA.md): Flusso dei dati, schema IndexedDB e Service Worker.
- [`BDD_SCENARIOS.md`](docs/BDD_SCENARIOS.md): Scenari di test Given-When-Then.
- [`ADR.md`](docs/ADR.md): Architectural Decision Records.
- [`AGENTS.md`](AGENTS.md): Guida di contesto per agenti AI.
