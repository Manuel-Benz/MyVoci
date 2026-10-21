// Headless-Prüfung des Ordner-Wegs (design/js/my-ablage.js + Set-Format von MyVoci):
// die OPFS-Wurzel gilt als verbundener Ordner (Handle in IndexedDB myvoci → kv →
// dir), dann Spiegeln, Nachlesen, Löschen im «Finder», Link. Nach jedem
// ./sync.sh voci laufen lassen:
//   node tools/test-ordner.js
// Braucht Playwright samt Chromium (PLAYWRIGHT=<Pfad zum Paket>, falls nicht
// installiert) und Internet (React, Babel, Tailwind kommen vom CDN).
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const A = require('../design/js/my-ablage.js');
const PORT = 8771;
const base = `http://127.0.0.1:${PORT}/`;
const results = [];
const check = (ok, msg) => { results.push(ok); console.log(`${ok ? '✅' : '❌'} ${msg}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
    { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  process.on('exit', () => server.kill());
  for (let i = 0; i < 100; i++) { try { await fetch(base); break; } catch { await wait(50); } }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base);
  // Ausgangslage: zwei Sets nur im Browser, OPFS leer und als Ordner verbunden
  await page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    for await (const name of root.keys()) await root.removeEntry(name, { recursive: true });
    localStorage.setItem('myvoci', JSON.stringify({
      sets: [
        { id: 's1', title: 'Unité 3 – La maison', dir: 'Französisch/Klasse 2', langs: ['de', 'fr'], words: [{ a: 'das Haus', b: 'la maison' }] },
        { id: 's2', title: 'Lektion 12', dir: '', langs: ['de', 'la'], words: [{ a: 'lieben', b: 'amare' }] },
        { id: 's3', title: 'Lektion 2', dir: '', langs: ['de', 'la'], words: [{ a: 'sein', b: 'esse' }] },
      ],
      folders: ['Leer'],
    }));
    await MyAblage.handleStore('myvoci').save(root); // derselbe Weg wie die App
  });
  const files = () => page.evaluate(async () => {
    const out = [];
    const walk = async (h, p) => { for await (const [n, e] of h.entries()) { if (e.kind === 'directory') { out.push(p + n + '/'); await walk(e, p + n + '/'); } else out.push(p + n); } };
    await walk(await navigator.storage.getDirectory(), '');
    return out.sort();
  });
  const store = () => page.evaluate(() => JSON.parse(localStorage.getItem('myvoci')));
  // Warten auf den Zustand statt fester Pausen: `fn` läuft im Browser, bis es
  // wahr liefert. Selbst abgefragt, weil page.waitForFunction eine async-Funktion
  // sofort als erfüllt nimmt (ein Promise ist «wahr»).
  const until = async (fn, arg, ms = 15000) => {
    for (const end = Date.now() + ms; Date.now() < end; await wait(100)) if (await page.evaluate(fn, arg)) return true;
    throw new Error('Zeitlimit');
  };
  // fertig geschrieben = vorhanden und nicht leer
  const hasFiles = (...paths) => until(async (paths) => {
    const root = await navigator.storage.getDirectory();
    for (const p of paths) {
      let h = root;
      const parts = p.split('/');
      try {
        for (const d of parts.slice(0, -1)) h = await h.getDirectoryHandle(d);
        if (!(await (await h.getFileHandle(parts.at(-1))).getFile()).size) return false;
      } catch { return false; }
    }
    return true;
  }, paths);
  const storeHas = (title, want = true) => until(([t, w]) => (JSON.parse(localStorage.getItem('myvoci')).sets.some((s) => s.title === t)) === w, [title, want]);
  const refocus = () => page.evaluate(() => window.dispatchEvent(new Event('focus')));

  await page.reload();
  // Chromium listet eine Datei, solange sie geschrieben wird, nicht in entries():
  // darum auf das fertige Schreiben warten statt eine Momentaufnahme zu prüfen
  const written = await hasFiles('Französisch/Klasse 2/Unite 3 - La maison.txt', 'Lektion 12.txt', 'Lektion 2.txt').then(() => true, () => false);
  const f = await files();
  check(written, `Sets aus dem Browser landen im Ordner, Namen ohne Umlaute (${f.join(', ')})`);
  const text = await page.evaluate(async () => {
    const r = await navigator.storage.getDirectory();
    const fh = await r.getFileHandle('Lektion 12.txt');
    return (await fh.getFile()).text();
  });
  check(text.startsWith('# Lektion 12\n') && text.includes('F: lieben\nA: amare'), 'Dateiinhalt im Voci-Format');

  const order = (await store()).sets.filter((s) => s.title.startsWith('Lektion')).map((s) => s.title);
  check(order.join() === 'Lektion 2,Lektion 12', `natürlich sortiert (${order.join(' · ')})`);

  // Von Hand angelegte Datei kommt beim Fokus in die Liste und behält ihren Namen
  await page.evaluate(async () => {
    const r = await navigator.storage.getDirectory();
    const w = await (await r.getFileHandle('Fremd.txt', { create: true })).createWritable();
    await w.write('# Von Hand\nSprachen: de → en\n\nF: Hund\nA: dog\n---\n');
    await w.close();
  });
  await refocus();
  await storeHas('Von Hand');
  let st = await store();
  const hand = st.sets.find((s) => s.title === 'Von Hand');
  check(!!hand && hand.file === 'Fremd.txt', 'Datei von Hand erscheint als Set, `file` gemerkt');

  // Im Finder gelöscht → beim Fokus weg
  await page.evaluate(async () => (await navigator.storage.getDirectory()).removeEntry('Lektion 12.txt'));
  await refocus();
  await storeHas('Lektion 12', false);
  st = await store();
  check(!st.sets.some((s) => s.title === 'Lektion 12'), 'im Ordner gelöschtes Set verschwindet');

  // Link: Voci-Format [Titel, Sprachen, Wörter], wird ein eigenes Set und landet im Ordner
  const data = await A.packLink(['Im Restaurant', ['de', 'fr'], [['die Rechnung', "l'addition"]]]);
  await page.goto(`${base}#v=${data}`);
  await storeHas('Im Restaurant');
  st = await store();
  const linked = st.sets.find((s) => s.title === 'Im Restaurant');
  check(!!linked, 'Link wird als eigenes Set übernommen');
  check(await hasFiles(`${linked ? linked.dir + '/' : ''}Im Restaurant.txt`).then(() => true, () => false),
    `Link-Set liegt im Ordner (${linked && linked.dir})`);

  // Erstellen: ein Feld, Vorschau, Titel aus «# Titel»; eine eigene Eingabe bleibt beim Weitertippen
  await page.goto(base);
  await page.click('#create > button');
  const box = page.locator('#create textarea');
  const words = '# Unité 4 – Les vêtements\nSprachen: de → fr\n\nF: das Hemd\nA: la chemise\n---\nKatze\n';
  await box.fill(words);
  const title = page.locator('#previewTitle');
  check(await title.inputValue() === 'Unité 4 – Les vêtements', 'Vorschau übernimmt den Titel aus «# Titel»');
  check((await page.locator('#create .vorschau').innerText()).includes('Katze'), 'Vorschau meldet die unverstandene Zeile');
  await title.fill('Unité 4 – Kleider');
  await box.fill(words + 'F: der Rock\nA: la jupe\n---\n');
  check(await title.inputValue() === 'Unité 4 – Kleider', 'eigener Titel bleibt beim Weitertippen');
  check((await page.locator('#create .vorschau ol li').count()) === 2, 'Vorschau zeigt beide Wörter');
  // eine ganz andere KI-Antwort bringt ihren eigenen Titel mit
  await box.fill('# Lektion 9\nSprachen: de → la\n\nF: Hund\nA: canis\n---\n');
  check(await title.inputValue() === 'Lektion 9', 'neuer Text mit anderem «# Titel»: der eigene Titel weicht');
  await box.fill(words + 'F: der Rock\nA: la jupe\n---\n');
  await title.fill('Unité 4 – Kleider');
  await page.click('#create .vorschau .knopf-1');
  await storeHas('Unité 4 – Kleider');
  check(await hasFiles('Französisch/Klasse 2/Unite 4 - Kleider.txt').then(() => true, () => false),
    'gespeichert nach Sprache abgelegt, Dateiname nach der Namensregel');
  check(!(await page.locator('#create .vorschau').count()) && !(await box.inputValue()), 'nach dem Speichern ist der Kasten leer');
  // ohne «# Titel» fragt die Vorschau danach, statt ein «Voci» anzulegen
  await box.fill('F: rot\nA: rouge\n---\n');
  check(await title.inputValue() === '', 'ohne «# Titel» bleibt das Titelfeld leer');
  const before = (await store()).sets.length;
  await page.click('#create .vorschau .knopf-1');
  await wait(300);
  check((await store()).sets.length === before && await page.evaluate(() => document.activeElement.id) === 'previewTitle',
    'ohne Titel wird nichts gespeichert, das Titelfeld hat den Fokus');

  check(errors.length === 0, `keine Fehler in der Konsole${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await browser.close();
  const ok = results.every(Boolean);
  console.log(ok ? 'ALLES OK' : 'FEHLGESCHLAGEN');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
