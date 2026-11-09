# Caso: 25 giorni di viaggio, pianificati e vissuti con un'app

Misura 2026-11-09 · `jappo-26` @ `bee8e17` + `trip-app-26` @ `1597bb0`

## Il problema

25 giorni fra Corea e Giappone: 6 alloggi, 24 giornate di programma, biglietti, frasario, numeri di
emergenza. Sparso su documenti, il dettaglio si perde. In aereo o in montagna la rete non c'è.

## Perché conta nel mio percorso

Questo caso mostra cosa rendono possibile questi strumenti, e insieme il loro limite. La pianificazione,
fatta a mano, avrebbe perso pezzi: con gli LLM è rimasta organica e i dettagli sono rimasti tutti. Poi 30
documenti sono diventati un markdown, e il markdown un'app in poco tempo. Ed è qui che arriva la parte
difficile, che sto ancora imparando: se costruire costa poco, la domanda smette di essere «ci riesco» e
diventa «cosa vale la pena». Gli strumenti tolgono il costo di fare. Il costo di dare priorità resta
intero.

## Come è andata

1. Pianificazione con gli LLM: 30 documenti in locale, 4.008 righe. Buona parte del materiale vive su
   Drive, quindi il conteggio locale è parziale.
2. NotebookLM li consolida in un markdown unico di 635 righe.
3. Dal markdown a un JSON di dati: 24 giornate, 6 alloggi, 30 espressioni, 3 biglietti.
4. L'app: React, 7.410 righe, 23 componenti, 10 file di test con 70 casi, 32 commit. I check-in si
   esportano in JSON, GeoJSON, KML e Markdown.

## I tre numeri

| | Prima | Dopo | Fonte |
|---|---|---|---|
| Pianificazione | 30 documenti locali, 4.008 righe | 1 markdown di 635 righe; un JSON con 24 giornate e 6 alloggi | `find ~/Progetti/jappo-26 -name '*.md'`; `database-app-viaggio-2026-v9.md`; `viaggio-2026-v5.json` |
| Uso in viaggio | il programma su documenti | 25 giorni e 23 notti su un telefono, senza mai bisogno della rete (dichiarato) | dichiarazione di Maurizio del 9/11 |
| Codice | 0 | 7.410 righe, 23 componenti, 70 casi di test, 4 formati di export | `find src`; `find app/tests`; `utils/exportUtils.ts` |

## Cosa non ha funzionato

In viaggio niente. Il debito è dopo: i check-in restano in IndexedDB, l'app li sa esportare in quattro
formati, ma per leggerli serve un'app che non ho ancora fatto. La ragione per cui non l'ho fatta è la
lezione del caso: era facile, non era la cosa da fare prima.

Su `jappo-26`: buona parte dei file sta su Drive, quindi i 60 non committati dicono poco del lavoro
fatto. Git, lì, non è il registro del progetto.

## La domanda del cliente (ipotetica)

«Ho un lavoro complesso da organizzare e poi da usare sul campo. Questi strumenti mi fanno risparmiare
tempo, ma come decido cosa costruire e cosa lasciare indietro?»
