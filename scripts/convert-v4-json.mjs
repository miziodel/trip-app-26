import fs from 'fs';
import path from 'path';

const sourcePath = path.resolve(process.cwd(), 'viaggio-2026.json');
const targetPath = path.resolve(process.cwd(), 'viaggio-2026-v2.json');

const raw = fs.readFileSync(sourcePath, 'utf8');
const data = JSON.parse(raw);

// Coordinates map for Open-Meteo
const CITY_COORDS = {
  seoul: { lat: 37.5665, lon: 126.9780 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  kanazawa: { lat: 36.5613, lon: 136.6562 },
  takayama: { lat: 36.1408, lon: 137.2513 },
  gujo: { lat: 35.7486, lon: 136.9544 },
  osaka: { lat: 34.6937, lon: 135.5023 },
  nara: { lat: 34.6851, lon: 135.8048 }
};

// Helper for type classification
function inferTipoAttivita(attivita, dettagli) {
  const text = (attivita + ' ' + (dettagli || '')).toLowerCase();
  if (text.includes('volo') || text.includes('shinkansen') || text.includes('bus') || text.includes('metro') || text.includes('taxi') || text.includes('spostamento') || text.includes('trasferimento') || text.includes('atterraggio') || text.includes('sbarco') || text.includes('treno')) {
    return 'trasporto';
  }
  if (text.includes('hotel') || text.includes('check-in') || text.includes('check-out') || text.includes('deposito bagagli') || text.includes('sistemazione')) {
    return 'alloggio';
  }
  if (text.includes('pranzo') || text.includes('cena') || text.includes('colazione') || text.includes('ristorante') || text.includes('food') || text.includes('bbq') || text.includes('ramen') || text.includes('udon') || text.includes('bento') || text.includes('mercato') || text.includes('tabelog')) {
    return 'pasto';
  }
  if (text.includes('matsuri') || text.includes('bon odori') || text.includes(' festival') || text.includes('danze') || text.includes('notte bianca')) {
    return 'festival';
  }
  if (text.includes('compito') || text.includes('ritiro') || text.includes('prelievo') || text.includes('t-money') || text.includes('suica') || text.includes('spedizione bagagli') || text.includes('catchtable')) {
    return 'compito';
  }
  if (text.includes('opzione') || text.includes('avviso') || text.includes('attenzione') || text.includes('recupero') || text.includes('skip')) {
    return 'info';
  }
  return 'attivita';
}

// 1. Meta
data.meta.versione = '4.0-v2';

// 2. Alloggi
data.alloggi = data.alloggi.map(h => {
  const cityKey = h.citta.toLowerCase();
  const isKR = cityKey.includes('seoul') || cityKey.includes('busan');
  const coords = CITY_COORDS[cityKey] || { lat: 35.6762, lon: 139.6503 };

  return {
    ...h,
    paese: isKR ? 'KR' : 'JP',
    latitudine: coords.lat,
    longitudine: coords.lon,
    linee_metro: h.stazione.includes('(') ? h.stazione.match(/\(([^)]+)\)/)?.[1].split(/,|\//).map(s => s.trim()) : undefined,
    features: h.note ? h.note.split(',').map(s => s.trim()) : []
  };
});

// 3. Trasporti (split flights & treni/bus)
const rawVoli = data.trasporti?.voli || [];
const rawTreniBus = data.trasporti?.treni_e_bus || [];

const newVoli = rawVoli.map(v => {
  const parts = v.tratta.split('->').map(s => s.trim());
  const times = v.orario.split('->').map(s => s.trim());
  const hasNextDay = times[1]?.includes('(+1)');
  const cleanTime1 = times[1]?.replace('(+1)', '').trim();

  return {
    id: v.id,
    data: v.data,
    aeroporto_partenza: parts[0]?.split(' ')?.[1] || parts[0],
    aeroporto_arrivo: parts[1]?.split(' ')?.[1] || parts[1],
    citta_partenza: parts[0]?.split(' ')?.[0] || parts[0],
    citta_arrivo: parts[1]?.split(' ')?.[0] || parts[1],
    ora_partenza: times[0],
    ora_arrivo: cleanTime1,
    giorno_arrivo_offset: hasNextDay ? 1 : 0,
    durata: v.durata,
    compagnia: v.compagnia,
    numero_volo: v.compagnia.split(' ').slice(-2).join(' '),
    pnr: v.pnr,
    stato: v.stato,
    note: v.note
  };
});

const newTreni = [];
const newBus = [];

rawTreniBus.forEach(tb => {
  const parts = tb.tratta.split('->').map(s => s.trim());
  const times = tb.orario.split('->').map(s => s.trim());
  const isBus = tb.id.startsWith('B') || tb.mezzo.toLowerCase().includes('bus');

  const baseObj = {
    id: tb.id,
    data: tb.data,
    stazione_partenza: parts[0],
    stazione_arrivo: parts[1],
    citta_partenza: parts[0],
    citta_arrivo: parts[1],
    ora_partenza: times[0],
    ora_arrivo: times[1],
    carrozza: tb.posti?.match(/Carrozza\s*(\w+)/i)?.[1],
    posti: tb.posti ? [tb.posti] : [],
    note: tb.note
  };

  if (isBus) {
    newBus.push({
      ...baseObj,
      vettore: tb.mezzo,
      codice: tb.pnr
    });
  } else {
    newTreni.push({
      ...baseObj,
      mezzo: tb.mezzo,
      pnr: tb.pnr,
      codice_ritiro: tb.codice_ritiro
    });
  }
});

data.trasporti = {
  voli: newVoli,
  treni: newTreni,
  bus: newBus
};

// 4. Extract tickets & tickets section
data.biglietti = [
  { id: "BGL1", giorno: 8, data: "2026-08-05", nome: "teamLab Borderless", nome_locale: "チームラボボーダレス", codice: "AAAVRRLHXVKT-0001", ora_ingresso: "09:00", note: "Azabudai Hills. Presentarsi entro le 09:00." },
  { id: "BGL2", giorno: 8, data: "2026-08-05", nome: "Mori Art Museum (Ron Mueck)", nome_locale: "森美術館", codice: "2370-0029 / 2370-0012", ora_ingresso: "16:00", note: "Roppongi Hills Mori Tower 53F." },
  { id: "BGL3", giorno: 14, data: "2026-08-11", nome: "21st Century Museum", nome_locale: "金沢21世紀美術館", codice: "160760XS1250", ora_ingresso: "15:00", note: "Kanazawa. Mostra d'arte contemporanea." }
];

// 5. Itinerario arricchito
data.itinerario = data.itinerario.map(g => {
  const isKR = g.citta.toLowerCase().includes('seoul');
  const paese = isKR ? 'KR' : 'JP';

  const newTabella = g.tabella_oraria.map(item => {
    const rawOra = item.ora;
    let oraPartenza = rawOra;
    let oraFine = undefined;

    if (rawOra.includes('-')) {
      const parts = rawOra.split('-').map(s => s.trim());
      oraPartenza = parts[0];
      oraFine = parts[1];
    }

    const tipo = inferTipoAttivita(item.attivita, item.dettagli);

    return {
      ora: oraPartenza,
      ora_fine: oraFine,
      tipo,
      attivita: item.attivita,
      dettagli: item.dettagli,
      luogo_nome_locale: item.nome_locale,
      maps_provider: isKR ? 'naver' : 'google',
      maps_query: item.attivita
    };
  });

  return {
    giorno: g.giorno,
    data: g.data,
    citta: g.citta,
    paese,
    fase: g.fase,
    titolo: g.titolo,
    focus_culinario: g.focus_culinario,
    tabella_oraria: newTabella,
    todo_list: g.todo_list || []
  };
});

fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ File viaggio-2026-v2.json creato con successo a ${targetPath}`);
