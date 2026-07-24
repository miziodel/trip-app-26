# Roadmap Funzionale & Backlog (v6.0 Completed)

Raccolta delle funzionalità implementate e future evoluzioni dell'applicazione PWA Trip App 2026.

---

## ✅ Funzionalità Completate (v6.0 - Luglio 2026)

- [x] **Palette Opzione B (Indaco & Bamboo Zen)**: Eliminazione del rosso-allarme. Orari in Verde Bamboo, badge fase in Indaco Giapponese, valuta in Zafferano. Token CSS `[data-theme="day"]` / `[data-theme="night"]` in `index.css`. Zero modifiche strutturali ai componenti.
- [x] **BottomNav Clean (No Dot Indicator)**: Rimosso il puntino attivo sotto l'icona di navigazione — la pillola di sfondo indaco è sufficiente indicatore visivo.
- [x] **Contrasto Card Voli Day Mode (WCAG AA)**: Badge `Confermato` e bordi card voli sostituiti con token Indaco ad alto contrasto su sfondo bianco (`bg-[var(--accent-torii)] text-white`).
- [x] **Sincronizzazione Offline-First GiPSigo (Feature 11)**: Servizio `gipsigoService.ts` con batch POST JSON (max 500 item), auto-sync su evento `online`, upload della prima foto in Data URI Base64 (`image_base64`), sincronizzazione atomica per-item con tracciamento `inserted_keys` dal server, fallback automatico coordinate città in `store.ts`, pulsante sync e widget con contatore pendenti sia nella Timeline dei Check-in che nelle Impostazioni (Emergenze).
- [x] **Selettore Vista Doppia (Itinerario vs Timeline)**: Selettore a due pill nel tab `Itinerario.tsx` per passare dalla vista "🗺️ Itinerario Completo" (tappe e orari) alla vista "📍 Timeline Check-in" (cronologia foto e momenti) mantenendo sempre la sezione Export in coda.

---

## ✅ Funzionalità Completate (v5.0 - Luglio 2026)

- [x] **Diario di Bordo Serale**: Sezione "🌙 Diario di Bordo" in fondo a ciascun giorno con valutazione a 5 stelle interattive, momento highlight e riflessioni della giornata salvate offline in IndexedDB (`journals` store v4).
- [x] **Copia Diario (Format Testo / Markdown Exporter)**: Generazione ed esportazione negli appunti di sistema del diario completo in formato Markdown (itinerario, check-in, diari serali, note).
- [x] **Check-in Foursquare Offline**: Registro geolocalizzato dei luoghi visitati con GPS nativo, ora esatta, rating, note e gestione foto.
- [x] **Compressione Foto Client-Side Canvas**: Compressione automatica delle foto allegate dalla fotocamera/galleria a max 1200px / JPEG 70% (~100KB) salvate in IndexedDB (`checkin_photos`).
- [x] **Modifica Check-in Esistenti**: Modal di modifica per aggiornare luoghi, note, rating ed allegare foto anche a posteriore sul rullino della giornata.
- [x] **Timeline dei Check-in**: Pagina/Vista cronologica di tutti i check-in e galleria foto del viaggio con ordinamento recente/vecchio e filtri per giorno.
- [x] **Esportazione Mappa GeoJSON & KML**: Generazione automatica di file `FeatureCollection` GeoJSON e KML (con fallback coordinate città per luoghi senza GPS) pronti per l'importazione in Google My Maps, Mapbox, Felt e Google Earth.
- [x] **TopBar Header Snellito**: Pulsante `📍 Check-in` integrato nell'header globale con icone compattate per Todo e Cambio Valuta.
- [x] **Itinerario Header Snellito & Filtro `Export 📥`**: Sezione strumenti di export spostata a fondo pagina con scroll automatico guidato dal chip `Export 📥`.
- [x] **Navigazione Giorno Inline ◀ GIORNO XX ▶**: Frecce di navigazione touch-friendly integrate sulla riga della data nel tab *Oggi*.
- [x] **Eliminazione Sicura con Conferma**: Dialog di conferma prima dell'eliminazione irreversibile dei Check-in.
- [x] **Deprecazione Reazioni 1-Tap**: Sostituzione delle vecchie reazioni 1-tap in favore dei Check-in e del Diario di Bordo.

---

## ✅ Funzionalità Completate (v4.0 - Luglio 2026)

- [x] **Formato Date Unificato**: Formattazione `dd-mm-yy ddd` (es. `28-07-26 lun`) su tutte le schede e tab.
- [x] **Tag Coperto/All'Aperto per Attività**: Badge visivi `🏢 Coperto`, `☀️ All'aperto`, `🌤️ Misto` sulle ScheduleCard.
- [x] **Focus Culinario Foto Google**: Chip linkati a Google Immagini per ciascun piatto citato.
- [x] **Mappe Trasporti Fisse**: Selezione diretta tra Destinazione e Itinerario (Directions) per item di trasporto.
- [x] **"Oggi" Alloggi Sveglia & Dormita**: Card decorative fisse `🌅 Sveglia a:` (in cima al giorno di cambio) e `🌙 Pernottamento a:` (in fondo).
- [x] **Taxi Card Tradotta**: Visualizzazione sia del nome tradotto (es. Coreano/Giapponese) che dell'indirizzo locale per i tassisti.
- [x] **Drawer Checklist & Promemoria (TopBar)**: Drawer globale da TopBar per accedere e gestire tutti i todo per ogni giorno con filtro passati.
- [x] **Giorno 0 con Volo Precedente**: Inserimento del volo V1 (giorno precedente) nel pannello espanso del Giorno 0.
- [x] **Deep-linking Mappe Mobile**: Composizione URL nativi (`maps://`, `geo:`, universal links) per bypassare il browser.
- [x] **Link Mappa Schede Alloggio**: Pulsanti dedicati 📍 Mappa per tutti gli alloggi.
- [x] **Filtro Trasporti Passati**: Toggle per nascondere/mostrare voli e treni delle date trascorse.
- [x] **Protocolli Culturali Espandibili**: Accordion espandibili per Onsen, Monjayaki, Transito Pechino, Geta Gujo.
- [x] **Selettore Lingua Frasario**: Toggle 🇯🇵 Giapponese | 🇰🇷 Coreano | 📖 Entrambe.
- [x] **Link Columbus Assicurazioni**: Pulsante con link web diretto al portale assicurazione.
- [x] **Google Drive Voucher in Trasporti**: Card per il backup dei voucher fruibile anche nel tab Trasporti.
- [x] **Offline Insights (`insights.json`)**: File curato di supporto per visualizzare consigli utili offline nelle attività.

