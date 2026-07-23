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

## Feature 8: Apertura Intelligente dell'Itinerario

```gherkin
Feature: Compressione Automatica dell'Itinerario Completo
  Come utente che naviga l'Itinerario Completo
  Voglio vedere aperto di default soltanto il giorno e l'orario del momento attuale
  Per non essere sopraffatto da decine di schede aperte contemporaneamente

  Scenario: Interazione con l'accordion del giorno e navigazione condizionale
    Given l'utente si trova nel Tab ITINERARIO
    When tocca qualsiasi punto dell'intestazione della card del giorno
    Then l'accordion del giorno si espande o si comprime rimanendo all'interno della vista ITINERARIO
    When l'utente tocca specificamente il pulsante CTA "Apri in Oggi ➔"
    Then l'applicazione naviga al Tab OGGI mostrando i dettagli del giorno selezionato
```

