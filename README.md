# MyVoci

Vokabeltrainer für den Unterricht – Tastatur oder Stift, beide Richtungen,
automatische Korrektur, Anwendungssätze, Lernstand mit Leitner-Fächern.
Komplett clientseitig (wie MyMemory): kein Backend, keine Inhalte auf GitHub.

**Live:** https://manuel-benz.github.io/MyVoci/

## Set erstellen

Im Kästchen **«Voci-Set erstellen»**: KI-Prompt kopieren, in Claude/ChatGPT den
Block zuoberst ausfüllen (Thema oder Buchseite, Sprachen, Anzahl), die
gelieferte `.txt` auf die Seite ziehen. Oder von Hand mit dem **+** im Editor.

Format (kompatibel mit MyMemory/MyTafelfussball – dieselbe `F:/A:`-Datei läuft
in allen Apps, die Zusatzzeilen überlesen die anderen):

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
S: Je vais à l'école à pied.
---
```

- `Sprachen: de → fr` (auch Namen: `Deutsch → Französisch`) steuert Vorlesen und
  Artikel-Toleranz. Ohne Zeile heisst es «Sprache A / B».
- `A:` mehrere gültige Antworten mit `/`; Klammern `(la) maison` = optional.
- `S:` Anwendungssatz (mehrere Zeilen oder mit `|`), `H:` Hinweis – beides optional.
  Weicht die Form im Satz stark vom Wort ab, mit Sternchen markieren:
  `S: Je *vais* à l'école.` – das wird die Lücke im Lückentext.

## Üben

Set antippen → Einstellungen wählen → **Üben starten**.

- **Schreiben**: Wort eintippen (Tastatur oder Stift – auf dem iPad schreibt
  Scribble direkt ins Feld). Korrektur regelbasiert, ohne KI: Gross/klein egal,
  Alternativen und Klammern zählen, ein Tippfehler = «fast richtig» (gilt als
  gewusst, Abweichung wird markiert). Toleranz *streng* (alles exakt), *normal*,
  *locker* (Akzente und Artikel egal). Falsche Wörter werden einmal
  abgeschrieben und kommen am Rundenende nochmals dran.
- **Karteikarten**: umdrehen, «Gewusst / Nicht gewusst».
- **Multiple Choice**: vier Antworten, die falschen stammen aus demselben Set.
- **Zuordnen**: Gruppen von sechs Paaren, links antippen, rechts die Übersetzung.
- **Lückentext**: der Anwendungssatz mit Lücke, das Wort in der passenden Form
  eintippen (nur Wörter, deren Satz das Wort enthält).
- **Hören**: das Wort wird vorgelesen (Web Speech), aufschreiben, was man hört.
- **Buchstabensalat**: Buchstaben-Kacheln in die richtige Reihenfolge tippen.
- **Handschrift**: mit Stift oder Finger auf die Schreibfläche schreiben, aufdecken,
  selbst bewerten – wie auf Papier, ohne Erkennung. Option «Nur Stift annehmen»
  gegen Handballen-Striche.
- **Prüfungsmodus** (Schreiben, Lückentext, Hören, Multiple Choice,
  Buchstabensalat): keine Rückmeldung während der Runde, keine Wiederholung,
  Lösungen erst am Ende als Tabelle. Startet im Vollbild; Verlassen des
  Vollbilds oder Wechseln der App wird gezählt und im Ergebnis angezeigt.
  Zusammen mit dem Geführten Zugriff (s. unten) ist das die Prüfungssituation.
- **Richtung** A→B, B→A oder gemischt; **Auswahl** alle / nur Fehler / fällig
  heute / Bereich; Reihenfolge zufällig oder wie in der Liste.
- **Lernstand** pro Wort im Browser: richtig = ein Leitner-Fach höher (Fach 5
  alle zwei Wochen fällig), falsch = zurück in Fach 1. Bleibt beim Teilen aussen vor.

## iPad

Kästchen **«Üben auf dem iPad»** auf der Startseite: Safari → Teilen → «Zum
Home-Bildschirm» (Web-Clip, keine App-Installation, geht meist auch auf
Schul-iPads), dann **Geführter Zugriff** zum Einsperren. Nur Safari möglich?
Beim Geführten Zugriff Adressleiste und Tab-Leiste einkreisen.

## Teilen, ordnen, exportieren

Wie in MyMemory: Direktlink (Set komprimiert im `#`-Fragment) und QR-Code,
Ordner per Drag & Drop, Export als `.txt` oder alles als ZIP, Oberfläche DE/EN.

## Technik

Eine einzelne [index.html](index.html): React, Tailwind und qrcode-generator per
CDN, kein Build-Schritt; JSZip nur beim Export. PWA-Manifest für den
Home-Bildschirm. GitHub Pages liefert vom main-Branch. Lokal testen:
`python3 -m http.server` und http://localhost:8000 öffnen.
