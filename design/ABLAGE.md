# My-Ablage – Regeln

Gilt für MyKahoot, MyVoci, MyMemory, MyTafelfussball: wie Quizzes, Voci-Sets, Memories und Aufgaben-Sets entstehen, heissen, liegen und weitergegeben werden. Der gemeinsame Code steht in `js/my-ablage.js` (Browser: `window.MyAblage`, Node: `require`), Tests: `node --test js/`. Wie `DESIGN.md` wird beides per `./sync.sh` verteilt und in den Apps nie von Hand geändert.

**Stand 2026-10-21, in allen vier Apps umgesetzt.** Vorlage ist MyVoci, wo nichts anderes steht.

## Begriffe
- **Set:** eine Datei mit Inhalt (Quiz, Voci-Set, Memory, Aufgaben-Set). Ein Set ohne Inhalt gibt es nicht: Es wird weder geschrieben noch gelesen.
- **Sammlung:** alle Sets einer App samt Ordnern, im Browser als `{ sets, folders }`.
- **Ordner:** Pfad mit `/`, z. B. `Mathe/Klasse 8`. `''` ist der Hauptordner.
- **Ort:** Ordner + Titel. Daran hängt, was als «dasselbe Set» gilt (s. „Dasselbe Set").

## Datei
- Endung **`.txt`** in allen Apps, UTF-8. Gelesen wird auch CRLF.
- Aufbau: Zeile `# Titel`, dann Kopfzeilen `Schlüssel: Wert`, eine Leerzeile, dann der Inhalt.
- Gemeinsame Kopfzeile `Sprache: de|en` = Sprache der Oberfläche beim Spielen. Gelesen wird grosszügig (`Language:`, «Deutsch», «English», «German»). Fehlt sie, gilt die Einstellung der App bzw. was die App rät.
- App-eigene Kopfzeilen (z. B. `Sprachen: de → fr` in MyVoci) und unbekannte Zeilen überlesen die anderen Apps still.
- **Titel** aus `# Titel`. Nur wenn die Zeile fehlt, aus dem Dateinamen: ohne Endung, ohne alte Präfixe `Voci_`/`Memory_`, `_` wird Leerzeichen.
- **Text aus dem Chat** wird bereinigt: Fettschrift, die den ganzen Text umschliesst (`# **Titel**`, `- **4**`), fällt weg (nur doppelte Sterne, der einfache ist in MyKahoot die Lösungsmarkierung). Leere Inhaltszeilen fallen weg.
- **Export und Import sind Gegenstücke:** geschrieben wird genau die Datei, die der Import unverändert wieder liest (`# Titel` inklusive).

### Inhalt: Paare (MyVoci, MyMemory, MyTafelfussball)
```
# Hauptstädte Europas
Sprache: de

F: Hauptstadt der Schweiz
A: Bern
---
```
- `F:` Vorderseite/Frage (gelesen auch `Q:`), `A:` Rückseite/Antwort, `---` nach jedem Paar, auch nach dem letzten.
- MyVoci-Zusätze (`S:`, `H:`, `HF:`, `HA:`, `W:`, `Zeilen:`/`Spalten:`/`T:`) überlesen die anderen. Eine Liste steht auf **einer** Zeile mit ` | ` (`A: 1. petere | 2. appetere`), weil MyMemory nur die erste `A:`-Zeile liest.
- Altes MyMemory-Format (`## Vorderseite` + nächste Zeile) wird weiter gelesen, nie geschrieben.

### Inhalt: Quiz (MyKahoot)
```
# Titel
Sprache: de

## Fragetext?
![](fotos/gepard.jpg)
- falsch
- *richtig
Zeit: 30
```
- Format wie bisher (MyKahoot-CLAUDE.md, „Quiz-Format"), nur die Endung wird `.txt`.
- Eine Quiz-Datei erkennt MyKahoot am Inhalt (`## ` mit `- `-Antworten darunter), nicht an der Endung. Eine Paar-Datei im Quiz-Ordner wird übergangen, nicht als kaputtes Quiz gemeldet.
- `.md` und `.json` werden weiter gelesen. Ein `.md`-Quiz wird beim nächsten Speichern im Editor zu `.txt` (die alte Datei verschwindet, Medien bleiben, wo sie sind).

## Namen
- **Der Titel bleibt, wie er ist:** Umlaute, Akzente, «–» und Gross/Klein gehören zum Titel.
- **Datei- und neue Ordnernamen ohne Sonderzeichen** (`plainName`): Umlaute ausgeschrieben (ä → ae, ß → ss), Akzente weg, Leerzeichen bleiben, alles ausser Buchstaben, Ziffern, Leerzeichen und `( ) , . ' -` wird `-`, mehrfache `-` und Leerzeichen zusammengezogen, an den Enden weg. `Unité 3 – La maison` → `Unite 3 - La maison.txt`.
- Bleibt dabei kein lateinischer Buchstabe übrig (griechischer Titel), werden nur die vom Dateisystem verbotenen Zeichen ersetzt (`safeName`), sonst hiessen alle solchen Sets gleich.
- **Bestehende Ordner** werden nicht umbenannt: Neben `Französisch/` entsteht nie ein zweites `Franzoesisch/` (`safeDir` für vorhandene Ordner).
- **Von Hand benannte Dateien** behalten ihren Namen: Weicht der Dateiname vom Automatiknamen ab, merkt ihn das Set (`file`). Benennt man ein Set in der App um, dessen Datei bisher automatisch nach dem alten Titel hiess (auch nach einer früheren Regel, z. B. mit Umlaut), fällt `file` weg und die Datei heisst danach wie der neue Titel. Eine von Hand benannte Datei (`Fremd.txt`) behält ihren Namen.
- Keine App-Präfixe (`Memory_…`) und keine Slugs (`hauptstaedte-europas.md`) mehr.

## Dasselbe Set
- **Ort = Ordner + Titel, ohne Gross/Klein** (macOS und Windows kennen keinen Unterschied). Titel sind nur im Ordner eindeutig, nicht in der App: Zwei Klassen dürfen gleiche Titel haben.
- Ein Platz ist besetzt, wenn **Titel oder Dateiname** gleich sind (`sameSlot`): «Unité 3» und «Unite 3» ergäben dieselbe Datei.
- Ordnernamen gelten ohne Gross/Klein als gleich. «Verben» → «verben» ist ein Umbenennen, keine Kollision.
- Bei Kollision: Import und Speichern fragen «ersetzen?», Verschieben und Umbenennen melden den Fehler und tun nichts. Kein stilles Ausweichen auf `titel-2`. Ein **Link** ersetzt ohne Frage: Er ist die neuere Fassung desselben Sets (s. „Weitergeben“), wer ihn öffnet, will ihn. Sicherung einlesen ersetzt nie, sie ergänzt. Liegt unter dem Dateinamen eine Datei, die kein Set dieser App ist (in MyKahoot z. B. ein Memory), wird sie nie ersetzt: Das Speichern meldet den Fehler. Einzige Ausnahme vom Ausweichen: alte Stände, in denen zwei Sets nach einer früheren Namensregel dieselbe Datei ergeben («Unité 3»/«Unite 3»), werden beim Laden einmal getrennt (`Unite 3 (2).txt`, `resolveSlots`).

## Ordner
- **Beliebig tief.** Die Ordner der Sammlung sind die Ordner auf der Platte.
- **Baum** als kompakte Liste (DESIGN.md, „Listen"), aufklappbar. Welche Ordner offen sind, merkt sich der Browser.
- **Ziehen** (aus MyKahoot): Sets **und** Ordner samt Inhalt. Ziel ist die ganze Ordnerkachel (ein Drop auf ein Set meint dessen Ordner), die Liste selbst ist der Hauptordner. Nicht in sich selbst, nicht dorthin, wo es schon liegt. In MyKahoot wandern Medien mit.
- **Anlegen** über «Neuer Ordner» (Unterordner mit `/`), **Umbenennen** am Ordner, **Löschen** nur leer. Leere Ordner bleiben stehen, bis man sie löscht. Was der Finder hinterlässt (`.DS_Store`, `._*`), zählt nicht: Ein geleerter Ordner gilt als leer. Andere versteckte Dateien (`.notizen`, `.gitkeep`) halten den Ordner.
- **Automatische Ablage nur in MyVoci:** ohne gewählten Ordner in den Ordner der Fremdsprache, darin der höchste `Klasse N` (Details: MyVoci-CLAUDE.md, „Benennung und Ablage"). Die anderen Apps legen in den gewählten Ordner, ohne Wahl in den Hauptordner.

## Speicherort
- **Ablageordner `~/Documents/My<App>`** (`MyKahoot`, `MyVoci`, `MyMemory`, `MyTafelfussball`). Liegen dort, gleichen sich über iCloud («Schreibtisch & Dokumente») zwischen den Macs ab.
- **MyKahoot** liest und schreibt den Ordner direkt (Server). Der Ordner ist umstellbar wie bisher.
- **Browser-Apps** (Chrome/Edge am Computer): File System Access API, Auswahl startet in «Dokumente» (`startIn: 'documents'`), Handle in IndexedDB `<app>` → `kv` → `dir`. `localStorage` bleibt Zwischenspeicher.
- Der Ordner wird **unter der Liste angeboten**, solange keiner verbunden ist. Knöpfe (wählen, freigeben, neu laden, trennen) stehen in den Einstellungen. Wo es nicht geht (Safari, iPad), steht nichts. Dort hilft die Sicherung (s. „Weitergeben").
- Texte, die den Speicherort nennen, hängen am Ordner-Status: Mit Ordner liegen die Sets dort, im Browser nur noch der Rest (z. B. Lernstand).
- Was kein Set ist (Lernstand, Einstellungen, Spielstand), bleibt in der App bzw. im Browser und kommt nie in den Ordner.
- Installierte Home-Bildschirm-App: `navigator.storage.persist()` anfragen, sonst darf iOS den Speicher räumen.

### Abgleich mit dem Ordner (Browser-Apps, aus MyVoci)
1. **Beim Start und beim Fenster-Fokus gilt der Ordner allein.** Neu gelesen wird nur, was sich geändert hat (Grösse + Änderungszeit). Ist nichts anders, wird auch nicht neu gezeichnet.
2. **Geschrieben wird nur die Differenz** (`mirrorDir`, Vergleich über die id: Pfad und Inhalt). `mirrored` hält fest, was der Ordner zuletzt sah. Was aus dem Ordner gelesen wird, wird nicht zurückgeschrieben, sonst bügelte die App jede von Hand geschriebene Datei in ihr Format.
3. **Eine Promise-Kette** für alle Ordner-Zugriffe: Ein Nachlesen darf nicht in ein halb geschriebenes Set hineinlesen. Ein Auftrag für einen inzwischen getrennten Ordner verpufft still.
4. **`disk` = «lag schon einmal im Ordner».** Fehlt ein solches Set beim Nachlesen, wurde es im Finder gelöscht. Eines ohne Merkmal wurde bloss noch nie geschrieben und bleibt.
5. **Zuordnung beim Lesen:** zuerst Ort, dann «verschoben» (nur für Sets mit `disk`, deren Titel auf beiden Seiten genau einmal vorkommt). Daran hängen ids und damit Lernstand.
6. **Beim ersten Verbinden** wandern Sets, die nur im Browser liegen, in den Ordner. Gleiche Sets werden vereint, nicht ersetzt.
7. **Ein Schreibweg** für die Sammlung (`commit`: speichern, zeichnen, spiegeln).

## Erstellen
**Ein Kasten auf der Startseite, in allen vier Apps gleich** (Vorbild MyVoci): «Voci-Set erstellen», «Memory erstellen», «Kahoot erstellen», «Tafelfussball erstellen». Zu ist er eine Zeile mit Pfeil über der Sammlung, offen steht darin von oben nach unten:
1. **Speichern in** (Ordnerwahl).
2. Die vier Schritte.
3. **«KI-Prompt kopieren»** als breiter Hauptknopf.
4. **Ein Feld** für Text *oder* Datei: einfügen oder die Datei hineinziehen. Kein Knopf «Datei wählen», keine eigene Ablagefläche.
5. Die Vorschau (unten).
6. **«oder von Hand»** und **«Leeres … von Hand anlegen»**: MyVoci und MyMemory öffnen ihren Editor, MyKahoot den Editor-Tab, MyTafelfussball eine leere Liste im Lehrer:innen-Fenster.

«+» im Kopf der Sammlung und an jedem Ordner öffnet den Kasten mit diesem Ordner. Eine einzelne Datei, aufs Fenster gezogen, kommt ebenfalls in den Kasten, auf einen Ordner gezogen mit diesem Ordner (MyKahoot nimmt Dateien auf der Liste an, MyTafelfussball kennt keine Ordner als Ziel). Mehrere Dateien gehen ohne Vorschau direkt in die Sammlung. Der Editor selbst hat keinen KI-Weg mehr.

**MyTafelfussball:** Kasten und Sammlung stehen auf der Startseite, nicht mehr im Lehrer:innen-Fenster. Die grosse Kachel einer Set-Zeile ist zweigeteilt: **Beamer** und **Lehrer:in** laden das Set und öffnen je ihr Fenster (in MyKahoot startet die eine Kachel das Quiz). Das Lehrer:innen-Fenster behält die aktuelle Liste mit «Speichern»; beide Fenster teilen die Sammlung.

### KI-Prompt
Aufbau im Stil von MyVoci, in jeder App gleich gegliedert, Deutsch und Englisch mit denselben Abschnitten:
1. **Rolle** in einem Satz («Du erstellst … für den Unterricht.»).
2. **Ausfüllblock** `===== NUR DAS HIER AUSFÜLLEN =====`: Thema oder Material, Für wen, Anzahl, Schwierigkeit, Sprache, Besonderes. Dazu, was die App braucht (MyKahoot: Zeit pro Frage).
3. **Material:** Schicke ich Material mit, nur daraus. Sonst eigenes Wissen.
4. **SO GIBST DU ES AUS:** eine Datei `.txt`, Dateiname = Titel nach der Namensregel (`Unite 3 - La maison.txt`), dazu derselbe Inhalt in **einem** Code-Block. Kein Wort davor oder danach.
5. **FORMAT** als Beispiel, genau so.
6. **TITEL:** wie im Material (Lektion, Unité, Kapitel), sonst das Thema kurz. Nicht in den Titel: Klasse, Datum, Sprache, App-Name, «Quiz»/«Memory»/«Vocabulary».
7. **REGELN** der App (Format, Länge, Formeln als LaTeX in `$…$`).
8. **ZUM SCHLUSS** eine Prüfliste, still ausbessern, nur das Ergebnis ausgeben.

Der Prompt kennt die Ablage: Ändert sich Format, Titel- oder Namensregel, wird er in allen Apps nachgeführt.

### Text einfügen und Vorschau
- **Ein Feld** für den ganzen Text, kein eigenes Titelfeld: Der Titel kommt aus `# Titel`. Fehlt die Zeile, fragt die Vorschau danach.
- **Vorschau vor dem Speichern** für eingefügten Text und eine einzelne Datei (die Datei steht dann sichtbar im Feld): Titel, Zielordner, Anzahl, Inhalt so dargestellt wie in der App (Formeln gerendert), dazu Hinweise auf Zeilen, die nicht verstanden wurden (`strayLines`, höchstens drei genannt). Erst «In die Sammlung» bzw. «Speichern» legt das Set an. Bei besetztem Platz fragt sie «ersetzen?».
- Der Titel der Vorschau folgt dem Text, bis man ihn selbst ändert. Ohne `# Titel` bleibt das Feld leer und «In die Sammlung» setzt den Cursor hinein, statt ein Set «Voci»/«Memory» anzulegen.
- Mehrere Dateien auf einmal: ohne Vorschau, danach eine Meldung, was angekommen ist.

## Weitergeben
- **Datei:** ⤓ an jeder Set-Zeile lädt genau die Datei herunter, die der Import liest.
- **ZIP:** alle Sets samt Ordnern (auch leeren), gleiche Dateinamen im selben Ordner nummeriert. JSZip wird erst beim Export geladen.
- **Link/QR** (MyVoci, MyMemory, MyTafelfussball): `#<kürzel>=` + Daten, Kürzel `v` (MyVoci), `m` (MyMemory), `t` (MyTafelfussball). Daten = JSON-Array (Titel, Kopf, Inhalt), `deflate-raw`, base64url, Präfix `1.`. Ohne `CompressionStream` unkomprimiert mit `0.`. Neue Felder nur hinten, leere Enden fallen weg: Alte Links bleiben gültig. Beim Empfänger wird der Link ein eigenes Set (gleicher Ort ersetzt, ein unverändert vorhandenes Set wird nur geöffnet).
- **MyKahoot** hat keinen Link (Medien, der Empfänger braucht ohnehin den Server). Dafür bleiben Vorschau und **Arbeitsblatt als PDF**.
- **Sicherung** (Browser-Apps, v. a. für Safari/iPad): eine JSON-Datei `{ app, version, sets, folders, … }` ohne Ordner-Buchführung (`disk`, `file`). Einlesen ergänzt, was fehlt, und ersetzt nichts.

## Umgesetzt (2026-10-21, Kasten angeglichen 2026-10-22)
| App | Was dazukam |
|---|---|
| MyKahoot | `.txt` schreiben, `.md` lesen und beim Speichern umziehen, Quiz am Inhalt erkennen · Dateiname = Titel nach `plainName` (alte Slugs ziehen beim Umbenennen mit) · gleicher Platz: Editor fragt «ersetzen?», Verschieben lehnt ab · neue Ordner nach der Namensregel · KI-Prompt mit Dateiname und TITEL · Kasten «Kahoot erstellen» auf der Startseite (Vorschau, «In die Sammlung», Hinweis auf unverstandene Zeilen), der Editor ist nur noch zum Bearbeiten und für «von Hand» · Kopf «Meine Kahoots» mit ＋ und Ordner. Der Server lädt `public/design/js/my-ablage.js`. |
| MyVoci | `my-ablage.js` · ein Feld für Text oder Datei, mit Vorschau |
| MyMemory | `my-ablage.js`, Namensregel · ein Feld für Text oder Datei, mit Vorschau, «+» an jedem Ordner öffnet den Kasten · «ersetzen?» beim Import · KI-Prompt ohne `Memory_`, mit TITEL · Sicherung · Link wird ein eigenes Memory (Link trägt jetzt auch die Sprache, alte Links gelten weiter) |
| MyTafelfussball | `# Titel` in der Datei, Namensregel, `my-ablage.js`, Ordner ziehen, Link/QR (`#t=`), ZIP, Sicherung, KI-Prompt nach dem Aufbau oben · Startseite mit Kasten «Tafelfussball erstellen» und Sammlung, Kacheln Beamer/Lehrer:in |

## my-ablage.js
Welche Namen es gibt, steht im `return` am Ende der Datei. Gruppen:
- **Überall** (Browser und Node): Namen, Ordnerpfade, Ort, Kopf (`titleFromFile` nimmt das alte KI-Präfix der App als Argument), `strayLines(text, known)` für die Vorschau, Link. Der MyKahoot-Server nutzt `plainName`, `cleanFolderName` und `strayLines`.
- **Browser:** Skripte laden mit Zeitlimit (`loadOnce`, `loadScript`), Herunterladen, ZIP, Ordner auf der Platte (`handleStore(app)`, `pickDir(app)`, `queue`).
- **`sammlung({ list, items, toFile, parseFile, merge, fallback })`** bindet das an das Set-Format einer App (`list`: Schlüssel der Sets, MyMemory `memories`): Dateiname, Platz, `readDir` (mit Cache), `mirrorDir`, `fromDisk(prev, disk, keepAll, root)` (was `mirrorDir` in `root` geschrieben hat, zählt wie `disk`, aus MyMemory; `forget(root)` beim Trennen), `prepareSave` (neue id, `dropAutoFile`), `resolveSlots` (beim Laden), ZIP, Sicherung (`backupFile`, `restoreBackup`: ergänzt über `sameSlot` und `merge`, liefert `idMap` für App-Eigenes wie den Lernstand), dazu die Ordner-Helfer an `list` gebunden (`ablage.allFolders(store)`, `ablage.renameFolderTarget(…)`, `ablage.resolveFolderPath(store, eingabe)` und `ablage.renamePathTarget(store, von, eingabe)` für ganze Pfade usw.).
- Bleibt pro App: Parser und `toFile` des Inhalts, Baum, Vorschau, React-Zustand (`mirrored`, `commit`).
- Abweichungen von MyVoci: `setPlace` ohne Gross/Klein (wie oben verlangt). Ein Ordner mit nur `.DS_Store`/`._*` gilt als leer. `mirrorDir` vergleicht pro Datei statt pro Set und löscht erst, bevor es schreibt (vorher gingen «gelöscht + auf denselben Namen umbenannt» und ein Namenstausch verloren). `queue` lehnt nie ab, Fehler gehen nur an `onError`.
