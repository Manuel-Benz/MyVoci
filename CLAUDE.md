# CLAUDE.md

Vokabeltrainer, clientseitig wie MyMemory (eine `index.html`, React + Tailwind
per CDN, `localStorage`, Direktlink im `#`-Fragment). Roadmap und Datenformat:
siehe PLAN.md. Sprache im Code und in Commits: Deutsch.

- Dateiformat bleibt kompatibel zu MyMemory/MyTafelfussball (`F:`/`A:`/`---`);
  `S:` (Satz), `H:` (Hinweis) und `Sprachen:` sind Zusätze, die andere Apps
  überlesen.
- Kein Build-Schritt. Lokal testen mit `python3 -m http.server`.
- GitHub Pages ab `main`, Ordner `/`.
