# MyVoci — Plan

Vokabeltrainer für den Unterricht, komplett clientseitig wie MyMemory: eine
`index.html`, kein Backend, gespeichert im Browser, geteilt per Direktlink/QR.
Live: https://manuel-benz.github.io/MyVoci/

**Stand (06.10.2026, 21):** **Breit** in jeder Runde: ein Knopf in der Kopfzeile
(`PracticeFrame`) lässt die Spalte die ganze Fensterbreite nehmen (bis 110rem)
und macht die Schreibfläche höher (`max(14rem, 42vh)`) — fürs Schreiben von
Hand auf dem iPad. Gemerkt pro Gerät (`myvoci_breit`), nie im Link; ab 1360 px
lässt die Kopfzeile dem angedockten Einstellungs-Kästchen Platz. Review mit
drei Befunden behoben: das künstliche `resize` beim Umschalten war überflüssig
(iink und `Sketch` beobachten ihre Fläche selbst), Speicher über
`readLocal`/`writeLocal`, Doku zum `<style>`-Block berichtigt. Im Browser
geprüft (Stift und iink, beide Richtungen, ohne neue Anfragen); auf dem iPad
noch nicht.

**Stand (05.10.2026, 20):** Review über den Designsystem-Umbau, 6 Befunde
behoben: Schatten von Fenster, Einstellungs-Kästchen und Meldung fehlten
(`shadow-[var(--schatten)]` setzt in Tailwind keinen Schatten, jetzt die
Klasse `schatten`), das Kästchen klappte hinter einer geöffneten Anleitung
zu, `rounded-sm` hatte keinen Radius, der `color-mix`-Ersatz fehlte für
`--akzent-weich`/`--akzent-text`, `make-logo.py` prüft und setzt die Version.
Danach vereinfacht: toter Code raus (`.pille`, `.qr`, zweites Element von
`useSettings`), gesperrte Knöpfe über `.knopf:disabled` statt Klassen-Weichen.
Im Browser geprüft; auf dem iPad noch nicht.

**Stand (05.10.2026, 19):** **My-Designsystem** (Kopie aus `~/MySuite` in
`design/`): Farben aus den Tokens, Schema Moonrise mit Akzent Navy, Sonne/Nacht
und der Verlauf fallen weg. Bausteine und Übersicht wie in MyMemory (Markenzug
mit Papagei, Abschnitte auf Karten, kompakte Liste), Einstellungen als
Kästchen oben rechts mit Farbschema und Ton (ab 1360 px am Fensterrand), neues
Icon Papagei. Eigener Rand oben auf der Übersicht: Federn (hell), Buchstaben
als Sternbild (dunkel), statisch im HTML und per Preload im `<head>` vorgeladen
(kommt nach 30 ms statt nach Babel, ~2,5 s). Im Browser geprüft (Übersicht, Set-Seite, Runde,
Editor, Anleitung, Handy-Breite, beide Modi); auf dem iPad noch nicht.

**Stand (29.09.2026, 18):** Review über die Wortformen mit 14 behobenen
Befunden, danach ein Vereinfachungs-Durchgang. Die wichtigsten: ein Link
trägt die Wahl Wörter/Wortformen immer (sonst lief eine Wörter-Übung beim
Empfänger als Wortformen), Enter prüft nur aus der Karte bzw. einem
Tabellenfeld (nicht mehr aus Einstellungen oder «Beenden?»), der Editor
verliert keine Tabelle mehr, Bestimmen geht mit der Tastatur und wertet in
`grade`. Hören zeigt bei Wortformen die Frage (gleich klingende Formen),
Sprechen prüft ohne Tippfehler-Toleranz, der KI-Prompt fragt nicht mehr bei
jeder Liste mit Verben nach, und welche Seite die Tabelle trägt, sagen die
Formen selbst (auch `fr → de`). 30 Node-Fälle, im Browser geprüft.

**Stand (28.09.2026, 17):** **Wortformen** (Phase 6): Ein Wort kann eine
Tabelle mit seinen Formen tragen (`Zeilen:`/`Spalten:`/`T:`), auch nur
einzelne Wörter eines Sets. Mit «Wortformen» auf der Set-Seite laufen alle
Modi auf den einzelnen Formen, dazu **Bestimmen** und **Tabelle**; geprüft
ohne Tippfehler- und Artikel-Toleranz. Der KI-Prompt entscheidet selbst, ob
Tabellen passen, und fragt nur bei Unklarheit nach. Editor mit Textfeld und
Meldungen, Abschnitt in der Anleitung, zwei Verben im Beispiel Französisch.
Im Browser und mit 26 Node-Fällen geprüft; auf dem iPad noch nicht.

**Stand (26.09.2026, 16):** Import ohne Ordnerwahl legt nach Fremdsprache
ab (höchster Klassenordner), Datei- und neue Ordnernamen ohne Sonderzeichen,
dauerhafter Speicher für die Home-Bildschirm-App (Status unter «Sicherung»).

**Stand (24.09.2026, 15):** Übungsmenü mit Kacheln und Linien-Icons, Farben
Sonne (hell) / Nacht (dunkel), neues Icon.

**Stand (23.09.2026, 14):** «Handschrift» ist kein eigener Modus mehr, sondern
eine Eingabe von **Schreiben**: Tastatur · Handschrift ohne Kontrolle ·
Handschrift mit Kontrolle. «Mit Kontrolle» ist ohne MyScript-Schlüssel oder
Sprachpaket ausgegraut (mit Verweis in die Anleitung), «ohne» erkennt auch mit
Schlüsseln nie und kostet kein Kontingent. Im Browser geprüft: Auswahl,
Freigabe nach Eintragen der Schlüssel, beide Flächen, Rückfall ohne Schlüssel.

**Stand (22.09.2026, 13):** «Voci-Set erstellen» hat eine **Ordnerwahl** und
den Weg **von Hand**; das `+` an einem Ordner (und bei «Meine Voci») öffnet
denselben Kasten mit dem Ordner vorgewählt, statt direkt in den Editor zu
springen. Damit geht der KI-Weg in jeden Ordner, und das Anlegen von Hand ist
auffindbar (offener Punkt aus Stand 10). Im Browser geprüft: Vorwahl,
Text-Import in einen Unterordner, «von Hand» öffnet den Editor im Ordner.

**Stand (22.09.2026, 12):** Listen auf beiden Seiten (`W: alle`, `checkAll`)
und Hinweise pro Seite (`HF:`/`HA:`).

**Stand (09.09.2026, 11):** Neues **App-Icon**: zwei Karteikarten auf dem
Verlauf der App, die vordere mit Doppelpfeil — ein Motiv wie MyMemorys
Kartenpaar statt des Buchstabens «Vo», und der Pfeil sagt, was MyVoci vom
Karteikasten unterscheidet. Die PNGs neu randlos, weil iOS ohnehin maskiert.
In 96/60/32/16 px geprüft.

**Stand (09.09.2026, 10):** Die Erklärtexte stehen jetzt in einer **Anleitung**
hinter dem `?`-Knopf oben (iPad · Handschrift einrichten · Ordner · Codes
scannen) statt verstreut in den Einstellungen und im Kasten zuunterst; die
Einstellungen behalten die Bedienelemente und eine Zeile «Anleitung →». Für
MyScript stehen die Einrichtungsschritte erstmals da (Konto, wo die zwei
Schlüssel stehen, Weitergabe per QR) — die Schlüsselfelder tragen ihren
Verweis selber, weil sie auch dort stehen, wo es keinen `?`-Knopf gibt. Der
Scan-Knopf trägt neu einen Sucher-Rahmen statt einer Kamera (er nimmt einen
Code auch eingefügt an). Im Browser geprüft, DE und EN. Offen: Ein Set von
Hand anzulegen geht (`+` neben «Meine Voci»), ist aber schlecht auffindbar —
der Kasten «Voci-Set erstellen» kennt nur den KI-Weg und die Datei.

**Stand (09.09.2026, 9):** Review über den Scanner, sechs Befunde behoben: Der
Knopf hängt nicht mehr an der Kamera (auf unsicherem Origin fiel sonst auch das
Einfügen weg), `scanned` prüft die Route gegen `ROUTE_KEYS` statt jeden
Anker-Link zu schlucken, die Kamera wird nach dem Schliessen nicht mehr gefragt,
Schlüssel und Set gehen nicht mehr gegenseitig verloren, der Canvas wird nur bei
Grössenwechsel neu angelegt. `scanned` mit 13 Fällen in Node geprüft, die Wege
im Browser.

**Stand (09.09.2026, 8):** QR-Codes lassen sich **in der App** scannen
(Kamera-Knopf in der Übersicht, jsQR): Auf dem iPad öffnet die Kamera-App jeden
Code in Safari, die Home-Screen-Webapp mit ihrem eigenen Speicher ging leer aus.
Jetzt landen Set-Code und Schlüssel-Code dort, wo gescannt wird; im selben
Fenster lässt sich der Link auch einfügen (Handoff vom Mac). Im Browser
geprüft (Einfügen: Schlüssel, Fremdlink, Set-Route): Knopf, Modal, Nachladen und Dekodieren eines gezeichneten Codes; der
Kamera-Zugriff selbst (Berechtigung, Rückkamera, Home-Screen-App) steht auf
dem iPad noch aus.

**Stand (09.09.2026, 7):** Ein gescanntes Set bleibt im Browser: `#v=`-Links
werden beim Öffnen übernommen (Wurzel, gleicher Titel = ersetzen) und als
eigenes Set geöffnet, Lernstand vom alten `link:`-Schlüssel umgehängt. Dazu die
MyScript-Schlüssel per QR-Code auf ein zweites Familien-Gerät bringen (`#k=`,
wird nach dem Speichern aus der Adresse gestrichen). Beides im Browser geprüft
(Übernahme, erneuter Link ohne Zweitkopie, korrigierter Link ersetzt, `go=1`
zündet, Schlüssel-Roundtrip, Meldung). Offen: Weitergabe der App an Fremde —
eigenes MyScript-Konto pro Nutzer (Kasten steht, Anleitung fehlt) oder ein
kleiner Proxy mit Kontingent pro Nutzer.

**Stand (09.09.2026, 6):** Review über die Handschrift-Erkennung, fünfzehn
Befunde, die schwersten behoben: erkannt wird jetzt **auf Verlangen** statt nach
jeder Schreibpause (eine Anfrage pro Wort statt drei bis sieben — sonst wäre das
Gratiskontingent in zwei Wochen weg), jede Stelle der Warteschlange zählt nur
noch einmal (`scored`), ein Fehler beim Erkennen sagt das, statt heimlich die
vorige Erkennung zu werten, «Aufdecken» gibt es auch mit Erkennung, die Toleranz
lässt sich für die Handschrift einstellen, «Nur Stift annehmen» wirkt endlich
auch dort, und die Schlüsselfelder stehen auf jeder Seite, von der aus geübt
wird. Dazu zusammengeführt: ein Zweig für beide Flächen, ein Lader für alle
CDN-Bibliotheken. Im Browser geprüft (0 Anfragen beim Schreiben, 1 bei drei
schnellen Klicks); mit dem Pencil auf dem iPad weiterhin offen.

**Stand (09.09.2026, 5):** Handschrift-Erkennung über MyScript iink (Cloud,
Gratiskontingent reicht für zwei Kinder) als Option: Schlüssel in den
Einstellungen, dann korrigiert der Handschrift-Modus automatisch wie
«Schreiben»; ohne Schlüssel bleibt es beim Papier. Im Browser mit der Maus
geprüft (Erkennung, Prüfen, Diff, Weiter, Leeren); mit dem Pencil auf dem iPad
noch nicht. Die Wiederholung falscher Wörter am Rundenende ist fest eingebaut
(ausser in der Prüfung) — ein Schalter dafür wäre möglich.

**Stand (09.09.2026, 4):** Erster iPad-Test der Handschrift: Safari markierte
beim Schreiben das Wort auf der Karte (Auswahl-Geste) — behoben mit
`user-select: none` auf der Karte und nativem `touchstart`-`preventDefault`.
Klargestellt: Scribble greift im Modus Schreiben, Handschrift bleibt Papier
ohne Erkennung. Noch offen auf dem iPad: Hören, Sprechen, Link-Kopieren.

**Stand (09.09.2026, 3):** Review über den Ordner-Anschluss mit zehn behobenen
Befunden — allen voran: der Titel galt als eindeutiger Schlüssel, obwohl beide
Kinder dieselben Set-Titel haben («dasselbe Set» ist jetzt Ordner + Titel, s.
`setPlace`). Dazu ein Vereinfachungs-Durchgang: ein Schreibweg für den Store,
eine Stelle fürs Zusammenführen von Wörtern, spürbar weniger Arbeit bei jedem
Fenster-Wechsel. Offen gelassen: ein Set per Ziehen in einen Ordner schieben,
in dem sein Titel schon liegt, fragt nicht nach (Ordner tun das).

**Stand (09.09.2026, 2):** Übersicht schlank wie die Quiz-Auswahl in MyKahoot;
Beispiele abschaltbar (Einstellungen, gemerkt pro Gerät); echte Sets liegen in
`voci/` (ignoriert). Der Ordner wird neu unter der Liste angeboten statt nur in
den Einstellungen, und der Hinweis darunter nennt bei verbundenem Ordner die
Dateien statt des Browsers. Benennung der Sets: Anleitungen →
`Prozesse/MyVoci-Voci-Benennung`.

**Stand (09.09.2026):** Neu: **Ordner auf dem Computer** (Einstellungen) —
wie die Quizzes in MyKahoot liegen die Sets als `.txt` in einem Ordner auf der
Platte (Chrome/Edge, File System Access API), beide Richtungen; im Finder
Abgelegtes erscheint beim Fokus. Noch nicht von Hand geprüft: der
Ordner-Dialog selbst und ob Chrome die Freigabe über Neuladen hinweg behält.

**Stand (08.09.2026):** Phasen 0–5 sind fertig, dazu ein Review über die ganze
App mit 15 behobenen Befunden (Korrektur-Regeln, Tastatur, geteilte Links,
Prüfungsmodus, Import und Ordner, Schreibfläche; Einzelheiten in CLAUDE.md unter
«Stolpersteine»). Phasen — neun Übungsmodi, automatische
Korrektur, Lernstand mit Leitner-Fächern, Prüfungsmodus, Teilen-Links mit
Voreinstellung, Sicherung als Datei. Offen ist nur noch der Backlog zuunterst;
auf dem iPad geprüft werden müssen Handschrift, Hören, Sprechen und das
Kopieren der Teilen-Links (Safari verlangt dafür `ClipboardItem`).

## Idee

Flexibel Voci üben — beide Richtungen, verschiedene Abfragearten, Eingabe per
Tastatur **oder Stift**, automatische Korrektur, Anwendungssätze dazu.
Lehrperson erstellt Sets (von Hand oder per KI-Prompt), SuS üben auf dem
eigenen Gerät; der Lernstand bleibt in ihrem Browser.

## Dateiformat

Gleiche Familie wie MyMemory/MyTafelfussball (`F:`/`A:`/`---`), damit dieselbe
Datei in allen Apps funktioniert — plus zwei neue, optionale Zeilen:

```
# Unité 3 – La maison
Sprachen: de → fr

F: das Haus
A: la maison
S: J'habite dans une grande maison.
H: f.
---
F: gehen
A: aller / marcher
S: Je vais à l'école. | Nous marchons vite.
---
```

- `Sprachen: de → fr` — Sprachcodes für Richtung, Tastatur-Sprache und
  Vorlesen (TTS). Ohne Zeile: „Sprache A / Sprache B".
- `A:` mehrere gültige Antworten mit `/`; Klammern `(la) maison` = optional.
- `S:` Anwendungssatz in Sprache B, mehrere mit `|`; das Wort darin wird für den
  Lückentext per Wortstamm erkannt (`marchons` ↔ `marcher`); weicht die Form
  stark ab, markiert man sie: `Je *vais* à l'école.`
- `H:` Hinweis (Genus, Wortart, Merkhilfe) — wird bei der Abfrage eingeblendet.
- MyMemory-Dateien ohne `S:/H:` laden direkt; umgekehrt überliest MyMemory die
  neuen Zeilen.

## Abfragemodi

| Modus | Eingabe | Korrektur |
|---|---|---|
| **Schreiben** · Tastatur | Eingabefeld (Stift: Scribble) | automatisch, mit Toleranz |
| **Schreiben** · Handschrift ohne Kontrolle | Schreibfläche | selbst bewerten |
| **Schreiben** · Handschrift mit Kontrolle | Schreibfläche, MyScript erkennt | automatisch, mit Toleranz (aufdecken geht immer) |
| **Karteikarten** | umdrehen, selbst bewerten (Gewusst/Nicht gewusst) | manuell |
| **Multiple Choice** | 4 Optionen, Ablenker aus demselben Set | automatisch |
| **Zuordnen** | 6–8 Paare per Tippen verbinden | automatisch |
| **Lückentext** | Anwendungssatz mit Lücke, Wort eintippen | automatisch |
| **Hören** | Wort/Satz vorgelesen (Web Speech TTS), aufschreiben | automatisch |
| **Buchstabensalat** | Buchstaben in richtige Reihenfolge ziehen | automatisch |
| **Sprechen** (später) | Wort aussprechen (SpeechRecognition, nur Chrome) | automatisch, unscharf |
| **Blitzrunde** (später) | beliebiger Modus mit Timer, Punktestand | — |

Einstellbar pro Runde: Richtung (A→B, B→A, gemischt), Auswahl (alle / nur
Fehler / Leitner-fällig / Bereich 1–20), Reihenfolge (zufällig / wie in Datei),
Hinweise ein/aus, Toleranz streng/locker.

## Eingabe und Korrektur

**Stift**: Kein eigenes Erkennungs-Modell nötig — auf dem iPad schreibt Apple
**Scribble** mit dem Pencil direkt in jedes Textfeld, Windows hat das
Handschrift-Panel, Android Gboard-Handschrift. Die App muss dafür nur ein
grosses, gut erreichbares Eingabefeld bieten. Zusätzlich **Schreibfläche
ohne Erkennung** (Canvas): SuS schreiben das Wort von Hand, decken die Lösung
auf und bewerten selbst — wie Papier, funktioniert überall, gut für Rechtschreib-
Feinheiten (Akzente, Doppelkonsonanten), die eine Erkennung glattbügelt.

**Automatische Korrektur** (`checkAnswer(eingabe, lösung)`), abgestuft:

1. Normalisieren: Leerzeichen, Gross/klein, typografische Apostrophe, „ß/ss".
2. Alternativen (`/`) und optionale Teile `( )` durchprobieren.
3. Artikel-Toleranz optional: `maison` statt `la maison` = „fast richtig".
4. Akzente: Set-Einstellung — streng (Französisch) oder tolerant.
5. Tippfehler: Levenshtein ≤ 1 (bei Wörtern ab 5 Zeichen) = **fast richtig**:
   gilt als gewusst, die Lösung wird mit markierter Abweichung gezeigt
   (Buchstaben-Diff: fehlend grün, zu viel rot).
6. Sonst falsch: Lösung zeigen, Wort muss einmal **abgeschrieben** werden, bevor
   es weitergeht (bewusste Wiederholung), und kommt später nochmals dran.

## Lernstand

Pro Set und Wort im Browser: richtig/falsch-Zähler, Leitner-Fach (1–5),
zuletzt geübt. Daraus: **Fehlerliste** (nur falsche wiederholen), **Fällig
heute** (Leitner: Fach 1 täglich, Fach 5 alle 2 Wochen), Fortschrittsbalken
pro Set, kleine Statistik am Rundenende (Zeit, Trefferquote, schwierigste
Wörter). Zurücksetzen pro Set möglich. Nicht im Link — der teilt nur Inhalt.

## „In den Bildschirm einsperren"

Eine Website kann das Gerät nicht sperren; das kann nur das Betriebssystem:

- **iPad: Geführter Zugriff** (Bedienungshilfen → Geführter Zugriff, dann
  3× Seitentaste) — die Lehrperson sperrt das Gerät auf Safari/MyVoci, Code
  zum Beenden. Das ist im Schulkontext der Standard.
- **Android: Bildschirm anheften**, **Windows: Kiosk-Modus / Zugewiesener Zugriff**.
- Die App liefert dazu: **Vollbild-Knopf** (Fullscreen API), PWA-Manifest
  (auf Homescreen legen → ohne Adressleiste), Anleitung „Sperren fürs Üben"
  im Hilfe-Kästchen, plus ein **Prüfungsmodus**: Vollbild, kein Zurück-Knopf,
  Lösung erst am Ende, Ergebnis als Bildschirm zum Vorzeigen/Screenshot.
  Verlässt jemand das Vollbild, wird das vermerkt (Zähler im Ergebnis) —
  ehrlich gesagt eine Abschreckung, keine Sperre.

## Rahmen (von MyMemory übernehmen)

Übersicht mit Ordnern (Drag & Drop), Import per Datei-Ablage/Text-Einfügen,
**Editor**, **KI-Prompt** (Ausfüllblock: Thema/Material, Sprachen, Klasse,
Anzahl Wörter, mit/ohne Sätze → liefert `Voci_<Thema>.txt`), Export `.txt`/ZIP,
**Direktlink** (Set komprimiert im `#`-Fragment) und **QR-Code**,
Oberfläche DE/EN, Beispiel-Sets fest eingebaut (z. B. Französisch Unité 1,
Englisch Unit 1). Zusätzlich: **Link mit Voreinstellung** (`#v=…&mode=write&dir=ab`)
— die Lehrperson teilt nicht nur das Set, sondern die fertige Übung.

## Technik

Eine `index.html` — React 18, Tailwind, qrcode-generator per CDN, kein
Build-Schritt (Babel standalone wie MyMemory). Web Speech API für Hören/Sprechen,
Canvas für die Schreibfläche, `localStorage` für Sets + Lernstand. GitHub Pages
ab `main`. Lokal: `python3 -m http.server` → http://localhost:8000.

## Phasen

- [x] **0 — Gerüst**: Repo, GitHub Pages, dieser Plan.
- [x] **1 — Grundgerüst** (08.09.2026): Übersicht, Ordner, Import
  (`F:/A:/S:/H:`, `Sprachen:`), Editor, Export, Direktlink/QR, DE/EN,
  Beispiel-Sets, KI-Prompt. Dazu vorgezogen: **PWA-Manifest** + Icons und die
  Anleitung «Üben auf dem iPad» (Home-Bildschirm, Geführter Zugriff, Safari-
  Variante mit eingekreisten Bereichen) — auf Schul-iPads ohne App-Installation
  ist der Web-Clip der Weg.
- [x] **2 — Schreiben & Karteikarten** (08.09.2026): Set-Seite mit
  Rundeneinstellungen (Modus, Richtung, Auswahl alle/Fehler/fällig/Bereich,
  Reihenfolge, Toleranz streng/normal/locker, Hinweise, Abschreiben),
  `checkAnswer` mit Diff-Anzeige, Karteikarten mit Selbstbewertung, Wiederholung
  falscher Wörter am Rundenende, Zusammenfassung mit «Fehler nochmals üben»,
  Lernstand (Leitner-Fächer, Fehlerliste, fällig heute) inkl. Zurücksetzen.
  Vorlesen (Web Speech) und Vollbild-Knopf sind schon drin.
- [x] **3 — Weitere Modi** (08.09.2026): Multiple Choice (Ablenker aus demselben
  Set), Zuordnen (Gruppen zu 6, eigene Komponente `MatchRound`), Lückentext
  (Satz in Sprache B mit Lücke; Form per Stamm gefunden oder mit `*vais*`
  markiert — `splitSentence` ist die eine Stelle dafür), Hören (Wort per Web
  Speech vorgelesen, nur wenn die Sprache sprechbar ist), Buchstabensalat
  (Kacheln). Alle Modi teilen `Practice`; was ein Modus zeigt und verlangt,
  steckt in `task`. Stolperstein: die Aufgabe hängt am Wort, nicht an der
  Warteschlange — die wächst bei jedem Fehler, und Multiple Choice mischte
  sonst nach dem Antippen neu. Karteikarten bewerten und schalten im selben
  Schritt weiter: `finish` gibt den neuen Stand zurück, sonst fehlte das
  letzte Wort in der Bilanz.
- [x] **4 — Stift & Sperren** (08.09.2026): Modus **Handschrift** — Canvas mit
  Pointer-Events (`Sketch`, Pencil/Finger/Maus gleich, `touch-action: none`,
  Grundlinie, «Nur Stift annehmen»), Aufdecken, Selbstbewertung wie bei
  Karteikarten. **Prüfungsmodus** (`opts.exam`, nur automatisch korrigierbare
  Modi): `settle` schaltet ohne Rückmeldung weiter, keine Wiederholung, Log
  trägt Eingabe + Lösung, die Bilanz zeigt alles als Tabelle; Vollbild beim
  Start (die Geste vom Start-Knopf reicht), Vollbild-Verlassen und
  `visibilitychange` zählen als «Bildschirm verlassen». Vollbild-Aufrufe
  fangen das abgelehnte Promise (iPhone kann kein Element-Vollbild).
- [x] **5 — Feinschliff** (08.09.2026): **Übung teilen** auf der Set-Seite —
  Direktlink/QR mit allen Einstellungen als eigene Hash-Teile
  (`…&mode=write&dir=ab&sel=range&from=1&to=10…`, `optsToHash`/`optsFromHash`,
  `OPT_KEYS` hält die Route sauber), optional `go=1` = ohne Einstellungsseite
  (zündet nur beim ersten Aufbau, sonst startete jede Runde die nächste).
  Modus **Sprechen** (Web Speech Recognition, `recognizeOnce` mit fünf
  Alternativen, Vergleich «locker», zehn Sekunden Zeitgrenze — ein offener
  Mikrofon-Dialog meldet sonst nie etwas). **Blitzrunde**: Zeit pro Wort
  (5/10/20 s) für automatisch prüfbare Modi, Balken oben an der Karte, der
  Wecker liest den Stand aus einer Ref und wertet, was schon dasteht.
  **Sicherung**: Sets + Ordner + Lernstand als JSON aus den Einstellungen
  heraus oder per Datei-Ablage; Einlesen ergänzt (gleicher Titel = dasselbe
  Set, Lernstand pro Wort der neuere Versuch).

- [x] **6 — Wortformen: Deklinieren und Konjugieren** (28.09.2026), s.
  Abschnitt unten.

## Formen (Phase 6)

Formenlehre in allen Sprachen, geübt als eigene Übung statt als Umweg über
Wortpaare. Ein Wort kann eine **Formentabelle** tragen, mit höchstens zwei
Achsen (Zeilen × Spalten): Kasus × Numerus, Person × Tempus. Eine Achse ist
einfach eine Tabelle mit einer Spalte. Eine dritte Achse (Adjektiv: Genus)
wird ein eigener Eintrag: «bonus (m.)», «bona (f.)».

**Die Sets unterscheiden sich durch ihren Inhalt, nicht durch eine Art.**
Wie der Lückentext nur geht, wenn Sätze da sind (`gapN`), gehen die
Formen-Modi nur, wenn Tabellen da sind. Ein Set kann beides: `F:`/`A:` bleiben
Grundform und Bedeutung, sodass auch Schreiben, Karteikarten usw. laufen und
MyMemory die Datei weiterhin als Wortliste liest (die neuen Zeilen überliest
es).

### Dateiformat

```
# Verben a-Konjugation
Sprachen: la → de
Zeilen: 1. Sg | 2. Sg | 3. Sg | 1. Pl | 2. Pl | 3. Pl
Spalten: Präsens | Perfekt

F: amare
A: lieben
T: amo | amavi
T: amas | amavisti
T: amat | amavit
T: amamus | amavimus
T: amatis | amavistis
T: amant | amaverunt
---
F: rosa
A: die Rose
Zeilen: Nom | Gen | Dat | Akk | Abl
Spalten: Singular | Plural
T: rosa | rosae
T: rosae | rosarum
…
---
```

- `Zeilen:`/`Spalten:` im Kopf gelten für alle Einträge, im Eintrag nur für
  diesen (Verben und Nomen im selben Set). `T:` ist eine Tabellenzeile, Zellen
  mit ` | ` getrennt. Fehlen die `Spalten:`, hat die Tabelle eine Spalte.
- In einer Zelle gelten `/` (Alternativen, «amavisti / amasti») und `( )` wie
  überall. `–` heisst «gibt es nicht»; die Zelle wird nicht abgefragt.
- Die Tabelle gehört zu der Seite, mit deren Grundform die Formen anfangen
  (`formSide`: amare/amo, der Hund/des Hundes), sonst zur **Fremdsprache**
  (`foreignLang`) — egal ob die auf `F:` oder `A:` steht. So sind `de → fr`
  (F: gehen, A: aller, T: je vais …), `la → de` und `fr → de` gleich zu
  schreiben. Stimme, Artikel und iink-Sprache kommen von dort.
- Passt die Zahl der Zellen nicht zu den Beschriftungen, wird der Eintrag
  trotzdem gelesen. Der Editor zeigt die Abweichung an, statt sie zu schlucken.

### Datenmodell

Am Wort: `f: { r: [...], c: [...], t: [[...], ...] }` (Zeilen-, Spalten-
beschriftungen, Zellen). Es entsteht über `cleanWord` wie alles andere und
steht im Direktlink als achtes Feld des Wort-Arrays, sodass alte Links gültig
bleiben. `toFile` schreibt `Zeilen:`/`Spalten:` pro Eintrag (dieselben
Beschriftungen werden ausnahmsweise im Kopf zusammengefasst).

**Lernstand pro Form** über `wordKey` der Form-Wörter (Grundform samt
Beschriftungen + Form) — über die Beschriftungen, nicht über die Stelle,
damit das Einfügen einer Spalte den Stand nicht verschiebt. Der Stand des
Wortes selbst (Grundform ↔ Bedeutung) bleibt davon getrennt. Leitner,
Fehlerliste und «fällig» funktionieren pro Form unverändert.

### Modi

**Umgesetzt (6a) anders als zuerst geplant:** Statt einer Kachel «Formen»
steht bei Sets mit Tabellen über den Kacheln die Wahl **«Was willst du üben?
Wörter · Formen»**. Mit «Formen» wird jede Zelle zu einem eigenen Wort
(`formSet`: vorne «manger · nous · présent», hinten «mangeons»), und
**alle bestehenden Modi** laufen darauf: Schreiben mit allen drei
Eingaben, Karteikarten, Multiple Choice (Ablenker zuerst aus derselben
Tabelle), Zuordnen, Hören, Sprechen, Buchstabensalat, dazu Blitzrunde und
Prüfung. Die «Einzelform» ist damit kein eigener Modus mehr. Die Richtung
steht fest (Grundform → Form), der Lückentext fällt mangels Sätzen weg.

Dazu zwei Modi, deren Kacheln nur mit «Wortformen» erscheinen (`FORM_MODES`):

1. **Bestimmen** (`parse`, 6b): Eine Form wird gezeigt (Grundform und
   Bedeutung dabei), gesucht sind Zeile und Spalte, gewählt mit zwei
   Knopfreihen (bei einer Spalte nur eine). Bei mehrdeutigen Formen
   («rosae»: Gen. Sg., Dat. Sg., Nom. Pl.) genügt eine richtige Wahl; die
   Lösung zeigt alle Lesarten, und jede Form wird nur einmal gefragt.
   Automatisch geprüft, also auch mit Blitzrunde und Prüfung.
2. **Tabelle** (`table`, 6c, `TableRound`): Die ganze Tabelle als Raster aus
   Eingabefeldern. Statt einer eigenen Vorgabe-Wahl entscheidet die übliche
   Auswahl: die gewählten Formen sind leer, die übrigen stehen schon da — mit
   «nur Fehler» übt man genau die Lücken im Zusammenhang. «Prüfen» wertet
   jede Zelle für sich, falsche zeigen die Lösung; gezählt wird pro Form.
   Enter springt spaltenweise weiter. Nur Tastatur (auf dem iPad geht
   Scribble), ohne Blitzrunde und Prüfung.

**Toleranz:** Bei Formen gibt es **weder Tippfehler- noch
Artikel-Toleranz** (`checkAnswer` mit `forms`). Ein Buchstabe ist hier die
Grammatik: «amat» statt «amant» ist die falsche Person, «dem Hundes» statt
«des Hundes» der falsche Fall. Gross/klein und Akzente folgen weiter der
Stufe. Die übrigen Formen der Runde gehen wie immer als `others` mit. Das
gilt auch beim Sprechen. Beim Hören steht bei Wortformen die Frage da —
mange/manges/mangent klingen gleich.

### Editor und KI-Prompt

- **KI-Prompt:** neue Zeile im Ausfüllblock «Formen: [leer = du entscheidest
  / nein / z. B. Verben im Präsens]» und ein Block FORMEN mit Beispiel. Ohne
  Angabe und ohne Formen im Material gibt es keine Tabelle und keine
  Rückfrage; gefragt wird nur, wenn Formen gewünscht sind, aber offen bleibt,
  welche. Die KI
  schreibt die Formen aus; eine Regelmaschine in der App gibt es bewusst
  nicht (unregelmässige Formen, eine Sprache nach der anderen). Der Prompt
  verlangt, unsichere Formen wegzulassen statt zu raten, und die Anleitung
  sagt: Tabellen vor dem Üben durchsehen.
- **Editor:** pro Wort «+ Wortformen» klappt ein Textfeld auf, mit den
  Zeilen `Zeilen:`/`Spalten:`/`T:` in derselben Schreibweise wie die Datei
  (derselbe Zeilenleser `readTableLine` wie für Dateien; andere Zeilen, auch
  `F:` und `---`, werden übergangen). Darunter steht live, was nicht zusammenpasst:
  unverständliche Zeilen, falsche Anzahl Beschriftungen oder Zellen. Ein
  echtes Tabellenraster kommt erst, wenn sich das Textfeld im Alltag als
  mühsam erweist.

### Reihenfolge

- [x] **6a** (28.09.2026): Format lesen und schreiben (`parseFA`, `toFile`,
  `cleanWord`, Direktlink `&forms=1`), Lernstand pro Form, «Wörter · Formen»
  auf der Set-Seite, KI-Prompt (die KI entscheidet selbst und fragt nur bei
  Unklarheit nach), zwei Verben mit Tabelle im Beispiel Französisch. Der
  Editor zeigt die Tabelle nur an und behält sie beim Speichern. In Node
  26 Fälle (Datei- und Link-Rundlauf, alte Links, Korrektur); im Browser
  Schreiben, Multiple Choice und Zuordnen auf Formen.
- [x] **6b/6c** (28.09.2026): «Wortformen» statt «Formen» in der
  Oberfläche; **Bestimmen**, **Tabelle**, Tabellen im Editor, Abschnitt
  «Wortformen» in der Anleitung (verlinkt von der Set-Seite). Im Browser
  geprüft: Bestimmen mit einer und zwei Spalten, mehrdeutige Form, Link mit
  `go=1`; Tabelle mit Fehler, leerem Feld und Gross/klein; Editor mit
  Meldungen und Speichern.
- [x] **Review** (29.09.2026): 14 Befunde behoben, s. Stand 18.

## Backlog / Ideen

- Lernstand geräteübergreifend live (ein Sync via GitHub/Gist bräuchte ein
  Token pro SchülerIn — eher nicht; die Sicherung als Datei deckt den Umzug ab).
- Bilder statt Wort A (Bild-URL) für Anfänger.
- Offline (Service Worker) für Schul-iPads ohne stabiles WLAN.
