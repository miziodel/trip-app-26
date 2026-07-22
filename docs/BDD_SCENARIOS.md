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

  Scenario: Auto-espansione della card dell'ora attuale
    Given la data corrente è compresa nell'intervallo del viaggio
    When l'utente apre il Tab OGGI
    Then l'app seleziona automaticamente il giorno corrente
    And la ScheduleCard più vicina all'ora attuale si espande automaticamente mostrando le azioni

  Scenario: Apertura mappa locale per un punto d'interesse in Giappone
    Given l'utente visualizza una ScheduleCard per una tappa a Tokyo
    When tocca il pulsante "📍 Apri Mappa"
    Then viene aperto un link esterno a Google Maps per quella voce

  Scenario: Apertura mappa Naver per una tappa a Seoul
    Given l'utente visualizza una ScheduleCard per una tappa a Seoul
    When tocca il pulsante "📍 Apri Mappa"
    Then viene aperto un link esterno a Naver Map (map.naver.com) per quella voce
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

## Feature 6: Reset Database

```gherkin
Feature: Ripristino dello Stato Iniziale
  Come utente
  Voglio poter cancellare tutti i dati locali per ricaricare un nuovo database
  Per ripartire da zero in sicurezza

  Scenario: Conferma di reset nell'area Emergenze
    Given l'utente si trova nel Tab EMERGENZE
    When tocca il pulsante "🗑️ Reimposta App (Cancella IndexedDB)"
    Then appare un box di conferma con avviso rosso
    When tocca "Sì, Elimina Tutto"
    Then IndexedDB viene completamente svuotato
    And l'app ritorna alla WelcomeScreen iniziale
```
