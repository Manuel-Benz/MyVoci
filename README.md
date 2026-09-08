# MyVoci

Vokabeltrainer für den Unterricht – Tastatur oder Stift, beide Richtungen,
verschiedene Abfragemodi, automatische Korrektur, Anwendungssätze.
Komplett clientseitig (wie MyMemory): kein Backend, keine Inhalte auf GitHub.

**Live:** https://manuel-benz.github.io/MyVoci/

Status: im Aufbau — siehe [PLAN.md](PLAN.md).

## Technik

Eine einzelne `index.html` (React, Tailwind per CDN, kein Build-Schritt).
GitHub Pages liefert direkt vom main-Branch. Lokal testen:
`python3 -m http.server` und http://localhost:8000 öffnen.
