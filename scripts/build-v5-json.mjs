import fs from 'fs';
import path from 'path';

const v4Path = path.resolve(process.cwd(), 'viaggio-2026-v4.json');
const targetPath = path.resolve(process.cwd(), 'viaggio-2026-v5.json');

const raw = fs.readFileSync(v4Path, 'utf8');
const data = JSON.parse(raw);

// Update Meta Version & Passengers e-tickets
data.meta.versione = "5.0-v5";
data.meta.passeggeri = [
  {
    nome: "Maurizio Delmonte",
    documento: "PASSPORT_MAURIZIO",
    eticket_air_china: "9992985792237-238",
    eticket_ana: "2052985792255"
  },
  {
    nome: "Paola Cennerelli",
    documento: "PASSPORT_PAOLA",
    eticket_air_china: "9992985792239-240",
    eticket_ana: "2052985792254"
  }
];

// Update Voli - sync durate and e-tickets/luggage
data.trasporti.voli = data.trasporti.voli.map(v => {
  if (v.id === 'V1') {
    return {
      ...v,
      durata: "10h 15m",
      note: "Boeing 777-300. Franchigia: Mano 1x 5kg, Stiva 2x 23kg a testa."
    };
  }
  if (v.id === 'V2') {
    return {
      ...v,
      durata: "1h 55m",
      note: "Airbus A321. Transito PEK: 6h 05m."
    };
  }
  if (v.id === 'V5') {
    return {
      ...v,
      durata: "2h 15m",
      note: "Boeing 767. Pasto caldo incluso a bordo. Franchigia: Mano 1x 10kg, Stiva 2x 23kg."
    };
  }
  if (v.id === 'V3') {
    return {
      ...v,
      durata: "3h 20m",
      note: "Airbus A321. Transito PEK T3-E."
    };
  }
  if (v.id === 'V4') {
    return {
      ...v,
      durata: "11h 10m",
      note: "Boeing 777-300. Transito PEK: 1h 55m (Connessione Stretta) - Zero Power Bank nei bagagli."
    };
  }
  return v;
});

// Update Bus tratte durations and confirmations
data.trasporti.bus = data.trasporti.bus.map(b => {
  if (b.id === 'B1') {
    return { ...b, durata: "2h 15m", codice_prenotazione: "07122010861" };
  }
  if (b.id === 'B2') {
    return { ...b, durata: "1h 21m", codice_prenotazione: "116572765" };
  }
  if (b.id === 'B3') {
    return { ...b, durata: "4h 31m", codice_prenotazione: "07162002992" };
  }
  return b;
});

fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ File viaggio-2026-v5.json creato con successo a partire dalla v9.md!`);
