# Specifica Funzionale — PWA "Viaggio Corea & Giappone 2026"

## 1. Visione del Prodotto
**"Viaggio Corea & Giappone 2026"** è una Progressive Web App (PWA) Single Page Application (SPA) responsive, 100% Offline-First, progettata con un'architettura **Privacy Zero-Cloud**.
L'applicazione permette ai viaggiatori (Maurizio & Paola) di consultare e gestire l'intero itinerario di 24 giorni (28 Luglio – 20 Agosto 2026) in Corea del Sud e Giappone senza dipendere da connessioni internet o server esterni.

---

## 2. Requisiti di Privacy & Storage Locale

### 2.1 Architettura Zero-Cloud
- L'app non possiede un backend/database cloud centralizzato.
- Tutti i dati sensibili (PNR dei voli, numeri di prenotazione treni, indirizzi locali, numero di polizza assicurativa) risiedono unicamente nella memoria locale del dispositivo.

### 2.2 Primo Avvio & Persistenza (IndexedDB)
- **Welcome Screen**: Se l'IndexedDB è vuoto, l'app mostra una schermata di benvenuto con due opzioni:
  1. `📂 Carica Database Viaggio (.json)` — Caricamento manuale di un file JSON locale fornito dall'utente.
  2. `Carica Database Integrato` — Caricamento rapido del file `viaggio-2026.json` fornito col bundle.
- **Persistenza**: All'importazione dei dati viene eseguita la chiamata `navigator.storage.persist()` per richiedere al sistema operativo di non cancellare la memoria dell'app.
- **Store IndexedDB (`viaggio-db-v2`)**:
  - `config`: memorizza i dati generali del viaggio, i to-do di base, i to-do custom e i tassi di cambio personalizzati.
  - `logs`: memorizza le reazioni (❤️👍😐👎) e le note inserite dall'utente per ogni punto d'interesse.

---

## 3. Specifiche per Scheda (Bottom Navigation)

L'interfaccia mobile-first presenta una **Bottom Navigation Bar fissa** a 5 schede con min touch target di 52px.

### 3.1 📅 Tab 1: "OGGI" (Dashboard Dinamica)
- **Logica Data Automatica**:
  - Se la data corrente è compresa tra il 28 Luglio e il 20 Agosto 2026, l'app si apre automaticamente sul giorno corrispondente.
  - Altrimenti, parte da Giorno 0 mettendo a disposizione un selettore manuale (< Giorno X >).
- **Hero Card "IN CORSO NOW"**:
  - Mostrata **SOLO ED ESCLUSIVAMENTE** quando la data e l'ora attuale rientrano strettamente nell'intervallo del trasporto attivo del giorno (`isTransitActiveNow`).
  - Layout a 3 colonne per tragitto, barra di avanzamento e pulsante Taxi Card all'arrivo.
- **Parità Informativa Completa**:
  - Espone in tempo reale tutte le informazioni del giorno visibili in Itinerario: Voli del giorno (`dayFlights`), Treni & Bus (`dayTransits`), Biglietti & Voucher con codice (`dayTickets`), e Focus Culinario con ricerche Tabelog/Google.
- **Programma Orario Dinamico (`ScheduleCard`)**:
  - **Stato chiuso di default** per una consultazione rapida e pulita.
  - **Layout fisso a 3 righe da chiuso**:
    - Riga 1: Pallino colorato per `tipo` (es. `bg-sky-500` trasporto, `bg-amber-500` pasto, `bg-emerald-500` visita) + Orario + Badge tipo.
    - Riga 2: Titolo attivita + Nome locale in caratteri giapponesi/coreani.
    - Riga 3: Descrizione dell'item (`dettagli`) visibile subito.
  - **Sezione Espansa al Click**: Attiva le CTA per Google Maps, Naver Maps, Tabelog, Taxi Card, Feedback Reazioni (`❤️`, `👍`, `😐`, `👎`) e Note offline.
  - Ogni slot orario mostra l'ora, la categoria badge (Cibo 🍜, Trasporto 🚌, Cultura ⛩️, Onsen ♨️, Evento ⭐), il titolo e i dettagli.
  - **Auto-espansione**: L'attività più vicina all'orario attuale del giorno si espande automaticamente all'avvio.
  - **Pannello azioni al click**:
    - `📍 Apri Mappa`: Deep link a Naver Map per Seoul/Corea (`map.naver.com`) o Google Maps per il Giappone (`google.com/maps`).
    - `🔍 Cerca su Google`: Ricerca automatica della voce su Google.
    - `🍜 Cerca su Tabelog`: Presente per le voci cibo in Giappone (filtro score >3.5).
    - `🎟️ Codice Biglietto`: Se i dettagli contengono un codice/PNR/ticket, appare il tasto per la copia rapida negli appunti.
- **Checklist & To-Do**:
  - Spunte interattive salvate in IndexedDB.
  - Form `+ Aggiungi nota o promemoria` per inserire voci custom per quel giorno (con tasto elimina `✕`).
- **Alloggio Notturno & Taxi Card**: Box in fondo alla pagina con nome dell'hotel, stazione di riferimento e pulsante `🚗 Mostra Taxi Card`.

### 3.2 🗺️ Tab 2: "ITINERARIO" (Overview & Diario di Viaggio)
- **Filtri Città**: Pills interattivi (`Tutti` | `Seoul` | `Tokyo` | `Alpi Giapponesi` | `Osaka`).
- **Navigazione diretta**: Cliccando sul titolo di un giorno si viene reindirizzati direttamente alla vista **OGGI** di quel specifico giorno.
- **Integrazione Trasporti & Alloggi nella Timeline**:
  - I voli della giornata compaiono come voci speciali `Volo ✈️` con PNR copiabile.
  - L'alloggio notturno del giorno compare come voce finale `Pernottamento 🏨` con tasto Taxi Card.
- **Diario Express 1-Tap**:
  - Ogni slot del programma dispone di 4 icone reazione: ❤️ (Super), 👍 (Bello), 😐 (Così così), 👎 (Da evitare).
  - Campo di testo per annotare note libere (es. piatto migliore, costo, ricordo).
- **Pulsante `📥 Esporta Diario`**: Genera e fa scaricare un file `.json` contenente tutte le recensioni e note salvate dall'utente.

### 3.3 🚄 Tab 3: "VIAGGI" (Voli, Treni, Alloggi & Biglietti)
- **Filtri Categoria**: `Tutti` | `✈️ Voli` | `🚄 Treni & Bus` | `🏨 Alloggi` | `🎟️ Biglietti`.
- **Sezione Voli (V1 - V5)**: Tabella sintetizzata con PNR copiabili in 1-tap, terminal, orari, durata e note sui transiti (es. layover Pechino 1h 55m).
- **Sezione Treni & Bus (T1, B1-B3)**: Shinkansen Kagayaki e Bus Nohi/Kintetsu con PNR, carrozze, posti e codici di ritiro.
- **Card Spedizione Valigie Yamato (Takkyubin)**: Scheda dedicata per la spedizione Shinjuku ➔ Osaka con pulsante fullscreen dell'indirizzo dell'Hotel S-Presso West.
- **Nuova Sezione Biglietti Musei & Eventi**: Estratta automaticamente dal programma (teamLab Borderless, Mori Art Museum, 21st Century Museum) con codici d'accesso copiabili.
- **Registro Alloggi (H1 - H6)**: Indirizzi in inglese e lingua locale copiabili, note lavatrice, stazioni metro e pulsante `🚗 Taxi Card` per ciascun hotel.

### 3.4 ⛩️ Tab 4: "GUIDA" (Frasario & Protocolli)
- **Pulsanti Anchor Rapidi**: In cima al tab due bottoni d'azione `[ 📖 Vai al Frasario ]` e `[ 🎌 Vai ai Protocolli ]` per scrollare immediatamente alle sezioni.
- **Frasario Tascabile (30 Espressioni)**:
  - Suddiviso in 4 categorie (*Cortesia*, *Cibo*, *Trasporti*, *Emergenze*).
  - Testo in Giapponese 🇯🇵 (Kanji/Kana) e Coreano 🇰🇷 (Hangul), pronuncia fonetica e pulsante per la copia rapida negli appunti.
  - Campo di ricerca live per filtrare le frasi.
- **Protocolli Culturali**:
  - *Etichetta Onsen & Tattoo Cover* (regole lavaggio, asciugamani, tattoo stickers).
  - *Tecnica della Diga (Dote) per Monjayaki* (passaggi di cottura al tavolo).
  - *Protocollo Transito Pechino PEK* (regole battery bank <100Wh, cartelli blu).
  - *Uso dei Geta al Gujo Odori* (calzata corta, prevenzione vesciche).

### 3.5 🆘 Tab 5: "EMERGENZE & UTILITIES"
- **Polizza Assicurativa Columbus**: Numero polizza `000000000` e avvio chiamata rapida `tel:+390000000000` H24.
- **Numeri Nazionali & Ambasciate**: Polizia, Ambulanza, Hotline Turistica (1330 Corea / JNTO Giappone), Ambasciata Seoul/Tokyo e Consolato Osaka con avvio chiamata rapida.
- **Documenti Cloud**: Link diretto alla cartella Google Drive per il recupero dei voucher originali.
- **Reset Database**: Pulsante `🗑️ Reimposta App (Cancella IndexedDB)` con modal di conferma per svuotare i dati e tornare alla WelcomeScreen.

---

## 4. Requisiti d'Interfaccia & Modali Globali

### 4.1 Taxi Card Fullscreen
- Overlay a schermo intero (`fixed inset-0 bg-black z-50`) attivabile da qualsiasi scheda hotel o attività.
- Visualizza l'indirizzo in caratteri giganti (**Kanji / Hangul**) bianco su sfondo nero ad altissimo contrasto per essere chiaramente visibile ai conducenti di taxi di notte o in movimento.

### 4.2 Convertitore Valuta Pivoted (`CurrencyModal`)
- Visualizzazione tassi di riferimento pivoitata: **"1 EUR = X JPY / X KRW"**.
- Calcolo automatico bidirezionale: inserendo EUR si ottengono JPY e KRW, inserendo JPY/KRW si ottiene l'equivalente in EUR.
- **Sezione `⚙️ Modifica Tassi`**: Possibilità per l'utente di modificare i tassi di cambio correnti durante il viaggio. I tassi custom vengono salvati in IndexedDB e l'interfaccia mostra il badge `Personalizzato`.

### 4.3 Clipboard One-Tap & Toast
- Toccando qualsiasi PNR, codice biglietto, indirizzo o numero di telefono, questo viene copiato negli appunti e appare una toast notification "Copiato! ✓" per 2.5 secondi.
