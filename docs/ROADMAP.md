# Roadmap Funzionale & Backlog (v4.0 Completed)

Raccolta delle funzionalità implementate e future evoluzioni dell'applicazione PWA Trip App 2026.

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
- [x] **Feedback 1-Tap su Singolo Item**: Reazioni ❤️👍😐👎 a livello di singola attività della giornata salvate in IndexedDB.
- [x] **Deep-linking Mappe Mobile**: Composizione URL nativi (`maps://`, `geo:`, universal links) per bypassare il browser.
- [x] **Link Mappa Schede Alloggio**: Pulsanti dedicati 📍 Mappa per tutti gli alloggi.
- [x] **Filtro Trasporti Passati**: Toggle per nascondere/mostrare voli e treni delle date trascorse.
- [x] **Protocolli Culturali Espandibili**: Accordion espandibili per Onsen, Monjayaki, Transito Pechino, Geta Gujo.
- [x] **Selettore Lingua Frasario**: Toggle 🇯🇵 Giapponese | 🇰🇷 Coreano | 📖 Entrambe.
- [x] **Link Columbus Assicurazioni**: Pulsante con link web diretto al portale assicurazione.
- [x] **Google Drive Voucher in Trasporti**: Card per il backup dei voucher fruibile anche nel tab Trasporti.
- [x] **Offline Insights (`insights.json`)**: File curato di supporto per visualizzare consigli utili offline nelle attività.

---

## 🎯 Prossime Funzionalità Pianificate (v5.0+)

### 📱 1. QR Code Gallery Offline per Biglietti & Voucher
- **Descrizione**: Sezione dedicata per visualizzare offline le foto/screenshot dei QR Code dei biglietti (teamLab, Mori Art Museum, Bus Nohi).

### 🔊 2. Sintesi Vocale Offline (Web Speech API) per Frasario
- **Descrizione**: Pulsante `🔊 Pronuncia` accanto a ciascuna frase del Frasario utilizzando l'engine Web Speech sintetizzato nativo dello smartphone.

### 📊 3. Spese di Viaggio & Budget Tracker
- **Descrizione**: Piccola sezione per annotare le uscite giornaliere (Cibo, Souvenir, Trasporti) in Yen/Won con calcolo automatico in Euro.
