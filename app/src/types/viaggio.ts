// ─────────────────────────────────────────────
// Primitive enums / union types
// ─────────────────────────────────────────────

export type Paese = 'KR' | 'JP' | 'IT' | 'CN';
export type MapsProvider = 'naver' | 'google' | 'auto';
export type IntensitaGiorno =
  | 'bassa'
  | 'media'
  | 'alta'
  | 'media-alta'
  | 'bassa-media';

export type TipoAttivita =
  | 'trasporto'  // treno, bus, volo, metro, taxi
  | 'attivita'   // visita, museo, passeggiata
  | 'pasto'      // colazione, pranzo, cena, street food
  | 'alloggio'   // check-in, check-out
  | 'festival'   // matsuri, eventi speciali
  | 'compito'    // task critico (prelievo, ritiro biglietti, ecc.)
  | 'info';      // note operative, avvisi

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────

export interface Meta {
  titolo: string;
  versione: string;
  passeggeri: string[];
  tassi_cambio: {
    JPY_EUR: number;
    KRW_EUR: number;
  };
}

// ─────────────────────────────────────────────
// Alloggi
// ─────────────────────────────────────────────

export interface Alloggio {
  id: string;
  citta: string;
  paese: Paese;
  nome: string;
  nome_locale?: string;
  indirizzo_en: string;
  indirizzo_locale: string;
  /** Coordinate per Open-Meteo weather API */
  latitudine?: number;
  longitudine?: number;
  check_in: string;   // ISO date: "2026-07-28"
  check_out: string;  // ISO date: "2026-08-01"
  notti: number;
  stazione: string;
  linee_metro?: string[];     // es. ["L1", "L3", "L5"]
  stato_pagamento: string;
  features?: string[];        // es. ["Lavatrice in camera", "Colazione inclusa"]
  note?: string;
}

// ─────────────────────────────────────────────
// Trasporti
// ─────────────────────────────────────────────

export interface Volo {
  id: string;
  data: string;                   // ISO date
  aeroporto_partenza: string;     // IATA: "FCO"
  aeroporto_arrivo: string;       // IATA: "PEK"
  citta_partenza: string;
  citta_arrivo: string;
  ora_partenza: string;           // "20:30"
  ora_arrivo: string;             // "12:45"
  giorno_arrivo_offset?: number;  // 0 = stesso giorno, 1 = giorno dopo
  durata: string;                 // "10h 15m"
  compagnia: string;
  numero_volo: string;            // "CA 940"
  pnr: string;
  stato: string;
  layover?: string;               // "6h 05m a PEK"
  attenzione?: string;            // avviso critico, es. "Aeroporto Gimpo (GMP)!"
  note?: string;
}

export interface Treno {
  id: string;
  data: string;
  stazione_partenza: string;
  stazione_arrivo: string;
  citta_partenza?: string;
  citta_arrivo?: string;
  ora_partenza: string;
  ora_arrivo: string;
  durata?: string;
  mezzo: string;          // "Shinkansen Kagayaki 527"
  pnr?: string;
  carrozza?: string;
  posti?: string[];       // ["5-A", "5-B"]
  codice_ritiro?: string;
  note?: string;
}

export interface Bus {
  id: string;
  data: string;
  stazione_partenza: string;
  stazione_arrivo: string;
  citta_partenza: string;
  citta_arrivo: string;
  ora_partenza: string;
  ora_arrivo: string;
  vettore: string;
  codice?: string;
  bus_id?: string;
  carrozza?: string;
  posti?: string[];
  note?: string;
  pickup_privato?: boolean; // es. accoglienza privata da Jeenie a Gujo
}

export interface Trasporti {
  voli: Volo[];
  treni: Treno[];
  bus: Bus[];
}

// ─────────────────────────────────────────────
// Itinerario
// ─────────────────────────────────────────────

export interface ItemOrario {
  ora: string;            // "09:30"
  ora_fine?: string;      // "12:30" — per intervalli
  tipo: TipoAttivita;
  attivita: string;
  dettagli?: string;
  luogo_nome?: string;          // nome in inglese del luogo
  luogo_nome_locale?: string;   // nome in giapponese/coreano — per TaxiCard
  indirizzo_locale?: string;    // indirizzo completo per taxista
  costo_stimato?: string;       // "¥1.400/pp"
  prenotazione?: {
    codice: string;
    note?: string;
  };
  maps_provider?: MapsProvider;
  maps_query?: string;          // query o stringa indirizzo per il link mappe
  tabelog_url?: string;
}

export interface Todo {
  id?: string;
  testo: string;
  fatto: boolean;
}

export interface GiornoItinerario {
  giorno: number;
  data: string;
  citta: string;
  paese: Paese;
  fase: string;
  titolo: string;
  focus?: string;             // breve descrizione della giornata
  vibe?: string;              // atmosfera (es. "Notturna, relax")
  intensita?: IntensitaGiorno;
  focus_culinario?: string;
  alloggio_id?: string;       // riferimento all'ID alloggio della notte
  trasporto_id?: string;      // ID volo/treno/bus principale del giorno
  tabella_oraria: ItemOrario[];
  todo_list: Todo[];
}

// ─────────────────────────────────────────────
// Biglietti & prenotazioni
// ─────────────────────────────────────────────

export interface Biglietto {
  id: string;
  giorno: number;
  data: string;
  nome: string;
  nome_locale?: string;
  codice: string;
  ora_ingresso?: string;
  note?: string;
}

// ─────────────────────────────────────────────
// Emergenze
// ─────────────────────────────────────────────

export interface Assicurazione {
  compagnia: string;
  polizza: string;
  telefono_h24: string;
  sito_web?: string;
}

export interface EmergenzeCitta {
  polizia: string;
  ambulanza: string;
  hotline_turismo?: string;
  hotline_jnto?: string;
  ambasciata?: string;
  ambasciata_tokyo?: string;
  consolato_osaka?: string;
  centralino_ambasciata?: string;
}

export interface Emergenze {
  assicurazione: Assicurazione;
  corea: EmergenzeCitta;
  giappone: EmergenzeCitta;
}

// ─────────────────────────────────────────────
// Frasario & Protocolli
// ─────────────────────────────────────────────

export interface Frase {
  categoria: string;
  it: string;
  jp: string;
  pronuncia: string;
  kr?: string;
  kr_pronuncia?: string;
}

export interface Protocollo {
  titolo: string;
  regole?: string[];
  passaggi?: string[];
  istruzioni?: string[];
  consigli?: string[];
}

export interface Protocolli {
  [key: string]: Protocollo;
}

// ─────────────────────────────────────────────
// Root document
// ─────────────────────────────────────────────

export interface ViaggioData {
  meta: Meta;
  alloggi: Alloggio[];
  trasporti: Trasporti;
  itinerario: GiornoItinerario[];
  biglietti?: Biglietto[];
  emergenze: Emergenze;
  frasario: Frase[];
  protocolli: Protocolli;
}

// ─────────────────────────────────────────────
// Weather (Open-Meteo, not stored in ViaggioData)
// ─────────────────────────────────────────────

export interface WeatherData {
  citta: string;
  temperatura: number;       // °C
  temperatura_max?: number;
  temperatura_min?: number;
  descrizione: string;       // "Soleggiato", "Nuvoloso", ecc.
  icona: string;             // emoji
  umidita?: number;          // %
  precipitazioni?: number;   // mm
  aggiornato_at: number;     // timestamp epoch ms
}

// ─────────────────────────────────────────────
// IndexedDB / App state helpers
// ─────────────────────────────────────────────

export interface DayLog {
  giorno: number;
  reazione?: string;
  nota?: string;
  timestamp: number;
}

export interface TravelLog {
  reaction?: string;
  note?: string;
  updatedAt?: number;
}
