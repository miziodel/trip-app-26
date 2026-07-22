# Architectural Decision Records (ADR)

Indice delle decisioni architetturali del progetto **Viaggio Corea & Giappone 2026**.

---

## 📄 ADR-0001: Architettura di Privacy Zero-Cloud

- **Stato**: Approvato
- **Data**: 2026-07-21
- **Contesto**: L'applicazione gestisce dati riservati e personali (PNR dei voli, numeri di polizza sanitaria, indirizzi e contatti di emergenza). L'invio di tali dati su server cloud terzi o backend remoti comporterebbe rischi di privacy e dipendenza da rete durante il viaggio.
- **Decisione**: Non utilizzare alcun database cloud o API backend. Tutta la struttura dati risiede esclusivamente nel file JSON caricato dall'utente e memorizzato nel browser del dispositivo locale.
- **Conseguenze**:
  - Positivo: 100% privacy dei dati personali.
  - Positivo: Funzionamento garantito in assenza di connessione internet.
  - Negativo: La sincronizzazione tra dispositivi diversi non è automatica (richiede export/import manuale del JSON).

---

## 📄 ADR-0002: Persistenza su IndexedDB via libreria `idb`

- **Stato**: Approvato
- **Data**: 2026-07-21
- **Contesto**: `localStorage` ha un limite stringente di ~5MB, API sincrona bloccante per il main thread e rischia di essere svuotato da iOS Safari se lo spazio del dispositivo scarseggia.
- **Decisione**: Utilizzare **IndexedDB** gestito tramite il wrapper Promise-based `idb` in accoppiata con la chiamata `navigator.storage.persist()`.
- **Conseguenze**:
  - Positivo: Nessun limite pratico di spazio storage per note e log.
  - Positivo: Operazioni I/O asincrone che non bloccano l'interfaccia UI a 60fps.
  - Positivo: La richiesta di persistenza protegge i dati dalle pulizie automatiche di Safari/Chrome.

---

## 📄 ADR-0003: PWA Cache-First con Service Worker

- **Stato**: Approvato
- **Data**: 2026-07-21
- **Contesto**: Durante gli spostamenti in treno o nelle zone montane delle Alpi Giapponesi, la connessione dati potrebbe essere assente.
- **Decisione**: Configurare `vite-plugin-pwa` con Workbox per generare un Service Worker con strategia **Cache-First** per tutti gli asset statici (HTML, JS, CSS, icone, font).
- **Conseguenze**:
  - Positivo: L'applicazione si carica istantaneamente anche in modalità aereo.
  - Positivo: Installabile come app standalone su iOS Safari (Add to Home Screen) e Android Chrome.

---

## 📄 ADR-0004: Pattern `ScheduleCard` con Auto-Espansione Oraria

- **Stato**: Approvato
- **Data**: 2026-07-21
- **Contesto**: Nella versione iniziale, la tab OGGI mostrava una "Hero Card" superiore statica con solo il primo slot del giorno. Questo richiedeva troppi passaggi per accedere ai link mappa o dettagli degli slot successivi.
- **Decisione**: Rimuovere la Hero Card duplicata ed introdurre il componente riutilizzabile `ScheduleCard`. Ogni slot del programma è una card espandibile inline (slide-down) con link al click a Naver/Google Maps, Tabelog e codici ticket. La card dell'orario più vicino all'ora corrente si espande **automaticamente**.
- **Conseguenze**:
  - Positivo: Accesso istantaneo con una sola mano alle azioni rilevanti per l'ora attuale.
  - Positivo: Codice unificato e riutilizzato tra Tab OGGI e Tab ITINERARIO.
