#!/usr/bin/env python3
"""Erzeugt den Rand der Übersicht, der oben dicht beginnt und nach unten ausdünnt
(wie Dschungel/Blut in MyKahoot und Pixel/Neuronen in MyMemory):
hintergrund/feder-N.svg (Hell: Gefieder des Papageis, aus dem sich nach unten
einzelne Federn lösen) und hintergrund/zeichen-N.svg (Dunkel: Buchstaben aus
verschiedenen Sprachen als Sternbild — MyVoci übt Wörter, nicht Bilder).

Jede Datei ist eine Farbschicht und dient als CSS-Maske (.rand in index.html):
eingefärbt wird mit Tokens des Schemas (--akzent, --rad-N), damit der Rand jedes
Farbschema mitmacht. Darum enthält eine Datei nur Alpha, keine Farbe. Keine
SVG-Filter: jeder Filter wird pro Element gerastert und bremst (MyMemory).
Kachelbreite 1200 px, nahtlos in x (über die Kante ragende Teile werden um ±1200
versetzt ein zweites Mal gezeichnet).

    python3 tools/make-hintergrund.py   # schreibt das Markup selbst nach index.html
"""
import hashlib
import math
import random
import re
from pathlib import Path

W = 1200
HOEHE = {'feder': 300, 'zeichen': 320}  # Kachelhöhe je Satz
out = Path(__file__).resolve().parent.parent / 'hintergrund'
out.mkdir(exist_ok=True)
for alt in out.glob('*.svg'):
    alt.unlink()


def save(name, h, body, defs=''):
    (out / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}">'
        f'<defs>{defs}</defs>{body}</svg>')


def shifts(x_min, x_max, margin=4):
    """Versätze, unter denen ein Element sichtbar ist: 0 und, wenn es über eine
    Kante ragt, die Kopie auf der anderen Seite."""
    res = [0]
    if x_min < margin: res.append(W)
    if x_max > W - margin: res.append(-W)
    return res


# ---------- Federn (Hell) ----------
# Eine Feder ist ein Kiel mit feinen Ästen links und rechts, schräg zur Spitze
# hin — aus Strichen statt einer gefüllten Fläche, sonst liest man sie als
# Blatt. Sie liegt entlang der y-Achse (Spule oben bei 0, Spitze unten bei L),
# leicht gebogen, und wird per transform gedreht. Ein, zwei Kerben (dort
# fehlen ein paar Äste) wie bei echten Federn. Schicht 0 = --akzent (der
# Grossteil), 1..4 = Rad-Farben.
def feather(L, wide, rnd):
    w = L * wide
    stem = L * 0.16                       # nackte Spule
    bend = rnd.uniform(-0.12, 0.12) * L   # Biegung des Kiels
    kx = lambda y: bend * (y / L) ** 2    # x des Kiels auf Höhe y
    # Der Kiel endet vor der Spitze: dort laufen die Äste zusammen, sonst
    # stünde unten ein nackter Stiel heraus
    d = [f'M0 0Q{bend * 0.2:.1f} {L * 0.45:.1f} {kx(L * 0.9):.1f} {L * 0.9:.1f}']
    cuts = [(c, c + 0.035) for c in (rnd.uniform(0.3, 0.8) for _ in range(rnd.choice((0, 1, 1, 2))))]
    for side in (-1, 1):
        y = stem
        while y < L * 0.92:
            t = (y - stem) / (L - stem)
            if not any(c0 < t < c1 for c0, c1 in cuts if side == (1 if c0 > 0.55 else -1) or c0 < 0.45):
                h = max(L * 0.04, w * math.sin(math.pi * min(1.0, t * 1.1 + 0.05)) ** 0.7 * (1 - t) ** 0.25)
                x0 = kx(y)
                x1, y1 = x0 + side * h, y + h * 0.95
                d.append(f'M{x0:.1f} {y:.1f}Q{x0 + side * h * 0.55:.1f} {y + h * 0.2:.1f} {x1:.1f} {y1:.1f}')
            y += 2.6
    return ''.join(d)


def federn():
    H = HOEHE['feder']
    rnd = random.Random(7)
    layers = 5
    parts = [[] for _ in range(layers)]

    def put(x, y, L, wide, angle, a, layer):
        d = feather(L, wide, rnd)
        for dx in shifts(x - L, x + L):
            parts[layer].append(
                f'<path transform="translate({x + dx:.1f} {y:.1f}) rotate({angle:.1f})" d="{d}" opacity="{a:.2f}"/>')

    # Gefieder: drei versetzte Reihen, Spule über dem Rand, Spitzen nach unten.
    # Unten mehr Lücken, damit die Kante nicht wie ein Lineal aussieht.
    for row in range(3):
        step = 30
        for i in range(W // step):
            if row == 2 and rnd.random() < 0.55: continue
            x = i * step + (step / 2 if row % 2 else 0) + rnd.uniform(-5, 5)
            L = rnd.uniform(80, 120) - row * 14
            layer = 0 if rnd.random() < 0.5 else 1 + rnd.randrange(layers - 1)
            put(x, -34 + row * 22, L, rnd.uniform(0.15, 0.2), rnd.uniform(-12, 12), 1.0 - row * 0.15, layer)

    # Lose Federn: kleiner und blasser, je tiefer sie hängen; drehen sich im Fallen
    for _ in range(22):
        y = 110 + rnd.random() ** 1.4 * (H - 150)
        f = max(0.0, 1 - (y - 100) / (H - 100))
        L = 30 + 36 * f * rnd.uniform(0.7, 1)
        layer = 0 if rnd.random() < 0.35 else 1 + rnd.randrange(layers - 1)
        put(rnd.random() * W, y, L, rnd.uniform(0.16, 0.22), rnd.uniform(-80, 80), 0.3 + 0.55 * f, layer)

    style = '<style>path{fill:none;stroke:#000;stroke-width:1.4;stroke-linecap:round}</style>'
    for i, p in enumerate(parts):
        save(f'feder-{i}.svg', H, ''.join(p), style)


# ---------- Buchstaben (Dunkel) ----------
# Zeichen aus Schulsprachen (Latein, Griechisch, Kyrillisch und Akzente der
# romanischen Sprachen), oben gross und hell, nach unten klein und blass, dazu
# feine Linien zwischen Nachbarn wie ein Sternbild und Sternpunkte.
# Nur Schriften, die jedes Gerät mitbringt: eine Maske ist ein Bild, dort
# gibt es keine Webfonts, und fehlende Zeichen würden zu Kästchen.
# Schicht 0 = Linien + Punkte in --akzent, 1..4 = Buchstaben in Rad-Farben.
ZEICHEN = list('aàâbcçdeéèêfghiïjklmnñoôöpqrsßtuùüvwxyzæœ') + list('αβγδελμπσφωΩΣΔ') + list('бдждлфшщюяЖЯ') + ['¿', '¡', '«', '»']
FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"


def zeichen():
    H = HOEHE['zeichen']
    rnd = random.Random(3)
    layers = 5
    parts = [[] for _ in range(layers)]
    fade = lambda y: max(0.0, 1 - y / (H - 20)) ** 1.4
    nodes = []
    for _ in range(95):
        y = 8 + rnd.random() ** 2.0 * (H - 40)
        nodes.append((rnd.random() * W, y))

    # Sternbild: jede Stelle mit ihren zwei nächsten Nachbarn, nur auf kurze Distanz
    lines = {}
    for i, (x, y) in enumerate(nodes):
        near = sorted((min(abs(x - u), W - abs(x - u)) ** 2 + (y - v) ** 2, j)
                      for j, (u, v) in enumerate(nodes) if j != i)[:2]
        for d2, j in near:
            if j < i or d2 > 120 ** 2: continue
            u, v = nodes[j]
            if abs(x - u) > W / 2: u += W if u < x else -W
            a = 0.5 * fade(max(y, v))
            if a < 0.04: continue
            for dx in shifts(min(x, u), max(x, u)):
                lines.setdefault(f'{a:.2f}', []).append(f'M{x + dx:.1f} {y:.1f}L{u + dx:.1f} {v:.1f}')
    for a, ds in lines.items():
        parts[0].append(f'<path d="{"".join(ds)}" stroke="#000" stroke-width="0.8" fill="none" opacity="{a}"/>')

    # Buchstaben an den Knoten, mit einem Hof (radialer Verlauf statt Weichzeichner)
    for x, y in nodes:
        f = fade(y)
        if f < 0.05: continue
        size = 11 + 18 * f * rnd.uniform(0.6, 1)
        layer = 1 + rnd.randrange(layers - 1)
        ch = rnd.choice(ZEICHEN)
        for dx in shifts(x - size, x + size):
            parts[layer].append(f'<circle cx="{x + dx:.1f}" cy="{y:.1f}" r="{size * 1.1:.1f}" fill="url(#hof)" opacity="{0.22 * f:.2f}"/>')
            parts[layer].append(
                f'<text x="{x + dx:.1f}" y="{y + size * 0.35:.1f}" font-size="{size:.1f}" text-anchor="middle" '
                f'font-weight="600" opacity="{0.25 + 0.6 * f:.2f}">{ch}</text>')

    # Sternpunkte dazwischen
    for _ in range(120):
        y = rnd.random() ** 1.8 * (H - 20)
        f = fade(y)
        if f < 0.05: continue
        x = rnd.random() * W
        parts[0].append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{0.8 + 1.2 * f:.1f}" opacity="{0.3 + 0.6 * f:.2f}"/>')

    defs = ('<radialGradient id="hof"><stop offset="0" stop-opacity=".7"/><stop offset=".5" stop-opacity=".3"/>'
            '<stop offset="1" stop-opacity="0"/></radialGradient>'
            f'<style>text{{font-family:{FONT}}}</style>')
    for i, p in enumerate(parts):
        save(f'zeichen-{i}.svg', H, ''.join(p), defs)


federn()
zeichen()

# Das Markup des Rands geht von hier direkt in index.html (zwischen die Marken «rand-html»),
# fest im <body> statt in React, damit die Masken nicht erst nach Babel laden.
# Datei i trägt die i-te Farbe; V ändert sich mit dem Inhalt der Dateien (Browser-Cache).
SCHICHTEN = {
    'hell': ('feder', ['--akzent', '--rad-1', '--rad-3', '--rad-5', '--rad-7']),
    'dunkel': ('zeichen', ['--akzent', '--rad-1', '--rad-3', '--rad-5', '--spiel-3']),
}
V = hashlib.md5(b''.join(f.read_bytes() for f in sorted(out.glob('*.svg')))).hexdigest()[:8]
html = out.parent / 'index.html'
daten = ''.join(
    f'\n  <div class="rand rand-{modus}" aria-hidden="true" style="--h: {HOEHE[name]}px; --w: {W}px">'
    + ''.join(f'<i style="--c: var({farbe}); --m: url(hintergrund/{name}-{i}.svg?v={V})"></i>'
              for i, farbe in enumerate(farben))
    + '</div>'
    for modus, (name, farben) in SCHICHTEN.items())
neu, n = re.subn(r'(<!-- <rand-html>[^\n]*).*?(\n\s*<!-- </rand-html> -->)', lambda m: m[1] + daten + m[2],
                 html.read_text(encoding='utf-8'), flags=re.S)
assert n == 1, 'Marken «rand-html» in index.html nicht gefunden'
# dieselben Dateien als Preload im Skript im <head> (Marken «rand-preload»)
assert len({len(f) for _, f in SCHICHTEN.values()}) == 1, 'Preload rechnet mit gleich vielen Schichten'
pre = (f"const RAND = {{ v: '{V}', n: {len(SCHICHTEN['hell'][1])}, "
       + ', '.join(f"{m}: '{name}'" for m, (name, _) in SCHICHTEN.items()) + ' };')
neu, n = re.subn(r'(// <rand-preload>\n\s*).*?(\n\s*// </rand-preload>)', lambda m: m[1] + pre + m[2], neu, flags=re.S)
assert n == 1, 'Marken «rand-preload» in index.html nicht gefunden'
html.write_text(neu, encoding='utf-8')
for f in sorted(out.iterdir()):
    print(f'{f.name}: {f.stat().st_size // 1024} KB')
