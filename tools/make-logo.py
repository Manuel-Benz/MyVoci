#!/usr/bin/env python3
"""Erzeugt logo-papagei.svg aus dem App-Icon des My-Designsystems
(design/icons/voci.svg, Kopie aus ~/MySuite): nur der Papagei, ohne Kachel.
Die Datei dient als CSS-Maske (.logo in index.html) — eingefärbt wird mit
currentColor, also hell auf dunklem und dunkel auf hellem Grund, wie der
Elefant in MyMemory und der Gepard in MyKahoot (dort gleiches Werkzeug).

    python3 tools/make-logo.py      # nach jedem ~/MySuite/sync.sh voci mit neuem Icon

Schreibt die neue viewBox auch als aspect-ratio in index.html (Marke «logo-seiten»)
und setzt die Version von logo-papagei.svg dort auf den Hash der Datei.
"""
import hashlib
import re
import subprocess
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / 'design/icons/voci.svg').read_text()
src = re.sub(r'<metadata>.*?</metadata>', '', src, flags=re.S)
tier = re.search(r'<g id="tier".*?</g>', src, flags=re.S).group(0)
tier = tier.replace('fill="#FFFFFF"', 'fill="#fff"')


def svg(view):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">'
            f'<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">{tier}</mask></defs>'
            f'<rect width="1024" height="1024" fill="#000" mask="url(#m)"/></svg>')


# eng zuschneiden: einmal rendern, Begrenzung messen, viewBox darauf setzen
with tempfile.TemporaryDirectory() as tmp:
    full = Path(tmp) / 'voll.svg'
    full.write_text(svg('0 0 1024 1024'))
    subprocess.run(['qlmanage', '-t', '-s', '1024', '-o', tmp, str(full)], capture_output=True, check=True)
    box = subprocess.run(['magick', str(full) + '.png', '-alpha', 'off', '-negate', '-trim', '-format', '%w %h %X %Y', 'info:'],
                         capture_output=True, text=True, check=True).stdout.split()
w, h, x, y = (int(v) for v in box)
pad = 8
view = f'{x - pad} {y - pad} {w + 2 * pad} {h + 2 * pad}'
logo = svg(view)
(root / 'logo-papagei.svg').write_text(logo)
html = root / 'index.html'
MARK = '/* logo-seiten (tools/make-logo.py) */'
text = html.read_text()
# Seitenverhältnis und Version (gegen die alte Maske im Browser-Cache) gehen direkt in index.html;
# eine Stelle, die sich nicht ersetzen lässt, soll laut scheitern statt still alt zu bleiben
text, n = re.subn(r'aspect-ratio: [\d ]+/ [\d ]+; ' + re.escape(MARK),
                  f'aspect-ratio: {w + 2 * pad} / {h + 2 * pad}; {MARK}', text)
assert n == 1, 'aspect-ratio mit Marke «logo-seiten» in index.html nicht gefunden'
V = hashlib.md5(logo.encode()).hexdigest()[:8]
text, n = re.subn(r'logo-papagei\.svg\?v=\w+', f'logo-papagei.svg?v={V}', text)
assert n == 2, 'logo-papagei.svg?v=… (-webkit-mask und mask) in index.html nicht gefunden'
html.write_text(text)
print(f'logo-papagei.svg: viewBox {view}, aspect-ratio {w + 2 * pad} / {h + 2 * pad}, v={V}')
