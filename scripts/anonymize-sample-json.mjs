import fs from 'fs';
import path from 'path';

const v2Path = path.resolve(process.cwd(), 'viaggio-2026-v2.json');
const samplePath = path.resolve(process.cwd(), 'viaggio-sample.json');
const appSamplePath = path.resolve(process.cwd(), 'app/src/data/viaggio-sample.json');

const raw = fs.readFileSync(v2Path, 'utf8');
const data = JSON.parse(raw);

// 1. Anonimizza Meta
data.meta.titolo = "Viaggio Demo Giappone & Corea 2026";
data.meta.versione = "4.0-sample";
data.meta.passeggeri = ["Mario Rossi", "Laura Bianchi"];

// 2. Anonimizza Alloggi (mantieni nomi generici ma reali per le città)
data.alloggi = data.alloggi.map(h => ({
  ...h,
  nome: `Demo Hotel ${h.citta}`,
  nome_locale: `デモホテル ${h.citta}`,
  indirizzo_en: `1-1-1 Demo Street, ${h.citta}`,
  indirizzo_locale: `${h.citta} デモ 1-1-1`,
  stato_pagamento: "Pagato"
}));

// 3. Anonimizza Voli (PNR fittizio, mantieni compagnie/tratte per la demo)
data.trasporti.voli = data.trasporti.voli.map(v => ({
  ...v,
  pnr: "SAMPLE_PNR"
}));

// 4. Anonimizza Treni e Bus (PNR e codice ritiro fittizi)
data.trasporti.treni = data.trasporti.treni.map(t => ({
  ...t,
  pnr: t.pnr ? "SAMPLE_TRN" : undefined,
  codice_ritiro: t.codice_ritiro ? "00000000000000000" : undefined
}));

data.trasporti.bus = data.trasporti.bus.map(b => ({
  ...b,
  codice: b.codice ? "SAMPLE_BUS" : undefined
}));

// 5. Anonimizza Biglietti
data.biglietti = data.biglietti.map(b => ({
  ...b,
  codice: "DEMO-TICKET-0000"
}));

// 6. Anonimizza Emergenze
data.emergenze = {
  assicurazione: {
    compagnia: "Assicurazione Demo H24",
    polizza: "000000000",
    telefono_h24: "+39 00 0000 0000"
  },
  corea: {
    polizia: "112",
    ambulanza: "119",
    hotline_turismo: "1330",
    ambasciata: "+82 0 0000 0000"
  },
  giappone: {
    polizia: "110",
    ambulanza: "119",
    hotline_jnto: "050-0000-0000",
    ambasciata_tokyo: "+81 0 0000 0000",
    consolato_osaka: "+81 0 0000 0000"
  }
};

// MANTIENI L'INTERO ITINERARIO DI TUTTI E 24 I GIORNI!
const jsonStr = JSON.stringify(data, null, 2);
fs.writeFileSync(samplePath, jsonStr, 'utf8');
fs.writeFileSync(appSamplePath, jsonStr, 'utf8');

console.log(`✅ viaggio-sample.json rigenerato con TUTTI i ${data.itinerario.length} giorni dell'itinerario e dati sensibili anonimizzati!`);
