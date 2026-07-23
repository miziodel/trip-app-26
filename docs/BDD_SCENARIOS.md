# Scenari BDD (Behavior-Driven Development)

I seguenti scenari specificano il comportamento atteso dell'applicazione nel formato **Given - When - Then** (Gherkin).

---

## Feature 1: Caricamento Database & Welcome Screen

```gherkin
Feature: Caricamento del Database di Viaggio
  Come utente
  Voglio caricare il file JSON del viaggio o usare quello integrato
  Per poter consultare i dati in totale offline e sicurezza

  Scenario: Primo avvio con IndexedDB vuoto
    Given l'app viene aperta per la prima volta
    And l'IndexedDB non contiene alcun dato salvato
    When il caricamento iniziale viene completato
    Then viene mostrata la WelcomeScreen
    And viene visualizzato il pulsante "📂 Carica Database Viaggio (.json)"
    And viene visualizzato il pulsante "Carica Database Integrato"

  Scenario: Caricamento del file JSON integrato
    Given l'utente si trova sulla WelcomeScreen
    When tocca il pulsante "Carica Database Integrato"
    Then i dati di "viaggio-2026.json" vengono salvati in IndexedDB
    And viene invocata la funzione navigator.storage.persist()
    And l'app passa alla schermata principale mostrando il Tab "OGGI"
```

---

## Feature 2: Dashboard "OGGI" & Card Oraria Espandibile

```gherkin
Feature: Tab OGGI e Schede Orarie
  Come utente in viaggio
  Voglio vedere immediatamente l'impegno orario più rilevante e accedere alle mappe
  Per orientarmi rapidamente con una sola mano

  Scenario: Hero Progress Card visibile solo per trasporti attivi in tempo reale
    Given l'utente visualizza il Tab OGGI
    When la data corrente e l'ora attuale rientrano strettamente nell'intervallo [ora_partenza, ora_arrivo] del trasporto attivo
    Then la HeroProgressCard "IN CORSO NOW" viene visualizzata con la percentuale di avanzamento
    But se la data o l'ora corrente sono fuori dal range della tratta
    Then la HeroProgressCard rimane nascosta

  Scenario: Layout a 3 righe da chiuso e pannello espanso della ScheduleCard
    Given l'utente visualizza l'elenco della tabella oraria
    When le card vengono renderizzate
    Then sono chiuse di default mostrando Riga 1 (Orario + Tag Tipo), Riga 2 (Titolo + Nome Locale) e Riga 3 (Descrizione)
    When l'utente tocca qualsiasi punto della card
    Then la card si espande mostrando le CTA Google Maps, Naver Maps, Taxi Card, Feedback Reazioni e Note offline

  Scenario: Feedback Reazioni e persistenza Note offline
    Given una ScheduleCard espansa
    When l'utente tocca un'icona di reazione (❤️, 👍, 😐, 👎)
    Then la reazione viene salvata nello store locale IndexedDB (userLogs)
    And viene visualizzata nell'header della scheda
    When l'utente inserisce una nota offline
    Then la nota viene salvata e mostrata nella scheda ambrata del dettaglio
```

---

## Feature 3: Taxi Card Fullscreen

```gherkin
Feature: Visualizzazione Indirizzo Taxi Card
  Come utente in un taxi in Giappone o Corea
  Voglio mostrare l'indirizzo dell'hotel a schermo intero in caratteri locali
  Per farmi capire immediatamente dal conducente

  Scenario: Apertura Taxi Card da una scheda alloggio
    Given l'utente si trova nel Tab OGGI o Viaggi
    When tocca il pulsante "🚗 Mostra Taxi Card" per l'Hotel Vista Kanazawa
    Then viene aperto un overlay fullscreen a sfondo nero
    And mostra l'indirizzo "石川県金沢市広岡2-13-27" in testo bianco extra-large (text-4xl/5xl)
    And viene mostrato il pulsante "✕ Chiudi" in alto a destra
```

---

## Feature 4: Convertitore Valuta Pivoted & Editabile

```gherkin
Feature: Convertitore Valuta EUR ↔ JPY / KRW
  Come utente in un negozio o ristorante
  Voglio convertire al volo prezzi in Yen o Won ed eventualmente aggiornare il tasso
  Per sapere esattamente quanto sto spendendo in Euro

  Scenario: Conversione da Yen ad Euro con tassi di base
    Given il tasso di base è 1 EUR = 166 JPY
    When l'utente apre il modal Convertitore Valuta e digita "5000" Yen
    Then la scheda Euro mostra l'equivalente "€ 30,12"

  Scenario: Modifica manuale del tasso di cambio
    Given l'utente apre la sezione "⚙️ Modifica Tassi" nel modal valute
    When modifica il tasso JPY inserendo "160" Yen per 1 EUR e salva
    Then i nuovi tassi vengono salvati in IndexedDB
    And viene visualizzato il badge "Personalizzato" nel modal
    And le conversioni successive utilizzano il nuovo tasso di 160 JPY/EUR
```

---

## Feature 5: Diario Express & Esportazione

```gherkin
Feature: Log di Viaggio Express & Export JSON
  Come utente in viaggio
  Voglio lasciare reazioni rapide e note sui ristoranti/luoghi visitati
  Per poter conservare un diario dei ricordi scaricabile

  Scenario: Inserimento di una reazione e nota
    Given l'utente si trova nel Tab ITINERARIO su una tappa cibo
    When tocca la reazione "❤️" e inserisce la nota "Ramen eccezionale"
    Then la reazione e la nota vengono salvate istantaneamente nello store IndexedDB

  Scenario: Esportazione del diario salvato
    Given l'utente ha inserito varie note e reazioni durante il viaggio
    When tocca il pulsante "📥 Esporta Diario" nel Tab ITINERARIO
    Then viene scaricato sul dispositivo un file JSON contenente tutti i log salvati
```

---

## Feature 7: Tema Giorno 100% Solare & Alto Contrasto (WCAG AAA)

```gherkin
Feature: Palette Colori Giorno e Notte Dinamica
  Come utente sotto il sole estivo in Asia
  Voglio un'interfaccia 100% chiara, solare e priva di aloni scuri hardcoded
  Per consultare la mia guida senza riflessi e alla massima leggibilità

  Scenario: Attivazione Modalità Giorno 100% Chiara
    Given l'utente seleziona il tema "day" (Giorno)
    When l'attributo data-theme="day" viene applicato all'HTML
    Then lo sfondo primario passa a #F8FAFC e le card a #FFFFFF puro
    And tutti i container, modali (TodoDrawer, CurrencyModal) e bottoni non utilizzano sfondi grigio scuro slate
    And i testi primari (#0F172A) e secondari (#475569) rispettano lo standard WCAG AAA per la massima leggibilità

  Scenario: Mantenimento Modalità Notte OLED
    Given l'utente seleziona il tema "night" (Notte)
    When l'attributo data-theme="night" viene applicato all'HTML
    Then lo sfondo passa a #090D16 con superfici #131C2E
    And la struttura ed il template HTML dell'app rimangono 100% identici alla versione Giorno
```

---

## Feature 6: Diario di Bordo Serale & Note Daily

```gherkin
Feature: Diario di Bordo Serale
  Come utente a fine giornata
  Voglio valutare la giornata (1-5 stelle), salvare il momento highlight ed inserire le note serali
  Per conservare un ricordo vivido delle esperienze vissute giorno per giorno

  Scenario: Inserimento e salvataggio del diario di bordo serale
    Given l'utente si trova nel Tab OGGI o ITINERARIO per il Giorno corrente
    When seleziona una valutazione (es. 5 stelle), inserisce l'highlight "Tramonto a Fushimi Inari" e le note "Cena fantastica a Gion"
    Then i dati del diario vengono salvati in IndexedDB nella store "journals"
    And l'interfaccia si aggiorna mostrando il rating e i ricordi salvati
```

---

## Feature 9: Copia Diario in Formato Testo (Markdown Exporter)

```gherkin
Feature: Copia Diario in Formato Testo
  Come utente
  Voglio copiare l'intero diario di viaggio o le singole giornate in formato Markdown / Testo negli appunti
  Per poter incollare i miei ricordi su WhatsApp, Telegram, Notion o Apple Notes

  Scenario: Copia dell'intero diario di viaggio negli appunti
    Given l'utente si trova nel Tab ITINERARIO
    When tocca il pulsante "📋 Copia Diario (Testo)"
    Then viene generato il testo completo in formato Markdown contenente itinerario, rating, highlight, note serali e log
    And il testo viene copiato negli appunti tramite navigator.clipboard o fallback execCommand
    And viene mostrato un messaggio di conferma "Diario copiato negli appunti! 📋"

---

## Feature 10: Check-in Foursquare Offline & GeoJSON Map Export

```gherkin
Feature: Check-in Offline con Foto Compresse e Timestamp Matching
  Come utente in viaggio offline
  Voglio effettuare check-in geolocalizzati, allegare foto compresse e fare match automatico con i timestamp
  Per poter esportare la mappa del mio viaggio in formato GeoJSON, KML o Markdown

  Scenario: Check-in offline con foto compressa in IndexedDB
    Given l'utente si trova offline ed esplora una scheda di un luogo (es. "Fushimi Inari")
    When tocca il pulsante "📍 Check-in Ora" e seleziona una foto dalla galleria
    Then la foto viene compressa via HTML Canvas a dimensione massima 1200px e qualità JPEG 0.7 (~100KB)
    And il Blob della foto compressa viene salvato nello store IndexedDB "checkin_photos"
    And il record di check-in viene salvato nello store IndexedDB "checkins" con coordinate GPS e timestamp
    And la UI della scheda mostra il badge "📍 Visitato" ed il thumbnail della foto allegata

  Scenario: Match automatico foto da timestamp EXIF
    Given un check-in salvato alle ore 14:30 del "2026-07-23"
    When l'utente apre il pannello "Match Foto Galleria" e carica una serie di foto scattate durante la giornata
    Then l'app analizza i metadata EXIF DateTimeOriginal di ciascuna foto
    And associa automaticamente le foto scattate nella finestra temporale ±30 minuti (es. 14:15 - 14:45) al check-in di Fushimi Inari
    And aggiorna i photoIds nel record di check-in in IndexedDB

  Scenario: Esportazione delle tappe in formato GeoJSON / KML / Markdown
    Given l'utente ha salvato diversi check-in geolocalizzati durante il viaggio
    When apre il menu di esportazione e seleziona "🗺️ Esporta GeoJSON"
    Then viene generato e scaricato un file FeatureCollection GeoJSON con le coordinate e le note delle tappe
    When seleziona "📋 Esporta Markdown con Foto"
    Then viene generato un documento Markdown contenente le note, i dati di check-in ed i thumbnail in Data URI base64
```

---

## Feature 11: Sincronizzazione Offline-First dei Check-in verso GiPSigo

```gherkin
Feature: Sincronizzazione Offline-First dei Check-in verso GiPSigo
  Come utente in viaggio
  Voglio che i miei check-in salvati offline vengano sincronizzati verso il server GiPSigo
  Per mantenere aggiornato il tracciamento del mio itinerario anche in mobilità senza rischiare di perdere dati

  Scenario: Configurazione dinamica delle credenziali GiPSigo
    Given l'utente si trova nella schermata delle impostazioni di sincronizzazione
    When inserisce l'API Key (es. "gips_live_abc123") e il Trip Token (es. "trip_kr_jp_2026")
    And tocca il pulsante "Salva Credenziali GiPSigo"
    Then le credenziali vengono salvate nello store IndexedDB locale "config"
    And l'interfaccia mostra lo stato "GiPSigo Configurato" ed il pulsante per testare la connessione

  Scenario: Registrazione check-in in modalità offline-first
    Given l'utente effettua un check-in in una tappa (es. "N Seoul Tower")
    When tocca il pulsante "📍 Check-in Ora"
    Then il check-in viene salvato SEMPRE prima nello store IndexedDB locale "checkins"
    And la voce viene contrassegnata con il flag syncedToGiPSigo: false
    And il check-in entra nella coda di sincronizzazione pendente
    And l'indicatore di sync aggiorna il conteggio dei check-in pendenti

  Scenario: Sincronizzazione automatica al ripristino della connessione internet
    Given l'utente ha uno o più check-in salvati con syncedToGiPSigo: false in IndexedDB
    And viene rilevato il ripristino della connessione internet (evento online)
    When il servizio di sincronizzazione in background viene attivato
    Then l'app invia gli elementi pendenti in batch (fino a un massimo di 500 elementi per richiesta) tramite POST JSON a "external_checkin.php"
    And include le credenziali API Key e Trip Token memorizzate
    And alla conferma con esito positivo dal server
    Then ciascun record in IndexedDB viene aggiornato impostando syncedToGiPSigo: true ed il timestamp syncedAt corrente

  Scenario: Sincronizzazione manuale dal pulsante Sync GiPSigo
    Given l'utente visualizza il pulsante "Sync GiPSigo" recante l'indicatore dei check-in pendenti (es. "(3)")
    When l'utente tocca il pulsante "Sync GiPSigo"
    Then l'app avvia la trasmissione in batch (max 500) dei check-in non ancora sincronizzati (syncedToGiPSigo: false) a "external_checkin.php"
    And mostra uno spinner di caricamento durante l'operazione
    And aggiorna i record in IndexedDB impostando syncedToGiPSigo: true e syncedAt al termine con esito positivo
    And azzera l'indicatore dei check-in pendenti sul pulsante
```



