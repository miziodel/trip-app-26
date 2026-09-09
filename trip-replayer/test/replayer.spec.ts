import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';

/**
 * Suite TripReplayer — segue SPEC-TripReplayer.md.
 *
 * Convenzioni:
 * - I dati (itinerario e check-in) sono 0-based; la UI mostra "Giorno 01..24".
 * - Il caricamento avviene attraverso il FLUSSO REALE (setInputFiles sugli
 *   input file), non chiamando funzioni globali.
 * - Ogni test fallisce anche su eccezioni non catturate (pageerror), non solo
 *   su console.error.
 */

const TEST_DIR = path.dirname(__filename);
const ORIG_JSON = path.join(TEST_DIR, 'viaggio-demo.json');
const BACKUP_JSON = path.join(TEST_DIR, 'test-checkins.json');
const TINY_PNG = path.join(TEST_DIR, 'fixture-photo.png');

/* ── Error watch: console.error + pageerror (l'AC9 copre entrambi) ─────── */

function watchErrors(page: Page, bag: { errors: string[] }) {
  page.on('pageerror', (err) => bag.errors.push('pageerror: ' + String(err).slice(0, 300)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      // rumore di rete delle tile (404/429 di OSM) non è un errore dell'app
      if (/Failed to load resource|tile\.openstreetmap/.test(msg.text())) return;
      bag.errors.push('console: ' + msg.text().slice(0, 300));
    }
  });
}

async function expectNoErrors(bag: { errors: string[] }) {
  expect(bag.errors, 'console/pageerror:\n' + bag.errors.join('\n')).toHaveLength(0);
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

async function openApp(page: Page) {
  await page.goto('/');
  await expect(page.locator('#map')).toBeVisible();
  await page.waitForFunction(() => !!(window as any).appMap, undefined, { timeout: 10000 });
}

async function loadViaggio(page: Page) {
  await page.setInputFiles('#loadOrigInput', ORIG_JSON);
  await expect(page.locator('.sidebar-day')).toHaveCount(24);
}

async function loadBackup(page: Page) {
  await page.setInputFiles('#loadExportInput', BACKUP_JSON);
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3);
}

/** Giorno della sidebar per l'indice 0-based dato. */
const dayEntry = (page: Page, giorno: number) => page.locator(`.sidebar-day[data-giorno="${giorno}"]`);

/* ── Suite ─────────────────────────────────────────────────────────────── */

test.describe('TripReplayer', () => {

  test('T0 — pagina: mappa pronta, sidebar vuota, export disabilitato, nessuna modal, zero errori', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);

    await expect(page.locator('.sidebar-day')).toHaveCount(0);
    await expect(page.locator('#sidebarEmpty')).toBeVisible();
    await expect(page.locator('#downloadBtn')).toBeDisabled();
    await expect(page.locator('#dayModal')).toBeHidden();
    await expect(page.locator('#ciModal')).toBeHidden();
    await expect(page.locator('#bottomPanel')).toBeHidden();
    await expect(page.locator('#headerSub')).toContainText('Carica i file per rivivere il viaggio');
    await expectNoErrors(bag);
  });

  test('T1 — viaggio: sidebar 24 giorni GIORNO 01..24, header informativo, primo giorno selezionato senza modal', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);

    // header
    await expect(page.locator('#headerSub')).toContainText('24 giorni');
    await expect(page.locator('#headerSub')).toContainText('Viaggio Giappone & Corea 2026');

    // etichette 1-based
    await expect(dayEntry(page, 0).locator('.day-num')).toHaveText('GIORNO 01');
    await expect(dayEntry(page, 23).locator('.day-num')).toHaveText('GIORNO 24');
    await expect(dayEntry(page, 0).locator('.day-title')).toContainText('Atterraggio e Benvenuti a Seoul');
    await expect(dayEntry(page, 0).locator('.day-date')).toContainText('2026-07-28 · Seoul');

    // primo giorno selezionato, pannello visibile, NESSUNA modal auto-aperta
    await expect(dayEntry(page, 0)).toHaveClass(/active/);
    await expect(page.locator('#bottomPanel')).toBeVisible();
    await expect(page.locator('#panelTitle')).toContainText('Giorno 1: Seoul');
    await expect(page.locator('#dayModal')).toBeHidden();
    await expect(page.locator('#ciModal')).toBeHidden();
    await expect(page.locator('#downloadBtn')).toBeEnabled();
    await expectNoErrors(bag);
  });

  test('T2 — backup: 3 marker (Seoul Station, Tokyo Tower, Gotokuji) + indicatori sidebar sui giorni giusti', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // ancora 24 giorni; indicatori sui giorni 0, 4, 12 (solo su quelli)
    await expect(page.locator('.sidebar-day')).toHaveCount(24);
    await expect(dayEntry(page, 0).locator('.checkin-dot')).toBeVisible();
    await expect(dayEntry(page, 4).locator('.checkin-dot')).toBeVisible();
    await expect(dayEntry(page, 12).locator('.checkin-dot')).toBeVisible();
    await expect(dayEntry(page, 1).locator('.checkin-dot')).toHaveCount(0);

    // nomi dei marker
    const markers = page.locator('.leaflet-marker-icon');
    await expect(markers).toHaveCount(3);
    for (const name of ['Seoul Station', 'Tokyo Tower', 'Gotokuji']) {
      await expect(page.locator(`.leaflet-marker-icon[title*="${name}"]`)).toHaveCount(1);
    }

    // il giorno selezionato (0) mostra il suo check-in nel pannello
    await expect(page.locator('#panelScroll .checkin-mini')).toHaveCount(1);
    await expect(page.locator('#panelScroll .checkin-mini').first()).toContainText('Seoul Station');
    await expect(page.locator('#panelTitle')).toContainText('Giorno 1: Seoul');
    await expectNoErrors(bag);
  });

  test('T3 — selezione giorno + programma: fit mappa, pannello, dayModal con Orario/To-Do, ESC chiude', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // click giorno 4 (GIORNO 05, Tokyo Tower): modal NON aperta, pannello aggiornato
    await dayEntry(page, 4).click();
    await expect(page.locator('#dayModal')).toBeHidden();
    await expect(page.locator('#panelTitle')).toContainText('Giorno 5: Tokyo');
    await expect(page.locator('#panelScroll .checkin-mini').first()).toContainText('Tokyo Tower');

    // fit della mappa sul marker del giorno (Tokyo Tower)
    await expect.poll(async () => {
      const c = await page.evaluate(() => {
        const m = (window as any).appMap;
        if (!m) return null;
        const center = m.getCenter();
        return { lat: center.lat, lng: center.lng, zoom: m.getZoom() };
      });
      if (!c) return -1;
      const dLat = Math.abs(c.lat - 35.6586);
      const dLng = Math.abs(c.lng - 139.7454);
      return dLat < 0.05 && dLng < 0.05 && c.zoom >= 10 ? 1 : -1;
    }, { timeout: 5000 }).toBe(1);

    // programma dal pulsante dedicato
    await page.locator('#openProgramBtn').click();
    await expect(page.locator('#dayModal')).toBeVisible();
    await expect(page.locator('#dayModalTitle')).toContainText('Giorno 5');
    const body = page.locator('#dayModalBody');
    await expect(body).toContainText('Orario');
    await expect(body).toContainText('To-Do');
    expect(await body.locator('.orario-entry').count()).toBeGreaterThan(0);
    expect(await body.locator('.todo-entry').count()).toBeGreaterThan(0);

    // ESC chiude la modal
    await page.keyboard.press('Escape');
    await expect(page.locator('#dayModal')).toBeHidden();
    await expectNoErrors(bag);
  });

  test('T4 — click marker: popup anteprima con link Google Maps e pulsante Dettagli', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    await page.locator('.leaflet-marker-icon').first().click();
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible();
    await expect(popup.locator('.popup-name')).toContainText('Seoul Station');
    await expect(popup.locator('.popup-day')).toContainText('Giorno 1 · Seoul');
    const gmaps = popup.locator('a[href*="google.com/maps"]');
    await expect(gmaps).toBeVisible();
    await expect(popup.locator('.popup-detail')).toBeVisible();

    // il pulsante Dettagli apre la modal piena (con Modifica/Elimina)
    await popup.locator('.popup-detail').click();
    await expect(page.locator('#ciModal')).toBeVisible();
    await expect(page.locator('#ciModalBody')).toContainText('Modifica');
    await expect(page.locator('#ciModalBody')).toContainText('Elimina');
    await page.keyboard.press('Escape');
    await expect(page.locator('#ciModal')).toBeHidden();
    await expectNoErrors(bag);
  });

  test('T5 — popup mostra la foto base64 del check-in', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    await page.locator('.leaflet-marker-icon').first().click();
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible();
    const imgs = popup.locator('img');
    expect(await imgs.count()).toBeGreaterThan(0);
    const src = await imgs.first().getAttribute('src');
    expect(src).toContain('data:image');
    await expectNoErrors(bag);
  });

  test('T6 — giorno senza check-in: selezione senza crash, pannello "Nessun check-in", zero errori', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    await dayEntry(page, 19).click(); // GIORNO 20 — Osaka, nessun check-in nel fixture
    await expect(page.locator('#dayModal')).toBeHidden();
    await expect(page.locator('#panelScroll')).toContainText('Nessun check-in');
    await expect(page.locator('#panelCoord')).toContainText('Nessun check-in');
    await expectNoErrors(bag);
  });

  test('T7 — merge backup: un secondo load (file diverso, stessi id) non duplica marker né foto', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // copia del backup con nome diverso: il change dell'input scatta davvero
    const copyPath = path.join(os.tmpdir(), `replayer-backup-copy-${Date.now()}.json`);
    fs.copyFileSync(BACKUP_JSON, copyPath);
    await page.setInputFiles('#loadExportInput', copyPath);

    // merge per id: 0 nuovi
    await expect(page.locator('.toast').last()).toContainText('0 nuovi');
    await expect(page.locator('.sidebar-day')).toHaveCount(24);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3);
    await expect(dayEntry(page, 0).locator('.checkin-dot')).toBeVisible();
    await expect(page.locator('#panelScroll .thumb')).toHaveCount(1); // foto non duplicata
    fs.unlinkSync(copyPath);
    await expectNoErrors(bag);
  });

  test('T8 — nuovo check-in dalla mappa con foto, poi export coerente', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // nuovo check-in sul giorno attivo (0) tramite il form reale
    await page.evaluate(() => {
      const m = (window as any).appMap;
      m.fire('click', { latlng: L.latLng(37.56, 126.97) });
    });
    await expect(page.locator('#ciModal')).toBeVisible();
    await expect(page.locator('#ciModalTitle')).toContainText('Nuovo check-in');
    await page.fill('#newName', 'Namdaemun Market');
    await page.selectOption('#newRating', '5');
    await page.fill('#newComment', 'Mercato pieno di vita');
    await page.setInputFiles('#newPhotos', TINY_PNG);
    await page.locator('#ciModalBody button', { hasText: 'Registra' }).click();

    await expect(page.locator('.toast').last()).toContainText('registrato');
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
    await expect(page.locator('#panelScroll .checkin-mini')).toHaveCount(2); // giorno 0
    await expect(page.locator('#panelScroll .thumb')).toHaveCount(2); // foto fixture + foto test1

    // export: JSON con 4 check-in e la foto nuova come base64
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#downloadBtn').click(),
    ]);
    const filePath = await download.path();
    const backup = JSON.parse(fs.readFileSync(filePath!, 'utf-8'));
    expect(backup.checkIns).toHaveLength(4);
    const newCi = backup.checkIns.find((c: any) => c.luogo_nome === 'Namdaemun Market');
    expect(newCi).toBeTruthy();
    expect(newCi.giorno).toBe(0);
    expect(backup.checkInPhotos[newCi.photoIds[0]]).toContain('data:image');
    expect(Object.keys(backup.checkInPhotos)).toHaveLength(2);
    await expectNoErrors(bag);
  });

  test('T9 — round-trip: il backup scaricato si ricarica nel replayer (4 marker, foto visibile)', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // aggiungi un check-in per avere uno stato diverso dal fixture
    await page.evaluate(() => {
      const m = (window as any).appMap;
      m.fire('click', { latlng: L.latLng(37.55, 126.96) });
    });
    await page.fill('#newName', 'Gwangjang Market');
    await page.locator('#ciModalBody button', { hasText: 'Registra' }).click();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#downloadBtn').click(),
    ]);
    const exportedPath = await download.path();

    // pagina pulita: viaggio + backup esportato
    const page2 = await page.context().newPage();
    const bag2 = { errors: [] as string[] };
    watchErrors(page2, bag2);
    await openApp(page2);
    await page2.setInputFiles('#loadOrigInput', ORIG_JSON);
    await expect(page2.locator('.sidebar-day')).toHaveCount(24);
    await page2.setInputFiles('#loadExportInput', exportedPath!);
    await expect(page2.locator('.leaflet-marker-icon')).toHaveCount(4);

    // foto della sessione precedente ancora visibili nel pannello del giorno 0
    // (solo foto_test1: il nuovo check-in Gwangjang è senza foto)
    await expect(page2.locator('#panelScroll .thumb')).toHaveCount(1);
    const thumbs = page2.locator('#panelScroll .thumb img');
    const srcs = await thumbs.evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    expect(srcs.every((s) => s.startsWith('data:image'))).toBe(true);
    await expectNoErrors(bag2);
    await page2.close();
    await expectNoErrors(bag);
  });

  test('T10 — modifica check-in dalla modal dettaglio (nome/rating/giorno)', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // apri dettaglio dalla card del giorno 0
    await page.locator('#panelScroll .checkin-mini').first().click();
    await expect(page.locator('#ciModal')).toBeVisible();
    await page.locator('#ciModalBody button', { hasText: 'Modifica' }).click();

    await page.fill('#editName', 'Seoul Station — ritorno');
    await page.selectOption('#editRating', '5');
    await page.locator('#ciModalBody button', { hasText: 'Salva modifiche' }).click();
    await expect(page.locator('.toast').last()).toContainText('modificato');

    // verifica: card e popup riflettono il nuovo nome
    await expect(page.locator('#panelScroll .checkin-mini').first()).toContainText('Seoul Station — ritorno');
    await expect(page.locator('.leaflet-marker-icon[title="Seoul Station — ritorno"]')).toHaveCount(1);
    await expectNoErrors(bag);
  });

  test('T11 — eliminazione check-in con conferma: marker, card e foto orfane rimosse', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    await page.locator('#panelScroll .checkin-mini').first().click();
    await expect(page.locator('#ciModal')).toBeVisible();

    page.once('dialog', (d) => d.accept());
    await page.locator('#ciModalBody button', { hasText: 'Elimina' }).click();

    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2);
    await expect(page.locator('#panelScroll .checkin-mini')).toHaveCount(0);
    await expect(page.locator('#panelScroll .thumb')).toHaveCount(0); // foto orfana rimossa
    await expect(page.locator('#panelScroll')).toContainText('Nessun check-in');
    await expectNoErrors(bag);
  });

  test('T12 — errori: JSON invalido e file con chiavi mancanti → toast, app stabile', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);

    const tmpInvalid = path.join(os.tmpdir(), `replayer-invalid-${Date.now()}.json`);
    fs.writeFileSync(tmpInvalid, '{ questo non è json ');
    await page.setInputFiles('#loadOrigInput', tmpInvalid);
    await expect(page.locator('.toast').last()).toContainText('JSON non valido');
    await expect(page.locator('.sidebar-day')).toHaveCount(0);

    const tmpNoItinerario = path.join(os.tmpdir(), `replayer-noit-${Date.now()}.json`);
    fs.writeFileSync(tmpNoItinerario, JSON.stringify({ meta: { titolo: 'X' } }));
    await page.setInputFiles('#loadOrigInput', tmpNoItinerario);
    await expect(page.locator('.toast').last()).toContainText('manca meta o itinerario');

    const tmpNoCheckIns = path.join(os.tmpdir(), `replayer-noci-${Date.now()}.json`);
    fs.writeFileSync(tmpNoCheckIns, JSON.stringify({ meta: { titolo: 'X' } }));
    await page.setInputFiles('#loadExportInput', tmpNoCheckIns);
    await expect(page.locator('.toast').last()).toContainText('manca checkIns');

    // l'app è ancora utilizzabile dopo gli errori
    await loadViaggio(page);
    await loadBackup(page);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3);
    fs.unlinkSync(tmpInvalid); fs.unlinkSync(tmpNoItinerario); fs.unlinkSync(tmpNoCheckIns);
    await expectNoErrors(bag);
  });

  test('T13 — backup senza viaggio: marker visibili senza contesto giorni + invito a caricare il viaggio', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);

    await page.setInputFiles('#loadExportInput', BACKUP_JSON);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3);
    await expect(page.locator('.sidebar-day')).toHaveCount(0);
    await expect(page.locator('.toast').last()).toContainText('Carica anche il file viaggio');

    // poi il viaggio arriva: 24 giorni + marker ancora presenti
    await page.setInputFiles('#loadOrigInput', ORIG_JSON);
    await expect(page.locator('.sidebar-day')).toHaveCount(24);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3);
    await expectNoErrors(bag);
  });

  test('T14 — check-in da luogo del programma: posiziona sulla mappa con giorno e luogo precompilati', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // apri il programma del GIORNO 05 (giorno 4, Tokyo) dal pulsante della sidebar
    await dayEntry(page, 4).locator('.day-program-btn').click();
    await expect(page.locator('#dayModal')).toBeVisible();

    // primo luogo dell'orario → bottone "📍 Check-in"
    const firstPlace = await page.locator('#dayModalBody .add-ci-btn').first().getAttribute('data-place');
    expect(firstPlace).toBeTruthy();
    await page.locator('#dayModalBody .add-ci-btn').first().click();

    // il programma si chiude e compare il banner di guida col luogo indicato
    await expect(page.locator('#dayModal')).toBeHidden();
    const banner = page.locator('#placeBanner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(firstPlace!);

    // click sulla mappa → form precompilato: nome = luogo, giorno = 4
    await page.evaluate(() => {
      const m = (window as any).appMap;
      m.fire('click', { latlng: L.latLng(35.65, 139.71) });
    });
    await expect(page.locator('#ciModal')).toBeVisible();
    await expect(banner).toBeHidden(); // pending consumato
    await expect(page.locator('#newName')).toHaveValue(firstPlace!);
    await expect(page.locator('#newGiorno')).toHaveValue('4');

    await page.fill('#newComment', 'Visto nel programma del giorno');
    await page.locator('#ciModalBody button', { hasText: 'Registra' }).click();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);

    // la card del nuovo check-in appare nel pannello del giorno 4 (giorno attivo)
    await expect(page.locator('#panelScroll .checkin-mini')).toHaveCount(2);
    await expect(page.locator('#panelScroll .checkin-mini').last()).toContainText(firstPlace!);
    await expectNoErrors(bag);
  });

  test('T15 — pulsante 📋 nella sidebar: click = seleziona il giorno e apre il programma', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);

    // ogni riga ha il suo pulsante programma
    await expect(page.locator('.sidebar-day .day-program-btn')).toHaveCount(24);

    // click sul pulsante del GIORNO 06 (giorno 5): seleziona e apre il programma giusto
    await dayEntry(page, 5).locator('.day-program-btn').click();
    await expect(dayEntry(page, 5)).toHaveClass(/active/);
    await expect(page.locator('#dayModal')).toBeVisible();
    await expect(page.locator('#dayModalTitle')).toContainText('Giorno 6');
    await expect(page.locator('#panelTitle')).toContainText('Giorno 6: Tokyo');

    // il click sulla riga (non sul pulsante) continua a solo-selezionare
    await page.keyboard.press('Escape');
    await expect(page.locator('#dayModal')).toBeHidden();
    await dayEntry(page, 0).click();
    await expect(page.locator('#dayModal')).toBeHidden();
    await expect(page.locator('#panelTitle')).toContainText('Giorno 1: Seoul');
    await expectNoErrors(bag);
  });

  test('T16 — modifica posizione geografica: click sulla mappa dal form di modifica', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // apri dettaglio Seoul Station → Modifica
    await page.locator('#panelScroll .checkin-mini').first().click();
    await page.locator('#ciModalBody button', { hasText: 'Modifica' }).click();
    await expect(page.locator('#editPosBadge')).toContainText('37.56650');

    // "cambia cliccando sulla mappa": chiude la modal e mostra il banner
    await page.locator('#ciModalBody button', { hasText: 'Cambia' }).click();
    await expect(page.locator('#ciModal')).toBeHidden();
    const banner = page.locator('#placeBanner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('nuova posizione');
    await expect(banner).toContainText('Seoul Station');

    // click sulla mappa → la modifica si riapre con le nuove coordinate
    await page.evaluate(() => {
      const m = (window as any).appMap;
      m.fire('click', { latlng: L.latLng(37.57, 126.98) });
    });
    await expect(page.locator('#ciModal')).toBeVisible();
    await expect(banner).toBeHidden();
    await expect(page.locator('#editPosBadge')).toContainText('37.57000');

    await page.locator('#ciModalBody button', { hasText: 'Salva modifiche' }).click();
    await expect(page.locator('.toast').last()).toContainText('modificato');

    // il marker si è spostato: il link Maps del popup punta alle nuove coordinate
    await page.locator('.leaflet-marker-icon[title*="Seoul Station"]').click();
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible();
    const href = await popup.locator('a[href*="google.com/maps"]').getAttribute('href');
    expect(href).toContain('37.57');
    expect(href).toContain('126.98');
    await expectNoErrors(bag);
  });

  test('T17 — incolla posizione da Google Maps: coordinate e Plus Code corto con città', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // nuovo check-in con posizione incollata come Plus Code corto + città (esempio Pechino)
    await page.evaluate(() => {
      const m = (window as any).appMap;
      m.fire('click', { latlng: L.latLng(37.5, 126.9) });
    });
    await expect(page.locator('#ciModal')).toBeVisible();
    await page.fill('#newName', 'PEK — scalo');
    await page.fill('#newGmaps', 'Aeroporto Internazionale di Pechino-Capital - 3JH3+W6X, Shunyi District, Beijing, Cina');
    await page.locator('#ciModalBody button', { hasText: 'Applica' }).click();
    await expect(page.locator('#newPosBadge')).toContainText('40.07981');
    await expect(page.locator('#newPosBadge')).toContainText('116.60306');
    await page.locator('#ciModalBody button', { hasText: 'Registra' }).click();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);

    // coordinate effettive verificate nell'export
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#downloadBtn').click(),
    ]);
    const backup = JSON.parse(fs.readFileSync((await download.path())!, 'utf-8'));
    const ci = backup.checkIns.find((c: any) => c.luogo_nome === 'PEK — scalo');
    expect(ci).toBeTruthy();
    expect(ci.lat).toBeCloseTo(40.07981, 3);
    expect(ci.lng).toBeCloseTo(116.60306, 3);
    await expectNoErrors(bag);
  });

  test('T18 — persistenza: dopo un reload i file caricati e le modifiche sono ancora lì; Azzera dati pulisce', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // aggiungi un check-in di sessione
    await page.evaluate(() => {
      const m = (window as any).appMap;
      m.fire('click', { latlng: L.latLng(37.55, 126.95) });
    });
    await page.fill('#newName', 'PersistTest');
    await page.locator('#ciModalBody button', { hasText: 'Registra' }).click();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
    await page.waitForTimeout(900); // attende il salvataggio (debounce + IndexedDB)

    // reload: i dati vengono ripristinati dal browser
    await page.reload();
    await page.waitForFunction(() => !!(window as any).appMap, undefined, { timeout: 10000 });
    await expect(page.locator('.sidebar-day')).toHaveCount(24);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
    await expect(page.locator('#panelScroll .checkin-mini')).toHaveCount(2); // Seoul + PersistTest
    await expect(page.locator('#panelScroll')).toContainText('PersistTest');
    await expect(page.locator('#resetDataBtn')).toBeVisible();

    // Azzera dati: conferma, reload, stato pulito
    page.once('dialog', (d) => d.accept());
    await page.locator('#resetDataBtn').click();
    await page.waitForFunction(() => !!(window as any).appMap, undefined, { timeout: 10000 });
    await expect(page.locator('.sidebar-day')).toHaveCount(0);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(0);
    await expect(page.locator('#headerSub')).toContainText('Carica i file per rivivere il viaggio');
    await expectNoErrors(bag);
  });

  test('T19 — pannello giorno ridimensionabile trascinando la maniglia', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);
    await openApp(page);
    await loadViaggio(page);

    const panel = page.locator('#bottomPanel');
    const before = (await panel.boundingBox())!.height;

    const handle = page.locator('#panelResizer');
    const hb = (await handle.boundingBox())!;
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2 - 140, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const after = (await panel.boundingBox())!.height;
    expect(after).toBeGreaterThan(before + 100);
    await expectNoErrors(bag);
  });

  test('T20 — widget di ricerca luoghi: geocoding Nominatim e salto sulla mappa', async ({ page }) => {
    const bag = { errors: [] as string[] };
    watchErrors(page, bag);

    // risposta Nominatim simulata (2 risultati → il widget mostra la lista)
    await page.route(/nominatim\.openstreetmap\.org\/search/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            place_id: 1,
            lat: '35.6595756',
            lon: '139.7006156',
            display_name: 'Shibuya Crossing, Shibuya, Tokyo, Giappone',
            boundingbox: ['35.6500', '35.6700', '139.6900', '139.7100'],
            address: { road: 'Shibuya Crossing', suburb: 'Shibuya', city: 'Tokyo', country: 'Giappone' },
          },
          {
            place_id: 2,
            lat: '35.66',
            lon: '139.71',
            display_name: 'Un altro luogo, Tokyo, Giappone',
            boundingbox: ['35.6500', '35.6700', '139.7000', '139.7200'],
            address: { road: 'Un altro luogo', city: 'Tokyo', country: 'Giappone' },
          },
        ]),
      });
    });

    await openApp(page);
    await loadViaggio(page);
    await loadBackup(page);

    // il widget è sulla mappa (in alto a destra)
    const ctrl = page.locator('.leaflet-control-geocoder');
    await expect(ctrl).toBeVisible();

    // espandi, cerca, scegli il primo risultato
    await ctrl.locator('.leaflet-control-geocoder-icon').click();
    const input = page.locator('.leaflet-control-geocoder-expanded input');
    await expect(input).toBeVisible();
    await input.fill('Shibuya Crossing');
    await input.press('Enter');

    const firstResult = page.locator('.leaflet-control-geocoder-alternatives li a').first();
    await expect(firstResult).toContainText('Shibuya');
    await firstResult.click();

    // la mappa si sposta sul luogo e compare il pin azzurro del risultato
    await expect(page.locator('.leaflet-marker-icon.search-marker')).toHaveCount(1);
    await expect.poll(async () => {
      const c = await page.evaluate(() => {
        const m = (window as any).appMap;
        if (!m) return null;
        const center = m.getCenter();
        return { lat: center.lat, lng: center.lng };
      });
      if (!c) return -1;
      return Math.abs(c.lat - 35.6596) < 0.01 && Math.abs(c.lng - 139.7006) < 0.01 ? 1 : -1;
    }, { timeout: 5000 }).toBe(1);

    // il pin di ricerca NON è un check-in: i marker restano 3
    await expect(page.locator('.leaflet-marker-icon:not(.search-marker)')).toHaveCount(3);
    await expectNoErrors(bag);
  });

});
