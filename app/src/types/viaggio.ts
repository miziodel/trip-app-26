export interface Meta {
  titolo: string;
  versione: string;
  passeggeri: string[];
  tassi_cambio: {
    JPY_EUR: number;
    KRW_EUR: number;
  };
}

export interface Alloggio {
  id: string;
  citta: string;
  nome: string;
  indirizzo_en: string;
  indirizzo_locale: string;
  check_in: string;
  check_out: string;
  notti: number;
  stazione: string;
  stato_pagamento: string;
  note: string;
}

export interface Volo {
  id: string;
  data: string;
  tratta: string;
  orario: string;
  durata: string;
  compagnia: string;
  pnr: string;
  stato: string;
  note?: string;
}

export interface TrenoBus {
  id: string;
  data: string;
  tratta: string;
  mezzo: string;
  orario: string;
  pnr: string;
  posti: string;
  codice_ritiro?: string;
  note: string;
}

export interface Trasporti {
  voli: Volo[];
  treni_e_bus: TrenoBus[];
}

export interface Assicurazione {
  compagnia: string;
  polizza: string;
  telefono_h24: string;
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

export interface TabellaOraria {
  ora: string;
  attivita: string;
  dettagli: string;
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
  fase: string;
  titolo: string;
  focus_culinario: string;
  tabella_oraria: TabellaOraria[];
  todo_list: Todo[];
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

export interface Frase {
  categoria: string;
  it: string;
  jp: string;
  pronuncia: string;
  kr: string;
  kr_pronuncia: string;
}

export interface ViaggioData {
  meta: Meta;
  alloggi: Alloggio[];
  trasporti: Trasporti;
  emergenze: Emergenze;
  itinerario: GiornoItinerario[];
  protocolli: Protocolli;
  frasario: Frase[];
}

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
