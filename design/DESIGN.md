# My-Designsystem – Regeln

Gilt für MySchool, MyVoci, MyMemory, MyKahoot, MyTafelfussball, MySound, MyLab. Die Werte stehen in `css/my-tokens.css` und `css/my-schemen.css`. Die visuelle Referenz ist `referenz/My Designsystem.dc.html`.

## Gemeinsam (in jeder App gleich)
- **Schrift:** Systemschrift (SF Pro). Titel 700, Laufweite -0.02em. Fliesstext 16–17px, Zeilenhöhe 1.55. Kleine Überschriften 13px, 650, Grossbuchstaben, Laufweite .08em.
- **Neutraltöne:** Hell: Grund #F6F4F1, Karte #FFFFFF, Linie #E6E2DC, Text #1D1D1F / #5A5A60 / #8A8A90. Dunkel: Grund #121213, Fläche #19191B, Karte #1F1F22, Linie #2E2E32, Text #F2F2F4 / #B4B4BA / #85858C.
- **Radien:** 6px für Kürzel und kleine Flächen, 10px für Knöpfe und Zeilen, 14px für Karten, Pillen 999px.
- **Leiste:** Dunkle Kopfleiste #202022 in jeder App, außer eine App weicht begründet ab (s. „Anpassungen pro App"). Aktiver Eintrag mit Akzent (dunkle Variante) bei 28 % Deckkraft hinterlegt, Schrift #FFFFFF. Inaktiv #D8D8DC.
- **Knöpfe:** Primär: Akzent als Fläche, --akzent-ink als Schrift, 600, Padding 10px 20px, Radius 10px. Sekundär: --akzent-weich als Fläche, Akzent als Text. Neutral: transparent, 1px Linie.
- **Pillen:** Akzent als Text auf --akzent-weich, 600, 12–13px, Padding 2–3px 8–10px. Signal-Pillen: Fehlt = --rot, Erledigt = --gruen, Warnung = --orange, Info = --blau.
- **Akzent als Text:** Wird abgedunkelt (hell) bzw. aufgehellt (dunkel), bis er 4.5:1 auf seiner Fläche erreicht. Token `--akzent-text` (my-tokens.css): Helligkeit in OKLCH gedeckelt (hell ≤ 0.5, dunkel ≥ 0.74), Farbton bleibt.
- **Modus erzwingen:** `data-modus="dunkel"` bzw. `"hell"` (an `<html>` oder einem Container) setzt die Neutraltöne unabhängig vom OS-Modus, z. B. für einen eigenen Umschalter der App.
- **Akzent ohne `--akzent-ink`:** Wo eine Umgebung keine dunkle Schrift auf dem Akzent kennt (MySchool/SwiftUI: weisse Schrift auf `.borderedProminent`), braucht der Akzent hell ≥ 4.5:1 auf Weiss und dunkel ≥ 3:1 für weisse Schrift. Zissou weicht dort auf Bernstein aus (#845400 / #B49000).

## Listen: zwei Formen
Jede App wählt pro Liste die passende Form. Radius, Hover-Fläche, Schrift und Abstände sind bei beiden gleich.
- **Kartenzeilen** für wenige Einträge mit zwei Zeilen Inhalt, Pillen oder Aktionen. Zum Beispiel Schüler, Termine, Notizen. Jede Zeile: Fläche --zeile, Rand 1px --zeile-linie, Radius 10px, Padding 9px 12px, Abstand 6px.
- **Kompakte Liste** (aus MyKahoot) für viele gleichartige Einträge mit einer Zeile, oft in Ordnern. Zum Beispiel Quizze, Vokabellisten, Memory-Sets. Keine Fläche, nur beim Darüberfahren --hover. Padding 5–6px 10px, Radius 10px, Abstand 2px. Name in fester Spalte (`flex: 0 1 19rem`, kürzt mit Ellipse), Anzahl direkt dahinter in --text-3, damit die Zahlen untereinander stehen. Werkzeuge als quadratische Symbolknöpfe (30–35px, transparent, Hover --hover) in gleicher Spalte. Ordner: aufklappbar mit Chevron, Inhalt eingerückt (14px Abstand + 10–12px Polster) an einer 2px-Linie in --linie.

## Farbschemen
Fünf Schemen: Fox, Budapest und Moonrise aus MySchool (`Farbpalette.swift`), Zissou und Isle of Dogs aus MyKahoot. Jedes Schema liefert Akzent, 9 Töne, 4 Signalfarben, 8 Glücksradfarben, 4 Spielfarben und 2 Bühnenfarben, jeweils für Hell und Dunkel (Spiel, Rad und Bühne sind in beiden gleich).

Spiel und Bühne (für Apps mit Beamer-Bühne, z. B. MyKahoot):
- `--spiel-N-ink`: Schrift auf der Spielfarbe. Weiss, solange es mindestens 3:1 erreicht (Antwortkacheln tragen grosse, fette Schrift), sonst #1D1D1F.
- `--akzent-buehne` / `--akzent-buehne-ink`: Akzent auf der Bühne. Die Bühne ist in beiden Modi dunkel, deshalb gilt immer der **Dunkel-Akzent** des Schemas, unabhängig vom OS-Modus. Schrift darauf #1D1D1F (gewinnt bei allen fünf Schemen den Kontrast gegen Weiss).

Regeln für bestehende und neue Schemen:
1. **Ein Bereich im Farbkreis:** Fox warm, Budapest Violett–Magenta, Moonrise Grün–Blau, Zissou Gelb–Rot, Isle of Dogs entsättigte Erdtöne.
2. **Ein Gegenpol:** Genau ein Ton liegt bewusst ausserhalb (Cyan, Messing, Rot, Meerblau, Lavendel).
3. **Abstand innerhalb:** Jedes Paar der 9 Töne liegt mindestens ΔE 20 (CIELAB, CIE76) auseinander, in Hell und Dunkel separat gerechnet.
4. **Lesbar:** Jeder Ton erreicht mindestens 3:1 auf #FFFFFF bzw. 4.6:1 auf #1E1E1E.
5. **Signal bleibt Signal:** Rot, Grün, Orange und Blau bleiben erkennbar, nur zum Schema hin getönt.
6. **Signal ist kein Ton (neue Schemen):** Signal-Rot und -Orange liegen mindestens ΔE 20 von jedem der 9 Töne, sonst sieht ein Kalender oder Tag in diesem Ton aus wie eine Warnung. Bekannte Ausnahmen aus der Zeit davor: Fox teilt Orange (Kürbis), Moonrise Rot (Suzy-Rot).
7. **Rad:** Die 8 Glücksradfarben liegen paarweise mindestens ΔE 20 auseinander.

Prüfwerte der aktuellen Schemen (min. ΔE / min. Kontrast):
- Fantastic Mr. Fox: Hell ΔE 23.0, 3.52:1 · Dunkel ΔE 21.6, 4.79:1
- Grand Budapest Hotel: Hell ΔE 21.0, 3.36:1 · Dunkel ΔE 21.5, 4.79:1
- Moonrise Kingdom: Hell ΔE 21.3, 3.09:1 · Dunkel ΔE 21.5, 4.80:1
- The Life Aquatic: Hell ΔE 24.2, 4.29:1 · Dunkel ΔE 24.7, 4.88:1
- Isle of Dogs: Hell ΔE 21.6, 5.17:1 · Dunkel ΔE 21.3, 5.10:1

Alle Schemen stehen allen Apps offen, auch als Einstellung für die Nutzer. Jede App hat ein Standardschema und einen Standardton als Akzent.

## Pro App
| App | Standardschema | Akzent (hell / dunkel) | Listenform | Icon |
|---|---|---|---|---|
| MySchool | Fantastic Mr. Fox | Rost-Karmin (#900B2E / #EC5E86) | karten | Oktopus, Kachel #900B2E |
| MyVoci | Moonrise Kingdom | Navy (#1E4F7A / #418ED7) | kompakt | Papagei, Kachel #1E4F7A |
| MyMemory | Grand Budapest Hotel | Aubergine (#4A2569 / #A17BBC) | kompakt | Elefant, Kachel #4A2569 |
| MyKahoot | The Life Aquatic | Akzent (#E1AF00 / #EBCC2A) | kompakt | Gepard, Kachel #A98404 |
| MyTafelfussball | Moonrise Kingdom | Tanne (#17603F / #2D9C69) | karten | Zebra, Kachel #17603F |
| MySound | The Life Aquatic | Tiefsee (#1B3F5C / #6A8FE8) | karten | Wal, Kachel #1B3F5C |
| MyLab | Grand Budapest Hotel | Himbeere (#A81B47 / #E35A83) | karten | Axolotl, Kachel #A81B47 |

## Anpassungen pro App
Das System ist ein Rahmen, kein Korsett: Eine App darf von Hand abweichen, wenn es zum Werkzeug passt. Die Abweichung steht dann in der CLAUDE.md der App. Beispiele aus MyKahoot:
- **Leiste optional:** MyKahoot hat die Kopfleiste bewusst nicht (sie störte), die Startseite trägt stattdessen einen Markenzug: Titel plus Tier-Logo als Maske in `currentColor` (hell auf dunkel, dunkel auf hell).
- **Hintergrund passend zum Tool:** Ein eigenes Bild (Dschungel, tags/nachts) darf den Grund ersetzen. Es muss dieselbe Umschaltung wie die Tokens mitmachen: `data-modus="dunkel"` von Hand **und** `prefers-color-scheme: dark` ohne `data-modus="hell"`. Bild-URLs und Schichten einmal als Custom Properties definieren, nicht in beiden Regeln kopieren. Karten und Listen bleiben auf `--karte`, frei stehender Text bekommt einen Hof in `--grund`.
- **Sonderstimmung:** Ein Modus (MyKahoot: Deep-Dark) darf Dunkel erzwingen und den Akzent ändern; Tokens und Kontrast (≥ 4.5:1 als Schrift) gelten weiter.

## Icons
- Weisses Tier auf farbiger Kachel (abgerundetes Quadrat, 1024×1024). Fertige Dateien: `icons/<app>.svg`. Die Originale ohne Einfärbung liegen in `icons/original/`.
- Kachelfarbe = heller Akzent der App, abgedunkelt Richtung #1A1410, bis Weiss darauf mindestens 3.5:1 Kontrast hat. Sie bleibt in Hell und Dunkel gleich.
- Am SVG-Pfad selbst nichts ändern, nur die beiden Füllfarben.
- Variante für Illustrationen (Website, Leerzustände): farbiges Tier auf Creme #F4ECDD, `icons/creme/<app>.svg`.
- Grössen: App-Icon 1024, in der Leiste 24px mit Radius 6px, in Listen 52px mit Radius 12px.
