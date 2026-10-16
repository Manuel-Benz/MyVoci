// MyVoci — Spiel «Verteidigen» (Tower Defense)
//
// Wird erst geladen, wenn jemand den Modus wählt (Abschnitt «Spiele» in
// index.html), und läuft in einer eigenen Funktion: es sieht alles, was im
// App-Skript auf oberster Ebene steht (checkAnswer, buildQueue,
// PracticeFrame, t, I18N …), hinaus geht nur `GAMES.defense`.
//
// Wörter laufen als Gegner zur Burg. **Jedes Wort ist ein Schild**: ein
// Schleim trägt eines, ein Ritter zwei, ein Hauptmann drei, der Boss bis zu
// fünf. Eine getippte Übersetzung bricht den Schild, zu dem sie passt; ohne
// Schild ist der Gegner «entlarvt» und die Türme greifen ihn an. Grundsatz
// bleibt: **kein Wort fällt ohne Antwort** — Türme, Explosionen und
// Orbitalschlag treffen nur Gegner ohne Schild, geschützte machen sie
// höchstens mürbe. Jedes Wort wird so genau einmal gefragt; was falsch war,
// läuft ein paar Gegner später nochmals (Wiederkehr), nie gleich in der
// Gegenrichtung. Gewertet wird wie beim Schreiben, für den Lernstand zählt
// die erste Antwort pro Wort.
'use strict';

Object.assign(I18N.de, {
  dfWave: (i, n) => `Welle ${i} von ${n}`,
  dfBossWave: 'Schlusswelle: der Boss aus deinen Fehlern',
  dfIntro: 'Die Wörter laufen zur Burg, jedes Wort ist ein Schild. Tippe eine Übersetzung und drücke Enter: Sie bricht den Schild, zu dem sie passt. Ohne Schild greifen die Türme an. Ein Fehler zählt beim markierten Gegner, das Wort kommt etwas später nochmals; ein Tipp auf einen anderen Gegner markiert ihn.',
  dfEnergyIntro: 'Jede richtige Antwort lädt den Akku oben. Damit zündest du die Frostwelle (mit Frost-Turm), die Überladung (mit Rakete) und einmal pro Welle den Orbitalschlag.',
  dfBuild: 'Tippe auf einen freien Platz (+), um einen Turm zu bauen, oder auf einen Turm, um ihn auszubauen, umzubauen oder zu verkaufen. Das geht nur zwischen den Wellen.',
  dfPreview: 'Diese Wörter kommen:',
  dfBossPreview: 'Der Boss trägt diese Wörter:',
  dfGo: 'Los',
  dfFire: 'Feuer',
  dfWaiting: 'Gleich kommen Gegner …',
  dfTowersWork: 'Die Türme erledigen den Rest …',
  dfAway: 'Pause — tippe ins Feld, dann geht es weiter.',
  dfGun: 'Gewehr', dfGunHint: 'schiesst schnell auf Gegner ohne Schild', dfGunUp: 'weiter und stärker',
  dfRocket: 'Rakete', dfRocketHint: 'Flächenschaden, dazu die Überladung', dfRocketUp: 'grösserer Knall',
  dfFrost: 'Frost', dfFrostHint: 'Gegner in Reichweite langsamer, dazu die Frostwelle', dfFrostUp: 'weiter und noch langsamer',
  dfLight: 'Leuchtturm', dfLightHint: 'zeigt den ersten Buchstaben (und Hinweise)', dfLightUp: 'auch letzter Buchstabe und Länge',
  dfLevel: (n) => `Stufe ${n}`,
  dfUpgrade: 'Ausbauen',
  dfRebuild: 'Umbauen zu',
  dfSell: 'Verkaufen',
  dfFreeze: 'Frostwelle', dfCharge: 'Überladung', dfOrbital: 'Orbitalschlag',
  dfEnergy: (n) => `${n} Energie`,
  dfReturns: (n) => (n === 1 ? '1 Wort kommt nochmals' : `${n} Wörter kommen nochmals`),
  dfHearts: (n) => (n === 1 ? '1 Herz' : `${n} Herzen`),
  dfCoins: (n) => `${n} Münzen`,
  dfWaveDone: 'Welle geschafft',
  dfHeld: 'Burg gehalten',
  dfFallen: 'Die Burg ist gefallen.',
  dfEscaped: 'Der Boss entkam.',
});
Object.assign(I18N.en, {
  dfWave: (i, n) => `Wave ${i} of ${n}`,
  dfBossWave: 'Final wave: the boss made of your mistakes',
  dfIntro: 'The words walk towards the castle, every word is a shield. Type a translation and press Enter: it breaks the shield it fits. Without shields, the towers attack. A mistake counts for the marked enemy and the word comes back a little later; tap another enemy to mark it.',
  dfEnergyIntro: 'Every right answer charges the battery at the top. Use it for the frost wave (with a frost tower), the overcharge (with a rocket) and, once per wave, the orbital strike.',
  dfBuild: 'Tap a free spot (+) to build a tower, or a tower to upgrade, rebuild or sell it. You can only do this between waves.',
  dfPreview: 'These words are coming:',
  dfBossPreview: 'The boss carries these words:',
  dfGo: 'Go',
  dfFire: 'Fire',
  dfWaiting: 'Enemies are on their way …',
  dfTowersWork: 'The towers finish the job …',
  dfAway: 'Paused — tap the field to carry on.',
  dfGun: 'Rifle', dfGunHint: 'fires quickly at enemies without shields', dfGunUp: 'longer range, more damage',
  dfRocket: 'Rocket', dfRocketHint: 'area damage, unlocks the overcharge', dfRocketUp: 'bigger blast',
  dfFrost: 'Frost', dfFrostHint: 'slows enemies in range, unlocks the frost wave', dfFrostUp: 'longer range, even slower',
  dfLight: 'Lighthouse', dfLightHint: 'shows the first letter (and hints)', dfLightUp: 'also last letter and length',
  dfLevel: (n) => `Level ${n}`,
  dfUpgrade: 'Upgrade',
  dfRebuild: 'Rebuild as',
  dfSell: 'Sell',
  dfFreeze: 'Frost wave', dfCharge: 'Overcharge', dfOrbital: 'Orbital strike',
  dfEnergy: (n) => `${n} energy`,
  dfReturns: (n) => (n === 1 ? '1 word comes back' : `${n} words come back`),
  dfHearts: (n) => (n === 1 ? '1 heart' : `${n} hearts`),
  dfCoins: (n) => `${n} coins`,
  dfWaveDone: 'Wave cleared',
  dfHeld: 'Castle held',
  dfFallen: 'The castle has fallen.',
  dfEscaped: 'The boss escaped.',
});

// ---------- Regeln ----------
const DF_WAVE = 8; // Wörter pro Welle
const DF_HEARTS = 5, DF_STARS = 3;
const DF_START_COINS = 80, DF_HIT_COINS = 10, DF_KILL_COINS = 5;
const DF_BOSS_WORDS = 5;
const DF_RETURN_AFTER = 3; // ein falsches Wort läuft so viele Gegner später nochmals
const DF_ANSWER_DMG = 100; // Schaden der letzten Antwort: ein Schleim fällt damit
const DF_SELL = 0.6; // Anteil des Bezahlten, den ein verkaufter Turm zurückgibt
const DF_ENERGY_MAX = 10;
const DF_FREEZE = 5; // Sekunden Frostwelle
const DF_BLAST = { r: 110, dmg: 80 }; // Überladung
const DF_ORBITAL = { r: 150, dmg: 220, stun: 2, hit: 0.7 }; // `hit`: Einschlag, wenn der Strahl unten ist
const DF_END_COLOR = { dfHeld: 'gruen', dfEscaped: 'orange', dfFallen: 'rot' }; // Ausgang → Farbe des Endtexts
const DF_REVEAL = 2.5; // Sekunden: Lösung am Gegner
const DF_MIN_PX = 12; // kleinste Schrift auf dem Bildschirm, auch auf dem Handy mit Tastatur
// Sekunden für den ganzen Weg und zwischen zwei Gegnern. `hold`: niemand
// läuft, solange getippt wird (nur mit geschützten Gegnern auf dem Feld —
// sonst käme nie einer und Enter hätte kein Ziel).
const DF_PACE = { calm: { cross: 44, gap: 5, hold: true }, normal: { cross: 36, gap: 4.5 }, fast: { cross: 18, gap: 2.3 } };
// Gegner: Tempo, Lebenspunkte nach dem letzten Schild, Grösse. Die Zahl der
// Schilde gibt das Wellenmuster (`dfPack`), die Stufe nur das Tempo: ein
// einzelnes Wort ab «kommt langsam» ist ein schneller Pfeil.
const DF_KINDS = {
  slime: { speed: 1, hp: 100, r: 20 },
  arrow: { speed: 1.4, hp: 100, r: 20 },
  knight: { speed: 0.9, hp: 160, r: 20 },
  captain: { speed: 0.75, hp: 260, r: 22 },
  boss: { speed: 0.6, hp: 400, r: 32 },
};
// Türme: Preis, Ausbau (Stufe 2), Werte je Stufe (`dfStat`). Gewehr und
// Rakete schiessen nur auf Gegner ohne Schild.
const DF_TOWERS = [
  { id: 'gun', cost: 40, up: 40, icon: '⌖', label: 'dfGun', hint: 'dfGunHint', upHint: 'dfGunUp', range: [170, 210], dmg: [8, 11], every: 0.35 },
  { id: 'rocket', cost: 70, up: 60, icon: '▲', label: 'dfRocket', hint: 'dfRocketHint', upHint: 'dfRocketUp', range: [190, 230], dmg: [40, 55], every: 1.8, splash: [70, 90] },
  { id: 'frost', cost: 50, up: 40, icon: '❄', label: 'dfFrost', hint: 'dfFrostHint', upHint: 'dfFrostUp', range: [170, 220], slow: [0.5, 0.4] },
  { id: 'light', cost: 40, up: 40, icon: '✦', label: 'dfLight', hint: 'dfLightHint', upHint: 'dfLightUp', range: [170, 210] },
];
const dfTower = (id) => DF_TOWERS.find((d) => d.id === id);
const dfStat = (tw, key) => dfTower(tw.type)[key][tw.lvl - 1]; // Wert eines gebauten Turms auf seiner Stufe
// Die Burg wehrt sich selbst ein wenig: auf dem letzten Fünftel des Wegs
// zusammen 80 Schaden, verteilt nach zurückgelegtem Weg statt nach Zeit. Ein
// Ritter (60 übrig), der vor diesem Stück entlarvt ist, fällt so, Hauptmann
// und Boss brauchen Türme — gleich auf beiden Karten und in jedem Tempo. Mit
// Reichweite und Schaden pro Sekunde kam der Ritter bei «schnell» durch,
// obwohl alle Wörter gewusst waren, und hochkant erledigte die Burg sogar den
// Boss. Je `shot` Schaden ein sichtbarer Schuss: so schiesst sie nie, ohne
// zu treffen (stehen die Gegner, schadet sie auch nicht).
const DF_CASTLE = { zone: 0.2, dmg: 80, shot: 8 };
// Spezialkräfte laden mit richtigen Antworten auf, nicht mit der Zeit: ein
// Wecker belohnte Warten. Frostwelle und Überladung gibt es nur mit ihrem
// Turm, den Orbitalschlag einmal pro Welle (`perWave`). Was eine Kraft
// braucht und tut, steht in der Runde (`POWERS`).
const DF_SPECIALS = [
  { id: 'freeze', cost: 3, icon: '❄', label: 'dfFreeze', needs: 'frost' },
  { id: 'charge', cost: 4, icon: '✸', label: 'dfCharge', needs: 'rocket' },
  { id: 'orbital', cost: 8, icon: '◎', label: 'dfOrbital', perWave: true },
];
// Was jede Welle frisch beginnt (beim Start und in `endWave`)
const dfWaveState = () => ({ hits: [], frozen: 0, used: new Set(), returned: new Set() });

// Gegner einer Welle: Welle 1 nur Schleime und Ritter, ab Welle 2 mit
// mindestens sechs Wörtern als dritter Gegner ein Hauptmann. Gefüllt in der
// Reihenfolge der Wörter — dieselbe Vokabel steht so nie zweimal auf einem
// Gegner. Mehr als zehn Wörter hat eine Welle nie (`groupsOf`).
const dfPack = (items, wave) => {
  const cycle = !wave ? [1, 1, 2] : items.length >= 6 ? [1, 2, 3] : [1, 2, 1];
  const out = [];
  for (let k = 0, i = 0; k < items.length; i++) out.push({ items: items.slice(k, (k += cycle[i % 3])) });
  return out;
};
const dfShielded = (e) => e.done < e.items.length;
const dfItem = (e) => e.items[Math.min(e.done, e.items.length - 1)];

// ---------- Karten ----------
// Quer (flach, damit über der Bildschirmtastatur Platz bleibt) und hochkant
// fürs Handy, je als Schlange mit sieben Plätzen. Plätze zwischen zwei Bahnen
// decken beide ab — dort liegt die Strategie. Der Weg beginnt innerhalb der
// Karte: ausserhalb wäre das Wort eines neuen Gegners erst unsichtbar.
// Gegner laufen auf einem Anteil 0…1 des Wegs, Türme stehen auf einem Platz
// mit Nummer: beim Drehen des Geräts wechselt die Karte mitten im Spiel, ohne
// dass etwas springt. Die Zeit für den Weg (`cross`) hängt nicht an seiner
// Länge. Die Weglänge wird einmal gerechnet.
const dfDist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const dfMap = (m) => {
  let total = 0;
  const segs = m.path.slice(1).map((b, i) => {
    const a = m.path[i], len = dfDist(a, b), seg = { a, b, len };
    total += len;
    return seg;
  });
  return { ...m, segs, total, points: m.path.map((p) => p.join(',')).join(' ') };
};
const DF_MAPS = {
  wide: dfMap({
    w: 1000, h: 400,
    path: [[20, 70], [330, 70], [330, 200], [110, 200], [110, 330], [640, 330], [640, 90], [860, 90]],
    castle: { x: 860, y: 30, w: 110, h: 120 },
    slots: [[220, 135], [220, 265], [45, 265], [440, 250], [480, 60], [720, 210], [770, 360]],
  }),
  tall: dfMap({
    w: 600, h: 760,
    path: [[90, 50], [90, 170], [510, 170], [510, 330], [90, 330], [90, 490], [510, 490], [510, 650], [320, 650]],
    castle: { x: 210, y: 600, w: 110, h: 110 },
    slots: [[260, 90], [200, 250], [400, 250], [200, 410], [400, 410], [400, 570], [150, 580]],
  }),
};
const dfAt = (map, p) => {
  let rest = Math.min(1, Math.max(0, p)) * map.total;
  for (const s of map.segs) {
    if (rest <= s.len) return [s.a[0] + ((s.b[0] - s.a[0]) * rest) / s.len, s.a[1] + ((s.b[1] - s.a[1]) * rest) / s.len];
    rest -= s.len;
  }
  return map.path[map.path.length - 1];
};
// Nach Zeichen, nicht nach UTF-16-Einheiten: ein Emoji würde sonst halbiert («�»)
const dfCut = (text, n = 22) => { const c = [...text]; return c.length > n ? c.slice(0, n - 1).join('') + '…' : text; };

// Leuchtturm: Stufe 1 der erste Buchstabe (ab drei Buchstaben), Stufe 2 die
// Länge — jedes Wort mit seinem ersten Buchstaben, die übrigen als «·»,
// Leer- und Satzzeichen bleiben — und der letzte Buchstabe, wenn das letzte
// Wort mindestens vier hat (m····n, p···· d· t···e). Nie mehr als die Hälfte
// der Buchstaben: bei «to go» stand sonst «go» ganz da und das Abgeschriebene
// zählte als gewusst. Ziffern zählen wie Buchstaben.
const DF_LETTER = /[\p{L}\p{N}]/u, DF_LETTERS = /[\p{L}\p{N}]+/gu;
const dfHintShape = (word, lvl) => {
  const cs = [...word], isL = (ch) => DF_LETTER.test(ch || '');
  const n = cs.filter(isL).length;
  if (lvl < 2) return n >= 3 ? `${cs.find(isL)}…` : '·'.repeat(n);
  const lastAt = [...((word.match(DF_LETTERS) || []).pop() || '')].length >= 4 ? cs.length - 1 - [...cs].reverse().findIndex(isL) : -1;
  let budget = Math.floor(n / 2);
  return cs.map((ch, i) => (!isL(ch) ? ch : (!isL(cs[i - 1]) || i === lastAt) && budget-- > 0 ? ch : '·')).join('');
};

// Fensterbreite und die Höhe, die die Bildschirmtastatur übrig lässt
// (`visualViewport`, mal `scale`: beim Zoomen schrumpfte die Karte sonst mit)
const useDfViewport = () => {
  const read = () => {
    const vv = window.visualViewport;
    return { w: innerWidth, vh: vv ? vv.height * vv.scale : innerHeight };
  };
  const [v, setV] = useState(read);
  useEffect(() => {
    const on = () => setV(read());
    window.addEventListener('resize', on);
    if (window.visualViewport) visualViewport.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      if (window.visualViewport) visualViewport.removeEventListener('resize', on);
    };
  }, []);
  return v;
};
// Neu zeichnen nur, wenn sich die Signatur `sig` seit dem letzten Zeichnen
// geändert hat. Zurück kommt die Prüfung, die die Schleife in jedem Bild ruft
// (wahr, wenn sie neu zeichnen liess) — für Runde, Feld und Effekte gleich.
const useDfRedraw = (sig) => {
  const [, tick] = React.useReducer((x) => x + 1, 0);
  const drawn = useRef('');
  drawn.current = sig();
  return () => {
    if (sig() === drawn.current) return false;
    tick();
    return true;
  };
};

// ---------- Effekte ----------
// Nur CSS-Keyframes auf `transform` und `opacity`: ein Effekt ist ein
// kurzlebiges Element mit eigener id (`g.fx`), der Browser animiert es. Die
// Dauer steht an einer Stelle (`DF_FX`, Sekunden): für CSS und für den Ablauf
// in Spielzeit (`g.time`) — die steht still, solange das Spiel ruht, so wie
// `.df-halt` die Animationen anhält. `both` hält bei den kurzlebigen das
// unsichtbare Ende fest, bis sie wegfallen. Wer Bewegung reduziert hat, sieht
// sie nur ausblenden (`DF_FX_ANIM`, vierte Stelle: sanfter für Flächen).
// Einblendungen am Gegner tragen kein `both`: eine gefüllte Animation auf
// einer wandernden Gruppe liess Chrome in jedem Bild neu malen. Aura und
// Kegel laufen in Stufen (`steps`), sonst malte WebKit dafür 60-mal pro
// Sekunde neu.
const DF_FX = { shield: 0.6, tracer: 0.25, fly: 0.35, boom: 0.6, blast: 0.8, plus: 0.8, pop: 0.35, ghost: 0.9, breach: 0.9, freeze: 0.9, orbital: 1.3, quake: 0.5, banner: 2.4 };
// Klasse → [Keyframes, Effekt (Dauer), Verlauf, Keyframes bei reduzierter Bewegung]
const DF_FX_ANIM = {
  burst: ['df-burst', 'shield', 'ease-out'], shard: ['df-shard', 'shield', 'ease-out'],
  tracer: ['df-fade', 'tracer', 'ease-in'], hit: ['df-hit', 'tracer', 'ease-out'],
  fly: ['df-fly', 'fly', 'linear'], boom: ['df-boom', 'boom', 'ease-out'], ring: ['df-ring', 'boom', 'ease-out'],
  blast: ['df-ring', 'blast', 'ease-out'], plus: ['df-plus', 'plus', 'ease-out'], pop: ['df-burst', 'pop', 'ease-out'],
  ghost: ['df-ghost', 'ghost', 'ease-in'], heart: ['df-heart', 'breach', 'ease-in'], flash: ['df-flash', 'breach', 'ease-out', 'df-soft'],
  wave: ['df-wave', 'freeze', 'ease-out'], tint: ['df-flash', 'freeze', 'ease-out', 'df-soft'],
  lock: ['df-lock', 'orbital', 'ease-out'], guide: ['df-guide', 'orbital', 'linear'], beam: ['df-beam', 'orbital', 'ease-out', 'df-soft'],
  shock: ['df-shock', 'orbital', 'ease-out'], quake: ['df-quake', 'quake', 'linear', 'none'], banner: ['df-banner', 'banner', 'ease-out'],
};
const dfFxCss = (still) => Object.entries(DF_FX_ANIM).map(([cls, [kf, type, ease, calm = 'df-fade']]) =>
  `  .df-${cls} { animation: ${still ? calm : kf} ${DF_FX[type]}s ${still ? 'ease-in' : ease} both; }`).join('\n');
const DF_CSS = `
.df-svg * { transform-box: fill-box; transform-origin: center; }
.df-halt, .df-halt * { animation-play-state: paused !important; }
@media (prefers-reduced-motion: no-preference) {
${dfFxCss(false)}
  .df-beam { transform-origin: center top; }
  .df-ice { animation: df-ice .3s ease-out; }
  .df-shake { animation: df-shake .4s linear; }
  .df-lit { animation: df-pop-in .35s ease-out; }
  .df-redring { animation: df-redring .6s linear; }
  .df-barin { animation: df-barin .3s ease-out; }
  .df-drop { animation: df-drop .6s ease-out; }
  .df-dust { animation: df-dust .6s ease-out; }
  .df-star { animation: df-star .5s ease-out backwards; }
  .df-charge { animation: df-charge .5s ease-in-out infinite alternate; }
  .df-spark { animation: df-spark .3s steps(2) infinite; }
  .df-aura { animation: df-aura 2.4s steps(4) infinite; }
  .df-sweep { animation: df-sweep 3s steps(5) infinite; }
  .df-bump { display: inline-block; animation: df-bump .35s ease-out; }
}
@media (prefers-reduced-motion: reduce) {
${dfFxCss(true)}
}
@keyframes df-burst { from { transform: scale(1); opacity: 1 } to { transform: scale(1.7); opacity: 0 } }
@keyframes df-shard { from { transform: translate(0, 0); opacity: 1 } to { transform: translate(var(--dx), var(--dy)); opacity: 0 } }
@keyframes df-fade { from { opacity: 1 } to { opacity: 0 } }
@keyframes df-soft { from { opacity: .4 } to { opacity: 0 } }
@keyframes df-hit { from { transform: scale(.5); opacity: 1 } to { transform: scale(1.5); opacity: 0 } }
@keyframes df-fly { 0% { transform: translate(0, 0) } 50% { transform: translate(calc(var(--dx) * .5), calc(var(--dy) * .5 - 50px)) } 90% { opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)); opacity: 0 } }
@keyframes df-boom { 0% { transform: scale(0); opacity: 0 } 15% { opacity: .9 } 60% { transform: scale(1); opacity: .7 } 100% { transform: scale(1.2); opacity: 0 } }
@keyframes df-ring { from { transform: scale(.2); opacity: 1 } to { transform: scale(1.6); opacity: 0 } }
@keyframes df-plus { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(-30px); opacity: 0 } }
@keyframes df-ghost { 0% { transform: translate(0, 0); opacity: 1 } 80% { opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)); opacity: 0 } }
@keyframes df-heart { 0% { transform: scale(1); opacity: 1 } 25% { transform: scale(1.6) } 100% { transform: translateY(40px) scale(.8); opacity: 0 } }
@keyframes df-flash { 0% { opacity: 0 } 25% { opacity: .5 } 100% { opacity: 0 } }
@keyframes df-wave { from { transform: scale(0); opacity: .9 } to { transform: scale(1); opacity: 0 } }
@keyframes df-ice { 0% { transform: scale(.5); opacity: 0 } 70% { transform: scale(1.1); opacity: .9 } 100% { transform: scale(1); opacity: .8 } }
@keyframes df-lock { 0% { transform: scale(2.2) rotate(0); opacity: 0 } 10% { opacity: 1 } 40% { transform: scale(1) rotate(90deg); opacity: 1 } 50%, 100% { transform: scale(1) rotate(90deg); opacity: 0 } }
@keyframes df-guide { 0%, 36% { opacity: 0 } 38% { opacity: .9 } 41% { opacity: .1 } 44% { opacity: .9 } 48%, 100% { opacity: 0 } }
@keyframes df-beam { 0%, 46% { transform: scaleY(0); opacity: 1 } 54%, 68% { transform: scaleY(1); opacity: .95 } 100% { transform: scaleY(1); opacity: 0 } }
@keyframes df-shock { 0%, 52% { transform: scale(.2); opacity: 0 } 56% { opacity: 1 } 100% { transform: scale(1.8); opacity: 0 } }
@keyframes df-quake { 0%, 100% { transform: translate(0, 0) } 20% { transform: translate(-4px, 3px) } 40% { transform: translate(4px, -3px) } 60% { transform: translate(-3px, 2px) } 80% { transform: translate(3px, 0) } }
@keyframes df-shake { 0%, 100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 45% { transform: translateX(6px) } 70% { transform: translateX(-4px) } }
@keyframes df-pop-in { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
@keyframes df-redring { 0% { opacity: 0 } 30% { opacity: 1 } 50% { opacity: .2 } 100% { opacity: 1 } }
@keyframes df-barin { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes df-charge { from { transform: scale(1) } to { transform: scale(1.15) } }
@keyframes df-spark { 50% { opacity: .1 } }
@keyframes df-aura { 0%, 100% { transform: scale(.92); opacity: .5 } 50% { transform: scale(1); opacity: 1 } }
@keyframes df-sweep { 0%, 100% { transform: rotate(-12deg) } 50% { transform: rotate(12deg) } }
@keyframes df-drop { 0% { transform: translateY(-50px); opacity: 0 } 20% { opacity: 1 } 60% { transform: translateY(4px) } 80% { transform: translateY(-2px) } 100% { transform: translateY(0); opacity: 1 } }
@keyframes df-dust { 0%, 50% { transform: scale(.3); opacity: 0 } 55% { opacity: .8 } 100% { transform: scale(1.6); opacity: 0 } }
@keyframes df-banner { 0% { transform: translateY(-20px); opacity: 0 } 12%, 80% { transform: translateY(0); opacity: 1 } 100% { opacity: 0 } }
@keyframes df-star { 0% { transform: scale(0) } 60% { transform: scale(1.35) } 100% { transform: scale(1) } }
@keyframes df-bump { 50% { transform: scale(1.35) } }
`;
// Bei jedem Laden neu setzen: ein nachgeladenes neueres Spiel bringt seine Effekte mit
const dfStyle = document.getElementById('df-css') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'df-css' }));
dfStyle.textContent = DF_CSS;

// Schrift nie kleiner als DF_MIN_PX (auf dem Handy mit Tastatur ist die Karte
// auf ein Drittel verkleinert) und mit Rand in der Kartenfarbe
const dfFs = (scale) => (base) => Math.max(base, DF_MIN_PX / scale);
const dfHalo = (fs) => ({ paintOrder: 'stroke', stroke: 'var(--karte)', strokeWidth: fs(20) / 4, strokeLinejoin: 'round' });
// Schildringe: der k-te liegt bei r + 4 + 5·k, der äusserste trägt die
// Beschriftungen, den Zielring und die Trefferfläche
const dfRing = (e, k) => DF_KINDS[e.kind].r + 4 + k * 5;
const dfOuter = (e) => dfRing(e, e.items.length - e.done);
const dfBar = (e) => (48 * Math.max(0, e.hp)) / DF_KINDS[e.kind].hp;
// Textbreite geschätzt: etwa ein halbes Geviert pro Zeichen
const dfTextW = (text, size) => [...text].length * size * 0.55;
// Preis in Münzen; negativ heisst: es gibt etwas zurück
const DfPrice = ({ n }) => (n >= 0 ? <span className="text-orange">● {n}</span> : <span className="text-gruen">+{-n}</span>);
// Energie als Akku (`fill` 0…1), kein Blitz: zwei Blitze nebeneinander (so
// stand es beim Knopf der Überladung) erinnerten an die SS-Runen
const DfCell = ({ fill = 1, big }) => (
  <svg viewBox="0 0 22 12" aria-hidden="true" className="inline-block shrink-0" style={big ? { width: '2.6em', height: '1.4em' } : { width: '1.4em', height: '0.8em', verticalAlign: '-0.05em' }}>
    <rect x="0.75" y="0.75" width="18" height="10.5" rx="2" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }} />
    <rect x="19.5" y="3.5" width="2" height="5" rx="0.5" style={{ fill: 'currentColor' }} />
    <rect x="2.5" y="2.5" width={14.5 * fill} height="7" rx="1" style={{ fill: 'currentColor' }} />
  </svg>
);

// Effekte in eigener Ebene: ein Schuss alle 0.35 s zeichnet nur sie neu, nicht
// alle Gegner samt Beschriftungen. Lage fest beim Entstehen, Bewegung über
// --dx/--dy. `act.fxFrame` ruft die Schleife in jedem Bild.
const DfFx = memoLang(({ g, map, scale, act }) => {
  act.fxFrame = useDfRedraw(() => g.fx.map((f) => f.id).join());
  const fs = dfFs(scale), halo = dfHalo(fs);
  const d = (dx, dy) => ({ '--dx': `${dx}px`, '--dy': `${dy}px` });
  const cover = (cls, fill) => <rect width={map.w} height={map.h} className={cls} style={{ fill, opacity: 0 }} />;
  const fxNode = (f) => {
    switch (f.type) {
      case 'shield': return (
        <g key={f.id}>
          <circle cx={f.x} cy={f.y} r={f.r} className="df-burst" style={{ fill: 'none', stroke: 'var(--akzent)', strokeWidth: 3 }} />
          {[[0, -1], [1, 0], [-1, 0], [0.7, 0.7], [-0.7, 0.7]].map(([a, b], i) => (
            <line key={i} x1={f.x + a * f.r} y1={f.y + b * f.r} x2={f.x + a * (f.r + 7)} y2={f.y + b * (f.r + 7)} className="df-shard"
              style={{ stroke: 'var(--akzent)', strokeWidth: 3, strokeLinecap: 'round', ...d(a * 24, b * 24) }} />
          ))}
        </g>
      );
      case 'tracer': return (
        <g key={f.id}>
          <line x1={f.x} y1={f.y} x2={f.x2} y2={f.y2} className="df-tracer" style={{ stroke: 'var(--akzent)', strokeWidth: 4, strokeLinecap: 'round' }} />
          <circle cx={f.x2} cy={f.y2} r="9" className="df-hit" style={{ fill: 'var(--orange-weich)', stroke: 'var(--orange)', strokeWidth: 2 }} />
        </g>
      );
      case 'fly': return <circle key={f.id} cx={f.x} cy={f.y} r="7" className="df-fly" style={{ fill: 'var(--orange)', ...d(f.x2 - f.x, f.y2 - f.y) }} />;
      case 'boom': return (
        <g key={f.id}>
          <circle cx={f.x} cy={f.y} r={f.r} className="df-boom" style={{ fill: 'var(--rot-weich)', stroke: 'var(--rot)', strokeWidth: 2 }} />
          <circle cx={f.x} cy={f.y} r={f.r * 0.8} className="df-ring" style={{ fill: 'none', stroke: 'var(--orange)', strokeWidth: 3 }} />
        </g>
      );
      case 'blast': return <circle key={f.id} cx={f.x} cy={f.y} r={f.r} className="df-blast" style={{ fill: 'var(--orange-weich)', fillOpacity: 0.4, stroke: 'var(--orange)', strokeWidth: 6 }} />;
      // Steigt 30 auf: so weit unter dem oberen Rand beginnen, auch mit grosser Schrift
      case 'plus': return <text key={f.id} x={f.x} y={Math.max(fs(18) + 30, f.y)} textAnchor="middle" fontSize={fs(18)} fontWeight="700" className="df-plus" style={{ ...halo, fill: 'var(--orange-text)' }}>{f.text}</text>;
      case 'pop': return <circle key={f.id} cx={f.x} cy={f.y} r={f.r} className="df-pop" style={{ fill: 'none', stroke: 'var(--rot)', strokeWidth: 3 }} />;
      case 'ghost': return (
        <text key={f.id} x={f.x} y={f.y} textAnchor="middle" fontSize={fs(16)} fontWeight="600" className="df-ghost"
          style={{ ...halo, fill: 'var(--orange-text)', ...d(f.x2 - f.x, f.y2 - f.y) }}>{f.text}</text>
      );
      case 'breach': return (
        <g key={f.id}>
          {cover('df-flash', 'var(--rot-weich)')}
          <text x={f.x} y={f.y} textAnchor="middle" fontSize={fs(30)} className="df-heart" style={{ fill: 'var(--rot)' }}>♥</text>
        </g>
      );
      case 'freeze': return (
        <g key={f.id}>
          {cover('df-tint', 'var(--akzent-weich)')}
          <circle cx={map.w / 2} cy={map.h / 2} r={Math.hypot(map.w, map.h) / 2} className="df-wave" style={{ fill: 'none', stroke: 'var(--akzent)', strokeWidth: 6 }} />
        </g>
      );
      case 'orbital': return (
        <g key={f.id}>
          <circle cx={f.x} cy={f.y} r={f.r} className="df-lock" style={{ fill: 'none', stroke: 'var(--rot)', strokeWidth: 3, strokeDasharray: '16 12' }} />
          <line x1={f.x} y1="0" x2={f.x} y2={f.y} className="df-guide" style={{ stroke: 'var(--rot)', strokeWidth: 2, opacity: 0 }} />
          <rect x={f.x - 34} y="0" width="68" height={f.y} className="df-beam" style={{ fill: 'var(--rot-weich)', stroke: 'var(--rot)', strokeWidth: 2, opacity: 0 }} />
          <ellipse cx={f.x} cy={f.y} rx={f.r * 0.7} ry={f.r * 0.22} className="df-shock" style={{ fill: 'none', stroke: 'var(--rot)', strokeWidth: 5, opacity: 0 }} />
        </g>
      );
      case 'banner': {
        const text = t(f.text), size = fs(28), w = Math.max(300, dfTextW(text, size) + 48);
        return (
          <g key={f.id} className="df-banner">
            <rect x={map.w / 2 - w / 2} y={map.h / 2 - size * 1.2} width={w} height={size * 2.2} rx="12" style={{ fill: 'var(--gruen-weich)', stroke: 'var(--gruen)', strokeWidth: 2 }} />
            <text x={map.w / 2} y={map.h / 2 + size * 0.2} textAnchor="middle" fontSize={size} fontWeight="700" style={{ fill: 'var(--gruen-text)' }}>{text}</text>
          </g>
        );
      }
      default: return null; // `quake` wirkt über die Klasse am Feld
    }
  };
  // Effekte schlucken keine Tipps: das Banner lag sonst über den Plätzen
  return <g style={{ pointerEvents: 'none' }}>{g.fx.map(fxNode)}</g>;
});

// ---------- Spielfeld ----------
// Was nur Ereignisse ändern (Schilde, Texte, Ziel, Eis, Beben — `look`),
// zeichnet React; was beim Laufen wandert (Lage der Gegner, Lebensbalken,
// Einrücken der Beschriftungen am Rand, Frost-Restzeit), setzt `act.frame`
// direkt (`put`) — auf einem älteren iPad zwei Drittel weniger Rechenzeit, und
// am Kartenrand zeichnete React sonst in jedem Bild das ganze Feld neu. Die
// Runde selbst zeichnet nur bei Ereignissen. Gezeichnet wird in fester
// Reihenfolge, der älteste Gegner zuoberst: nach dem Weg sortiert verschob
// React beim Überholen den Knoten und alle Animationen darin starteten neu.
// `act` ist ein festes Objekt mit den Handlungen der Runde.
const DfField = memoLang(({ g, map, phase, slot, halt, maxHeight, vw, label, act }) => {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);
  React.useLayoutEffect(() => {
    const r = svgRef.current.getBoundingClientRect();
    const s = Math.min(r.width / map.w, r.height / map.h);
    if (s > 0 && Math.abs(s - scale) > 0.01) setScale(s);
  }, [map, maxHeight, vw]);
  const fs = dfFs(scale), halo = dfHalo(fs);
  // Beschriftungen rücken am Kartenrand ein, statt halb hinauszuragen: waagrecht
  // (`inside`) und senkrecht (`rows`). Das Wort steht über dem Gegner, weitere
  // Zeilen darunter; passen sie unten nicht mehr in die Karte, stapeln sie
  // sich über dem Wort und oben rückt der Block herein, bis die Schrift ganz
  // zu sehen ist. Die Ringe der Schilde schoben sonst das Wort des Bosses auf
  // der obersten Bahn ganz hinaus und Lösung samt Leuchtturm unter die Karte.
  const inside = (x, text, size) => {
    const half = dfTextW(text, size) / 2 + 4;
    return Math.min(Math.max(x, half), map.w - half) - x;
  };
  const rows = (y, outer, n) => {
    const step = fs(18), top = -outer - 10;
    const below = Array.from({ length: n - 1 }, (_, k) => outer + step * (k + 1));
    const ys = [top, ...(n > 1 && y + below[n - 2] > map.h - 4 ? below.map((_, k) => top - step * (k + 1)) : below)];
    const lift = Math.max(0, fs(20) - (y + Math.min(...ys)));
    return ys.map((v) => v + lift);
  };
  const place = (ls, [x, y], outer) => { const ys = rows(y, outer, ls.length); return ls.map((l, i) => [inside(x, l.text, fs(l.size)), ys[i]]); };
  // Was an einem geschützten Gegner steht: das Wort des obersten Schilds, die
  // Schilde, dann die Lösung nach einem Fehler oder der Leuchtturm. Der
  // Schlüssel trägt mit, was neu einblenden soll (zweiter Fehler, Ausbau des
  // Leuchtturms).
  const labels = (e, pos, target) => {
    if (!dfShielded(e)) return [];
    const out = [{ key: 'w', size: 20, fill: e === target ? 'var(--akzent-text)' : 'var(--text)', text: (e.ret ? '↺ ' : '') + dfCut(inline(promptOf(dfItem(e)))), weight: 600 }];
    if (e.items.length > 1) out.push({ key: 's', size: 15, fill: 'var(--akzent-text)', text: '◆'.repeat(e.items.length - e.done) + '◇'.repeat(e.done) });
    const lit = act.lit(pos);
    if (e.revealUntil > g.time) out.push({ key: 'r' + e.misses, size: 18, fill: 'var(--rot-text)', text: dfCut(inline(e.solution)), weight: 600, pop: true });
    else if (lit) out.push({ key: 'l' + lit, size: 16, fill: 'var(--orange-text)', text: act.lightHint(e, lit), pop: true });
    return out;
  };
  const quaking = () => g.fx.some((f) => f.type === 'quake');
  const nodes = useRef(new Map()).current; // Schlüssel → Element (Gegner, Lebensbalken, Beschriftung, Frost-Balken)
  const keep = (key) => (el) => (el ? nodes.set(key, el) : nodes.delete(key));
  // Nur setzen, was sich geändert hat: im Stillstand (Frost, «ruhig» beim
  // Tippen) schrieb das Feld sonst jedes Bild alle Attribute neu
  const put = (key, name, v) => { const el = nodes.get(key); if (el && el.getAttribute(name) !== String(v)) el.setAttribute(name, v); };
  let seen = []; // Stand der Gegner aus dem letzten `look`, für das schnelle Nachführen
  const look = () => {
    const target = act.target();
    seen = g.enemies.map((e) => { const pos = dfAt(map, e.p); return { e, pos, ls: labels(e, pos, target) }; });
    return [act.frozen(), quaking(), ...seen.map(({ e, ls }) => [e.id, e.done, e.misses, e.charged, e.slow < 1, e === target, ...ls.map((l) => l.key + l.fill + l.text)].join())].join('|');
  };
  const stale = useDfRedraw(look);
  act.frame = () => {
    if (stale()) return;
    for (const { e, pos, ls } of seen) {
      put(e.id, 'transform', `translate(${pos[0]} ${pos[1]})`);
      put(`${e.id}:bar`, 'width', dfBar(e));
      place(ls, pos, dfOuter(e)).forEach(([dx, y], i) => { put(`${e.id}:${ls[i].key}`, 'x', dx); put(`${e.id}:${ls[i].key}`, 'y', y); });
    }
    put('frost', 'width', (160 * Math.max(0, g.frozen - g.time)) / DF_FREEZE);
  };
  const pause = phase === 'pause', run = phase === 'run';
  const target = act.target();
  const iced = act.frozen();
  const c = map.castle;
  const shape = (e) => {
    if (e.kind === 'slime') return <path d="M-20 12 Q-22 -18 0 -18 Q22 -18 20 12 Z" style={{ fill: 'var(--gruen-weich)', stroke: 'var(--gruen)', strokeWidth: 2.5 }} />;
    if (e.kind === 'arrow') return <path d="M-20 -13 L22 0 L-20 13 L-12 0 Z" style={{ fill: 'var(--akzent-weich)', stroke: 'var(--akzent)', strokeWidth: 2.5 }} />;
    if (e.kind === 'knight') return (
      <>
        <circle r="19" style={{ fill: 'var(--orange-weich)', stroke: 'var(--orange)', strokeWidth: 2.5 }} />
        <path d="M-12 -6 L0 -12 L12 -6 L10 8 L0 13 L-10 8 Z" style={{ fill: 'none', stroke: 'var(--orange)', strokeWidth: 2 }} />
      </>
    );
    if (e.kind === 'captain') return (
      <>
        <rect x="-20" y="-20" width="40" height="40" rx="8" style={{ fill: 'var(--orange-weich)', stroke: 'var(--orange)', strokeWidth: 3 }} />
        <path d="M-10 -4 L-5 -11 L0 -4 L5 -11 L10 -4 L10 6 L-10 6 Z" style={{ fill: 'var(--orange)' }} />
      </>
    );
    return (
      <>
        <circle r="32" style={{ fill: 'var(--rot-weich)', stroke: 'var(--rot)', strokeWidth: 3 }} />
        <circle cx="-11" cy="-6" r="5" style={{ fill: 'var(--rot)' }} /><circle cx="11" cy="-6" r="5" style={{ fill: 'var(--rot)' }} />
        <path d="M-12 14 Q0 6 12 14" style={{ fill: 'none', stroke: 'var(--rot)', strokeWidth: 3 }} />
      </>
    );
  };
  // Weg, Burg, Plätze und Türme ändern sich nur mit Karte, Phase, Wahl und
  // Türmen: einmal gebaut überspringt React sie in jedem Bild. Ein neuer oder
  // ausgebauter Turm fällt herein (eigener Schlüssel aus Art und Stufe).
  const towers = JSON.stringify(g.towers);
  const ground = useMemo(() => {
    // Der Kegel zeigt auf die nächste Stelle des Wegs
    const cone = (x, y, range) => {
      const [nx, ny] = map.segs.map(({ a, b, len }) => {
        const k = Math.min(1, Math.max(0, ((x - a[0]) * (b[0] - a[0]) + (y - a[1]) * (b[1] - a[1])) / (len * len)));
        return [a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])];
      }).sort((p, q) => dfDist(p, [x, y]) - dfDist(q, [x, y]))[0];
      const a = Math.atan2(ny - y, nx - x), s = 0.35;
      return `${x},${y} ${x + range * Math.cos(a - s)},${y + range * Math.sin(a - s)} ${x + range * Math.cos(a + s)},${y + range * Math.sin(a + s)}`;
    };
    return (
      <>
        <polyline points={map.points} style={{ fill: 'none', stroke: 'var(--hover)', strokeWidth: 52, strokeLinejoin: 'round' }} />
        <polyline points={map.points} style={{ fill: 'none', stroke: 'var(--linie)', strokeWidth: 2, strokeDasharray: '10 12' }} />
        <g>
          <rect x={c.x} y={c.y + 20} width={c.w} height={c.h - 20} rx="4" style={{ fill: 'var(--karte)', stroke: 'var(--text-2)', strokeWidth: 2 }} />
          {[0, 1, 2].map((i) => <rect key={i} x={c.x + 6 + i * ((c.w - 24) / 2)} y={c.y + 6} width="12" height="16" style={{ fill: 'var(--karte)', stroke: 'var(--text-2)', strokeWidth: 2 }} />)}
          <path d={`M${c.x + c.w / 2 - 14} ${c.y + c.h} v-26 a14 14 0 0 1 28 0 v26`} style={{ fill: 'var(--hover)', stroke: 'var(--text-2)', strokeWidth: 2 }} />
        </g>
        {/* Reichweiten zuerst und ohne Zeiger-Ereignisse: über den Plätzen
            gezeichnet schluckten sie die Tipps auf die Plätze darunter. In
            der Pause als Kreis, beim Spielen atmet der Frost und der
            Leuchtturm schwenkt seinen Kegel */}
        {map.slots.map(([x, y], i) => {
          const tw = g.towers[i], range = tw ? dfStat(tw, 'range') : DF_TOWERS[0].range[0];
          if (slot === i || (pause && tw)) return <circle key={i} cx={x} cy={y} r={range} style={{ fill: 'var(--akzent-weich)', fillOpacity: 0.35, stroke: 'var(--akzent)', strokeDasharray: '6 6', pointerEvents: 'none' }} />;
          if (run && tw && tw.type === 'frost') return <circle key={i} cx={x} cy={y} r={range} className="df-aura" style={{ fill: 'var(--akzent-weich)', fillOpacity: 0.3, pointerEvents: 'none' }} />;
          if (run && tw && tw.type === 'light') return <polygon key={i} points={cone(x, y, range)} className="df-sweep" style={{ fill: 'var(--orange-weich)', fillOpacity: 0.45, pointerEvents: 'none', transformBox: 'view-box', transformOrigin: `${x}px ${y}px` }} />;
          return null;
        })}
        {map.slots.map(([x, y], i) => {
          const tw = g.towers[i];
          return (
            <g key={i} onClick={() => pause && act.choose(i)} style={{ cursor: pause ? 'pointer' : 'default' }}>
              {tw ? (
                <g key={tw.type + tw.lvl}>
                  <ellipse cx={x} cy={y + 24} rx="30" ry="7" className="df-dust" style={{ fill: 'var(--text-3)', opacity: 0 }} />
                  <g className="df-drop">
                    <rect x={x - 24} y={y - 24} width="48" height="48" rx="6" style={{ fill: 'var(--karte)', stroke: 'var(--akzent)', strokeWidth: slot === i ? 4 : 2.5 }} />
                    {tw.lvl > 1 && <rect x={x - 19} y={y - 19} width="38" height="38" rx="4" style={{ fill: 'none', stroke: 'var(--akzent)', strokeWidth: 1.5 }} />}
                    <text x={x} y={y + 9} textAnchor="middle" fontSize="26" style={{ fill: 'var(--akzent-text)' }}>{dfTower(tw.type).icon}</text>
                  </g>
                </g>
              ) : (
                <>
                  <rect x={x - 24} y={y - 24} width="48" height="48" rx="6" style={{ fill: 'transparent', stroke: slot === i ? 'var(--akzent)' : 'var(--text-3)', strokeWidth: 2, strokeDasharray: '5 4' }} />
                  <text x={x} y={y + 9} textAnchor="middle" fontSize="26" style={{ fill: 'var(--text-3)' }}>{pause ? '+' : ''}</text>
                </>
              )}
            </g>
          );
        })}
      </>
    );
  }, [map, phase, slot, towers]);
  return (
    // Ein Tipp aufs Feld nimmt dem Eingabefeld nicht den Fokus — auf dem
    // iPad ginge sonst mitten in der Welle die Tastatur zu
    <svg ref={svgRef} viewBox={`0 0 ${map.w} ${map.h}`} className={`df-svg w-full block select-none touch-manipulation${halt ? ' df-halt' : ''}`}
      style={{ maxHeight }} role="group" aria-label={label} onMouseDown={(e) => { if (run) e.preventDefault(); }}>
      {/* Beben (Orbitalschlag): ein gewöhnlicher Effekt, die Klasse sitzt am Inhalt */}
      <g className={quaking() ? 'df-quake' : undefined}>
        {ground}
        {seen.slice().reverse().map(({ e, pos, ls }) => {
          const [x, y] = pos, r = DF_KINDS[e.kind].r;
          const sh = dfShielded(e), outer = dfOuter(e), at = place(ls, pos, outer);
          return (
            // Entlarvte nehmen keine Tipps an: ihr Trefferkreis lag sonst über
            // einem geschützten Gegner dahinter und der Tipp ging verloren
            <g key={e.id} ref={keep(e.id)} transform={`translate(${x} ${y})`}
              onClick={() => act.pick(e)} style={sh ? { cursor: 'pointer' } : { pointerEvents: 'none' }}>
              <circle r={outer + 18} style={{ fill: 'transparent' }} />
              {e === target && <circle r={outer + 7} style={{ fill: 'none', stroke: 'var(--akzent)', strokeWidth: 4 }} />}
              <g className={e.charged ? 'df-charge' : undefined}>
                <g key={e.misses} className={e.misses ? 'df-shake' : undefined}>{shape(e)}</g>
                {e.charged && <path d={`M${-r} ${-r} l8 8 -6 3 9 9 M${r} ${r} l-8 -8 6 -3 -9 -9`} className="df-spark" style={{ fill: 'none', stroke: 'var(--orange)', strokeWidth: 3 }} />}
              </g>
              {e.slow < 1 && <circle r={r} style={{ fill: 'var(--akzent-weich)', opacity: 0.55 }} />}
              {Array.from({ length: e.items.length - e.done }, (_, k) => <circle key={k} r={dfRing(e, k + 1)} style={{ fill: 'none', stroke: 'var(--akzent)', strokeWidth: 2.5 }} />)}
              {!sh && (
                <>
                  <circle r={r + 6} className="df-redring" style={{ fill: 'none', stroke: 'var(--rot)', strokeWidth: 2.5, strokeDasharray: '5 4' }} />
                  <g className="df-barin">
                    <rect x="-24" y={r + 10} width="48" height="7" rx="3.5" style={{ fill: 'var(--karte)', stroke: 'var(--linie)' }} />
                    <rect ref={keep(`${e.id}:bar`)} x="-24" y={r + 10} width={dfBar(e)} height="7" rx="3.5" style={{ fill: 'var(--rot)' }} />
                  </g>
                </>
              )}
              {iced && <rect x={-r - 6} y={-r - 6} width={2 * r + 12} height={2 * r + 12} rx="5" className="df-ice" style={{ fill: 'var(--akzent-weich)', stroke: 'var(--akzent)', strokeWidth: 2, opacity: 0.8 }} />}
              {ls.map((l, i) => (
                <text key={l.key} ref={keep(`${e.id}:${l.key}`)} x={at[i][0]} y={at[i][1]} textAnchor="middle" fontSize={fs(l.size)} fontWeight={l.weight}
                  className={l.pop ? 'df-lit' : undefined} style={{ ...halo, fill: l.fill }}>{l.text}</text>
              ))}
            </g>
          );
        })}
        {/* Frost-Restzeit aus dem Spielstand, nicht als Effekt mit eigener Uhr */}
        {iced && <rect ref={keep('frost')} x={map.w / 2 - 80} y="6" width={(160 * (g.frozen - g.time)) / DF_FREEZE} height="8" rx="4" style={{ fill: 'var(--akzent)' }} />}
        <DfFx g={g} map={map} scale={scale} act={act} />
      </g>
      {phase === 'end' && (
        <>
          <text x={map.w / 2} y={map.h / 2} textAnchor="middle" fontSize={fs(48)} fontWeight="700"
            style={{ ...halo, strokeWidth: 10, fill: `var(--${DF_END_COLOR[g.text]}-text)` }}>{t(g.text)}</text>
          {Array.from({ length: DF_STARS }, (_, i) => (
            <text key={i} x={map.w / 2 + (i - 1) * fs(48)} y={map.h / 2 + fs(60)} textAnchor="middle" fontSize={fs(44)} className="df-star"
              style={{ ...halo, fill: i < g.stars ? 'var(--orange)' : 'var(--linie)', animationDelay: `${0.3 + i * 0.2}s` }}>★</text>
          ))}
        </>
      )}
    </svg>
  );
});

// ---------- Runde ----------
const DefenseRound = ({ set, opts, words, prog, onDone, onBack, onResult }) => {
  const pace = DF_PACE[opts.pace] || DF_PACE.normal; // `pace` prüft schon normOpts
  const view = useDfViewport();
  const map = DF_MAPS[view.w < 640 ? 'tall' : 'wide'];
  const [input, setInput] = useState('');
  const [slot, setSlot] = useState(null); // gewählter Platz in der Pause
  const [missed, setMissed] = useState(null); // letzte falsche Antwort, ganz: { item, solution }
  const [, redraw] = React.useReducer((x) => x + 1, 0);
  const [ask, dialogNode] = useAsk();
  const inputRef = useRef(null), hudRef = useRef(null), barRef = useRef(null);
  const [startedAt] = useState(Date.now);
  // Zeitgeber müssen beim Verlassen weg (wie in MatchRound): sonst legte sich
  // die Auswertung über die Set-Seite oder über eine neu gestartete Runde
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const act = useRef({}).current;

  // Der ganze Spielstand in einer Ref: die Schleife läuft 60-mal pro Sekunde.
  // Zeiten sind Zeitpunkte in Spielzeit `g.time` (steht still, solange das
  // Spiel ruht); nur `g.next` zählt herunter, weil es bei Frost und «ruhig»
  // stillsteht.
  const G = useRef(null);
  if (!G.current) {
    // Eine Restwelle mit ein, zwei Wörtern lohnt keine Pause: an die vorige
    const waves = groupsOf(buildQueue(words, opts), DF_WAVE, 2);
    G.current = {
      waves, wave: 0, boss: false, pending: dfPack(waves[0], 0), carry: [], ...dfWaveState(),
      enemies: [], uid: 0, next: 0, time: 0, away: false,
      hearts: DF_HEARTS, coins: DF_START_COINS, energy: 0, towers: {}, cds: {}, fx: [],
      stars: 0, text: '', phase: 'pause', bossOut: false,
      // pin: der Gegner, für den gerade getippt wird (angetippt oder beim
      // ersten Zeichen festgehalten) — ohne ihn wechselte das Ziel mitten im
      // Wort, sobald ein Pfeil überholt, und die Antwort traf ein anderes
      // Wort. Bricht er durch, bleibt der Text bei ihm und trifft höchstens
      // noch einen Gegner, zu dem er passt.
      pin: null, pinByTap: false,
      // seen: Wort → Spielzeit, zu der seine Lösung zuletzt zu sehen war
      answered: new Set(), log: [], errors: new Map(), seen: new Map(),
    };
  }
  const g = G.current;

  const posOf = (e) => dfAt(map, e.p);
  const frontmost = (list = g.enemies.filter(dfShielded)) => list.reduce((a, e) => (!a || e.p > a.p ? e : a), null);
  const targetOf = () => (g.pin ? (g.enemies.includes(g.pin) && dfShielded(g.pin) ? g.pin : null) : frontmost());
  const pinTo = (e, byTap) => { g.pin = e; g.pinByTap = byTap; };
  const unpin = () => { g.pin = null; g.pinByTap = false; };
  const frozen = () => g.frozen > g.time;
  // Gebaute Türme: pro Rendern einmal (Türme ändern sich nur in der Pause,
  // Plätze mit der Karte) statt in jedem Bild pro Gegner
  const towerList = Object.keys(g.towers).map((i) => ({ i: Number(i), at: map.slots[i], ...g.towers[i], def: dfTower(g.towers[i].type) }));
  const inRange = (tw, pos) => dfDist(tw.at, pos) <= dfStat(tw, 'range');
  const near = (pos, type) => towerList.filter((tw) => tw.type === type && inRange(tw, pos));
  const fx = (type, more) => g.fx.push({ id: ++g.uid, type, until: g.time + DF_FX[type], ...more });
  const plan = (delay, run) => g.hits.push({ at: g.time + delay, run }); // Treffer nach dem Flug (Rakete, Orbitalschlag)
  // Eben gesehen: die Lösung stand am Gegner oder in der Leiste. Solange gilt
  // eine richtige Antwort als abgeschrieben und die Wiederkehr wartet
  const seenRecently = (word) => g.time < (g.seen.get(word) ?? -Infinity) + DF_REVEAL + pace.gap;
  // Die Wiederkehr ist immer ein Schleim: das eben verfehlte Wort fiel um
  // zwei Stufen und käme sonst ab «kommt langsam» als schneller Pfeil
  const kindOf = (spec) => (spec.boss ? 'boss' : spec.items.length >= 3 ? 'captain' : spec.items.length === 2 ? 'knight'
    : !spec.ret && stageOf(prog[wordKey(spec.items[0].word)]) >= 3 ? 'arrow' : 'slime');
  const spawn = (spec) => {
    const kind = kindOf(spec);
    return { id: ++g.uid, kind, items: spec.items, done: 0, hp: DF_KINDS[kind].hp, p: 0, revealUntil: 0, solution: '', misses: 0, missAt: -1, slow: 1, stun: 0, charged: false, ret: !!spec.ret, bounty: 0 };
  };
  // Erste Antwort pro Wort: Protokoll für die Auswertung und Lernstand.
  // Fehler neu einreihen, damit der Boss die letzten bekommt (Map behielte
  // sonst die Stelle des ersten Fehlers).
  const score = (item, ok, typed, solution) => {
    if (!ok) { g.errors.delete(item.word); g.errors.set(item.word, item); }
    if (g.answered.has(item.word)) return;
    g.answered.add(item.word);
    g.log.push({ item, ok, input: typed, solution: solution || solutionOf(item) });
    onResult(item.word, ok);
  };
  // Wiederkehr: ein falsches oder unbeantwortetes Wort läuft ein paar Gegner
  // später als eigener Schleim nochmals, ohne Lösung — erst das ist echtes
  // Abrufen (war die Lösung eben zu sehen, wartet es, s. `seenRecently`).
  // Einmal pro Welle; ein zweites Mal geht es in die nächste, beim Boss gar
  // nicht (seine Wörter sind schon die Fehler).
  const comeBack = (item, from) => {
    if (g.boss) return;
    if (g.returned.has(item.word)) { g.carry.push(item); return; }
    g.returned.add(item.word);
    g.pending.splice(Math.min(DF_RETURN_AFTER, g.pending.length), 0, { items: [item], ret: true });
    const [x2, y2] = map.path[0];
    fx('ghost', { x: from[0], y: from[1], x2, y2, text: '↺ ' + dfCut(inline(promptOf(item)), 14) });
  };
  const kill = (e) => {
    const [x, y] = posOf(e);
    g.enemies = g.enemies.filter((o) => o !== e);
    if (g.pin === e) unpin();
    g.coins += e.bounty;
    fx('pop', { x, y, r: DF_KINDS[e.kind].r + 8 });
  };
  // Schaden nur ohne Schild. `soft` (Überladung, Orbitalschlag) macht auch
  // geschützte Gegner mürbe, aber nie unter DF_ANSWER_DMG: die letzte Antwort
  // wirft sie dann sicher um, ohne sie fällt keiner.
  const hurt = (e, n, soft) => {
    if (!g.enemies.includes(e)) return;
    if (dfShielded(e)) { if (soft) e.hp = Math.max(DF_ANSWER_DMG, e.hp - n); return; }
    e.hp -= n;
    if (e.hp <= 0) kill(e);
  };
  // Trifft alle Gegner im Kreis und gibt sie zurück
  const area = (pos, r, n, soft) => {
    const hit = g.enemies.filter((e) => dfDist(pos, posOf(e)) <= r);
    hit.forEach((e) => hurt(e, n, soft));
    return hit;
  };
  // Burg (s. DF_CASTLE): Schaden nach Weg, je `shot` Schaden ein sichtbarer Schuss
  const castle = (e, n) => {
    e.castleHit = (e.castleHit || 0) + n;
    if (e.castleHit >= DF_CASTLE.shot) {
      e.castleHit -= DF_CASTLE.shot;
      const c = map.castle, [x2, y2] = posOf(e);
      fx('tracer', { x: c.x + c.w / 2, y: c.y + 24, x2, y2 });
    }
    hurt(e, n);
  };
  // Türme: jeder Schütze nimmt den vordersten entlarvten Gegner in seiner
  // Reichweite. Die Rakete trifft erst nach dem Flug, dort, wo ihr Ziel dann ist.
  const shootAll = () => {
    for (const tw of towerList) {
      if (!tw.def.every || g.cds[tw.i] > g.time) continue;
      const e = frontmost(g.enemies.filter((o) => !dfShielded(o) && inRange(tw, posOf(o))));
      if (!e) continue;
      g.cds[tw.i] = g.time + tw.def.every;
      const to = posOf(e), dmg = dfStat(tw, 'dmg');
      if (tw.def.splash) {
        const r = dfStat(tw, 'splash');
        fx('fly', { x: tw.at[0], y: tw.at[1], x2: to[0], y2: to[1] });
        plan(DF_FX.fly, () => {
          const at = g.enemies.includes(e) ? posOf(e) : to;
          fx('boom', { x: at[0], y: at[1], r });
          area(at, r, dmg);
        });
      } else {
        fx('tracer', { x: tw.at[0], y: tw.at[1], x2: to[0], y2: to[1] });
        hurt(e, dmg);
      }
    }
  };
  const finish = (held) => {
    g.phase = 'end';
    // Ein durchgebrochener Boss ist kein «gehalten»: höchstens ein Stern
    g.stars = !held ? 0 : g.bossOut ? 1 : g.hearts >= DF_HEARTS ? 3 : g.hearts >= 3 ? 2 : 1;
    g.text = !held ? 'dfFallen' : g.bossOut ? 'dfEscaped' : 'dfHeld';
    // `retry`: alle Wörter, die irgendwann schiefgingen — auch nach einer
    // ersten richtigen Antwort
    later(() => onDone({
      log: g.log, seconds: Math.round((Date.now() - startedAt) / 1000),
      game: { text: g.text, stars: g.stars, of: DF_STARS }, retry: [...g.errors.values()],
    }), 2200);
  };
  const endWave = () => {
    // Halb getippter Text gehörte zu einem Wort dieser Welle — in der
    // nächsten träfe er ein anderes
    setInput('');
    unpin();
    Object.assign(g, dfWaveState());
    if (g.boss) { finish(true); return; }
    if (g.wave + 1 < g.waves.length) {
      g.wave++;
      g.pending = [...dfPack(g.waves[g.wave], g.wave), ...g.carry.map((item) => ({ items: [item], ret: true }))];
      g.carry = [];
    } else {
      // Fehler der letzten Welle stecken im Boss
      const items = [...g.errors.values()].slice(-DF_BOSS_WORDS);
      if (!items.length) { finish(true); return; }
      g.boss = true;
      g.pending = [{ items, boss: true }];
    }
    g.phase = 'pause';
    fx('banner', { text: 'dfWaveDone' });
  };
  const go = () => {
    g.phase = 'run';
    g.next = 0.6;
    g.fx = [];
    // Das Eingabefeld steht erst nach dem Zeichnen da; iOS öffnet die
    // Tastatur nur bei einem focus() noch im Tipp — also sofort zeichnen
    ReactDOM.flushSync(() => { setSlot(null); setMissed(null); redraw(); });
    if (inputRef.current) inputRef.current.focus();
  };

  const step = (dt) => {
    if (g.phase !== 'run') return;
    // Gespielt wird nur, solange das Eingabefeld den Fokus hat: liegt etwas
    // darüber (Rückfrage, Einstellungen, Anleitung), ist die Tastatur zu
    // oder ein anderes Fenster vorn, steht alles still — sonst liefen die
    // Gegner weiter, während niemand tippen kann
    g.away = !(document.hasFocus() && document.activeElement === inputRef.current);
    if (g.away) { act.hud(); return; }
    g.time += dt;
    if (g.fx.some((f) => f.until <= g.time)) g.fx = g.fx.filter((f) => f.until > g.time);
    const due = g.hits.filter((h) => h.at <= g.time);
    if (due.length) { g.hits = g.hits.filter((h) => h.at > g.time); due.forEach((h) => h.run()); }
    // Die ganze Lösung steht in der Leiste, solange sie als «eben gesehen» gilt
    if (missed && !seenRecently(missed.item.word)) setMissed(null);
    // Frostwelle: niemand läuft und niemand kommt nach; die Türme schiessen weiter
    if (!frozen() && !(pace.hold && input.trim() && g.enemies.some(dfShielded))) {
      g.next -= dt;
      const spec = g.pending[0];
      if (g.next <= 0 && spec && !(spec.ret && seenRecently(spec.items[0].word))) {
        g.pending.shift();
        g.enemies.push(spawn(spec));
        g.next = pace.gap * (1 + 0.5 * (spec.items.length - 1)); // nach mehreren Schilden etwas Luft
      }
      const zone = 1 - DF_CASTLE.zone;
      for (const e of g.enemies) {
        e.slow = Math.min(1, ...near(posOf(e), 'frost').map((tw) => dfStat(tw, 'slow')));
        if (e.stun > g.time) continue;
        const from = e.p;
        e.p += (DF_KINDS[e.kind].speed * e.slow * dt) / pace.cross;
        const inZone = e.p - Math.max(from, zone);
        if (inZone > 0 && !dfShielded(e)) castle(e, (DF_CASTLE.dmg / DF_CASTLE.zone) * inZone);
      }
    }
    shootAll();
    // Durchgebrochen: kostet Herzen. Das angezeigte Wort gilt als nicht
    // gewusst; die Wörter unter den übrigen Schilden standen nie da, sie kommen
    // bloss wieder — gebucht hätten sie zwei Stufen verloren, ohne je gefragt
    // zu sein. Keines kommt doppelt (das nach einem Fehler ist schon unterwegs).
    const out = g.enemies.filter((e) => e.p >= 1);
    if (out.length) {
      g.enemies = g.enemies.filter((e) => e.p < 1);
      const c = map.castle;
      for (const e of out) {
        if (e === g.pin && !input.trim()) unpin();
        const boss = e.kind === 'boss';
        g.hearts -= boss ? 2 : 1;
        if (boss) g.bossOut = true;
        e.items.slice(e.done).forEach((item, k) => {
          if (!k) score(item, false, '', '');
          if (e.done + k !== e.missAt) comeBack(item, [c.x + c.w / 2, c.y + c.h / 2]);
        });
        fx('breach', { x: c.x + c.w / 2, y: c.y + 10 });
      }
    }
    if (g.hearts <= 0) { g.hearts = 0; finish(false); }
    else if (!g.pending.length && !g.enemies.length) endWave();
    // In jedem Bild vergleichen Runde, Feld und Effekte selbst, ob sie neu
    // zeichnen müssen — keine Merker, die eine Stelle vergessen kann
    act.hud();
    if (act.frame) act.frame();
    if (act.fxFrame) act.fxFrame();
  };
  // Die Schleife ruft immer den `step` des letzten Renderns: der sieht
  // Eingabe, Lernstand und Karte ohne Spiegel-Refs
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now) => {
      // Ein verdeckter Tab liefert lange Pausen: nie mehr als 0.1 s am Stück
      stepRef.current(Math.min(0.1, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Eine richtige Antwort bricht den obersten Schild und zahlt aus — ausser
  // die Lösung war eben zu sehen (abgeschrieben): dann weder Münzen noch
  // Energie und der Gegner bringt beim Abschuss nichts (`bounty`). Der letzte
  // Schild legt den Gegner frei und trifft ihn gleich; ein aufgeladenes Wort
  // explodiert.
  const breakShield = (e) => {
    const [x, y] = posOf(e);
    const copied = seenRecently(dfItem(e).word);
    fx('shield', { x, y, r: dfOuter(e) });
    if (!copied) {
      g.coins += DF_HIT_COINS;
      g.energy = Math.min(DF_ENERGY_MAX, g.energy + 1);
      fx('plus', { x, y: y - DF_KINDS[e.kind].r - 40, text: `+${DF_HIT_COINS}` });
    }
    e.done += 1;
    e.revealUntil = 0;
    if (e.charged) {
      e.charged = false;
      fx('blast', { x, y, r: DF_BLAST.r });
      area([x, y], DF_BLAST.r, DF_BLAST.dmg, true);
    }
    if (!dfShielded(e)) {
      if (g.pin === e) unpin();
      e.bounty = copied ? 0 : DF_KILL_COINS;
      hurt(e, DF_ANSWER_DMG);
    }
  };
  const fire = () => {
    const typed = input.trim();
    const target = targetOf();
    const gone = g.pin && !target && dfItem(g.pin); // durchgebrochen, während getippt wurde
    if (!typed || (!target && !gone) || g.phase !== 'run') return;
    // Getroffen wird der Gegner, zu dem die Antwort passt — das Ziel zuerst,
    // «richtig» vor «fast richtig»; `others` hält Verwechslungen fern
    const open = g.enemies.filter(dfShielded);
    const tries = (target ? [target, ...open.filter((e) => e !== target)] : open).map((e) => {
      const item = dfItem(e), solution = solutionOf(item);
      const r = checkAnswer(typed, solution, { level: opts.level, lang: langOf(set, item, 'answer'), others: otherSolutions(words, item, solution), forms: !!opts.forms });
      return { e, item, r };
    });
    const hit = tries.find((x) => x.r.status === 'right') || tries.find((x) => x.r.status === 'almost');
    setInput('');
    if (!g.pinByTap || gone) unpin();
    if (hit) {
      score(hit.item, true, typed, hit.r.solution);
      setMissed(null);
      breakShield(hit.e);
    } else if (target) {
      const { item, r } = tries[0];
      score(item, false, typed, r.solution);
      g.seen.set(item.word, g.time);
      target.revealUntil = g.time + DF_REVEAL;
      target.solution = r.solution || solutionOf(item);
      target.misses += 1;
      if (target.missAt !== target.done) { target.missAt = target.done; comeBack(item, posOf(target)); }
      setMissed({ item, solution: target.solution });
    } else {
      // Zu spät: das Wort ist schon als nicht gewusst gebucht, nur die Lösung zeigen
      g.seen.set(gone.word, g.time);
      setMissed({ item: gone, solution: solutionOf(gone) });
    }
    if (act.frame) act.frame();
  };
  const type = (v) => {
    // Beim ersten Zeichen festhalten, für wen getippt wird; ganz gelöscht
    // ist wieder frei (ausser angetippt)
    if (v.trim() && !input.trim() && !g.pin) { const tg = frontmost(); if (tg) pinTo(tg, false); }
    if (!v.trim() && (!g.pinByTap || !targetOf())) unpin();
    setInput(v);
  };

  // Spezialkräfte (Knöpfe neben «Feuer»): was jede braucht (`can`) und tut
  // (`run`). Bereit heisst: lässt sich jetzt sinnvoll zünden — sonst
  // verschwendete ein Doppeltipp auf die Frostwelle Energie oder ein Knopf sah
  // bereit aus und tat still nichts.
  const chargeTarget = () => { const e = targetOf() || frontmost(); return e && !e.charged ? e : null; };
  const POWERS = {
    freeze: { can: () => !frozen(), run: () => { g.frozen = g.time + DF_FREEZE; fx('freeze', {}); } },
    // Lädt das markierte Wort auf: wird es beantwortet, explodiert es
    charge: { can: () => !!chargeTarget(), run: () => { chargeTarget().charged = true; } },
    // Auf den Gegner, der der Burg am nächsten ist: entlarvte trifft er hart,
    // geschützte macht er mürbe; alle im Kreis stehen kurz still
    orbital: {
      can: () => true,
      run: () => {
        const at = posOf(frontmost(g.enemies));
        fx('orbital', { x: at[0], y: at[1], r: DF_ORBITAL.r });
        plan(DF_ORBITAL.hit, () => {
          area(at, DF_ORBITAL.r, DF_ORBITAL.dmg, true).forEach((o) => { o.stun = g.time + DF_ORBITAL.stun; });
          fx('quake', {});
        });
      },
    },
  };
  const offered = (sp) => !sp.needs || towerList.some((tw) => tw.type === sp.needs);
  const ready = (sp) => g.phase === 'run' && !g.away && g.energy >= sp.cost && offered(sp) && g.enemies.length > 0
    && !(sp.perWave && g.used.has(sp.id)) && POWERS[sp.id].can();
  const special = (sp) => {
    if (!ready(sp)) return;
    g.energy -= sp.cost;
    if (sp.perWave) g.used.add(sp.id);
    POWERS[sp.id].run();
    if (act.frame) act.frame();
  };
  // Knöpfe der Runde nehmen dem Feld den Fokus nicht (kein mousedown — an
  // `disabled` kommt keines an, darum sperrt nur aria-disabled) und holen ihn
  // zurück, falls er weg war: sonst stünde das Spiel (`g.away`)
  const keepFocus = (e) => e.preventDefault();
  const tap = (fn) => () => {
    if (inputRef.current) inputRef.current.focus();
    fn();
  };

  // Türme in der Pause: ein Kauf zahlt den Preis (negativ: Geld zurück) und
  // besetzt oder räumt den Platz. Bauen und Umbauen rechnen die Rücknahme des
  // alten Turms ein (DF_SELL des Bezahlten).
  const own = slot != null ? g.towers[slot] : null;
  const ownDef = own && dfTower(own.type);
  const refund = (tw) => Math.round(tw.paid * DF_SELL);
  const priceOf = (d) => d.cost - (own ? refund(own) : 0);
  const trade = (price, tower) => {
    if (g.coins < price) return;
    g.coins -= price;
    if (tower) g.towers[slot] = tower;
    else delete g.towers[slot];
    delete g.cds[slot];
    setSlot(null);
  };
  const buy = (d) => trade(priceOf(d), { type: d.id, lvl: 1, paid: d.cost });
  const upgrade = () => trade(ownDef.up, { ...own, lvl: 2, paid: own.paid + ownDef.up });
  const sell = () => trade(-refund(own), null);
  const quit = () => ask({ kind: 'confirm', ok: t('quit'), text: t('confirmQuit'), onYes: onBack });

  // Leuchtturm (s. dfHintShape): Lösung ohne Artikel («la maison», «l'école»,
  // «le chien» gäben sonst alle «l…»), bei Wortformen gehört der Artikel
  // dazu; Hinweise nur, wenn sie eingeschaltet sind. Gemerkt pro Gegner,
  // Schild und Stufe: die Feld-Signatur fragt in jedem Bild danach.
  act.lit = (pos) => Math.max(0, ...near(pos, 'light').map((tw) => tw.lvl));
  act.lightHint = (e, lvl) => {
    const key = `${e.done}/${lvl}`;
    if (e.hintKey !== key) {
      const item = dfItem(e), sol = firstAlt(solutionOf(item));
      const word = opts.forms ? sol : stripArticle(straightQuotes(sol).toLowerCase(), langOf(set, item, 'answer'));
      const h = opts.hints ? promptHint(item) : '';
      e.hintKey = key;
      e.hint = dfCut(`${dfHintShape(word, lvl)}${h ? ' ' + h : ''}`, 26);
    }
    return e.hint;
  };
  act.target = targetOf;
  act.frozen = frozen;
  act.pick = (e) => {
    if (!dfShielded(e)) return;
    pinTo(e, true);
    redraw();
    act.frame();
    if (inputRef.current) inputRef.current.focus();
  };
  act.choose = (i) => setSlot((s) => (s === i ? null : i));
  // Was die Runde zeigt: neu gezeichnet wird nur, wenn sich davon etwas ändert
  // (`step` vergleicht in jedem Bild, auch in der Pause durch Fokusverlust)
  const returns = g.pending.filter((s) => s.ret).length;
  act.hud = useDfRedraw(() => [g.phase, g.away, g.hearts, g.coins, g.energy, g.wave, g.boss, g.answered.size, g.enemies.length,
    g.pending.filter((s) => s.ret).length, (targetOf() || {}).id, g.pin && g.pin.id, towerList.length, DF_SPECIALS.map(ready)].join());

  // Platz fürs Feld: Fensterhöhe ohne Anzeige oben und Eingabekarte (die
  // Kopfzeile darf beim Tippen wegscrollen). Gemessen, nicht geschätzt.
  const [chrome, setChrome] = useState(180);
  React.useLayoutEffect(() => {
    if (g.phase !== 'run' || !barRef.current || !hudRef.current) return;
    const h = hudRef.current.offsetHeight + barRef.current.offsetHeight + 56;
    if (Math.abs(h - chrome) > 4) setChrome(h);
  });

  const pauseView = g.phase === 'pause';
  const target = targetOf();
  const targetItem = target && dfItem(target);
  const waveLabel = g.boss ? t('dfBossWave') : t('dfWave', g.wave + 1, g.waves.length);
  const hint = targetItem && opts.hints && promptHint(targetItem);
  const coming = g.pending.flatMap((s) => s.items.map((item) => ({ item, ret: s.ret })));
  const specials = DF_SPECIALS.filter(offered);

  return (
    <div className={`${SCREEN} p-3 sm:p-6`}>
      <PracticeFrame set={set} pos={g.answered.size} queue={words.length} done={g.answered.size} total={words.length} item={null} onQuit={quit}>
        <div className={`${CARD} p-2 sm:p-3 mb-3`}>
          <div ref={hudRef} className="flex items-center gap-3 px-1 pb-2 text-sm">
            <span className="text-rot tracking-wider" aria-label={t('dfHearts', g.hearts)}>{'♥'.repeat(g.hearts)}{'♡'.repeat(DF_HEARTS - g.hearts)}</span>
            <span key={g.coins} className="df-bump text-orange font-semibold" aria-label={t('dfCoins', g.coins)}>● {g.coins}</span>
            <span className="inline-flex items-center text-akzent-text" role="img" aria-label={t('dfEnergy', g.energy)}><DfCell fill={g.energy / DF_ENERGY_MAX} big /></span>
            {/* Wörter, die nach einem Fehler nochmals kommen; am Weg stand
                die Zahl den Wörtern neuer Gegner im Weg */}
            {returns > 0 && <span key={returns} className="df-bump text-orange font-semibold" aria-label={t('dfReturns', returns)}>↺ {returns}</span>}
            <span className="flex-1 text-right text-text-2 truncate">{waveLabel}</span>
          </div>
          <DfField g={g} map={map} phase={g.phase} slot={slot} halt={g.away} maxHeight={Math.max(160, view.vh - chrome)} vw={view.w} label={waveLabel} act={act} />
        </div>

        {pauseView ? (
          <div className={`${CARD} p-4 sm:p-5`}>
            <h2 className="text-lg font-semibold text-text mb-2">{waveLabel}</h2>
            {g.wave === 0 && !g.boss && <p className="text-sm text-text-2 mb-2">{t('dfIntro')}</p>}
            {g.wave === 0 && !g.boss && <p className="text-sm text-text-2 mb-2">{t('dfEnergyIntro')}</p>}
            <p className="text-sm text-text-2 mb-3">{t('dfBuild')}</p>
            {slot != null && !own && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {DF_TOWERS.map((d) => (
                  <button key={d.id} onClick={() => buy(d)} disabled={g.coins < priceOf(d)}
                    className={`${BTN_NEUTRAL} px-3 py-2 text-left flex items-center gap-3`}>
                    <span className="text-2xl text-akzent-text">{d.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold">{t(d.label)} <DfPrice n={priceOf(d)} /></span>
                      <span className="block text-xs text-text-2">{t(d.hint)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {own && (
              <div className="mb-3">
                <p className="font-semibold text-text mb-2"><span className="text-akzent-text">{ownDef.icon}</span> {t(ownDef.label)} · {t('dfLevel', own.lvl)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {own.lvl < 2 && (
                    <button onClick={upgrade} disabled={g.coins < ownDef.up} className={`${BTN_NEUTRAL} px-3 py-2 text-left`}>
                      <span className="block font-semibold">{t('dfUpgrade')} <DfPrice n={ownDef.up} /></span>
                      <span className="block text-xs text-text-2">{t(ownDef.upHint)}</span>
                    </button>
                  )}
                  <button onClick={sell} className={`${BTN_NEUTRAL} px-3 py-2 text-left`}>
                    <span className="block font-semibold">{t('dfSell')} <DfPrice n={-refund(own)} /></span>
                  </button>
                </div>
                <p className={`${LABEL} mb-1`}>{t('dfRebuild')}</p>
                <div className="flex flex-wrap gap-2">
                  {DF_TOWERS.filter((d) => d.id !== own.type).map((d) => (
                    <button key={d.id} onClick={() => buy(d)} disabled={g.coins < priceOf(d)} className={`${BTN_NEUTRAL} px-3 py-1.5 text-sm`}>
                      <span className="text-akzent-text">{d.icon}</span> {t(d.label)} <DfPrice n={priceOf(d)} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className={`${LABEL} mb-1`}>{t(g.boss ? 'dfBossPreview' : 'dfPreview')}</p>
            <ul className="text-sm text-text mb-4 grid sm:grid-cols-2 gap-x-4 gap-y-0.5">
              {coming.map(({ item, ret }, i) => <li key={i} className="break-words">{ret && <span className="text-orange">↺ </span>}<b>{inline(promptOf(item))}</b> — {inline(solutionOf(item))}</li>)}
            </ul>
            <button onClick={go} className={`w-full ${BTN_PRIMARY} px-6 py-3 text-lg`}>{t('dfGo')}</button>
          </div>
        ) : (
          <div ref={barRef} className={`${CARD} p-3 sm:p-4`}>
            {/* Die ganze Lösung: am Gegner steht sie gekürzt und nur kurz */}
            {g.away && <div className="text-sm font-semibold text-orange mb-1">{t('dfAway')}</div>}
            {missed && <div className="text-sm text-rot mb-1 break-words">✗ {inline(promptOf(missed.item))} → <b>{inline(missed.solution)}</b></div>}
            <div className="text-sm mb-2 min-h-[1.25rem] break-words">
              {targetItem ? <><b className="text-akzent-text">{inline(promptOf(targetItem))}</b> →{hint && <span className="text-text-3"> ({hint})</span>}</>
                : g.pin ? <span className="text-text-3"><s>{inline(promptOf(dfItem(g.pin)))}</s> →</span>
                : <span className="text-text-3">{t(g.enemies.length ? 'dfTowersWork' : 'dfWaiting')}</span>}
            </div>
            <div className="flex gap-2">
              <input ref={inputRef} value={input} onChange={(e) => type(e.target.value)} {...answerProps(targetItem && langOf(set, targetItem, 'answer'))}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); fire(); } }}
                disabled={g.phase !== 'run'} className={`flex-1 min-w-0 text-lg ${INPUT}`} />
              <button onMouseDown={keepFocus} onClick={tap(fire)} aria-disabled={!input.trim() || (!target && !g.pin)}
                className={`${BTN_PRIMARY} px-5 py-2`}>{t('dfFire')}</button>
            </div>
            {specials.length > 0 && (
              <div className="flex gap-2 mt-2">
                {specials.map((sp) => (
                  <button key={sp.id} onMouseDown={keepFocus} onClick={tap(() => special(sp))} aria-disabled={!ready(sp)}
                    aria-label={t(sp.label)} title={t(sp.label)} className={`${BTN_NEUTRAL} flex-1 min-w-0 px-2 py-1.5 text-sm truncate`}>
                    {/* Auf dem Handy nur Symbol und Preis: drei Namen passen nicht nebeneinander */}
                    <span className="text-akzent-text">{sp.icon}</span> <span className="hidden sm:inline">{t(sp.label)} </span><span className="text-text-3 whitespace-nowrap"><DfCell /> {sp.cost}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </PracticeFrame>
      {dialogNode}
    </div>
  );
};

DefenseRound.api = 1; // = GAME_API in index.html
GAMES.defense = DefenseRound;
