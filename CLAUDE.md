# CLAUDE.md

Vokabeltrainer für den Unterricht, clientseitig wie MyMemory: **eine**
`index.html` (React 18 + Tailwind + Babel standalone per CDN, kein
Build-Schritt), `localStorage` als einziger Speicher, Teilen über das
`#`-Fragment. GitHub Pages ab `main`, Ordner `/`. Roadmap: PLAN.md.
Sprache im Code, in Kommentaren und in Commits: **Deutsch**.

```bash
python3 -m http.server   # lokal testen, dann http://localhost:8000
```
Datei direkt im Browser öffnen geht nicht (Clipboard, `fetch`).

## Aufbau der index.html

Ein einziges `<script type="text/babel">`, gegliedert durch
`// ---------- Abschnitt ----------`-Kommentare. Reihenfolge grob: Speicher →
Sprache/I18N → Beispiel-Sets → KI-Prompt → Parser/Export → Ordner → Lernstand →
Direktlinks → Routing → **Korrektur** → Vorlesen/Spracherkennung/Vollbild →
Bausteine (Modal, Icons, QR, Scanner, Anleitung, Einstellungen) → Seiten.

Die Übersicht ist gebaut wie die Quiz-Auswahl in MyKahoot: schlanke Zeilen
statt Kacheln (`row`/`folderBox` in `Selection`), Titel in fester Spalte mit
der Wortzahl dahinter in einer Flucht, rechts transparente Symbolknöpfe
(`RowTool`, nicht `IconButton` — der bleibt für die Kacheln auf den anderen
Seiten), Ordnerinhalt an einer Linie eingerückt.

Seiten-Komponenten: `Selection` (Übersicht) · `SetEditor` · `SetPage`
(Rundeneinstellungen + Lernstand + Teilen) · `Practice` (alle Modi ausser
Zuordnen) · `MatchRound` (Zuordnen) · `Summary` · `Trainer` (Set-Seite → Runde →
Ende) · `Open` (Set aus der Route laden) · `App`.

## Datenmodell

Ein Set: `{ id, title, dir, langs: ['de','fr'], lang, words: [{ a, b, s: [], h }] }`
— `a`/`b` die zwei Seiten, `s` Anwendungssätze, `h` Hinweis, `lang` die
Oberflächensprache beim Üben. Gespeichert wird `{ sets, folders }` unter
`myvoci`; Ordner sind Pfad-Strings wie in MyKahoot/MyMemory.

**Dateiformat** bleibt kompatibel zu MyMemory/MyTafelfussball (`F:`/`A:`/`---`);
`S:`, `H:` und `Sprachen: de → fr` sind Zusätze, die die anderen Apps überlesen.
`Sprache:` (Einzahl) ist wie dort die Oberflächensprache — nicht verwechseln.

**Ordner auf der Platte** (wie `quizzes/` in MyKahoot, Abschnitt «Ordner auf
der Platte»): In Chrome/Edge am Computer öffnet die File System Access API
einen Ordner; die Sets liegen dort als `.txt`, Unterordner = Ordner. Der
Handle steckt in IndexedDB (`myvoci` → `kv` → `dir`), localStorage bleibt
Zwischenspeicher. `readDir` liest alles, `fromDisk` hängt die ids per
Ordner+Titel um (daran hängt der Lernstand) und liefert `onDisk` mit,
`mirrorDir` schreibt nur die Differenz (Diff über die id, Vergleich von Pfad
und Dateiinhalt). Beim Verbinden (`keepLocal`) bleiben Sets, die nur im
Browser liegen, und wandern in den Ordner; beim Start und beim Fenster-Fokus
gilt der Ordner allein. `file` am Set merkt den echten Dateinamen, damit eine
von Hand angelegte `Fremd.txt` nach einer Umbenennung nicht als Waise
liegen bleibt. Safari/iPad: kein Ordner, dort bleibt die Sicherung als Datei.

**Lernstand** getrennt davon unter `myvoci_progress`:
`{ <setKey>: { <wordKey>: { ok, bad, box, last, lastOk } } }`. `setKey` ist die
id (eigene Sets) oder `demo:<id>` (Beispiele). `wordKey` ist `ab`.
Leitner-Fächer 1–5, fällig nach `BOX_DAYS`. Steckt **nie** im Link.

**Geteilte Links bleiben** (`keepLink` in `App`): ein `#v=`-Link (Direktlink
und QR-Code sind dieselbe Adresse) wird beim Öffnen übernommen wie ein Import
und als eigenes Set unter `#local=<id>` geöffnet, die Optionen des Links
(`&mode=…&go=1`) bleiben dran. Gleicher Ort (Wurzel + Titel) = dasselbe Set,
ein korrigierter Link ersetzt es also; liegt das Set unverändert schon
irgendwo (die Lehrperson öffnet den eigenen Link), wird das geöffnet, ohne
Zweitkopie. Ein alter Lernstand unter `link:<titel>` wandert auf die id.

## Korrektur (`checkAnswer`) — kein Modell, nur Regeln

Abgestuft: normalisieren (Apostrophe, ß/ss, Satzzeichen) → Alternativen mit `/`
→ Klammern `(la) maison` optional → Gross/klein → Akzente → Artikel
(`ARTICLES` pro Sprache) → ein Tippfehler (Levenshtein ≤ 1 ab vier Zeichen).
Drei Stufen: `strict` / `normal` / `loose`. Ergebnis
`{ status: right|almost|wrong, solution, note }`; `almost` gilt als gewusst.
`charDiff` zeigt die Abweichung buchstabenweise.

Die reine Logik lässt sich ohne Browser testen: Abschnitte aus der Datei
schneiden und mit `node` prüfen (so entstanden die 26 Fälle in Phase 2).

## Handschrift-Erkennung (MyScript, optional)

Mit zwei Schlüsseln aus developer.myscript.com (`myvoci_myscript` im
localStorage, Eingabe in den Einstellungen jeder Seite, von der aus geübt wird —
`MyScriptKeys`; «Auf ein anderes Gerät bringen» zeigt einen QR-Code/Link
`#k=…`, der nur die Schlüssel trägt: `takeKeysFromHash` speichert sie beim
Laden und streicht den Teil sofort aus der Adresse, `keysArrived` löst die
einmalige Meldung in der Übersicht aus — Familien-Geräte, nie der Set-Link)
erkennt der Handschrift-Modus das Geschriebene: `InkPad` lädt
`iink-ts` erst bei Bedarf per CDN (`loadScript`), Variante `INK_V2`, Sprache aus
`IINK_LANG`. Erkannt wird **nur auf Verlangen** (`exportContent: 'DEMAND'`):
«Prüfen» holt per `export()` den Text und wertet ihn wie eine Eingabe
(`checkInk` → `settle`). Ohne Schlüssel, bei einer Sprache ohne Paket
(`inkNoLang`) oder wenn Laden/Anmelden scheitert (`inkFail`) bleibt die Fläche
ohne Erkennung (`Sketch`). Beide Wege teilen **einen** Zweig in `Practice`:
«Aufdecken» mit Selbstbewertung gibt es immer, «Prüfen» kommt nur dazu — sonst
käme niemand an einem Wort vorbei, das er nicht weiss, und ein falsch gelesenes
Wort liesse sich nicht richtigstellen.

## Anleitung (`Help`, `?`-Knopf oben)

Die langen Erklärtexte stehen **an einer Stelle**: ein Modal mit vier
Abschnitten (`HELP_SECTIONS`: iPad · Handschrift-Erkennung einrichten · Ordner
auf dem Computer · Codes scannen), Titel und Schritte je über eine Tabelle auf
I18N-Schlüssel (`HELP_TITLE`/`HELP_STEPS`). Vorher lagen sie verstreut in den
Einstellungen (`myscriptHint`, `dirHint` — beide zu `…Short` gekürzt) und im
Kasten «Üben auf dem iPad» zuunterst in der Übersicht, den es nicht mehr gibt.
In den Einstellungen bleiben die Bedienelemente plus eine Zeile mit `HelpLink`
in den passenden Abschnitt (`only`).

`only` ist kein Luxus: die Schlüsselfelder (`MyScriptKeys`) stehen auf **jeder**
Seite, von der aus geübt wird — wer über einen geteilten Link kommt, sieht die
Übersicht mit dem `?`-Knopf nie. Darum hält `MyScriptKeys` seinen eigenen
`Help only="ink"`.

`Modal` nimmt neu `wide` und begrenzt für alle die Höhe (`max-h-[85vh]`,
scrollend) — die Anleitung ist länger als ein iPhone hoch, und der Scanner
passte dort auch schon knapp nicht.

## QR-Code in der App scannen (`Scanner`)

Der Knopf trägt einen **Sucher-Rahmen** (`ScanIcon`), keine Kamera: er nimmt
einen Code auf — gescannt *oder* eingefügt, und eine Kamera verspräche ein Foto.
`QrIcon` bleibt fürs Zeigen eines Codes.

Ein mit der Kamera-App gescannter Code öffnet auf dem iPad **immer Safari**;
die Home-Screen-Webapp hat einen eigenen Speicher und bekäme so weder Set noch
Schlüssel. Darum liest die App den Code selbst: Kamera-Knopf in der Übersicht
(immer da), `getUserMedia` mit Rückkamera, Bild für Bild auf 640 px durch
**jsQR** (jsdelivr, bei Bedarf über `loadScript`; die cdnjs-URL gibt es nicht).
`scanned` deutet den Text: nur das Fragment zählt (die Adresse davor darf
localhost oder Pages sein), zerlegt wird es mit `hashParts`, das dafür auch
einen fremden Hash annimmt. Zurück kommen `keyPart` (`k=`) und die Route samt
Optionen — geprüft gegen `ROUTE_KEYS`/`isRoutePart`, dieselbe Stelle, aus der
`getRoute` liest. Unter dem Kamerabild nimmt ein Feld denselben Link auch
**eingefügt** an (Handoff: am Mac kopiert, auf dem iPad in der Zwischenablage)
— die Home-Screen-Webapp hat keine Adresszeile, sonst käme dort kein Link
hinein. `onCode` in `Selection`: Schlüssel über `takeKeys`
speichern, Set über `location.hash` öffnen — danach läuft alles wie bei einem
geöffneten Link (`keepLink`). Bibliothek und Kamera melden getrennt
(`scanNoLib` / `scanNoCam`). Die Kamera-Freigabe in der Home-Screen-App wurde
noch nicht auf dem iPad geprüft.

Stolpersteine hier: **Der Knopf hängt nicht an `scanSupported`.** Ohne
Kamera-API (jeder unsichere Origin, also auch `http://192.168.x.x:8000` beim
Testen im LAN) verschwand sonst mit dem Kamerabild auch das Einfügen — das
einzige, was dort noch ginge. **`scanned` prüft die Route gegen `ROUTE_KEYS`**,
sonst gilt jeder Anker-Link (`#section`) als MyVoci-Code und der Scanner tut
danach still gar nichts. **Nach dem Nachladen wird `stop` geprüft**, bevor die
Kamera gefragt wird: 257 KB dauern, und wer in der Zeit schliesst, bekäme sonst
den Berechtigungsdialog für ein Fenster, das nicht mehr da ist. **Schlüssel und
Route werden unabhängig behandelt** — ein kaputter Schlüsselteil verwarf sonst
das mitgelieferte Set; wird navigiert, trägt `keysArrived` die Meldung nach.

## Modi

`MODES` = write, pen, cards, choice, match, gap, listen, speak, scramble.
Daneben stehen die Listen, die entscheiden, was ein Modus kann:
`TYPED_MODES` (Eingabefeld, Toleranz, Abschreiben) · `AUTO_MODES` (der Rechner
kann selber werten — Voraussetzung für Blitzrunde und Prüfung) ·
`DIRECTIONLESS` (Lückentext, Zuordnen; dort steht die Richtung fest).
Ob ein Modus bei diesem Set geht, entscheidet **eine** Stelle (`modeOff` in
`SetPage`) — sonst laufen ausgegrauter Knopf und Rückfall auf «Schreiben»
auseinander.

Alle Modi ausser Zuordnen teilen sich `Practice`. **Was ein Modus zeigt und
verlangt, steckt in `task`** (ein `useMemo`) — dort ansetzen, nicht in `body`
verzweigen, wenn es um Inhalte geht.

## Stolpersteine (teuer erkauft)

- **`task` hängt am Wort (`[item]`), nicht an der Warteschlange.** Die wächst
  bei jedem Fehler; sonst mischt Multiple Choice nach dem Antippen neu.
- **`finish` gibt den neuen Stand zurück.** Karteikarten, Handschrift und
  Prüfung bewerten und schalten im selben Schritt weiter — mit dem alten
  Zustand fehlte das letzte Wort in der Bilanz und die Wiederholung fiel weg.
- **Der Blitzrunden-Wecker liest aus `latest` (Ref).** Eine Closure hätte den
  Stand vom Moment des Stellens.
- **`go=1` zündet nur beim ersten Aufbau** (`goRef` im Trainer), sonst startet
  jede beendete Runde von selbst die nächste.
- **Vollbild-Aufrufe fangen das abgelehnte Promise** — das iPhone kann kein
  Element-Vollbild, und ohne echte Geste lehnt der Browser ab.
- **Spracherkennung braucht eine Zeitgrenze** (10 s): ein offener
  Mikrofon-Dialog meldet weder Ergebnis noch Fehler, der Knopf bliebe grau.
- **Der Hash trägt Route, Sprache und Optionen nebeneinander.** `OPT_KEYS` hält
  auseinander, was Route ist und was Einstellung — sonst wird `&mode=write` zur
  Route.
- **Der Lückentext braucht die Form im Satz.** `splitSentence` sucht per
  Wortstamm; wo das nicht reicht, markiert die Datei sie: `Je *vais* à l'école.`
  Gesucht wird in einer Fassung mit geraden Apostrophen (`straightQuotes`,
  zeichengleich, damit die Fundstelle auf das Original passt) und **ohne
  Lookbehind** — `(?<!…)` kennt Safari erst ab 16.4 und wirft sonst mitten im
  Aufbau der Set-Seite, ohne Error Boundary also weisse Seite.
- **Nur `/` trennt Alternativen.** Komma und Semikolon gehören zur Wendung;
  wer daran trennt, lässt «comment ça va» als Antwort auf «Bonjour, comment ça
  va ?» durchgehen.
- **`checkAnswer` bekommt die übrigen Lösungen der Runde** (`others`): wer exakt
  ein anderes Wort des Sets tippt (vous/nous), hat verwechselt, nicht sich
  vertippt — sonst zählt die Ein-Zeichen-Toleranz das als gewusst.
- **Richtungslose Modi bekommen in `buildQueue` fest `dir: 'ab'`.** Sonst
  schlägt im Lückentext eine alte Richtungswahl durch, die dort gar nicht
  angeboten wird: falsche Stimme, falsche Artikel-Toleranz.
- **`set_` merkt nur die eigene Wahl**, aufgesetzt auf den gespeicherten Stand.
  Merkte es das ganze Objekt, würden Prüfungsmodus und Timer eines geteilten
  Links zum Standard des fremden Geräts.
- **Der Datei-Listener am Fenster hängt nur einmal** und hielte sonst die Liste
  vom ersten Rendern fest — die Rückfrage «gibt es schon» liest deshalb aus
  einer Ref, nicht aus der Closure.
- **Prüfung meldet nur, was sie wirklich gesehen hat.** Ohne aktives Vollbild
  überwacht niemand; dann steht das auch so da, statt eines grünen «nie
  verlassen».
- **`mirrored` (Ref) ist der Stand, den der Ordner zuletzt gesehen hat.** Was
  `takeDisk` vom Ordner liest, wird darauf gesetzt statt zurückgeschrieben —
  sonst bügelte die App jede von Hand geschriebene Datei in ihr eigenes
  Format. Alle Ordner-Zugriffe laufen über **eine** Promise-Kette
  (`enqueue`): ein Nachlesen beim Fokus darf nicht in ein halb geschriebenes
  Set hineinlesen.
- **Das Sprach-Badge zeigt `DE↔FR`, nicht `DE→FR`** (`langBadge`): geübt wird
  in beide Richtungen, die Wahl trifft die Runde. Die Reihenfolge bleibt
  trotzdem sichtbar — an ihr hängt, welche Seite `a` ist. In der Datei
  (`Sprachen: de → fr`) und in der Richtungswahl der Runde (`dirAB`) steht
  weiterhin der einfache Pfeil, dort ist er eine echte Festlegung.
- **Der Ordner wird unter der Liste angeboten, nicht nur in den
  Einstellungen** (`dirOffer`, nur bei `status === 'none'`): ein einmaliger
  Einrichtungsschritt, den hinter dem Zahnrad niemand findet. Wo es nicht geht
  (iPad, Safari → `unsupported`), steht nichts.
- **Texte, die den Speicherort nennen, hängen am Ordner-Status.** Mit
  verbundenem Ordner liegen die Sets als Dateien und nur der Lernstand im
  Browser (`storedHint` / `storedHintDir` unter der Liste) — «gespeichert in
  diesem Browser» wäre dort schlicht falsch.
- **Der Titel ist nur im Ordner eindeutig, nicht in der App.** Zwei Kinder
  haben dieselben Set-Titel — das ist die Ablage-Konvention. «Dasselbe Set»
  steht deshalb an **einer** Stelle (`setPlace`/`samePlace`, Ordner + Titel);
  Editor-Prüfung, Import-Rückfrage, `importSet`, Sicherung und `fromDisk`
  fragen dort nach. Global geprüft liess sich ein Set gar nicht mehr
  speichern, und ein Import überschrieb das gleichnamige Set des anderen
  Kindes.
- **`disk: true` heisst «lag schon einmal im Ordner».** Daran hängt, was beim
  Nachlesen verschwindet: ein Set mit dem Merkmal, das dort fehlt, wurde im
  Finder gelöscht; eines ohne wurde bloss noch nie geschrieben und bleibt.
  Ohne diese Unterscheidung machte die Freigabe nach einem Neustart jede
  Löschung im Finder wieder rückgängig. Nur das ausdrückliche Verbinden nimmt
  mit `keepAll` alles mit (Ordnerwechsel).
- **In `fromDisk` zählt der Ort, der Titel nur als zweite Chance.** Erst
  Ordner+Titel, dann «verschoben» — und das nur für Sets, die schon einmal im
  Ordner lagen und deren Titel auf beiden Seiten genau einmal vorkommt. Sonst
  erbte die Datei des einen Kindes den Lernstand des gleichnamigen Sets des
  anderen, das damit aus der Liste fiel.
- **Beim Verbinden werden Wörter vereint, nicht ersetzt** (`mergeWords`, nur
  bei `keepAll`): sonst verschluckte eine ältere Datei die im Browser
  ergänzten Wörter. `onDisk` trägt dabei den **rohen** Dateiinhalt, sonst
  schriebe mirrorDir die Ergänzung nie in die Datei.
- **Ein Schreibweg für den Store: `commit`** (speichern, `storeRef` nachziehen,
  rendern). `updateStore` und das Nachlesen aus dem Ordner gehen beide
  darüber; sonst rechnet ein Ordner-Auftrag auf einem veralteten Stand oder
  ein Updater setzt nebenbei `mirrored` — Updater dürfen mehrfach laufen oder
  verworfen werden.
- **`wanted` (Ref) hält fest, welcher Ordner gerade gelten soll.** Ein
  Auftrag, der erst nach dem Trennen fertig wird, erkennt sich daran als
  überholt: er lässt Store und Status in Ruhe, und `enqueue` schweigt mit
  seiner Fehlermeldung, statt einen Streifen ohne Ordnernamen zu zeigen.
- **Der Fokus liest nach, ändert aber nichts, wenn nichts anders ist.**
  `takeDisk` vergleicht das Ergebnis mit dem Stand und ruft `commit` nur bei
  Unterschied; `setDir` behält sein Objekt. Sonst rendert jeder
  Fenster-Wechsel die Liste neu und stösst einen `mirrorDir`-Lauf an, der
  jede Datei zweimal serialisiert, um Gleichheit festzustellen.
- **`file` steht nur bei abweichendem Dateinamen am Set.** Heisst die Datei wie
  der Titel, bleibt es leer — sonst klebte der Dateiname nach dem ersten
  Einlesen fest, und ein Umbenennen in der App liesse Titel und Datei
  auseinanderlaufen. Von Hand benannte Dateien (`Fremd.txt` mit `# Von Hand`)
  behalten so trotzdem ihren Namen, statt eine zweite Datei zu bekommen.
- **Was ins Einstellungs-Panel geht, muss vor `useSettings` deklariert sein.**
  Das Panel ist ein Argument, sein JSX wird also vorher ausgewertet, und Babel
  macht aus `const` ein `var`: eine später deklarierte Variable ist dort still
  `undefined` statt ein Fehler (der Haken «Beispiele anzeigen» blieb leer,
  obwohl die Beispiele standen). Gilt auch für `help` — der Ordner-Kasten im
  Panel verweist in die Anleitung.
- **Handschrift auf dem iPad: `.sketch` (`user-select: none`) auf der ganzen
  Karte, `touchstart` nativ mit `preventDefault`.** Safari deutet einen kurz
  gehaltenen Strich neben Text als Auswahl-Geste — das Wort oben wurde
  markiert, der Strich riss ab. `touch-action: none` stoppt nur das Scrollen,
  und Reacts Touch-Listener sind passiv, dort greift `preventDefault` nicht.
  Beide Flächen brauchen das, `InkPad` so gut wie `Sketch`. Scribble
  (Textfeld) bleibt davon unberührt: das ist der Modus «Schreiben».
- **Erkannt wird auf Verlangen, nicht nach jeder Pause.** `QUIET_PERIOD`
  schickt 400 ms nach jedem Absetzen des Stifts eine abrechenbare Anfrage; ein
  Wort kostete so drei bis sieben statt einer, und die 2 000 Gratis-Anfragen im
  Monat waren nach zwei Wochen weg. Mit `DEMAND` fliegt genau eine pro
  «Prüfen» — und die Vorschau «Erkannt: …» entfällt, samt dem Wettlauf
  zwischen laufender Erkennung und Knopfdruck.
- **`scored` (Ref) lässt jede Stelle der Warteschlange nur einmal zählen.**
  Die Handschrift wertet über das Netz: der Knopf bleibt währenddessen
  anklickbar, und fällt die Erkennung mitten in der Rückmeldung aus, stehen
  auf einmal die Selbstbewertungs-Knöpfe unter einem gewerteten Wort. Beides
  rief `finish` ein zweites Mal und buchte den Lernstand doppelt.
- **Gesperrt wird mit einer Ref (`inkAsking`), nicht mit einem Zustand.** Zwei
  Tipper kurz nacheinander lesen beide noch das alte `false` und schicken zwei
  kostenpflichtige Anfragen los — im Test blieb die Wertung dank `scored`
  einfach, die Anfragen wurden trotzdem verdreifacht.
- **Alle Zugriffe auf die iink-Fläche laufen über eine Kette (`inkQueue`)**,
  wie beim Ordner: `Canvas.load` ist statisch und zerstört die Vorgängerin
  selbst. Ein nebenher laufendes `destroy()` traf sonst die eben aufgebaute
  Fläche — bei Richtung «gemischt» wechselt die Sprache pro Wort, übrig blieb
  eine Fläche, die zeichnet, aber nichts mehr erkennt.
- **`loadScript` prüft, ob das Global wirklich da ist.** Ein Captive Portal
  liefert HTTP 200 mit einer Fehlerseite, `onload` feuert, und die gemerkte
  Promise stand für die ganze Sitzung auf `undefined` — kein späterer Versuch
  lud je nach.
- **Wer nach Toleranz gewertet wird, muss sie einstellen können** (`usesLevel`):
  `checkInk` misst mit `opts.level`, die Wahl stand aber nur bei `TYPED_MODES`.
  Still galt, was zuletzt in «Schreiben» gewählt war.
- **iink bekommt ein absolut eingepasstes Wurzelelement in einem Rahmen
  fester Höhe.** Es setzt seiner Wurzel `height: 100%` und wuchs mit dem
  eigenen SVG bei jedem Rendern weiter (1 500 px und mehr).
- **`writeLocal` meldet Fehlschläge** (`storageBroken` → Warnstreifen): ein
  stilles `catch {}` liess die App «gespeichert» sagen, während nichts ankam.

## Was nicht ins Repo gehört

Die **MyScript-Schlüssel** liegen im localStorage des Geräts, nicht im Code.
Manuels Kopie (Schlüssel und Zertifikat) liegt in `keys/`; der Ordner steht in
`.gitignore` und wird **nie** committet — wie `voci/` auch nicht proaktiv zum
Committen anbieten.

Im Code stehen nur die zwei eingebauten Beispiele. Die **echten Sets liegen in
`voci/`** — wie `quizzes/` in MyKahoot lebendes Material, das die App direkt von
der Platte liest (kein Code hängt an einer bestimmten Datei). Der Ordner steht in
`.gitignore` und wird **nie** committet; Änderungen dort nie proaktiv zum
Committen anbieten, auch nicht bei `/git`. Wie die Sets heissen und wo sie darin
liegen (`<Kind>/<Sprache>/<Lehrmittel>/`, Titel `Unité 3 – La maison`, Zusätze
`– Sätze`, `– Verben (présent)`), steht in Manuels Anleitungen:
`~/Documents/Unterricht/Anleitungen/Prozesse/MyVoci-Voci-Benennung/kurz.md`.
