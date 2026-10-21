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
  const collate = (a, b) => a.localeCompare(b, 'de', { numeric: true, sensitivity: 'base' });
  const byTitle = (a, b) => collate(a.title, b.title);
  // Alle Ordner: die gemerkten (auch leere) plus jeder Pfad samt Eltern, in dem ein Set liegt
  const allFolders = ({ sets, folders }) => {
    const all = new Set(folders);
    for (const s of sets) for (let d = s.dir || ''; d; d = parentDir(d)) all.add(d);
    return [...all].sort(collate);
  };
  // Ordner umbenennen/verschieben: alle Pfade darunter mitnehmen
  const remapDir = (store, from, to) => {
    const move = (d) => (inside(d, from) ? to + d.slice(from.length) : d);
    return { ...store, sets: store.sets.map((s) => ({ ...s, dir: move(s.dir || '') })), folders: [...new Set(store.folders.map(move))] };
  };
  // Liegt am Ziel schon ein Ordner dieses Namens? `self` ist der Ordner, der
  // selbst umzieht — sonst ginge «Verben» → «verben» nicht.
  const folderTaken = (store, target, self) => allFolders(store).some((f) => f !== self && sameFolder(f, target));

  // ---------- Dasselbe Set ----------
  // Ort = Ordner + Titel, ohne Gross/Klein. Titel sind nur im Ordner eindeutig:
  // zwei Klassen dürfen gleiche Titel haben.
  const setPlace = (s) => `${s.dir || ''}\u0001${s.title}`.toLowerCase();
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
  // Titel aus «# Titel», sonst aus dem Dateinamen: ohne Endung, ohne das alte
  // KI-Präfix der App (`prefix`, z. B. /^memory_+/i für «Memory_Thema.txt»),
  // «_» wird Leerzeichen. Nur so überlebt ein Titel den Weg Export → Import.
  const titleFromFile = (text, filename, prefix) => {
    const m = String(text).match(/^#\s+(.+)$/m);
    if (m) return stripBold(m[1]);
    const base = String(filename || '').replace(SET_EXT, '');
    return (prefix ? base.replace(prefix, '') || base : base).replace(/_/g, ' ').trim();
  };
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
  //   items      Schlüssel des Inhalts ('words', 'pairs', 'tasks', 'questions');
  //              ein Set ohne Inhalt gibt es nicht
  //   toFile     (set) → Dateitext, Gegenstück zu parseFile
  //   parseFile  (text, filename) → { title, [items]: […], … }
  //   merge      (aus Datei, aus Browser) → Inhalt; beim ersten Verbinden werden
  //              gleiche Sets vereint statt ersetzt (ohne: die Datei gilt)
  //   fallback   Dateiname, wenn vom Titel nichts übrig bleibt ('Voci', 'Memory' …)
  //   newId      () → neue id
  const sammlung = (cfg) => {
    const { items, toFile, parseFile, merge, fallback = 'Set' } = cfg;
    const caches = new WeakMap(); // Lese-Cache je Ordner-Handle (readDir)
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
      return { sets: read.filter(hasContent), folders };
    };

    // Schreibt nur, was sich geändert hat: Diff über die id, verglichen werden
    // Pfad und Dateiinhalt. Gelöscht → Datei weg; umbenannt/verschoben → alte
    // Datei weg, neue hin; leer gewordene Ordner werden mitgeräumt. `prev` ist
    // der Stand, den der Ordner zuletzt sah (`mirrored`), nicht der letzte im Browser.
    const mirrorDir = async (root, prev, next) => {
      const before = new Map(prev.sets.map((s) => [s.id, s]));
      const prevFolders = allFolders(prev), nextFolders = allFolders(next);
      for (const f of nextFolders) if (!prevFolders.includes(f)) await dirOf(root, safeDir(f), true);
      // Verglichen wird pro Datei, nicht pro Set: weg kommt jeder alte Pfad, den
      // kein Set mehr hat, geschrieben wird, was neu ist oder sich geändert hat.
      // Erst alles weg, dann alles hin, je nebeneinander (beim Verbinden oder
      // Verschieben eines Ordners sind das sonst Dutzende Vorgänge nacheinander).
      // So fallen «Brüche» gelöscht + «Bruch» → «Brüche» und ein Namenstausch von
      // selbst richtig aus, und «brüche» → «Brüche» nimmt die Schreibweise mit.
      const nextPaths = new Set(next.sets.map(setPath));
      const drops = [...new Set(prev.sets.map(setPath))].filter((p) => !nextPaths.has(p));
      const writes = [];
      for (const s of next.sets) {
        const old = before.get(s.id);
        if (old === s) continue; // unverändert — spart das Serialisieren
        const path = setPath(s), text = toFile(s);
        if (!old || setPath(old) !== path || toFile(old) !== text) writes.push({ path, text });
      }
      await Promise.all(drops.map((p) => removeFile(root, p)));
      await Promise.all(writes.map((w) => writeFile(root, w.path, w.text)));
      // Ordner erst danach und von innen nach aussen: leer ist er erst ohne Dateien
      const gone = prevFolders.filter((f) => !nextFolders.includes(f)).sort((a, b) => b.length - a.length);
      for (const f of gone) await removeEmptyDir(root, safeDir(f));
    };

    // Vom Ordner in die Sammlung. Die id trägt alles, was an einem Set hängt
    // (Lernstand, geladenes Set), sie soll also am richtigen Set kleben bleiben.
    // `keepAll` nur beim ausdrücklichen Verbinden: dann bleiben auch Sets, die
    // schon einmal im Ordner lagen (Ordnerwechsel), und gleiche Sets werden
    // vereint. Sonst gilt der Ordner allein.
    // Zurück kommt neben `next` auch `onDisk`: der reine Inhalt des Ordners, gegen
    // den mirrorDir seine Differenz bildet (also der neue `mirrored`).
    const fromDisk = (prev, disk, keepAll) => {
      // Ein Ort kann in alten Ständen doppelt vorkommen (früher zählte Gross/Klein):
      // dann bekommt jede Datei das nächste noch freie Set dieses Orts.
      const byPlace = new Map();
      for (const s of prev.sets) {
        const k = setPlace(s);
        (byPlace.get(k) || byPlace.set(k, []).get(k)).push(s);
      }
      const used = new Set();
      const take = (d, old) => {
        used.add(old.id);
        return { ...d, id: old.id, ...(keepAll && merge ? { [items]: merge(d[items], old[items]) } : {}) };
      };
      // Erst der sichere Treffer: gleicher Ort.
      const first = disk.sets.map((d) => {
        const old = (byPlace.get(setPlace(d)) || []).find((s) => !used.has(s.id));
        return old ? take(d, old) : { ...d, id: null };
      });
      // Dann verschoben oder umbenannt — nur für Sets, die schon einmal im Ordner
      // lagen und deren Titel auf beiden Seiten genau einmal vorkommt. Sonst
      // erbte die Datei der einen Klasse das gleichnamige Set der anderen.
      const titleKey = (s) => s.title.toLowerCase(); // wie setPlace
      const free = new Map();
      for (const s of prev.sets) if (!used.has(s.id) && s.disk) free.set(titleKey(s), free.has(titleKey(s)) ? null : s);
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
      const onDisk = { sets: disk.sets.map((d, i) => (sets[i][items] === d[items] ? sets[i] : { ...d, id: sets[i].id })).sort(byTitle), folders: disk.folders };
      const local = prev.sets.filter((s) => !used.has(s.id) && (keepAll || !s.disk));
      const next = {
        ...prev,
        sets: [...sets, ...local].sort(byTitle),
        folders: [...new Set([...disk.folders, ...(keepAll ? prev.folders : [])])],
      };
      return { next, onDisk };
    };

    // Alle Sets samt Ordnern (auch leeren) in einem ZIP. Gleiche Dateinamen im
    // selben Ordner bekommen eine Nummer, damit keiner den anderen überschreibt.
    const zipBlob = async ({ sets, folders }) => {
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

    // Sicherung: Ordner-Buchführung (`disk`, `file`) ist kein Inhalt — auf einem
    // fremden Gerät stünde sonst «lag schon im Ordner».
    const backupSets = (sets) => sets.map(({ disk, file, ...s }) => s);

    return { fileName, setPath, sameSlot, slotTaken, readDir, mirrorDir, fromDisk, zipBlob, backupSets };
  };

  return {
    safeName, safeDir, plainName, cleanFolderName,
    dirName, parentDir, inside, sameFolder, collate, byTitle, allFolders, remapDir, folderTaken,
    setPlace, samePlace,
    stripBold, langCode, langInFile, titleFromFile, fileHead,
    b64urlEncode, b64urlDecode, packLink, unpackLink,
    download, loadOnce, loadScript, loadJsZip,
    dirSupported, handleStore, pickDir, queue,
    sammlung,
  };
});
