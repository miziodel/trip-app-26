# PROMPT: Conversione Database Viaggio (MD -> JSON 4.0)

Usa questo prompt con un LLM avanzato (es. Claude 3.5 Sonnet o GPT-4o) per convertire il tuo file privato `database-app-viaggio-2026-v4.md` nel file `viaggio-real.json` pronto per l'app.

---

### 📋 ISTRUZIONI DA INCOLLARE AL LLM:

```text
Sei un estrattore ed analista dati esperto. Converti il seguente documento Markdown di itinerario di viaggio in un file JSON strutturato rispettando RIGOROSAMENTE lo schema specificato sotto.

### REGOLE DI TRASFORMAZIONE CHIAVE:

1. MAPPE & LOCALIZZAZIONE:
   - Se la città/paese è in Corea del Sud ("Seoul", "KR"): imposta "paese": "KR" e "maps_provider": "naver".
   - Se la città/paese è in Giappone ("Tokyo", "Kyoto", "Kanazawa", "Takayama", "Gujo", "Osaka", "Nara", "JP"): imposta "paese": "JP" e "maps_provider": "google".

2. TABELLA ORARIA & TIPI ATTIVITÀ ("tipo"):
   Per ogni voce della tabella oraria, assegna obbligatoriamente un campo "tipo" tra questi valori:
   - "trasporto": treni, bus, voli, spostamenti metro/taxi
   - "alloggio": check-in, check-out, arrivo in hotel, deposito bagagli
   - "pasto": colazione, pranzo, cena, assaggi mercato, izakaya
   - "attivita": visite a templi, musei, quartieri, shopping, parchi
   - "festival": matsuri, Bon Odori, danze tradizionali
   - "compito": task critici (es. prelievo contanti 7-Eleven, ritiro biglietti JR, spedizione bagagli Yamato)
   - "info": avvisi operativi, opzioni stanchezza, note di riposo

3. NOMI LOCALI & TAXI CARD:
   - Estrai sempre il nome e l'indirizzo originale in lingua locale (Giapponese / Coreano) dove presente nel testo, inserendolo in "luogo_nome_locale" e "indirizzo_locale". 
   - Esempio: per Wecostay Insadong -> "luogo_nome_locale": "위코스테이 인사동", "indirizzo_locale": "서울특별시 종로구 수표로18길 5".
   - Esempio per Maison Jeunesse -> "luogo_nome_locale": "メゾンジュネス", "indirizzo_locale": "東京都新宿区北新宿1丁目6-6".

4. TRASPORTI ATOMICI:
   - Separa gli orari di partenza e arrivo (es. "20:30" e "12:45").
   - Se un volo o treno arriva il giorno dopo, imposta "giorno_arrivo_offset": 1.
   - Separa la lista di posti in un array di stringhe (es. ["5-A", "5-B"]).
   - Crea tre sezioni distinte: "voli": [], "treni": [], "bus": [].

5. SEZIONE BIGLIETTI:
   - Estrai tutti i biglietti con codice di prenotazione (es. teamLab, Mori Art Museum, 21st Century Museum) e inseriscili nella lista "biglietti": [].

---

### SCHEMA JSON ATTESO (TEMPLATE TYPESCRIPT):

```json
{
  "meta": {
    "titolo": "Viaggio Giappone & Corea 2026",
    "versione": "4.0-real",
    "passeggeri": ["Maurizio", "Paola"],
    "tassi_cambio": { "JPY_EUR": 0.0060, "KRW_EUR": 0.00068 }
  },
  "alloggi": [
    {
      "id": "H1",
      "citta": "Seoul",
      "paese": "KR",
      "nome": "Wecostay Insadong",
      "nome_locale": "위코스테이 인사동",
      "indirizzo_en": "5, Supyo-Ro 18-Gil, Jongno-Gu",
      "indirizzo_locale": "서울특별시 종로구 수표로18길 5",
      "latitudine": 37.5704,
      "longitudine": 126.9922,
      "check_in": "2026-07-28",
      "check_out": "2026-08-01",
      "notti": 4,
      "stazione": "Jongno 3-ga (L1, L3, L5)",
      "linee_metro": ["L1", "L3", "L5"],
      "stato_pagamento": "Pagato",
      "features": ["Lavatrice in camera", "No colazione"],
      "note": "Check-in con codice di accesso fornito."
    }
  ],
  "trasporti": {
    "voli": [],
    "treni": [],
    "bus": []
  },
  "biglietti": [],
  "emergenze": {
    "assicurazione": { "compagnia": "", "polizza": "", "telefono_h24": "" },
    "corea": { "polizia": "112", "ambulanza": "119", "hotline_turismo": "1330", "ambasciata": "+82 2 750 0200" },
    "giappone": { "polizia": "110", "ambulanza": "119", "hotline_jnto": "050-3816-2720", "ambasciata_tokyo": "+81 3 3453 5291", "consolato_osaka": "+81 90 3350 1561" }
  },
  "itinerario": [
    {
      "giorno": 0,
      "data": "2026-07-28",
      "citta": "Seoul",
      "paese": "KR",
      "fase": "🇰🇷 Seoul",
      "titolo": "Atterraggio e Benvenuti a Seoul",
      "focus": "",
      "vibe": "Notturna, relax",
      "intensita": "bassa",
      "focus_culinario": "",
      "alloggio_id": "H1",
      "tabella_oraria": [
        {
          "ora": "21:45",
          "ora_fine": "22:30",
          "tipo": "trasporto",
          "attivita": "Atterraggio a Incheon (ICN)",
          "dettagli": "Immigrazione e ritiro bagagli",
          "luogo_nome_locale": "인천국제공항",
          "maps_provider": "naver"
        }
      ],
      "todo_list": [
        { "id": "td1", "testo": "Scaricare Naver Map", "fatto": true }
      ]
    }
  ],
  "protocolli": {},
  "frasario": []
}
```

Ora converti l'intero contenuto del file Markdown fornito di seguito producendo esclusivamente il codice JSON valido senza testo aggiuntivo:

[INCOLLA QUI IL CONTENUTO DI DATABASE-APP-VIAGGIO-2026-V4.MD]
```
