// My-Ablage: gemeinsamer Code für Sets in Ordnern (MyKahoot, MyVoci, MyMemory,
// MyTafelfussball). Regeln und Begründungen in ABLAGE.md — dieser Code setzt sie
// um, herausgelöst aus MyVoci (Namen, Ort, Ordner-Abgleich, Link) und MyMemory
// (Lese-Cache). Einzige Quelle ist ~/MySuite, verteilt per ./sync.sh.
//
// Läuft im Browser (window.MyAblage) und in Node (require, z. B. der MyKahoot-
// Server). Was eine Seite braucht (Ordner auf der Platte, ZIP, Download), prüft
// selbst, ob es sie gibt; die reinen Funktionen laufen überall.
//
// Was je App verschieden ist (Inhalt einer Datei, leeres Set, Zusammenführen),
// kommt über `sammlung({ … })` herein, siehe dort.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MyAblage = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- Namen ----------
  // Was Dateisysteme stört, wird zum Bindestrich. `fallback`, wenn nichts übrig bleibt.
  const safeName = (title, fallback = 'Set') => String(title || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').trim() || fallback;
  // Bestehende Ordner: nur das Nötigste ersetzen, sonst entstünde neben
  // `Französisch/` ein zweiter `Franzoesisch/`.
  const safeDir = (dir) => String(dir || '').split('/').filter(Boolean).map((p) => safeName(p, '-')).join('/');

  // Neue Datei- und Ordnernamen ohne Sonderzeichen: Umlaute ausgeschrieben,
  // Akzente weg, Leerzeichen bleiben (lesbarer als «_» für Leute, die nicht
  // programmieren), alles andere ausser ( ) , . ' - wird «-». Der Titel in der
  // Datei bleibt, wie er ist.
  const UMLAUT = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss', æ: 'ae', œ: 'oe', Æ: 'Ae', Œ: 'Oe' };
  const plainName = (title, fallback = 'Set') => {
    const ascii = String(title || '').normalize('NFC').replace(/[äöüÄÖÜßæœÆŒ]/g, (c) => UMLAUT[c])
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9 (),.'-]+/g, '-').replace(/\s+/g, ' ').replace(/-+/g, '-')
      .replace(/^[\s.-]+|[\s.-]+$/g, '');
    // Ganz ohne lateinische Buchstaben (griechischer Titel) bliebe nur eine
    // Ziffer oder nichts übrig — und zwei solche Sets teilten sich eine Datei.
    return /[A-Za-z]/.test(ascii) ? ascii : safeName(title, fallback);
  };
  // Ordnerpfad aus einer Eingabe («Neuer Ordner», Unterordner mit «/»): jeder
  // Teil nach der Namensregel, leere fallen weg. '' heisst abgebrochen.
  const cleanFolderName = (raw) => String(raw || '').split('/').map((p) => (p.trim() ? plainName(p.trim(), '') : '')).filter(Boolean).join('/');

  // ---------- Ordnerpfade ----------
  const dirName = (dir) => dir.split('/').pop();
  const parentDir = (dir) => (dir.includes('/') ? dir.slice(0, dir.lastIndexOf('/')) : '');
  const inside = (dir, ancestor) => dir === ancestor || dir.startsWith(ancestor + '/');
  // Gross/Klein zählt nicht: auf macOS und Windows ist es dasselbe Verzeichnis
  const sameFolder = (a, b) => a.toLowerCase() === b.toLowerCase();
  const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' }); // einmal, nicht pro Vergleich
  const collate = (a, b) => collator.compare(a, b);
  const byTitle = (a, b) => collate(a.title, b.title);
  // Eine Sammlung ist { <list>: [Sets], folders: [Pfade] }; `list` heisst meist
  // 'sets', in MyMemory 'memories'.
  // Alle Ordner: die gemerkten (auch leere) plus jeder Pfad samt Eltern, in dem ein Set liegt
  const allFolders = (store, list = 'sets') => {
    const all = new Set(store.folders);
    for (const s of store[list]) for (let d = s.dir || ''; d; d = parentDir(d)) all.add(d);
    return [...all].sort(collate);
  };
  // Ordner umbenennen/verschieben: alle Pfade darunter mitnehmen. Ausgangspunkt sind alle
  // Ordner (auch die nur über Sets bekannten): ein Elternordner, aus dem der letzte
  // Unterordner wegzieht, bleibt so als leerer Ordner stehen, statt still zu verschwinden.
  const remapDir = (store, from, to, list = 'sets') => {
    const move = (d) => (inside(d, from) ? to + d.slice(from.length) : d);
    return { ...store, [list]: store[list].map((s) => ({ ...s, dir: move(s.dir || '') })), folders: [...new Set(allFolders(store, list).map(move))] };
  };
  // Liegt am Ziel schon ein Ordner dieses Namens? `self` ist der Ordner, der
  // selbst umzieht — sonst ginge «Verben» → «verben» nicht.
  const folderTaken = (store, target, self, list = 'sets') => allFolders(store, list).some((f) => f !== self && sameFolder(f, target));

  // Ziele der Ordner-Aktionen (die App wendet sie mit remapDir bzw. folders an).
  // Zurück kommt der Zielpfad, `null` = nichts zu tun, `false` = am Ziel liegt
  // schon ein Ordner (ABLAGE.md: melden und nichts tun, sonst verschmölzen beide
  // still und der Weg zurück fehlte).
  // Neuer Ordner: Unterordner mit «/»; schreibt sich nur Gross/Klein anders, ist
  // es derselbe Ordner.
  // Ein eingegebener ganzer Pfad («Französisch/Klasse 3»): Teil für Teil gegen die
  // bestehenden Ordner aufgelöst. Was es schon gibt (ohne Gross/Klein), behält seinen
  // Namen — sonst entstünde neben «Französisch» ein zweites «Franzoesisch» —, nur neue
  // Teile gehen durch plainName. '' heisst abgebrochen.
  const resolveFolderPath = (store, raw, list = 'sets') => {
    const folders = allFolders(store, list);
    let path = '';
    // Vergleich über den Dateinamen ohne Gross/Klein: so trifft auch «Franzoesisch»
    // (ohne Umlaut getippt) den bestehenden Ordner «Französisch»
    const key = (n) => plainName(n, '').toLowerCase();
    const known = folders.map((f) => ({ f, parent: parentDir(f), key: key(dirName(f)) }));
    for (const part of String(raw || '').split('/').map((p) => p.trim()).filter(Boolean)) {
      const plain = plainName(part, '');
      const there = known.find((k) => k.parent === path && k.key === plain.toLowerCase());
      const name = there ? dirName(there.f) : plain;
      if (!name) continue;
      path = path ? `${path}/${name}` : name;
    }
    return path;
  };
  const newFolderPath = (store, parent, raw, list = 'sets') => {
    if (!cleanFolderName(raw)) return null;
    return resolveFolderPath(store, parent ? `${parent}/${raw}` : raw, list);
  };
  // Umbenennen ändert nur den letzten Namen («/» wird «-»). Die Vorgabe
  // unverändert bestätigt heisst nichts tun — sonst würde ein alter Ordner
  // «Französisch» still zu «Franzoesisch» samt allen Dateien.
  const renameFolderTarget = (store, dir, raw, list = 'sets') => {
    const input = String(raw || '').trim();
    if (input === dirName(dir)) return null;
    const name = input ? plainName(input, '') : '';
    if (!name) return null;
    const target = parentDir(dir) ? `${parentDir(dir)}/${name}` : name;
    if (target === dir) return null;
    return folderTaken(store, target, dir, list) ? false : target;
  };
  // Umbenennen mit ganzem Pfad (MyTafelfussball): Ziel, null = nichts tun, false = belegt.
  // Nur Gross/Klein anders («verben» → «Verben») behält den getippten Namen; sonst gilt
  // resolveFolderPath (bestehende Teile bleiben, neue ohne Sonderzeichen).
  const renamePathTarget = (store, from, raw, list = 'sets') => {
    const input = String(raw || '').trim();
    if (!input || input === from) return null; // Vorgabe unverändert bestätigt
    const to = sameFolder(input, from)
      ? from.slice(0, from.lastIndexOf('/') + 1) + safeName(dirName(input), '')
      : resolveFolderPath(store, input, list);
    if (!to || to === from || inside(to, from)) return null; // nicht in sich selbst
    return folderTaken(store, to, from, list) ? false : to;
  };
  const moveFolderTarget = (store, dir, parent, list = 'sets') => {
    const target = parent ? `${parent}/${dirName(dir)}` : dirName(dir);
    if (target === dir) return null;
    return folderTaken(store, target, dir, list) ? false : target;
  };

  // ---------- Dasselbe Set ----------
  // Ort = Ordner + Titel, ohne Gross/Klein. Titel sind nur im Ordner eindeutig:
  // zwei Klassen dürfen gleiche Titel haben.
  // Der Ordner geht über safeDir, wie mirrorDir ihn auf die Platte schreibt: ein
  // alter Ordner «Kap. 1: Zellen» heisst dort «Kap. 1- Zellen» und bleibt derselbe (aus MyMemory).
  const setPlace = (s) => `${safeDir(s.dir)}\u0001${s.title}`.toLowerCase();
  const samePlace = (a, b) => setPlace(a) === setPlace(b);

  // ---------- Datei: Kopf ----------
  // Fettschrift aus dem Chat, die den ganzen Text umschliesst (`**Titel**`).
  // Nur doppelte Marker: der einfache Stern ist in MyKahoot die Lösung.
  // Auch verschachtelt (`**__Titel__**`), wie im MyKahoot-Parser.
  const BOLD_WRAP = /^(\*\*|__)([\s\S]+)\1$/;
  const stripBold = (s) => {
    let out = String(s).trim(), m;
    while ((m = out.match(BOLD_WRAP))) out = m[2].trim();
    return out;
  };
  // `de`/`en` aus dem, was in einer Sprache:-Zeile stehen kann («en», «Englisch»,
  // «German» …), sonst null — die Oberflächen können nur diese zwei (aus MyKahoot).
  const langCode = (v) => {
    const w = String(v || '').trim().toLowerCase();
    if (/^(de|deu|ger|deutsch|german)\b/.test(w)) return 'de';
    if (/^(en|eng|englisch|english)\b/.test(w)) return 'en';
    return null;
  };
  // «Sprache: en» (Einzahl) = Sprache der Oberfläche; die KI übersetzt den
  // Schlüssel gern mit («Language:»).
  const langInFile = (text) => {
    const m = String(text).match(/^(?:sprache|language)\s*:(.*)$/im);
    return (m && langCode(m[1])) || undefined;
  };
  const SET_EXT = /\.(txt|md)$/i;
  // Hiess eine Datei (`base`, ohne Endung) automatisch nach `title`, nach heutiger
  // Regel (plainName) oder der früheren (safeName)? Dann zieht sie beim
  // Umbenennen mit. Ohne Gross/Klein, Umlaute in beiden Schreibweisen (NFC).
  const isAutoName = (base, title, fallback = 'Set') => {
    const b = String(base).normalize('NFC').toLowerCase();
    return [safeName(title, fallback), plainName(title, fallback)].some((n) => n.normalize('NFC').toLowerCase() === b);
  };
  // Titel aus «# Titel», sonst aus dem Dateinamen: ohne Endung, ohne das alte
  // KI-Präfix der App (`prefix`, z. B. /^memory_+/i für «Memory_Thema.txt»),
  // «_» wird Leerzeichen. Nur so überlebt ein Titel den Weg Export → Import.
  const titleFromFile = (text, filename, prefix) => {
    const m = String(text).match(/^#\s+(.+)$/m);
    if (m) return stripBold(m[1]);
    const base = String(filename || '').replace(SET_EXT, '');
    return (prefix ? base.replace(prefix, '') || base : base).replace(/_/g, ' ').trim();
  };
  // Zeilen, die das Format nicht kennt, für den Hinweis in der Vorschau: ohne
  // Leerzeilen, «# Titel», Code-Zäune (```), die Sprache:-Zeile und was
  // `known(zeile)` kennt. `known` läuft der Reihe nach über die übrigen Zeilen
  // und darf sich darum merken, wo es steht (Folgezeilen in MyTafelfussball).
  // Liefert [{ n, line }], n = Zeilennummer ab 1.
  const LANG_LINE = /^(?:sprache|language)\s*:/i;
  const strayLines = (text, known) => String(text).split(/\r?\n/)
    .map((raw, i) => ({ n: i + 1, line: stripBold(raw) }))
    .filter(({ line }) => line && !/^#\s/.test(line) && !line.startsWith('```') && !LANG_LINE.test(line) && !known(line));
  // Die ersten drei davon für den Hinweis: «7: «Quatsch» · 9: «…»»
  const strayText = (strays, max = 3) => strays.slice(0, max).map((x) => `${x.n}: «${x.line}»`).join(' · ');
  // Kopf schreiben: «# Titel», die Kopfzeilen, eine Leerzeile. Leere Werte fallen weg.
  const fileHead = (title, lines = []) => `# ${title}\n` + lines.filter(Boolean).map((l) => `${l}\n`).join('') + '\n';

  // ---------- Link: Daten komprimiert im URL-Fragment ----------
  const b64urlEncode = (bytes) => {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const b64urlDecode = (str) => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  // `data` ist ein JSON-Array der App (Titel, Kopf, Inhalt). Neue Felder nur
  // hinten anhängen, leere Enden weglassen — so bleiben alte Links gültig und kurz.
  // `1.` = deflate-raw, `0.` = unkomprimiert (ohne CompressionStream).
  const packLink = async (data) => {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    if (typeof CompressionStream === 'function') {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return '1.' + b64urlEncode(new Uint8Array(await new Response(stream).arrayBuffer()));
    }
    return '0.' + b64urlEncode(bytes);
  };
  const unpackLink = async (str) => {
    const bytes = b64urlDecode(str.slice(2));
    const json = str.slice(0, 1) === '1'
      ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text()
      : new TextDecoder().decode(bytes);
    return JSON.parse(json);
  };

  // ---------- Browser: Herunterladen, ZIP ----------
  const download = (name, data) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  // Erst holen, was jemand braucht (Bibliothek, Spiel), und jedes nur einmal
  // (aus MyVoci). `get` liefert das Ergebnis; kommt trotz Erfolg keins an
  // (Captive Portal, Werbeblocker, Fehlerseite mit Status 200), gilt das als
  // Fehlschlag — sonst bliebe die gemerkte Promise für die ganze Sitzung auf
  // `undefined` stehen und kein späterer Versuch lüde je nach. Ein hängendes
  // Schulnetz meldet sich nie (WebKit wartet ewig): nach LOAD_TIMEOUT bricht
  // `start` ab (`signal`), damit die App auf «geht nicht» zurückfallen kann.
  const LOAD_TIMEOUT = 30000;
  const loadCache = {};
  const loadOnce = (key, get, start) => {
    const there = get();
    if (there) return Promise.resolve(there);
    if (!loadCache[key]) {
      const stop = new AbortController();
      const timer = setTimeout(() => stop.abort(), LOAD_TIMEOUT);
      loadCache[key] = start(stop.signal)
        .then(() => { const got = get(); if (!got) throw new Error(key); return got; })
        .catch((e) => { loadCache[key] = null; throw e; })
        .finally(() => clearTimeout(timer));
    }
    return loadCache[key];
  };
  const loadScript = (url, get) => loadOnce(url, get, (signal) => new Promise((ok, fail) => {
    const el = document.createElement('script');
    el.src = url;
    const giveUp = () => { el.remove(); fail(new Error(url)); };
    el.onload = () => (get() ? ok() : giveUp());
    el.onerror = giveUp;
    signal.addEventListener('abort', giveUp);
    document.head.appendChild(el);
  }));
  // JSZip erst beim Export holen: wer nur einem Link folgt, lädt sonst 100 KB
  // für einen Knopf, den er nie drückt.
  const loadJsZip = () => loadScript('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js', () => window.JSZip);

  // ---------- Browser: Ordner auf der Platte ----------
  // File System Access API (Chrome/Edge am Computer). Safari/iPad: nichts, dort
  // bleibt die Sicherung als Datei. Der Handle überlebt nur in IndexedDB
  // (`<app>` → `kv` → `dir`), nicht in localStorage.
  const dirSupported = () => typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
  const handleStore = (dbName) => {
    const openDb = () => new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const run = async (mode, act) => {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const req = act(db.transaction('kv', mode).objectStore('kv'));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    };
    return {
      load: () => run('readonly', (kv) => kv.get('dir')).catch(() => undefined),
      save: (h) => run('readwrite', (kv) => (h ? kv.put(h, 'dir') : kv.delete('dir'))).catch(() => {}),
    };
  };
  // Beim ersten Mal in «Dokumente» (dort liegt ~/Documents/My<App>), danach
  // merkt sich der Browser über `id` den zuletzt gewählten Ort.
  const pickDir = (app) => window.showDirectoryPicker({ id: app, mode: 'readwrite', startIn: 'documents' });

  // Alle Ordner-Zugriffe laufen über eine Promise-Kette: ein Nachlesen beim
  // Fokus darf nicht in ein halb geschriebenes Set hineinlesen. Ein Fehler
  // bricht die Kette nicht ab und geht nur an `onError` — der zurückgegebene
  // Promise lehnt nie ab, Aufrufer dürfen ihn also liegen lassen.
  const queue = (onError = () => {}) => {
    let chain = Promise.resolve();
    return (job) => {
      const run = chain.then(job).catch(onError);
      chain = run.then(() => {}); // die Kette hält das Ergebnis des Jobs nicht fest
      return run;
    };
  };

  const dirOf = async (root, path, create) => {
    let h = root;
    for (const part of path.split('/').filter(Boolean)) h = await h.getDirectoryHandle(part, { create });
    return h;
  };
  const splitPath = (path) => [parentDir(path), dirName(path)];
  const writeFile = async (root, path, text) => {
    const [dir, name] = splitPath(path);
    const fh = await (await dirOf(root, dir, true)).getFileHandle(name, { create: true });
    const w = await fh.createWritable();
    await w.write(text);
    await w.close();
  };
  const removeFile = async (root, path) => {
    const [dir, name] = splitPath(path);
    try { await (await dirOf(root, dir, false)).removeEntry(name); } catch { /* schon weg */ }
  };
  // Nur leere Ordner gehen. Was der Finder hinterlässt (.DS_Store, ._*), zählt
  // nicht — sonst bliebe ein geleerter Ordner stehen und käme als Geisterordner
  // zurück. Andere versteckte Dateien (.notizen, .gitkeep) gehören jemandem:
  // dann bleibt der Ordner stehen.
  const FINDER_JUNK = /^(\.DS_Store|\._.*)$/;
  const removeEmptyDir = async (root, path) => {
    try {
      const h = await dirOf(root, path, false);
      const junk = [];
      for await (const name of h.keys()) {
        if (!FINDER_JUNK.test(name)) return;
        junk.push(name);
      }
      for (const name of junk) await h.removeEntry(name);
      const [dir, name] = splitPath(path);
      await (await dirOf(root, dir, false)).removeEntry(name);
    } catch { /* nicht da oder nicht leer */ }
  };

  const READ_BATCH = 16;

  // ---------- Eine Sammlung ----------
  // Bindet die Regeln an das Set-Format einer App:
  //   list       Schlüssel der Sets in der Sammlung (Standard 'sets')
  //   items      Schlüssel des Inhalts ('words', 'pairs', 'tasks', 'questions');
  //              ein Set ohne Inhalt gibt es nicht
  //   toFile     (set) → Dateitext, Gegenstück zu parseFile
  //   parseFile  (text, filename) → { title, [items]: […], … }
  //   merge      (aus Datei, aus Browser) → Inhalt; beim ersten Verbinden werden
  //              gleiche Sets vereint statt ersetzt (ohne: die Datei gilt)
  //   fallback   Dateiname, wenn vom Titel nichts übrig bleibt ('Voci', 'Memory' …)
  //   newId      () → neue id
  const sammlung = (cfg) => {
    const { items, toFile, parseFile, merge, fallback = 'Set', list = 'sets' } = cfg;
    // Je Ordner-Handle: Lese-Cache (readDir) und `known` = ids, die mirrorDir dort
    // geschrieben hat (fromDisk). `forget(root)` beim Trennen.
    const caches = new WeakMap(), knowns = new WeakMap();
    const knownFor = (root) => knowns.get(root) || knowns.set(root, new Set()).get(root);
    const forget = (root) => { caches.delete(root); knowns.delete(root); };
    const newId = cfg.newId || (() => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)));
    const hasContent = (s) => Array.isArray(s[items]) && s[items].length > 0;

    // `file` steht nur bei abweichendem Dateinamen am Set (von Hand angelegt):
    // heisst die Datei wie der Titel, nimmt ein Umbenennen in der App sie mit.
    const fileName = (set) => set.file || `${plainName(set.title, fallback)}.txt`;
    const setPath = (set) => `${set.dir ? safeDir(set.dir) + '/' : ''}${fileName(set)}`;
    // Gleiche Datei: «Unité 3» und «Unite 3» landen im selben Ordner in derselben
    // Datei — mirrorDir schriebe beide dorthin, beim Nachlesen fiele eines weg.
    const samePath = (a, b) => sameFolder(a.dir || '', b.dir || '') && fileName(a).toLowerCase() === fileName(b).toLowerCase();
    const sameSlot = (a, b) => samePlace(a, b) || samePath(a, b);
    // Belegt `set` einen Platz, den schon ein anderes Set hat? (Editor, Import, Verschieben)
    const slotTaken = (sets, set, exceptId) => sets.find((s) => s.id !== exceptId && sameSlot(s, set));

    // Liest den ganzen Ordner: Sets noch ohne id (die vergibt fromDisk). Eine
    // Datei mit gleicher Grösse und Änderungszeit wird nicht neu gelesen — der
    // Fokus liest sonst bei jedem Fensterwechsel alles. Der Cache gilt je Ordner.
    const readDir = async (root, cache = caches.get(root) || caches.set(root, new Map()).get(root)) => {
      const files = [], folders = [];
      const walk = async (handle, dir) => {
        for await (const [name, entry] of handle.entries()) {
          if (name.startsWith('.')) continue;
          if (entry.kind === 'directory') {
            const path = dir ? `${dir}/${name}` : name;
            folders.push(path);
            await walk(entry, path);
          } else if (SET_EXT.test(name)) files.push({ name, dir, entry });
        }
      };
      await walk(root, '');
      const readOne = async ({ name, dir, entry }) => {
        const file = await entry.getFile();
        const key = `${dir}/${name}`, hit = cache.get(key);
        let parsed;
        if (hit && hit.mod === file.lastModified && hit.size === file.size) parsed = hit.parsed;
        else {
          parsed = parseFile(await file.text(), name);
          cache.set(key, { mod: file.lastModified, size: file.size, parsed });
        }
        // `disk` = «lag schon einmal im Ordner»: fehlt so ein Set beim Nachlesen,
        // wurde es im Finder gelöscht; eines ohne wurde bloss noch nie geschrieben.
        const set = { ...parsed, dir, disk: true };
        return name === fileName(set) ? set : { ...set, file: name };
      };
      // Gebündelt lesen: einzeln abgewartet kostet jede Datei eine Runde ins
      // Dateisystem, alle auf einmal laufen bei grossen Ordnern in Grenzen.
      const read = [];
      for (let i = 0; i < files.length; i += READ_BATCH) read.push(...await Promise.all(files.slice(i, i + READ_BATCH).map(readOne)));
      // Gelöschte und umbenannte Dateien aus dem Cache, sonst wächst er bei
      // jedem Umbenennen weiter, solange das Fenster offen ist.
      const seen = new Set(files.map(({ name, dir }) => `${dir}/${name}`));
      for (const key of cache.keys()) if (!seen.has(key)) cache.delete(key);
      return { [list]: read.filter(hasContent), folders };
    };

    // Schreibt nur, was sich geändert hat: Diff über die id, verglichen werden
    // Pfad und Dateiinhalt. Gelöscht → Datei weg; umbenannt/verschoben → alte
    // Datei weg, neue hin; leer gewordene Ordner werden mitgeräumt. `prev` ist
    // der Stand, den der Ordner zuletzt sah (`mirrored`), nicht der letzte im Browser.
    const mirrorDir = async (root, prev, next) => {
      const before = new Map(prev[list].map((s) => [s.id, s]));
      const prevFolders = allFolders(prev, list), nextFolders = allFolders(next, list);
      for (const f of nextFolders) if (!prevFolders.includes(f)) await dirOf(root, safeDir(f), true);
      // Verglichen wird pro Datei, nicht pro Set: weg kommt jeder alte Pfad, den
      // kein Set mehr hat, geschrieben wird, was neu ist oder sich geändert hat.
      // Erst alles weg, dann alles hin, je nebeneinander (beim Verbinden oder
      // Verschieben eines Ordners sind das sonst Dutzende Vorgänge nacheinander).
      // So fallen «Brüche» gelöscht + «Bruch» → «Brüche» und ein Namenstausch von
      // selbst richtig aus, und «brüche» → «Brüche» nimmt die Schreibweise mit.
      const nextPaths = new Set(next[list].map(setPath));
      const drops = [...new Set(prev[list].map(setPath))].filter((p) => !nextPaths.has(p));
      const writes = [];
      for (const s of next[list]) {
        const old = before.get(s.id);
        if (old === s) continue; // unverändert — spart das Serialisieren
        const path = setPath(s), text = toFile(s);
        if (!old || setPath(old) !== path || toFile(old) !== text) writes.push({ path, text });
      }
      await Promise.all(drops.map((p) => removeFile(root, p)));
      await Promise.all(writes.map((w) => writeFile(root, w.path, w.text)));
      for (const s of next[list]) knownFor(root).add(s.id);
      // Ordner erst danach und von innen nach aussen: leer ist er erst ohne Dateien
      const gone = prevFolders.filter((f) => !nextFolders.includes(f)).sort((a, b) => b.length - a.length);
      for (const f of gone) await removeEmptyDir(root, safeDir(f));
    };

    // Vom Ordner in die Sammlung. Die id trägt alles, was an einem Set hängt
    // (Lernstand, geladenes Set), sie soll also am richtigen Set kleben bleiben.
    // `keepAll` nur beim ausdrücklichen Verbinden: dann bleiben auch Sets, die
    // schon einmal im Ordner lagen (Ordnerwechsel), und gleiche Sets werden
    // vereint. Sonst gilt der Ordner allein. Was mirrorDir in `root` geschrieben
    // hat, zählt wie `disk` (aus MyMemory) — sonst käme ein eben gespeichertes und
    // dann im Finder gelöschtes Set beim nächsten Fokus zurück.
    // Zurück kommt neben `next` auch `onDisk`: der reine Inhalt des Ordners, gegen
    // den mirrorDir seine Differenz bildet (also der neue `mirrored`).
    const fromDisk = (prev, disk, keepAll, root) => {
      const known = root ? knownFor(root) : new Set();
      const wasOnDisk = (s) => s.disk || known.has(s.id);
      // Ein Ort kann in alten Ständen doppelt vorkommen (früher zählte Gross/Klein):
      // dann bekommt jede Datei das nächste noch freie Set dieses Orts.
      const byPlace = new Map();
      for (const s of prev[list]) {
        const k = setPlace(s);
        (byPlace.get(k) || byPlace.set(k, []).get(k)).push(s);
      }
      const used = new Set();
      const take = (d, old) => {
        used.add(old.id);
        return { ...d, id: old.id, ...(keepAll && merge ? { [items]: merge(d[items], old[items]) } : {}) };
      };
      // Erst der sichere Treffer: gleicher Ort.
      const first = disk[list].map((d) => {
        const old = (byPlace.get(setPlace(d)) || []).find((s) => !used.has(s.id));
        return old ? take(d, old) : { ...d, id: null };
      });
      // Dann verschoben oder umbenannt — nur für Sets, die schon einmal im Ordner
      // lagen und deren Titel auf beiden Seiten genau einmal vorkommt. Sonst
      // erbte die Datei der einen Klasse das gleichnamige Set der anderen.
      const titleKey = (s) => s.title.toLowerCase(); // wie setPlace
      const free = new Map();
      for (const s of prev[list]) if (!used.has(s.id) && wasOnDisk(s)) free.set(titleKey(s), free.has(titleKey(s)) ? null : s);
      const want = {};
      for (const d of first) if (!d.id) want[titleKey(d)] = (want[titleKey(d)] || 0) + 1;
      const sets = first.map((d) => {
        if (d.id) return d;
        const old = want[titleKey(d)] === 1 && free.get(titleKey(d));
        return old ? take(d, old) : { ...d, id: newId() };
      });
      // Bewusst nicht aus `sets`: dort steckt beim Verbinden schon das Vereinte,
      // und genau das soll mirrorDir noch in die Datei schreiben.
      // Ohne Vereinen dasselbe Objekt wie in `next`: dann greift in mirrorDir
      // `old === s`, und das nächste Spiegeln serialisiert nichts neu.
      const onDisk = { [list]: disk[list].map((d, i) => (sets[i][items] === d[items] ? sets[i] : { ...d, id: sets[i].id })).sort(byTitle), folders: disk.folders };
      const local = prev[list].filter((s) => !used.has(s.id) && (keepAll || !wasOnDisk(s)));
      const next = {
        ...prev,
        [list]: [...sets, ...local].sort(byTitle),
        folders: [...new Set([...disk.folders, ...(keepAll ? prev.folders : [])])],
      };
      return { next, onDisk };
    };

    // Alle Sets samt Ordnern (auch leeren) in einem ZIP. Gleiche Dateinamen im
    // selben Ordner bekommen eine Nummer, damit keiner den anderen überschreibt.
    const zipBlob = async ({ [list]: sets, folders }) => {
      const JSZip = await loadJsZip();
      const zip = new JSZip();
      const used = new Set();
      for (const f of folders) zip.folder(safeDir(f));
      for (const s of sets) {
        const path = setPath(s), ext = path.match(SET_EXT)[0], base = path.slice(0, -ext.length);
        let name = path;
        for (let i = 2; used.has(name.toLowerCase()); i++) name = `${base} (${i})${ext}`;
        used.add(name.toLowerCase());
        zip.file(name, toFile(s));
      }
      return zip.generateAsync({ type: 'blob' });
    };

    // Umbenannt in der App: Hiess die Datei bisher automatisch nach dem alten
    // Titel (alte Regel `safeName` oder `plainName`), fällt `file` weg und die
    // Datei zieht mit dem Titel um — sonst klebte der alte Name fest. Von Hand
    // benannte Dateien (`Fremd.txt`) behalten ihren Namen.
    const dropAutoFile = (old, saved) => {
      if (!old || !old.file || old.title === saved.title || !saved.file) return saved;
      if (!isAutoName(old.file.replace(SET_EXT, ''), old.title, fallback)) return saved;
      const { file, ...rest } = saved;
      return rest;
    };

    // Speichern aus dem Editor: neues Set bekommt eine id, ein umbenanntes nimmt
    // seine automatisch benannte Datei mit (dropAutoFile gegen den alten Stand).
    const prepareSave = (store, set) => (set.id
      ? dropAutoFile(store[list].find((s) => s.id === set.id), set)
      : { ...set, id: newId() });

    // Alte Stände mit einer früheren Namensregel können zwei Sets haben, die
    // dieselbe Datei ergeben («Unité 3»/«Unite 3»): mirrorDir schriebe beide
    // dorthin, beim Nachlesen fiele eines weg. Einmal beim Laden aufrufen, dann
    // bekommt das zweite einen eigenen Dateinamen («Unite 3 (2).txt») — die
    // einzige Stelle, an der ausgewichen wird (sonst verhindert slotTaken das).
    const resolveSlots = (store) => {
      const taken = new Set();
      let changed = false;
      const sets = store[list].map((s) => {
        const f = fileName(s), ext = f.match(SET_EXT)[0], base = f.slice(0, -ext.length);
        for (let i = 2; taken.has(setPath(s).toLowerCase()); i++) { s = { ...s, file: `${base} (${i})${ext}` }; changed = true; }
        taken.add(setPath(s).toLowerCase());
        return s;
      });
      return changed ? { ...store, [list]: sets } : store;
    };

    // Sicherung: Ordner-Buchführung (`disk`, `file`) ist kein Inhalt — auf einem
    // fremden Gerät stünde sonst «lag schon im Ordner».
    const contentOf = ({ disk, file, ...s }) => s; // ohne Ordner-Buchführung, für beide Richtungen
    const backupSets = (sets) => sets.map(contentOf);
    const backupFile = (store, app, extra = {}) =>
      JSON.stringify({ app, version: 1, ...extra, [list]: backupSets(store[list]), folders: store.folders }, null, 1);
    // Sicherung einlesen ergänzt, was fehlt, und ersetzt nichts: ein Set am selben
    // Platz (sameSlot) bekommt nur, was ihm fehlt (cfg.merge), neue kommen dazu.
    // Zurück: der neue Stand, wie viele Sets neu sind oder etwas dazubekamen, und welche ids der Sicherung
    // auf welche hier zeigen (für App-eigenes wie den Lernstand). null = keine
    // Sicherung dieser App.
    const restoreBackup = (store, data, app) => {
      if (!data || data.app !== app || !Array.isArray(data[list])) return null;
      const next = [...store[list]];
      const byPlace = new Map(), byPath = new Map();
      const index = (s, i) => { byPlace.set(setPlace(s), i); byPath.set(setPath(s).toLowerCase(), i); };
      next.forEach(index);
      const idMap = {};
      let count = 0;
      for (const s of data[list]) {
        if (!s || typeof s.title !== 'string' || !hasContent(s)) continue;
        // Ordner-Buchführung einer fremden Sicherung gilt hier nicht (sonst gälte das Set
        // als «lag schon im Ordner» und verschwände beim nächsten Nachlesen); den Ordner
        // so, wie mirrorDir ihn auf die Platte schriebe
        const incoming = { ...contentOf(s), dir: safeDir(typeof s.dir === 'string' ? s.dir : '') };
        const i = byPlace.get(setPlace(incoming)) ?? byPath.get(setPath(incoming).toLowerCase());
        if (i !== undefined) {
          idMap[s.id] = next[i].id;
          const merged = merge ? merge(next[i][items], incoming[items]) : next[i][items];
          if (merged.length === next[i][items].length) continue; // nichts dazu: unverändert, nicht gezählt
          next[i] = { ...next[i], [items]: merged };
        } else {
          const added = { ...incoming, id: newId() };
          next.push(added);
          index(added, next.length - 1);
          idMap[s.id] = added.id;
        }
        count++;
      }
      const folders = [...new Set([...store.folders, ...(Array.isArray(data.folders) ? data.folders.filter((f) => typeof f === 'string').map(safeDir).filter(Boolean) : [])])];
      return { next: { ...store, [list]: next.sort(byTitle), folders }, count, idMap };
    };

    return {
      fileName, setPath, sameSlot, slotTaken, readDir, mirrorDir, fromDisk, forget, zipBlob, backupSets, backupFile, restoreBackup,
      dropAutoFile, prepareSave, resolveSlots,
      // die Ordner-Helfer, an den Listen-Schlüssel dieser Sammlung gebunden
      allFolders: (store) => allFolders(store, list),
      remapDir: (store, from, to) => remapDir(store, from, to, list),
      folderTaken: (store, target, self) => folderTaken(store, target, self, list),
      resolveFolderPath: (store, raw) => resolveFolderPath(store, raw, list),
      newFolderPath: (store, parent, raw) => newFolderPath(store, parent, raw, list),
      renameFolderTarget: (store, dir, raw) => renameFolderTarget(store, dir, raw, list),
      renamePathTarget: (store, from, raw) => renamePathTarget(store, from, raw, list),
      moveFolderTarget: (store, dir, parent) => moveFolderTarget(store, dir, parent, list),
    };
  };

  return {
    safeName, safeDir, plainName, cleanFolderName,
    dirName, parentDir, inside, sameFolder, collate, byTitle, allFolders, remapDir, folderTaken,
    resolveFolderPath, newFolderPath, renameFolderTarget, renamePathTarget, moveFolderTarget,
    setPlace, samePlace,
    stripBold, langCode, langInFile, titleFromFile, fileHead, isAutoName, strayLines, strayText,
    b64urlEncode, b64urlDecode, packLink, unpackLink,
    download, loadOnce, loadScript, loadJsZip,
    dirSupported, handleStore, pickDir, queue,
    sammlung,
  };
});
