# MyVoci — Plan

Vokabeltrainer für den Unterricht, komplett clientseitig wie MyMemory: eine
`index.html`, kein Backend, gespeichert im Browser, geteilt per Direktlink/QR.
Live: https://manuel-benz.github.io/MyVoci/

**Stand (08.09.2026):** Phasen 0–5 sind fertig — neun Übungsmodi, automatische
Korrektur, Lernstand mit Leitner-Fächern, Prüfungsmodus, Teilen-Links mit
Voreinstellung, Sicherung als Datei. Offen ist nur noch der Backlog zuunterst;
auf dem iPad geprüft werden müssen Handschrift, Hören und Sprechen.

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
| **Schreiben** | Tastatur oder Stift (s. u.) | automatisch, mit Toleranz |
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

## Backlog / Ideen

- Lernstand geräteübergreifend live (ein Sync via GitHub/Gist bräuchte ein
  Token pro SchülerIn — eher nicht; die Sicherung als Datei deckt den Umzug ab).
- Bilder statt Wort A (Bild-URL) für Anfänger.
- Konjugations-/Formen-Sets (mehrere Spalten) — eigenes Format, erst wenn nötig.
- Offline (Service Worker) für Schul-iPads ohne stabiles WLAN.
