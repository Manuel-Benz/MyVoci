# MyVoci

Vokabeltrainer für den Unterricht – Tastatur oder Stift, beide Richtungen,
automatische Korrektur, Anwendungssätze, Lernstand mit Leitner-Fächern.
Komplett clientseitig (wie MyMemory): kein Backend, keine Inhalte auf GitHub.

**Live:** https://manuel-benz.github.io/MyVoci/

## Set erstellen

Das **+** bei «Meine Voci» oder an einem Ordner öffnet den Kasten **«Voci-Set
erstellen»** (mit diesem Ordner als Ziel). Dort: KI-Prompt kopieren, in
Claude/ChatGPT den Block zuoberst ausfüllen (Thema oder Buchseite, Sprachen,
Anzahl), die gelieferte `.txt` in den Kasten ziehen — oder Text einfügen, eine
Datei wählen oder **von Hand** im Editor anlegen.

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
- Listen auf beiden Seiten: Punkte mit `1.`, `2)`, `-` oder `•` vorne, auf
  einer Zeile mit ` | ` getrennt (`A: 1. petere | 2. appetere`, auch `F:`).
  Ein Punkt genügt; mit der Zeile `W: alle` müssen beim Schreiben und bei der
  Handschrift alle kommen.
- `HF:` / `HA:` Hinweis zu Sprache A bzw. B: wird diese Seite gefragt, steht er
  gleich da, wird sie gesucht, erst mit der Lösung. Für Hinweise, die das Wort
  verraten (Stammformen, Genitiv). `H:` steht wie bisher immer da.

## Üben

Set antippen → Einstellungen wählen → **Üben starten**.

- **Schreiben**: Wort eintippen (Tastatur oder Stift – auf dem iPad schreibt
  Scribble direkt ins Feld). Korrektur regelbasiert, ohne KI: Gross/klein egal,
  Alternativen und Klammern zählen, ein Tippfehler = «fast richtig» (gilt als
  gewusst, Abweichung wird markiert). Toleranz *streng* (alles exakt), *normal*,
  *locker* (Akzente und Artikel egal). Falsche Wörter werden einmal
  abgeschrieben und kommen am Rundenende nochmals dran.
- **Schreiben mit Handschrift**: unter «Schreiben» die Eingabe wählen
  (Tastatur · Handschrift ohne Kontrolle · Handschrift mit Kontrolle).
  *Ohne Kontrolle*: auf die Schreibfläche schreiben, aufdecken, selbst bewerten –
  wie auf Papier. *Mit Kontrolle*: MyScript erkennt die Schrift und korrigiert
  wie beim Tippen (braucht zwei Schlüssel, s. Anleitung in der App). Option
  «Nur Stift annehmen» gegen Handballen-Striche.
- **Karteikarten**: umdrehen, «Gewusst / Nicht gewusst».
- **Multiple Choice**: vier Antworten, die falschen stammen aus demselben Set.
- **Zuordnen**: Gruppen von sechs Paaren, links antippen, rechts die Übersetzung.
- **Lückentext**: der Anwendungssatz mit Lücke, das Wort in der passenden Form
  eintippen (nur Wörter, deren Satz das Wort enthält).
- **Hören**: das Wort wird vorgelesen (Web Speech), aufschreiben, was man hört.
- **Buchstabensalat**: Buchstaben-Kacheln in die richtige Reihenfolge tippen.
- **Sprechen**: das Wort aussprechen, das Gerät hört zu (Spracherkennung von
  Safari/Chrome) und vergleicht grosszügig.
- **Blitzrunde**: «Zeit pro Wort» 5/10/20 s – läuft die Zeit ab, zählt das
  Wort als falsch; was schon dasteht, wird noch gewertet.
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

**Übung teilen** (Kästchen auf der Set-Seite): der Link bringt das Set *und*
die gewählten Einstellungen mit (Modus, Richtung, Auswahl, Toleranz, Zeit,
Prüfungsmodus). Mit «Direkt starten» landet die Klasse ohne Einstellungsseite
in der Übung – praktisch für die Prüfungssituation.

**Sicherung** (Einstellungen → Sicherung): alle Sets, Ordner und der Lernstand
als eine JSON-Datei, zum Umziehen auf ein anderes Gerät. Einlesen ergänzt, was
fehlt, und behält pro Wort den neueren Lernstand. Die Datei kann auch einfach
auf die Seite gezogen werden.

## Technik

Eine einzelne [index.html](index.html): React, Tailwind und qrcode-generator per
CDN, kein Build-Schritt; JSZip nur beim Export. PWA-Manifest für den
Home-Bildschirm. GitHub Pages liefert vom main-Branch. Lokal testen:
`python3 -m http.server` und http://localhost:8000 öffnen.
