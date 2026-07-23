import fs from 'fs';
import path from 'path';

/**
 * Validator script for Viaggio JSON 4.0 schema
 * Usage: node scripts/validate-viaggio-json.mjs <path-to-json>
 */

const jsonPath = process.argv[2] || './viaggio-sample.json';
const absolutePath = path.resolve(process.cwd(), jsonPath);

console.log(`🔍 Validazione schema JSON per: ${absolutePath}\n`);

if (!fs.existsSync(absolutePath)) {
  console.error(`❌ Errore: File non trovato a ${absolutePath}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(absolutePath, 'utf8');
  const data = JSON.parse(content);

  let errors = 0;
  let warnings = 0;

  function reportError(msg) {
    console.error(`  ❌ [ERRORE] ${msg}`);
    errors++;
  }

  function reportWarning(msg) {
    console.warn(`  ⚠️  [AVVISO] ${msg}`);
    warnings++;
  }

  // 1. Meta
  if (!data.meta) reportError('Sezione "meta" mancante.');
  else {
    if (!data.meta.titolo) reportError('meta.titolo mancante.');
    if (!data.meta.tassi_cambio?.JPY_EUR) reportError('meta.tassi_cambio.JPY_EUR mancante.');
    if (!data.meta.tassi_cambio?.KRW_EUR) reportError('meta.tassi_cambio.KRW_EUR mancante.');
  }

  // 2. Alloggi
  if (!Array.isArray(data.alloggi) || data.alloggi.length === 0) {
    reportError('Sezione "alloggi" mancante o vuota.');
  } else {
    data.alloggi.forEach((h, idx) => {
      if (!h.id) reportError(`alloggi[${idx}] manca di "id".`);
      if (!h.citta) reportError(`alloggi[${idx}] manca di "citta".`);
      if (!h.paese) reportError(`alloggi[${idx}] (${h.citta}) manca di "paese" (KR/JP/IT).`);
      if (!h.indirizzo_locale) reportWarning(`alloggi[${idx}] (${h.citta}) manca di "indirizzo_locale" per il taxista.`);
      if (!h.latitudine || !h.longitudine) reportWarning(`alloggi[${idx}] (${h.citta}) manca delle coordinate (lat/lon) per Open-Meteo.`);
    });
  }

  // 3. Trasporti
  if (!data.trasporti) {
    reportError('Sezione "trasporti" mancante.');
  } else {
    if (!Array.isArray(data.trasporti.voli)) reportError('trasporti.voli deve essere un array.');
    if (!Array.isArray(data.trasporti.treni)) reportError('trasporti.treni deve essere un array.');
    if (!Array.isArray(data.trasporti.bus)) reportError('trasporti.bus deve essere un array.');

    data.trasporti.voli?.forEach((v, idx) => {
      if (!v.ora_partenza || !v.ora_arrivo) reportError(`Volo ${v.id || idx} manca di ora_partenza o ora_arrivo.`);
      if (!v.pnr) reportWarning(`Volo ${v.id || idx} manca di PNR.`);
    });
  }

  // 4. Itinerario
  if (!Array.isArray(data.itinerario) || data.itinerario.length === 0) {
    reportError('Sezione "itinerario" mancante o vuota.');
  } else {
    data.itinerario.forEach((g, idx) => {
      if (g.giorno === undefined) reportError(`itinerario[${idx}] manca del numero giorno.`);
      if (!g.data) reportError(`Giorno ${g.giorno} manca della data.`);
      if (!g.paese) reportError(`Giorno ${g.giorno} (${g.citta}) manca di "paese".`);
      
      if (!Array.isArray(g.tabella_oraria)) {
        reportError(`Giorno ${g.giorno} manca della tabella_oraria.`);
      } else {
        g.tabella_oraria.forEach((item, itemIdx) => {
          if (!item.ora) reportError(`Giorno ${g.giorno}, item ${itemIdx} manca dell'ora.`);
          if (!item.tipo) reportWarning(`Giorno ${g.giorno}, item ${itemIdx} ("${item.attivita}") manca di "tipo" (trasporto/attivita/pasto/alloggio/festival/compito/info).`);
        });
      }
    });
  }

  console.log('\n----------------------------------------');
  if (errors === 0 && warnings === 0) {
    console.log('✅ VALIDAZIONE COMPLETATA CON SUCCESSO! Lo schema è perfetto.');
  } else if (errors === 0) {
    console.log(`✅ VALIDAZIONE RIUSCITA con ${warnings} avvisi minori.`);
  } else {
    console.log(`❌ VALIDAZIONE FALLITA: trovati ${errors} errori e ${warnings} avvisi.`);
    process.exit(1);
  }

} catch (err) {
  console.error('❌ Errore durante il parsing JSON:', err.message);
  process.exit(1);
}
