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

**Ein Weg zum neuen Set:** Das `+` bei «Meine Voci» und an jedem Ordner öffnet
den Kasten «Voci-Set erstellen» (`create(dir)`) mit dem Ordner vorgewählt
(`target`). Dort stehen alle Wege nebeneinander: KI-Prompt, Datei, Text
einfügen, «von Hand» (`onNew(into)` → Editor). Das `+` führte früher direkt
in den Editor, der Kasten kannte nur die Hauptebene — je nach Einstieg fehlte
die Hälfte. Ein Ziehen aufs Fenster landet weiterhin auf der Hauptebene, aufs
Ordner-Feld im Ordner. — die Ablage-Fläche im Kasten hat dafür ein
eigenes `onDrop` (`importHere`), sonst fiele die Datei zum Fenster-Listener
durch. Die Titelzeile des Kastens heisst Hauptebene (setzt `target` zurück);
Umbenennen/Verschieben nimmt die Wahl mit (`followMove`), ein Import klappt
seinen Ordner auf (`openTo`), und `FolderSelect` teilt sich die Ordnerliste
mit dem Editor.

Seiten-Komponenten: `Selection` (Übersicht) · `SetEditor` · `SetPage`
(Rundeneinstellungen + Lernstand + Teilen) · `Practice` (alle Modi ausser
Zuordnen) · `MatchRound` (Zuordnen) · `Summary` · `Trainer` (Set-Seite → Runde →
Ende) · `Open` (Set aus der Route laden) · `App`.

## Datenmodell

Ein Set: `{ id, title, dir, langs: ['de','fr'], lang, words: [{ a, b, s: [], h, ha, hb, all }] }`
— `a`/`b` die zwei Seiten, `s` Anwendungssätze, `h` Hinweis (immer sichtbar),
`ha`/`hb` Hinweis zu einer Seite (Datei `HF:`/`HA:`: bei der gefragten Seite
sofort, bei der gesuchten erst mit der Lösung), `lang` die Oberflächensprache
beim Üben. Gespeichert wird `{ sets, folders }` unter `myvoci`; Ordner sind
Pfad-Strings wie in MyKahoot/MyMemory. Jedes Wort entsteht über `cleanWord`
(feste Schlüssel-Reihenfolge, leere Felder fallen weg) — Datei, Link und
Editor liefern so dasselbe Objekt, und `keepLink` erkennt das eigene Set.

**Listen** (beide Seiten): Punkte mit `1.`/`2)`/`-`/`•` vorne stehen in `a`
bzw. `b` zeilenweise, mit `\n` und samt Zeichen (`listEntries`, `joinAnswer`)
— Anzeige mit `whitespace-pre-line` oder einzeilig über `inline`. Eine
einzelne Zeile ist nie eine Liste («1. August» bleibt stehen). `variants`
behandelt jeden Punkt wie eine Alternative, ein Punkt genügt also. `all`
(Datei `W: alle`, nur an Listen) verlangt alle Punkte der gesuchten Seite:
`task.need` in `Practice`, gewertet mit `checkAll` beim Schreiben (ein Feld pro
Punkt, die Felder als Zeilen von `input`) und bei der Handschrift (eine
Schriftzeile pro Punkt), bei Karteikarten nur als Vermerk. Im Direktlink
stehen `ha`, `hb`, `all` hinten im Wort-Array, leere Enden fallen weg — alte
Links bleiben gültig.

**Dateiformat** bleibt kompatibel zu MyMemory/MyTafelfussball (`F:`/`A:`/`---`);
`S:`, `H:`, `HF:`, `HA:`, `W:` und `Sprachen: de → fr` sind Zusätze, die die
anderen Apps überlesen. Eine Liste schreibt `toFile` auf **eine** Zeile, Punkte
mit ` | ` getrennt (`A: 1. petere | 2. appetere`): MyMemory liest nur die erste
`A:`-Zeile und sähe sonst nur den ersten Punkt; für `F:` ginge es ohnehin nicht
anders, ein neues `F:` beginnt ein neues Wort. Gelesen werden auch mehrere
`A:`-Zeilen mit Zeichen. `|` trennt nur, wenn Listenzeichen drinstehen.
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
erkennt die Eingabe «Handschrift, automatisch geprüft» (Modus `ink`) das
Geschriebene: `InkPad` lädt
`iink-ts` erst bei Bedarf per CDN (`loadScript`), Variante `INK_V2`, Sprache aus
`IINK_LANG`. Erkannt wird **nur auf Verlangen** (`exportContent: 'DEMAND'`):
«Prüfen» holt per `export()` den Text und wertet ihn wie eine Eingabe
(`checkInk` → `settle`). Ohne Schlüssel oder bei einer Sprache ohne Paket
ist `ink` in der Moduswahl ausgegraut (`modeOff`, `canInk`); ein gemerktes
oder verlinktes `ink` fällt dann auf `pen` zurück. Scheitert Laden/Anmelden
mitten in der Runde (`inkFail`), bleibt die Fläche ohne Erkennung
(`Sketch`). `pen` («selbst bewerten») erkennt nie, auch mit Schlüsseln —
kostet also kein Kontingent. Beide Wege teilen **einen** Zweig in `Practice`:
«Aufdecken» mit Selbstbewertung gibt es immer, «Prüfen» kommt nur dazu — sonst
käme niemand an einem Wort vorbei, das er nicht weiss, und ein falsch gelesenes
Wort liesse sich nicht richtigstellen.

Stift/Radierer (`padTool` in `Practice`, Werte wie bei iink `write`/`erase`,
über `clearPad` bei jedem Wort und beim Leeren zurück auf Stift) gilt für
beide Flächen: `Sketch` radiert mit `destination-out` (die Grundlinie ist
CSS-Hintergrund und bleibt), `InkPad` schaltet das Werkzeug von iink um
(`pad.tool`, nimmt ganze Striche weg) — auch nach dem Laden, falls vorher
umgeschaltet wurde.

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

`MODES` = write, pen, ink, cards, choice, match, gap, listen, speak, scramble.
`write`/`pen`/`ink` sind die drei Eingaben von «Schreiben» (`WRITE_INPUTS`:
Tastatur · Handschrift, selbst bewerten / automatisch geprüft): intern eigene Modi, damit Link
(`&mode=`), `modeOff` und die Listen unten nichts Neues lernen müssen; die
Set-Seite zeigt eine Kachel «Schreiben» und darunter die Zeile «Eingabe».

**Die Set-Seite** (Übungsmenü): oben die acht Modi als Kacheln (Linien-Icon
aus `MODE_ICON`, eine Zeile `…Short`; geht ein Modus nicht, steht dort der
Grund — ein Tooltip käme auf dem iPad nie an). Den Grund liefert `modeOff`
selbst (I18N-Schlüssel oder `null`), damit Sperre und Begründung nicht an zwei
Stellen entschieden werden. Fehlen dem Set die Sprachen, sagt es das
(`modeNoLangs`) statt «keine Spracherkennung» — sonst sucht man den Fehler im
Browser statt im Editor. Darunter eine Liste ohne Trennlinien: `OptRow` (Beschriftung
links, auf dem Handy darüber), `Seg` für kleine Wahlen, `Switch` für Ja/Nein,
kurze Erklärung nur zur aktuellen Wahl (`NOTE`). Die Eingabe trägt pro Feld
eine zweite Zeile, wer prüft (`INPUT_CHECK`) — auch die Tastatur
prüft, «mit/ohne Kontrolle» klang, als täte sie es nicht. `Choice` bleibt für die
Knopfreihen der Runde (Stift/Radierer).
`MODE_GROUP` sagt, welche Modi keinen eigenen Knopf haben (Beschriftung
`INPUT_LABEL`), `HAND_MODES` = pen, ink (Schreibfläche). Zurück zu «Schreiben» holt die
zuletzt gewählte Eingabe (`opts.input`). Alte Links mit `mode=pen` hatten mit
Schlüsseln die Erkennung und laufen jetzt ohne — bewusst so gelassen.
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
- **Nur `/` (und die Punkte einer Liste) trennen Alternativen.** Komma und Semikolon gehören zur Wendung;
  wer daran trennt, lässt «comment ça va» als Antwort auf «Bonjour, comment ça
  va ?» durchgehen.
- **`checkAll` ordnet erst die exakten Treffer zu, dann die Tippfehler, dann
  den Rest nach Ähnlichkeit (engstes Paar zuerst).** Sonst schnappt sich
  «apetere» als Tippfehler den Punkt «petere», und das danach getippte,
  richtige «petere» geht leer aus.
- **Die Felder von «alle Punkte» leben als Zeilen in `input`, nicht in einem
  Array.** `[...xs]` macht aus einer Lücke (Feld 1 übersprungen) ein echtes
  `undefined`, und `checkAll` stürzte beim `.trim()` ab — «Prüfen» tat nichts.
- **Gewertet wird an einer Stelle (`grade`)**: Knopf, Handschrift und Wecker.
  Der Wecker hatte zuvor eine eigene Kopie ohne `others`.
- **`checkAnswer` bekommt die übrigen Lösungen der Runde** (`others`): wer exakt
  ein anderes Wort des Sets tippt (vous/nous), hat verwechselt, nicht sich
  vertippt — sonst zählt die Ein-Zeichen-Toleranz das als gewusst.
- **Richtungslose Modi bekommen in `buildQueue` fest `dir: 'ab'`.** Sonst
  schlägt im Lückentext eine alte Richtungswahl durch, die dort gar nicht
  angeboten wird: falsche Stimme, falsche Artikel-Toleranz.
- **Der Rückfall eines Modus wird berechnet, nicht per Effekt gesetzt.**
  `SetPage` hält die Wahl in `wanted`; `opts` ist daraus abgeleitet, mit
  `MODE_FALLBACK` (`ink` → `pen`, sonst `write`), wo `modeOff` greift. Mit dem
  alten Effekt sah «Direkt starten» (`go=1`) beim ersten Aufbau noch den
  ungültigen Modus und startete nie; so kehrt auch `ink` von selbst zurück,
  sobald Schlüssel eingetragen sind. Direkt gestartet wird nur mit
  gleichwertigem Ersatz — «Schreiben» statt Lückentext wäre eine andere Übung.
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
- **Wer nach Toleranz gewertet wird, muss sie einstellen können** (`LEVEL_MODES`):
  `checkInk` misst mit `opts.level`, die Wahl stand aber nur bei `TYPED_MODES`.
  Still galt, was zuletzt in «Schreiben» gewählt war.
- **iink bekommt ein absolut eingepasstes Wurzelelement in einem Rahmen
  fester Höhe.** Es setzt seiner Wurzel `height: 100%` und wuchs mit dem
  eigenen SVG bei jedem Rendern weiter (1 500 px und mehr).
- **Der Radierer von iink darf nicht selber zu Ende radieren.**
  `EraseManager.end` ruft `removeStrokes`, und das schickt die übrigen
  Striche an den Server — eine abrechenbare Anfrage pro Radierstrich, am
  `DEMAND` vorbei; davor steht `Iterator.toArray` (Safari erst ab 18.4).
  `InkPad` ersetzt darum `eraser.end` an der Instanz (vor dem ersten
  Umschalten, `attach` bindet es) und nimmt die Striche nur aus Modell und
  Bild. Hängt an Interna von iink-ts 4.1.0 — beim Versionswechsel prüfen.
  Im Browser gemessen: Schreiben und Radieren 0 Anfragen.
- **`writeLocal` meldet Fehlschläge** (`storageBroken` → Warnstreifen): ein
  stilles `catch {}` liess die App «gespeichert» sagen, während nichts ankam.

## Farben: Sonne (hell) / Nacht (dunkel)

Das Skript im `<head>` legt jede Farbskala als CSS-Variable an und sagt
Tailwind (`tailwind.config`), die Klassen daraus zu lesen. Im Code heissen
sie **`acc-…`** (Akzent), **`acc2-…`** (zweiter Akzent; der Verlauf
`from-acc-500 to-acc2-500`), `gray-…` und die Signalfarben
`red`/`green`/`amber`/`yellow`/`orange`/`lime` wie gewohnt. **Hell = Sonne**
(Orange → Rose, Stein-Grau), **dunkel = Nacht** (Himmelblau → Smaragd,
Schiefer; `DARK`) — bewusst zwei Stimmungen, nicht eine Farbe in zwei
Helligkeiten: Orange wirkt auf Dunkel bräunlich. Dunkel kehrt jede Skala um
(50 ↔ 950 …), Grau hat eine eigene dunkle Skala (`DARK_GRAY`), sonst wäre
blasse Schrift unlesbar. Wahl in den Einstellungen
jeder Seite (`ThemeChoice`); gespeichert (`myvoci_theme`: `auto`/`light`/`dark`)
und angewendet wird nur im `<head>`-Skript (`themePick`/`setTheme`), `auto`
folgt dem Gerät live; das Skript läuft vor dem ersten Zeichnen, damit nichts
hell aufblitzt.

Stolpersteine: **Flächen heissen `bg-card`, nicht `bg-white`** — Weiss bleibt
im Dunkeln weiss. Echtes `bg-white` steht nur, wo es weiss bleiben soll: die
Schreibflächen (`PAD_FRAME`, Papier, die Tinte von iink ist dunkel) und der
Knopf im `Switch`. **Grau kehrt sich um**: `bg-gray-800` ist im Dunkeln hell,
Schrift darauf also `text-gray-50`, nie `text-white` (Toast, Knopf «Einfügen»).
Neue Farbtöne ausserhalb der Skalen (Hex im Code) nur über die Variablen
(`rgb(var(--c-red-200))`, s. `.diff-del`). **Die Home-Screen-Webapp auf iOS
liest nicht `theme-color`**, sondern `apple-mobile-web-app-status-bar-style`
beim Start — das Skript setzt beide, sonst bleibt die Statusleiste über der
dunklen Seite weiss. Safari vor 14 kennt am `matchMedia`-Objekt nur
`addListener`.

## Icon

Quelle ist `favicon.svg` (von Hand, 64×64): zwei Karteikarten auf dem
Verlauf von Sonne (Orange `#f97316` → Rose `#e11d48`), die hintere Karte
Pfirsich, die vordere weiss mit orangem **Doppelpfeil** — geübt wird in beide Richtungen, das unterscheidet
MyVoci vom Karteikasten. Motiv statt Buchstabe, wie das Kartenpaar von
MyMemory; die Familienähnlichkeit ist Absicht.

Die **PNGs sind randlos** (kein `rx`): iOS und Android legen ihre eigene
Maske darüber, eingebackene Ecken würden ein zweites Mal beschnitten. Nur
das SVG rundet (`rx="14"`), es steht im Tab unmaskiert. Neu rendern (für die
PNGs eine Kopie des SVG ohne `rx`):

```bash
# Chrome headless, weil ImageMagick SVG-Verläufe ohne librsvg verpfuscht
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --screenshot=icon-512.png --window-size=512,512 file://…/icon.html
sips -z 180 180 icon-512.png --out apple-touch-icon.png
```

Bei 16 px wird das Motiv zum Farbfleck — bei MyMemorys zwei Karten genauso,
für die Tab-Leiste reicht der Farbeindruck. Ändert sich ein Icon, wandert
`?v=N` in `index.html` **und** `manifest.webmanifest` eins hoch: Dateinamen
bleiben gleich, und Browser wie Home-Bildschirm halten Icons zäh fest.

## Was nicht ins Repo gehört

Die **MyScript-Schlüssel** liegen im localStorage, nicht im Code — und zwar
pro Browser **und** pro Adresse: Pages, `localhost:8000`, die LAN-Adresse und
die Home-Screen-Webapp haben je einen eigenen, leeren Speicher (Chrome-Sync
nimmt ihn nicht mit). Fehlen sie, ist «Handschrift, automatisch geprüft»
ausgegraut, mit Verweis in die Anleitung. Nachschlagen: developer.myscript.com, Konto-Symbol →
Cloud recognition (cloud.myscript.com) → MyFirstApp → Open → Reiter Keys
(Reiter Filters leer, also keine Einschränkung auf Adressen); oder per «Auf ein anderes Gerät bringen» von einem Gerät, das sie hat. Eine
lokale Kopie gehört nach `keys/` (steht in `.gitignore`, wird **nie**
committet — wie `voci/` auch nicht proaktiv zum Committen anbieten); Stand
23.09.2026 gibt es diesen Ordner noch nicht.

Im Code stehen nur die zwei eingebauten Beispiele. Die **echten Sets liegen in
`voci/`** — wie `quizzes/` in MyKahoot lebendes Material, das die App direkt von
der Platte liest (kein Code hängt an einer bestimmten Datei). Der Ordner steht in
`.gitignore` und wird **nie** committet; Änderungen dort nie proaktiv zum
Committen anbieten, auch nicht bei `/git`. Wie die Sets heissen und wo sie darin
liegen (`<Kind>/<Sprache>/<Lehrmittel>/`, Titel `Unité 3 – La maison`, Zusätze
`– Sätze`, `– Verben (présent)`), steht in Manuels Anleitungen:
`~/Documents/Unterricht/Anleitungen/Prozesse/MyVoci-Voci-Benennung/kurz.md`.
