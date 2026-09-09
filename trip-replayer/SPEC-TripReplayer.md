# SPEC-TripReplayer.md

Visualizzatore standalone (HTML/JS puro + Leaflet) per **rivivere il viaggio Corea & Giappone 2026**: mappa interattiva, check-in, foto, programmi giorno. Strumento desktop complementare all'app PWA (zero-cloud): legge i due file JSON dell'ecosistema `trip-app-26` e permette, come percorso secondario, di **completare il diario** aggiungendo/correggendo check-in dal desktop e riesportando il backup.

## Obiettivo e intento

1. **Percorso principale — Rivivere**: aprire il viaggio e scorrere i ricordi (mappa, marker, foto, programmi) in sola lettura, senza barriere.
2. **Percorso secondario — Completare il diario**: click sulla mappa per aggiungere un check-in mancante, modifica/elimina dei check-in esistenti, export del backup aggiornato da reimportare nell'app (che accetta il load JSON da SOS/Emergenze).
3. Lo stato è **in-memory** (nessuna persistenza): tutto si ricostruisce dai due file.

### Scenario d'uso end-to-end
1. L'utente apre la pagina e carica il **file viaggio originale** (schema app: `meta` + `itinerario` 0-based) e il **backup check-in** (export reale `exportFullBackupJSON`).
2. Vede la mappa coi marker dei check-in, la sidebar dei 24 giorni e il pannello del giorno selezionato con card e foto.
3. (Opzionale) Aggiunge/corregge ricordi dal desktop, poi scarica il backup aggiornato e lo reimporta nell'app.

### Regole di merge dei file
- **File viaggio**: sostituisce `meta`/`itinerario`/`alloggi`/ecc. e **mantiene** i check-in già caricati (permette di cambiare file viaggio senza perdere i ricordi). Se il giorno attivo non esiste più nel nuovo itinerario, si seleziona il primo giorno.
- **File backup**: **merge per `id`** dei check-in (niente duplicati); le foto (`checkInPhotos`, mappa id → dataURL base64) si aggiungono senza sovrascrivere id già presenti.
- **Ordine consigliato**: prima viaggio, poi backup. Il backup da solo è accettato: mostra i marker senza contesto giorno (popup senza città) e invita a caricare anche il viaggio.
- Il backup reale dell'app può contenere `journals`/chiavi extra: **ignorate** dal replayer.

### Convenzione `giorno`
`giorno` è **0-based ovunque nei dati** (itinerario e check-in), come in `app`, `viaggio-sample.json` ed export reale (giorno 0 = 28 luglio 2026 = arrivo a Seoul). **Solo la UI mostra "Giorno 1..24"** (valore +1). Mai tradurre tra i file.

## Funzionalità

### F1 — Caricamento file JSON
- Input file per viaggio originale (`.json`) e per backup check-in (`.json`), entrambi funzionanti dal click reale dell'utente.
- Parsing e validazione; toast di conferma/errore (JSON malformato, manca `meta`/`itinerario`, manca `checkIns`).
- Header informativo: titolo viaggio · N giorni · N alloggi. Pulsante export abilitato dopo il load del viaggio.

### F2 — Mappa interattiva
- Tile di base **Esri World Street Map** (etichette bilingui: nome locale + romanizzazione occidentale) con selettore per tornare a **OSM standard**; attribuzioni corrette in entrambi i casi.
- Icone marker **locali** (pin SVG grande, nessun asset esterno rotto).
- **Widget di ricerca luoghi** (in alto a destra, lente 🔍): geocoding via **OSM Nominatim** (uso on-demand, throttling 1s, niente autocomplete lato client come da policy). Al risultato la mappa **si sposta** sul luogo (fit sul bbox) e un **pin azzurro** segna il punto (non è un check-in; sparisce selezionando un giorno). Plugin: `leaflet-control-geocoder` v4.0.0 (BSD-2, vendored in `lib/geocoder/`) con geocoder `fetch` custom.
- Click su mappa (con viaggio caricato) → form nuovo check-in nel giorno attivo.
- Click marker → **popup di anteprima** (mai una modal a schermo pieno).

### F3 — Navigazione per giorno (sidebar → mappa + pannello)
- Sidebar con i giorni dell'itinerario, etichettati **Giorno 01..24** (titolo, data, città).
- **Click su un giorno = seleziona il giorno**: evidenzia la voce, fa il fit della mappa sui marker di quel giorno, riempie il bottom panel. **Non apre** alcuna modal.
- **Pulsante 📋 in ogni riga della sidebar** (target ≥34px): click = seleziona il giorno **e apre** il programma.
- Giorno con check-in → indicatore visibile (pallino) nella voce sidebar.

### F4 — Day modal (programma giorno)
- Titolo "Giorno N: <titolo>", data, città, fase.
- Orario (`tabella_oraria`: ora, attività, dettagli, riferimento mappe).
- To-Do (`todo_list`: testo, spunta se fatto).
- Focus culinario (`focus_culinario`).
- **Ogni attività dell'orario ha un pulsante "📍 Check-in"** e l'header del giorno un'azione "Aggiungi check-in al giorno": avviano il flusso di posizionamento (F7).
- Chiusura: ×, click sul backdrop, ESC.

### F5 — Popup check-in (anteprima) e modal dettaglio
- **Popup Leaflet** (click marker), layout leggibile: intestazione con nome + stelle rating, chip "Giorno N · città", orario, commento in riquadro, foto, azioni "🗺 Maps" e "Dettagli ✏".
- **Modal dettaglio** (da "Dettagli" o da card nel pannello): nome, giorno/città, timestamp, coordinate, foto grandi (lightbox al click), commento, link Google Maps, pulsanti **Modifica** / **Elimina**.

### F6 — Pannello del giorno e galleria foto
- Bottom panel potenziato (bordo ambra, ~300px, **ridimensionabile trascinando la maniglia**; doppio click = ripristina): **header-giorno** con `Giorno N: città`, titolo del giorno e data estesa; azioni a destra (badge check-in + pulsante "📋 Programma giorno").
- Sezioni etichettate: **Check-in del giorno** (card: nome, ora, rating, commento) con link "aggiungi un altro check-in", e **Foto del giorno** (griglia, dedup).
- Click foto → lightbox (chiusura: click, ×, ESC).

### F7 — Aggiunta/modifica/eliminazione check-in (percorso secondario)
- Click mappa → form nuovo check-in: nome (obbligatorio), giorno (default: attivo o del flusso), rating, commento, foto (max 3, da file).
- **Posizione geografica gestibile in entrambi i form**: badge con coordinate correnti + "🗺 Cambia cliccando sulla mappa" (il form si chiude, un banner guida, il click sulla mappa riapre il form con le nuove coordinate) **oppure** campo "incolla da Google Maps" che accetta coordinate decimali (`39.9042, 116.4074`), **Plus Code** pieni (`8Q3X3JH3+W6X`) e corti con città (`3JH3+W6X, Shunyi District, Beijing`), e link Google Maps (`@40.08,116.6` / `q=lat,lng`) — decodifica **offline** via `pluscodes.js`.
- **Check-in da luogo del programma ("posiziona sulla mappa")**: dal pulsante "📍 Check-in" di un'attività (o dell'azione giorno) il programma si chiude, un banner guida l'utente e il click successivo sulla mappa apre il form **precompilato** con nome = attività e giorno = quello del programma. Annulla possibile via banner o ESC.
- Modifica da modal dettaglio (stessi campi; le foto sostituiscono le esistenti).
- Elimina con conferma; le foto orfane vengono rimosse.
- Tutte le mutazioni aggiornano marker, sidebar (indicatori), pannello.

### F8 — Export backup
- Pulsante export → download `diario-viaggio-*.json` con `meta`, `exportDate`, `journals` (vuoto), `checkIns`, `checkInPhotos` (id → base64) — **stessa forma** del backup reale dell'app, quindi reimportabile nel replayer e nell'app.

### F9 — Errori gestiti
- JSON non valido → toast errore (nessun crash).
- Manca `meta`/`itinerario` nel viaggio o `checkIns` nel backup → toast errore.
- Foto con dataURL rotto/mancante → `img` nascosta con placeholder, nessun errore console.
- **Zero errori console e zero eccezioni non catturate (pageerror)** in tutti gli scenari.

### F10 — Persistenza sessione nel browser (IndexedDB)
- I file caricati (viaggio + backup) e le modifiche della sessione vengono salvati in **IndexedDB** locale e **ripristinati automaticamente** al reload: si può chiudere e riaprire la pagina senza ricaricare i JSON.
- Pulsante "🗑 Azzera dati" nell'header (visibile quando ci sono dati): cancella tutto e riparte pulito.
- Nessun dato esce dal browser (nessun sync).

## Stack tecnico
- HTML5 + JS vanilla, Leaflet locale (un solo include), nessuna dipendenza CDN per JS/CSS; tile OSM da CDN pubblico; server locale Python su `localhost:8080`.

## Input JSON

### Viaggio originale (`test/viaggio-demo.json`, schema app `viaggio-sample.json`)
```json
{
  "meta": { "titolo": "...", "versione": "..." },
  "itinerario": [
    {
      "giorno": 0,
      "data": "2026-07-28",
      "citta": "Seoul",
      "paese": "KR",
      "fase": "...",
      "titolo": "...",
      "focus_culinario": "...",
      "tabella_oraria": [{ "ora": "...", "tipo": "...", "attivita": "...", "dettagli": "..." }],
      "todo_list": [{ "testo": "...", "fatto": false }]
    }
  ],
  "alloggi": [...], "trasporti": [...], "emergenze": {...},
  "protocolli": {...}, "frasario": [...], "biglietti": [...]
}
```

### Backup check-in (`test/test-checkins.json`, forma `exportFullBackupJSON`)
```json
{
  "meta": { "titolo": "..." },
  "exportDate": "...",
  "journals": {},
  "checkIns": [
    { "id": "...", "giorno": 0, "timestamp": "...", "lat": 37.5665, "lng": 126.978,
      "luogo_nome": "Seoul Station", "locationName": "Seoul Station",
      "rating": 4, "commento": "...", "comment": "...",
      "photoIds": ["foto_..."], "photos": ["foto_..."], "coords": { "lat": ..., "lng": ... } }
  ],
  "checkInPhotos": { "foto_...": "data:image/png;base64,..." }
}
```

## Criteri di accettazione (AC)

- AC1: Dopo il caricamento del viaggio (via input reale), sidebar con **24 giorni** etichettati `GIORNO 01..24` con titolo, data, città; header con titolo e "24 giorni"; il primo giorno è selezionato (voce attiva, pannello visibile) **senza** modal aperta.
- AC2: Dopo il caricamento del backup, mappa con **3 marker** (Seoul Station → giorno 0, Tokyo Tower → giorno 4, Gotokuji → giorno 12) e indicatori visibili nelle voci sidebar corrispondenti.
- AC3: Click giorno → selezione (fit mappa sui marker del giorno + pannello aggiornato); click "Programma giorno" → day modal con Orario e To-Do popolati; ESC la chiude.
- AC4: Click marker → popup di anteprima con **link Google Maps** e pulsante Dettagli.
- AC5: Foto base64 del check-in visibili nel popup (img con `src` `data:image`).
- AC6: La sidebar mantiene i 24 giorni dopo il caricamento del backup; ricaricare lo stesso backup non duplica i marker (merge per id).
- AC7: Click "Dettagli" → modal dettaglio con pulsanti Modifica/Elimina; modifica e eliminazione aggiornano mappa/sidebar/pannello.
- AC8: Export scarica un JSON con `checkIns` e `checkInPhotos` coerenti con lo stato corrente (incluso un check-in con foto aggiunto nella sessione).
- AC9: Nessun console error **né pageerror** in nessun test.
- AC10: JSON invalido o file con chiavi mancanti → toast di errore, app stabile.

## Out of scope (per ora)
- Modifica di meta/itinerario/alloggi/trasporti (sola visualizzazione).
- Upload foto da URL esterni.
- Offline tiles (le tile richiedono rete).

## File di test
- `test/viaggio-demo.json`: viaggio demo (24 giorni, 0-based) — dati anonimizzati.
- `test/test-checkins.json`: 3 check-in allineati all'itinerario demo (Seoul Station giorno 0, Tokyo Tower giorno 4, Gotokuji giorno 12), il primo con foto base64 di test.
