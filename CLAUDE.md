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
Bausteine (Modal, Icons, QR, Einstellungen) → Seiten.

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

**Lernstand** getrennt davon unter `myvoci_progress`:
`{ <setKey>: { <wordKey>: { ok, bad, box, last, lastOk } } }`. `setKey` ist die
id (eigene Sets), `demo:<id>` (Beispiele) oder `link:<titel>` (geteilte Links —
der Link ändert bei jeder Korrektur, der Titel bleibt). `wordKey` ist
`ab`. Leitner-Fächer 1–5, fällig nach `BOX_DAYS`. Steckt **nie** im Link.

## Korrektur (`checkAnswer`) — kein Modell, nur Regeln

Abgestuft: normalisieren (Apostrophe, ß/ss, Satzzeichen) → Alternativen mit `/`
→ Klammern `(la) maison` optional → Gross/klein → Akzente → Artikel
(`ARTICLES` pro Sprache) → ein Tippfehler (Levenshtein ≤ 1 ab vier Zeichen).
Drei Stufen: `strict` / `normal` / `loose`. Ergebnis
`{ status: right|almost|wrong, solution, note }`; `almost` gilt als gewusst.
`charDiff` zeigt die Abweichung buchstabenweise.

Die reine Logik lässt sich ohne Browser testen: Abschnitte aus der Datei
schneiden und mit `node` prüfen (so entstanden die 26 Fälle in Phase 2).

## Modi

`MODES` = write, pen, cards, choice, match, gap, listen, speak, scramble.
Daneben stehen die Listen, die entscheiden, was ein Modus kann:
`TYPED_MODES` (Eingabefeld, Toleranz, Abschreiben) · `TIMED_MODES` und
`EXAM_MODES` (automatisch prüfbar) · `DIRECTIONLESS` (Lückentext, Zuordnen).
Ein Modus, der bei diesem Set nicht geht, ist ausgegraut; ein gemerkter fällt
auf Schreiben zurück.

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
- **`writeLocal` meldet Fehlschläge** (`storageBroken` → Warnstreifen): ein
  stilles `catch {}` liess die App «gespeichert» sagen, während nichts ankam.

## Was nicht ins Repo gehört

Keine echten Voci-Sets: Inhalte leben im Browser der Lehrperson bzw. in ihren
`.txt`-Dateien. Im Code stehen nur die zwei eingebauten Beispiele.
