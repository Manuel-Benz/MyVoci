// MyVoci — Spiel «Verteidigen» (Tower Defense)
//
// Wird erst geladen, wenn jemand den Modus wählt (Abschnitt «Spiele» in
// index.html), und läuft in einer eigenen Funktion: es sieht alles, was im
// App-Skript auf oberster Ebene steht (checkAnswer, buildQueue,
// PracticeFrame, t, I18N …), hinaus geht nur `GAMES.defense`.
//
// Wörter laufen als Gegner zur Burg. Wer eine Übersetzung tippt, trifft den
// Gegner, zu dem sie passt; ein Fehler zählt beim markierten. Grundsatz:
// **kein Wort fällt ohne Antwort.** Türme schiessen nicht selbst, sie helfen
// beim Antworten — mehr Zeit (Frost), ein Hinweis (Leuchtturm), ein Treffer
// weniger (Kanone). Gewertet wird wie beim Schreiben, für den Lernstand
// zählt die erste Antwort pro Wort.
'use strict';

Object.assign(I18N.de, {
  dfWave: (i, n) => `Welle ${i} von ${n}`,
  dfBossWave: 'Schlusswelle: der Boss aus deinen Fehlern',
  dfIntro: 'Die Wörter laufen zur Burg. Tippe eine Übersetzung und drücke Enter: Getroffen wird der Gegner, zu dem sie passt. Ein Fehler zählt beim markierten Gegner; ein Tipp auf einen anderen markiert ihn.',
  dfBuild: 'Tippe auf einen freien Platz (+), um einen Turm zu bauen. Bauen geht nur zwischen den Wellen.',
  dfPreview: 'Diese Wörter kommen:',
  dfBossPreview: 'Der Boss trägt diese Wörter:',
  dfGo: 'Los',
  dfFire: 'Feuer',
  dfWaiting: 'Gleich kommen Gegner …',
  dfAway: 'Pause — tippe ins Feld, dann geht es weiter.',
  dfFrost: 'Frost', dfFrostHint: 'Gegner in Reichweite halb so schnell',
  dfLight: 'Leuchtturm', dfLightHint: 'zeigt den ersten Buchstaben (und Hinweise)',
  dfCannon: 'Kanone', dfCannonHint: 'ein Treffer nimmt Nachbarn den Panzer',
  dfHearts: (n) => `${n} Herzen`,
  dfCoins: (n) => `${n} Münzen`,
  dfHeld: 'Burg gehalten',
  dfFallen: 'Die Burg ist gefallen.',
});
Object.assign(I18N.en, {
  dfWave: (i, n) => `Wave ${i} of ${n}`,
  dfBossWave: 'Final wave: the boss made of your mistakes',
  dfIntro: 'The words walk towards the castle. Type a translation and press Enter: it hits the enemy it fits. A mistake counts for the marked enemy; tap another one to mark it.',
  dfBuild: 'Tap a free spot (+) to build a tower. You can only build between waves.',
  dfPreview: 'These words are coming:',
  dfBossPreview: 'The boss carries these words:',
  dfGo: 'Go',
  dfFire: 'Fire',
  dfWaiting: 'Enemies are on their way …',
  dfAway: 'Paused — tap the field to carry on.',
  dfFrost: 'Frost', dfFrostHint: 'enemies in range move at half speed',
  dfLight: 'Lighthouse', dfLightHint: 'shows the first letter (and hints)',
  dfCannon: 'Cannon', dfCannonHint: 'a hit strips the armour of a neighbour',
  dfHearts: (n) => `${n} hearts`,
  dfCoins: (n) => `${n} coins`,
  dfHeld: 'Castle held',
  dfFallen: 'The castle has fallen.',
});

// ---------- Regeln ----------
const DF_WAVE = 8; // Wörter pro Welle
const DF_HEARTS = 5, DF_STARS = 3;
const DF_START_COINS = 60, DF_HIT_COINS = 10;
const DF_RANGE = 170; // Reichweite der Türme in Karteneinheiten
const DF_BOSS_WORDS = 5;
const DF_SHOT = 0.25, DF_REVEAL = 2.5; // Sekunden: Schuss sichtbar, Lösung am Gegner
const DF_MIN_PX = 12; // kleinste Schrift auf dem Bildschirm, auch auf dem Handy mit Tastatur
// Sekunden für den ganzen Weg und zwischen zwei Gegnern. `hold`: niemand
// läuft, solange getippt wird (nur mit Gegnern auf dem Feld — sonst käme nie
// einer und Enter hätte kein Ziel).
const DF_PACE = { calm: { cross: 40, gap: 5, hold: true }, normal: { cross: 28, gap: 3.5 }, fast: { cross: 18, gap: 2.3 } };
const DF_SPEED = { slime: 1, knight: 1, arrow: 1.4, boss: 0.6 };
const DF_TOWERS = [
  { id: 'frost', cost: 50, icon: '❄', label: 'dfFrost', hint: 'dfFrostHint' },
  { id: 'light', cost: 40, icon: '✦', label: 'dfLight', hint: 'dfLightHint' },
  { id: 'cannon', cost: 80, icon: '◉', label: 'dfCannon', hint: 'dfCannonHint' },
];
// Gegner nach Stufe: neu = Schleim; nicht gewusst/unsicher = Ritter mit
// Panzer (zwei Treffer, der zweite in der Gegenrichtung — also beide
// Richtungen geübt); ab «kommt langsam» = Pfeil (ein Treffer, schnell).
const dfKind = (rec) => { const s = stageOf(rec); return s === 0 ? 'slime' : s <= 2 ? 'knight' : 'arrow'; };

// ---------- Karten ----------
// Quer (flach, damit über der Bildschirmtastatur Platz bleibt) und hochkant
// fürs Handy. Der Weg beginnt innerhalb der Karte: ausserhalb wäre das Wort
// eines neuen Gegners erst unsichtbar. Gegner laufen auf einem Anteil 0…1 des Wegs, Türme stehen auf
// einem Platz mit Nummer: beim Drehen des Geräts wechselt die Karte mitten im
// Spiel, ohne dass etwas springt. Die Weglänge wird einmal gerechnet.
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
    path: [[20, 80], [300, 80], [300, 300], [620, 300], [620, 100], [860, 100]],
    castle: { x: 860, y: 40, w: 110, h: 120 },
    slots: [[170, 170], [410, 190], [470, 370], [730, 210], [460, 60]],
  }),
  tall: dfMap({
    w: 600, h: 760,
    path: [[100, 60], [100, 180], [500, 180], [500, 400], [100, 400], [100, 600], [300, 600]],
    castle: { x: 300, y: 545, w: 110, h: 110 },
    slots: [[250, 90], [300, 290], [220, 505], [480, 560], [430, 90]],
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
const dfFlip = (item) => ({ ...item, dir: item.dir === 'ab' ? 'ba' : 'ab' });

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

// ---------- Spielfeld ----------
// Bewegt sich etwas, ruft die Runde `act.frame`; sie selbst zeichnet nur bei
// Ereignissen — sonst lief 60-mal pro Sekunde auch Kopfzeile, Einstellungen
// und Eingabe mit. Laufen die Gegner bloss weiter, schiebt `frame` ihre <g>
// direkt, statt React alles abgleichen zu lassen (auf einem älteren iPad
// zwei Drittel der Rechenzeit); ändert sich sonst etwas (`look`: was an
// einem Gegner steht, wie weit es am Rand einrückt, Schüsse, Reihenfolge),
// zeichnet React. `act` ist ein festes Objekt mit den Handlungen der Runde.
const byP = (a, b) => a.p - b.p;
const DfField = memoLang(({ g, map, phase, slot, maxHeight, vw, label, act }) => {
  const [, tick] = React.useReducer((x) => x + 1, 0);
  const svgRef = useRef(null);
  // Schrift nie kleiner als DF_MIN_PX: auf dem Handy mit Tastatur ist die
  // Karte auf ein Drittel verkleinert
  const [scale, setScale] = useState(1);
  React.useLayoutEffect(() => {
    const r = svgRef.current.getBoundingClientRect();
    const s = Math.min(r.width / map.w, r.height / map.h);
    if (s > 0 && Math.abs(s - scale) > 0.01) setScale(s);
  }, [map, maxHeight, vw]);
  const fs = (base) => Math.max(base, DF_MIN_PX / scale);
  // Beschriftungen rücken am Kartenrand ein, statt halb hinauszuragen
  // (Breite geschätzt: etwa ein halbes Geviert pro Zeichen)
  const inside = (x, text, size) => {
    const half = ([...text].length * size * 0.55) / 2 + 4;
    return Math.min(Math.max(x, half), map.w - half) - x;
  };
  // Was an einem Gegner steht, [Grösse, Farbe, Text, Gewicht]: oben das Wort,
  // darunter Panzer bzw. Wörter des Bosses, dann die Lösung nach einem
  // Fehler oder der Leuchtturm
  const labels = (e, pos, target) => {
    const out = [[20, e === target ? 'var(--akzent-text)' : 'var(--text)', dfCut(inline(promptOf(act.itemOf(e)))), 600]];
    if (e.kind === 'knight') out.push([15, 'var(--orange-text)', '●'.repeat(e.hp) + '○'.repeat(e.max - e.hp)]);
    if (e.kind === 'boss') out.push([16, 'var(--rot-text)', `${e.hp} / ${e.max}`]);
    if (e.reveal > 0) out.push([18, 'var(--rot-text)', dfCut(inline(e.solution)), 600]);
    else if (act.lit(pos)) out.push([16, 'var(--orange-text)', act.lightHint(e)]);
    return out;
  };
  const nodes = useRef(new Map()).current; // id → <g> eines Gegners
  const drawn = useRef('');
  const look = () => {
    const target = act.target();
    return [g.shots.map((s) => s.until).join(), ...g.enemies.slice().sort(byP).map((e) => {
      const pos = dfAt(map, e.p);
      return e.id + labels(e, pos, target).map(([size, fill, text]) => fill + text + Math.round(inside(pos[0], text, fs(size)))).join();
    })].join('|');
  };
  act.frame = () => {
    if (look() !== drawn.current) { tick(); return; }
    for (const e of g.enemies) {
      const el = nodes.get(e.id);
      if (el) { const [x, y] = dfAt(map, e.p); el.setAttribute('transform', `translate(${x} ${y})`); }
    }
  };
  drawn.current = look();
  const LABEL_STYLE = { paintOrder: 'stroke', stroke: 'var(--karte)', strokeWidth: fs(20) / 4, strokeLinejoin: 'round' };
  const pause = phase === 'pause';
  const target = act.target();
  const c = map.castle;
  const shape = (e) => {
    if (e.kind === 'slime') return <path d="M-20 12 Q-22 -18 0 -18 Q22 -18 20 12 Z" style={{ fill: 'var(--gruen-weich)', stroke: 'var(--gruen)', strokeWidth: 2.5 }} />;
    if (e.kind === 'arrow') return <path d="M-20 -13 L22 0 L-20 13 L-12 0 Z" style={{ fill: 'var(--akzent-weich)', stroke: 'var(--akzent)', strokeWidth: 2.5 }} />;
    if (e.kind === 'knight') return (
      <>
        <circle r="19" style={{ fill: 'var(--orange-weich)', stroke: 'var(--orange)', strokeWidth: e.hp > 1 ? 5 : 2 }} />
        {e.hp > 1 && <path d="M-12 -6 L0 -12 L12 -6 L10 8 L0 13 L-10 8 Z" style={{ fill: 'none', stroke: 'var(--orange)', strokeWidth: 2 }} />}
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
  // Weg, Burg und Bauplätze ändern sich nur mit Karte, Phase, Wahl und
  // Türmen: einmal gebaut überspringt React sie in jedem Bild
  const towers = JSON.stringify(g.towers);
  const ground = useMemo(() => (
    <>
      <polyline points={map.points} style={{ fill: 'none', stroke: 'var(--hover)', strokeWidth: 52, strokeLinejoin: 'round' }} />
      <polyline points={map.points} style={{ fill: 'none', stroke: 'var(--linie)', strokeWidth: 2, strokeDasharray: '10 12' }} />
      <g>
        <rect x={c.x} y={c.y + 20} width={c.w} height={c.h - 20} rx="4" style={{ fill: 'var(--karte)', stroke: 'var(--text-2)', strokeWidth: 2 }} />
        {[0, 1, 2].map((i) => <rect key={i} x={c.x + 6 + i * ((c.w - 24) / 2)} y={c.y + 6} width="12" height="16" style={{ fill: 'var(--karte)', stroke: 'var(--text-2)', strokeWidth: 2 }} />)}
        <path d={`M${c.x + c.w / 2 - 14} ${c.y + c.h} v-26 a14 14 0 0 1 28 0 v26`} style={{ fill: 'var(--hover)', stroke: 'var(--text-2)', strokeWidth: 2 }} />
      </g>
      {/* Reichweiten zuerst und ohne Zeiger-Ereignisse: über den Plätzen
          gezeichnet schluckten sie die Tipps auf die Plätze darunter */}
      {map.slots.map(([x, y], i) => (slot === i || (pause && g.towers[i])) && (
        <circle key={i} cx={x} cy={y} r={DF_RANGE} style={{ fill: 'var(--akzent-weich)', fillOpacity: 0.35, stroke: 'var(--akzent)', strokeDasharray: '6 6', pointerEvents: 'none' }} />
      ))}
      {map.slots.map(([x, y], i) => {
        const tw = DF_TOWERS.find((d) => d.id === g.towers[i]);
        const free = pause && !tw;
        return (
          <g key={i} onClick={() => free && act.choose(i)} style={{ cursor: free ? 'pointer' : 'default' }}>
            <rect x={x - 24} y={y - 24} width="48" height="48" rx="6"
              style={tw ? { fill: 'var(--karte)', stroke: 'var(--akzent)', strokeWidth: 2.5 } : { fill: 'transparent', stroke: slot === i ? 'var(--akzent)' : 'var(--text-3)', strokeWidth: 2, strokeDasharray: '5 4' }} />
            <text x={x} y={y + 9} textAnchor="middle" fontSize="26" style={{ fill: tw ? 'var(--akzent-text)' : 'var(--text-3)' }}>{tw ? tw.icon : pause ? '+' : ''}</text>
          </g>
        );
      })}
    </>
  ), [map, phase, slot, towers]);
  return (
    // Ein Tipp aufs Feld nimmt dem Eingabefeld nicht den Fokus — auf dem
    // iPad ginge sonst mitten in der Welle die Tastatur zu
    <svg ref={svgRef} viewBox={`0 0 ${map.w} ${map.h}`} className="w-full block select-none touch-manipulation"
      style={{ maxHeight }} role="group" aria-label={label} onMouseDown={(e) => { if (phase === 'run') e.preventDefault(); }}>
      {ground}
      {g.shots.map((s, i) => <line key={i} x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} style={{ stroke: 'var(--akzent)', strokeWidth: 5, strokeLinecap: 'round', pointerEvents: 'none' }} />)}
      {g.enemies.slice().sort(byP).map((e) => {
        const pos = dfAt(map, e.p), [x, y] = pos;
        const r = e.kind === 'boss' ? 32 : 20;
        return (
          <g key={e.id} ref={(el) => (el ? nodes.set(e.id, el) : nodes.delete(e.id))} transform={`translate(${x} ${y})`}
            onClick={() => act.pick(e)} style={{ cursor: 'pointer' }}>
            <circle r={r + 22} style={{ fill: 'transparent' }} />
            {e === target && <circle r={r + 9} style={{ fill: 'none', stroke: 'var(--akzent)', strokeWidth: 4 }} />}
            {shape(e)}
            {labels(e, pos, target).map(([size, fill, text, weight], i) => (
              <text key={i} x={inside(x, text, fs(size))} y={i ? r + fs(18) * i : -r - 12} textAnchor="middle" fontSize={fs(size)} fontWeight={weight}
                style={{ ...LABEL_STYLE, fill }}>{text}</text>
            ))}
          </g>
        );
      })}
      {phase === 'end' && (
        <text x={map.w / 2} y={map.h / 2} textAnchor="middle" fontSize={fs(48)} fontWeight="700"
          style={{ ...LABEL_STYLE, strokeWidth: 10, fill: g.stars ? 'var(--gruen-text)' : 'var(--rot-text)' }}>{t(g.text)}</text>
      )}
    </svg>
  );
});

// ---------- Runde ----------
const DefenseRound = ({ set, opts, words, prog, onDone, onBack, onResult }) => {
  const pace = DF_PACE[opts.pace] || DF_PACE.normal; // `pace` prüft schon normOpts
  const fixed = fixedDir(opts);
  const view = useDfViewport();
  const map = DF_MAPS[view.w < 640 ? 'tall' : 'wide'];
  const [input, setInput] = useState('');
  const [slot, setSlot] = useState(null); // gewählter Bauplatz in der Pause
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

  // Der ganze Spielstand in einer Ref: die Schleife läuft 60-mal pro Sekunde
  const G = useRef(null);
  if (!G.current) {
    // Eine Restwelle mit ein, zwei Wörtern lohnt keine Pause: an die vorige
    const waves = groupsOf(buildQueue(words, opts), DF_WAVE, 2);
    G.current = {
      waves, wave: 0, boss: false, pending: [...waves[0]], carry: [],
      enemies: [], uid: 0, next: 0, time: 0, away: false,
      hearts: DF_HEARTS, coins: DF_START_COINS, towers: {}, stars: 0, text: '',
      phase: 'pause', shots: [], shown: null,
      // pin: der Gegner, für den gerade getippt wird (angetippt oder beim
      // ersten Zeichen festgehalten) — ohne ihn wechselte das Ziel mitten im
      // Wort, sobald ein Pfeil überholt, und die Antwort traf ein anderes
      // Wort. Bricht er durch, bleibt der Text bei ihm und trifft höchstens
      // noch einen Gegner, zu dem er passt.
      pin: null, pinByTap: false,
      answered: new Set(), log: [], errors: new Map(),
    };
  }
  const g = G.current;

  const itemOf = (e) => (e.kind === 'boss' ? e.items[e.max - e.hp] : e.item);
  const frontmost = () => g.enemies.reduce((a, e) => (!a || e.p > a.p ? e : a), null);
  const targetOf = () => (g.pin ? (g.enemies.includes(g.pin) ? g.pin : null) : frontmost());
  const pinTo = (e, byTap) => { g.pin = e; g.pinByTap = byTap; };
  const unpin = () => { g.pin = null; g.pinByTap = false; };
  // Türme eines Typs (oder alle) in Reichweite, der nächste zuerst
  const towersNear = (pos, type) => Object.keys(g.towers).map(Number)
    .filter((i) => (!type || g.towers[i] === type) && dfDist(map.slots[i], pos) <= DF_RANGE)
    .map((i) => map.slots[i]).sort((a, b) => dfDist(a, pos) - dfDist(b, pos));
  const shoot = (from, to) => g.shots.push({ from, to, until: g.time + DF_SHOT });
  const enemy = (kind, more) => {
    const hp = kind === 'boss' ? more.items.length : kind === 'knight' ? 2 : 1;
    return { id: ++g.uid, kind, hp, max: hp, p: 0, reveal: 0, solution: '', ...more };
  };
  const spawn = (item) => enemy(dfKind(prog[wordKey(item.word)]), { item });
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
  const finish = (held) => {
    g.phase = 'end';
    g.stars = held ? (g.hearts >= DF_HEARTS ? 3 : g.hearts >= 3 ? 2 : 1) : 0;
    g.text = held ? 'dfHeld' : 'dfFallen';
    // `retry`: alle Wörter, die irgendwann schiefgingen — auch nach einer
    // ersten richtigen Antwort (Ritter durchgelassen)
    later(() => onDone({
      log: g.log, seconds: Math.round((Date.now() - startedAt) / 1000),
      game: { text: g.text, stars: g.stars, of: DF_STARS }, retry: [...g.errors.values()],
    }), 1600);
  };
  const endWave = () => {
    // Halb getippter Text gehörte zu einem Wort dieser Welle — in der
    // nächsten träfe er ein anderes
    setInput('');
    unpin();
    g.shots = [];
    if (g.boss) { finish(true); return; }
    if (g.wave + 1 < g.waves.length) {
      g.wave++;
      g.pending = [...g.waves[g.wave], ...g.carry];
      g.carry = [];
    } else {
      // Durchgebrochene der letzten Welle sind Fehler und stecken im Boss
      const items = [...g.errors.values()].slice(-DF_BOSS_WORDS);
      if (!items.length) { finish(true); return; }
      g.boss = true;
      g.pending = items;
    }
    g.phase = 'pause';
  };
  const go = () => {
    if (g.boss && g.pending.length) g.enemies.push(enemy('boss', { items: g.pending.splice(0) }));
    g.phase = 'run';
    g.next = 0.6;
    // Das Eingabefeld steht erst nach dem Zeichnen da; iOS öffnet die
    // Tastatur nur bei einem focus() noch im Tipp — also sofort zeichnen
    ReactDOM.flushSync(() => { setSlot(null); setMissed(null); redraw(); });
    if (inputRef.current) inputRef.current.focus();
  };

  const step = (dt) => {
    if (g.phase !== 'run') return;
    let moved = false, changed = false;
    // Gespielt wird nur, solange das Eingabefeld den Fokus hat: liegt etwas
    // darüber (Rückfrage, Einstellungen, Anleitung), ist die Tastatur zu
    // oder ein anderes Fenster vorn, steht alles still — sonst liefen die
    // Gegner weiter, während niemand tippen kann
    const here = document.hasFocus() && document.activeElement === inputRef.current;
    if (here === g.away) { g.away = !here; changed = true; }
    // Nur beim Wechsel zeichnen: sonst lief die ganze Runde auch in der
    // Pause 60-mal pro Sekunde
    if (g.away) { if (changed) redraw(); return; }
    g.time += dt;
    if (!(pace.hold && input.trim() && g.enemies.length)) {
      g.next -= dt;
      if (g.next <= 0 && g.pending.length) {
        g.enemies.push(spawn(g.pending.shift()));
        g.next = pace.gap;
        changed = true;
      }
      for (const e of g.enemies) {
        const slow = towersNear(dfAt(map, e.p), 'frost').length ? 0.5 : 1;
        e.p += (DF_SPEED[e.kind] * slow * dt) / pace.cross;
        moved = true;
      }
    }
    for (const e of g.enemies) if (e.reveal > 0) { e.reveal = Math.max(0, e.reveal - dt); moved = true; }
    if (g.shots.length) { g.shots = g.shots.filter((s) => s.until > g.time); moved = true; }
    // Durchgebrochen: kostet Herzen, ein nie beantwortetes Wort zählt als
    // nicht gewusst und läuft in der nächsten Welle wieder mit
    const out = g.enemies.filter((e) => e.p >= 1);
    if (out.length) {
      changed = true;
      g.enemies = g.enemies.filter((e) => e.p < 1);
      for (const e of out) {
        if (e === g.pin && !input.trim()) unpin();
        if (e.kind === 'boss') { g.hearts -= 2; continue; }
        g.hearts -= 1;
        score(e.item, false, '', '');
        g.carry.push(e.item);
      }
    }
    if (g.hearts <= 0) { g.hearts = 0; finish(false); changed = true; }
    else if (!g.pending.length && !g.enemies.length) { endWave(); changed = true; }
    const shown = (targetOf() || {}).id;
    if (shown !== g.shown) { g.shown = shown; changed = true; }
    if (changed) redraw();
    if ((moved || changed) && act.frame) act.frame();
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

  const strike = (e) => {
    const pos = dfAt(map, e.p);
    shoot(towersNear(pos)[0] || [map.castle.x + 20, map.castle.y + 30], pos);
    g.coins += DF_HIT_COINS;
    e.hp -= 1;
    e.reveal = 0;
    // Kanone in Reichweite: der nächste gepanzerte Nachbar verliert einen
    // Treffer — fällt aber nie davon allein (kein Wort ohne Antwort)
    if (towersNear(pos, 'cannon').length) {
      const n = g.enemies.filter((x) => x !== e && x.kind !== 'boss' && x.hp >= 2 && dfDist(pos, dfAt(map, x.p)) <= DF_RANGE)
        .sort((a, b) => b.p - a.p)[0];
      if (n) { n.hp -= 1; if (!fixed) n.item = dfFlip(n.item); shoot(pos, dfAt(map, n.p)); }
    }
    if (e.hp <= 0) {
      g.enemies = g.enemies.filter((x) => x !== e);
      if (g.pin === e) unpin();
    } else if (e.kind === 'knight' && !fixed) {
      e.item = dfFlip(e.item); // Panzer weg, jetzt die Gegenrichtung
    }
  };
  const fire = () => {
    const typed = input.trim();
    const target = targetOf();
    const gone = g.pin && !target && itemOf(g.pin); // durchgebrochen, während getippt wurde
    if (!typed || (!target && !gone) || g.phase !== 'run') return;
    // Getroffen wird der Gegner, zu dem die Antwort passt — das Ziel zuerst,
    // «richtig» vor «fast richtig»; `others` hält Verwechslungen fern
    const tries = (target ? [target, ...g.enemies.filter((e) => e !== target)] : g.enemies).map((e) => {
      const item = itemOf(e), solution = solutionOf(item);
      const r = checkAnswer(typed, solution, { level: opts.level, lang: langOf(set, item, 'answer'), others: otherSolutions(words, item, solution), forms: !!opts.forms });
      return { e, item, r };
    });
    const hit = tries.find((x) => x.r.status === 'right') || tries.find((x) => x.r.status === 'almost');
    setInput('');
    if (!g.pinByTap || gone) unpin();
    if (hit) {
      score(hit.item, true, typed, hit.r.solution);
      setMissed(null);
      strike(hit.e);
    } else if (target) {
      const { item, r } = tries[0];
      score(item, false, typed, r.solution);
      target.reveal = DF_REVEAL;
      target.solution = r.solution || solutionOf(item);
      setMissed({ item, solution: target.solution });
    } else {
      // Zu spät: das Wort ist schon als nicht gewusst gebucht, nur die Lösung zeigen
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
  const build = (id) => {
    const tw = DF_TOWERS.find((x) => x.id === id);
    if (slot == null || g.coins < tw.cost) return;
    g.coins -= tw.cost;
    g.towers[slot] = id;
    setSlot(null);
  };
  const quit = () => ask({ kind: 'confirm', ok: t('quit'), text: t('confirmQuit'), onYes: onBack });

  // Leuchtturm: erster Buchstabe der Lösung ohne Artikel («la maison»,
  // «l'école», «le chien» gäben sonst alle «l…»); bei Wortformen gehört der
  // Artikel dazu. Hinweise nur, wenn sie eingeschaltet sind.
  act.lit = (pos) => towersNear(pos, 'light').length > 0;
  act.lightHint = (e) => {
    const item = itemOf(e);
    const sol = firstAlt(solutionOf(item));
    const word = opts.forms ? sol : stripArticle(straightQuotes(sol).toLowerCase(), langOf(set, item, 'answer'));
    const h = opts.hints ? promptHint(item) : '';
    return dfCut(`${[...word][0] || ''}…${h ? ' ' + h : ''}`, 26);
  };
  act.itemOf = itemOf;
  act.target = targetOf;
  act.pick = (e) => {
    pinTo(e, true);
    g.shown = e.id;
    redraw();
    act.frame();
    if (inputRef.current) inputRef.current.focus();
  };
  act.choose = (i) => setSlot((s) => (s === i ? null : i));

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
  const targetItem = target && itemOf(target);
  const waveLabel = g.boss ? t('dfBossWave') : t('dfWave', g.wave + 1, g.waves.length);
  const hint = targetItem && opts.hints && promptHint(targetItem);

  return (
    <div className={`${SCREEN} p-3 sm:p-6`}>
      <PracticeFrame set={set} pos={g.answered.size} queue={words.length} done={g.answered.size} total={words.length} item={null} onQuit={quit}>
        <div className={`${CARD} p-2 sm:p-3 mb-3`}>
          <div ref={hudRef} className="flex items-center gap-3 px-1 pb-2 text-sm">
            <span className="text-rot tracking-wider" aria-label={t('dfHearts', g.hearts)}>{'♥'.repeat(g.hearts)}{'♡'.repeat(DF_HEARTS - g.hearts)}</span>
            <span className="text-orange font-semibold" aria-label={t('dfCoins', g.coins)}>● {g.coins}</span>
            <span className="flex-1 text-right text-text-2 truncate">{waveLabel}</span>
          </div>
          <DfField g={g} map={map} phase={g.phase} slot={slot} maxHeight={Math.max(160, view.vh - chrome)} vw={view.w} label={waveLabel} act={act} />
        </div>

        {pauseView ? (
          <div className={`${CARD} p-4 sm:p-5`}>
            <h2 className="text-lg font-semibold text-text mb-2">{waveLabel}</h2>
            {g.wave === 0 && !g.boss && <p className="text-sm text-text-2 mb-2">{t('dfIntro')}</p>}
            <p className="text-sm text-text-2 mb-3">{t('dfBuild')}</p>
            {slot != null && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                {DF_TOWERS.map((tw) => (
                  <button key={tw.id} onClick={() => build(tw.id)} disabled={g.coins < tw.cost}
                    className={`${BTN_NEUTRAL} px-3 py-2 text-left flex items-center gap-3`}>
                    <span className="text-2xl text-akzent-text">{tw.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold">{t(tw.label)} <span className="text-orange">● {tw.cost}</span></span>
                      <span className="block text-xs text-text-2">{t(tw.hint)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <p className={`${LABEL} mb-1`}>{t(g.boss ? 'dfBossPreview' : 'dfPreview')}</p>
            <ul className="text-sm text-text mb-4 grid sm:grid-cols-2 gap-x-4 gap-y-0.5">
              {g.pending.map((item, i) => <li key={i} className="break-words"><b>{inline(promptOf(item))}</b> — {inline(solutionOf(item))}</li>)}
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
                : g.pin ? <span className="text-text-3"><s>{inline(promptOf(itemOf(g.pin)))}</s> →</span>
                : <span className="text-text-3">{t('dfWaiting')}</span>}
            </div>
            <div className="flex gap-2">
              <input ref={inputRef} value={input} onChange={(e) => type(e.target.value)} {...answerProps(targetItem && langOf(set, targetItem, 'answer'))}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); fire(); } }}
                disabled={g.phase !== 'run'} className={`flex-1 min-w-0 text-lg ${INPUT}`} />
              {/* mousedown verhindern: sonst nimmt der Knopf dem Feld den
                  Fokus und auf dem iPad geht nach jedem Schuss die Tastatur zu */}
              <button onMouseDown={(e) => e.preventDefault()} onClick={fire} disabled={!input.trim() || (!target && !g.pin)}
                className={`${BTN_PRIMARY} px-5 py-2`}>{t('dfFire')}</button>
            </div>
          </div>
        )}
      </PracticeFrame>
      {dialogNode}
    </div>
  );
};

DefenseRound.api = 1; // = GAME_API in index.html
GAMES.defense = DefenseRound;
