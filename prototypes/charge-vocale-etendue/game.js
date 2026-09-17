// PROTOTYPE - NOT FOR PRODUCTION
// Question: avec le modèle révisé du système 11, sent-on la charge monter et a-t-on le temps de se taire ?
//           Quelle sémantique d'avertissement, quelle zizanie, quel objet ? (E1, E2, E4)
// Date: 2026-09-17

(function (A) {
  'use strict';
  var el = A.el, fmt = A.fmt, cfg = A.s11, s1 = A.s1;
  var TICK = 0.02;                                  // tick fixe de l'hôte, 50 Hz

  // ============================================================ réglages du système 11
  var FIELDS = [
    ['Avertissement', 'Avertissement', 'ms', 100, 900, 10, 1000],
    ['Remplissage', 'Remplissage', 's', 0.5, 4, 0.05, 1],
    ['Vidange', 'Vidange', 's', 0.5, 5, 0.05, 1],
    ['Amorcage', 'Amorçage', '%', 0, 40, 1, 100],
    ['h', 'h — réarmement', '', 0.05, 0.5, 0.01, 1],
    ['k', 'k — plafond du murmure', '', 0.3, 0.99, 0.01, 1],
    ['Lenteur', 'Lenteur', '', 1, 30, 0.5, 1],
    ['k_z', 'k_z — seuil de zizanie', '', 0.1, 0.9, 0.05, 1],
    ['z', 'z — zizanie', '', 0, 2, 0.05, 1],
    ['DureeMin', 'Durée minimale d\'épisode', 's', 0.2, 3, 0.1, 1],
    ['FusionMax', 'Fusion maximale', 's', 2, 60, 1, 1]
  ];
  var savedCfg = A.load('s11');
  if (savedCfg && !P.configErrors(Object.assign({}, cfg, savedCfg)).length) Object.assign(cfg, savedCfg);

  var tuneBox = el('tuneBox');
  FIELDS.forEach(function (f) {
    var d = document.createElement('div'); d.className = 'knob';
    d.innerHTML = '<div class="lab"><span>' + f[1] + '</span><span class="val" id="tv_' + f[0] + '"></span></div>' +
      '<input type="range" id="ti_' + f[0] + '" min="' + f[3] + '" max="' + f[4] + '" step="' + f[5] + '">';
    tuneBox.appendChild(d);
    var inp = d.querySelector('input');
    inp.value = cfg[f[0]] * f[6];
    inp.addEventListener('input', function () {
      var cand = Object.assign({}, cfg); cand[f[0]] = +inp.value / f[6];
      var errs = P.configErrors(cand);
      el('tuneErr').textContent = errs.length ? 'Refusé : ' + errs.join(' ; ') : '';
      if (!errs.length) { cfg[f[0]] = cand[f[0]]; A.store('s11', cfg); }
      renderTune();
    });
  });
  function renderTune() {
    FIELDS.forEach(function (f) {
      var v = cfg[f[0]] * f[6];
      el('tv_' + f[0]).textContent = (f[2] === 'ms' || f[2] === '%' ? Math.round(v) : fmt(v, 2)) + (f[2] ? ' ' + f[2] : '');
      el('ti_' + f[0]).value = v;
    });
  }
  renderTune();

  // objet
  function setT(T) {
    var cand = Object.assign({}, cfg, { T_objet: T });
    if (P.configErrors(cand).length) return;
    cfg.T_objet = T; el('tObj').value = T; el('tObjV').textContent = fmt(T, 2); A.store('s11', cfg);
  }
  el('objType').addEventListener('change', function () { setT(+el('objType').value); });
  el('tObj').addEventListener('input', function () { setT(+el('tObj').value); });
  setT(cfg.T_objet);

  // sémantique, zizanie
  function radios(name, key) {
    document.querySelectorAll('input[name=' + name + ']').forEach(function (r) {
      r.checked = r.value === cfg[key];
      r.addEventListener('change', function () { if (r.checked) { cfg[key] = r.value; A.store('s11', cfg); } });
    });
  }
  radios('sem', 'semantique'); radios('ziz', 'zizanie'); radios('ancr', 'ancrage');

  // ============================================================ comparaison aveugle (E1)
  var blind = null;
  el('blindStart').addEventListener('click', function () {
    var flip = Math.random() < 0.5;
    blind = { 1: flip ? 'evenement' : 'banc', 2: flip ? 'banc' : 'evenement', joue: 1 };
    document.querySelectorAll('input[name=sem]').forEach(function (r) { r.disabled = true; r.parentNode.style.opacity = 0.35; });
    el('blindBox').hidden = false;
    playBlind(1);
  });
  function playBlind(n) {
    blind.joue = n; cfg.semantique = blind[n];
    el('blindNote').textContent = 'Comparaison en cours — tu joues V' + n + '. Les deux versions cachent les deux sémantiques.';
  }
  document.querySelectorAll('[data-blind]').forEach(function (b) { b.addEventListener('click', function () { if (blind) playBlind(+b.dataset.blind); }); });
  document.querySelectorAll('[data-blindpick]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!blind) return;
      var n = +b.dataset.blindpick, pick = blind[n];
      A.log('E1', 'Comparaison aveugle : V' + n + ' préférée = ' + (pick === 'evenement' ? 'événement au franchissement' : 'indice dès l\'attaque (banc)'), { V1: blind[1], V2: blind[2], preferee: pick, config: snapshot() });
      el('blindNote').textContent = 'Tu as préféré V' + n + ' : ' + (pick === 'evenement' ? 'l\'événement au franchissement (GDD).' : 'l\'indice dès l\'attaque (banc).');
      cfg.semantique = pick; blind = null;
      document.querySelectorAll('input[name=sem]').forEach(function (r) { r.disabled = false; r.parentNode.style.opacity = 1; r.checked = r.value === pick; });
      el('blindBox').hidden = true;
    });
  });

  // ============================================================ voix simulées
  var MODES = [['muet', 'Muet'], ['chuchote', 'Chuchote'], ['converse', 'Converse'], ['cris', 'Crie par à-coups'], ['panique', 'Panique'], ['curseur', 'Curseur']];
  var ROOMS = [['A', 'Pièce A'], ['B', 'Pièce B'], ['X', 'Hors de portée']];
  var sims = A.load('sims') || [
    { name: 'Lou', color: '#7FA7D9', room: 'A', r: 0.47, mode: 'muet', slider: 0.3, lat: 120, f: 650 },
    { name: 'Max', color: '#B98BD9', room: 'A', r: 0.35, mode: 'muet', slider: 0.3, lat: 90, f: 1000 },
    { name: 'Ada', color: '#D9C27F', room: 'B', r: 0.60, mode: 'muet', slider: 0.3, lat: 150, f: 1450 }
  ];
  sims.forEach(function (s) { s.x = 0; s.L = 0; s.target = 0; s.until = 0; s.on = false; s.queue = []; s.needle = 0; s.force = 0; });
  function saveSims() {
    A.store('sims', sims.map(function (s) { return { name: s.name, color: s.color, room: s.room, r: s.r, mode: s.mode, slider: s.slider, lat: s.lat, f: s.f }; }));
  }
  function simUi() {
    var box = el('simBox'); box.innerHTML = '';
    sims.forEach(function (s, i) {
      var d = document.createElement('div'); d.className = 'sim';
      d.innerHTML =
        '<div class="head"><span><span class="swatch" style="background:' + s.color + '"></span>' + s.name + '</span>' +
        '<select data-k="room">' + ROOMS.map(function (r) { return '<option value="' + r[0] + '"' + (r[0] === s.room ? ' selected' : '') + '>' + r[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="row" style="margin-top:4px"><select data-k="mode" style="flex:1">' + MODES.map(function (m) { return '<option value="' + m[0] + '"' + (m[0] === s.mode ? ' selected' : '') + '>' + m[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="knob"><div class="lab"><span>r′ — sa voix posée</span><span class="val" data-v="r"></span></div><input type="range" data-k="r" min="0.05" max="0.95" step="0.01" value="' + s.r + '"></div>' +
        '<div class="knob" data-slider><div class="lab"><span>Position (curseur)</span><span class="val" data-v="slider"></span></div><input type="range" data-k="slider" min="0" max="1" step="0.01" value="' + s.slider + '"></div>' +
        '<div class="knob"><div class="lab"><span>Latence de sa voix</span><span class="val" data-v="lat"></span></div><input type="range" data-k="lat" min="0" max="300" step="5" value="' + s.lat + '"></div>';
      box.appendChild(d);
      function sync() {
        d.querySelector('[data-v=r]').textContent = fmt(s.r, 2);
        d.querySelector('[data-v=slider]').textContent = fmt(s.slider, 2);
        d.querySelector('[data-v=lat]').textContent = s.lat + ' ms';
        d.querySelector('[data-slider]').hidden = s.mode !== 'curseur';
      }
      d.querySelectorAll('[data-k]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var k = inp.dataset.k; s[k] = (k === 'room' || k === 'mode') ? inp.value : +inp.value;
          if (k === 'mode') s.until = 0;
          sync(); saveSims();
        });
      });
      sync();
    });
  }
  simUi();
  el('btnSimsMute').addEventListener('click', function () { sims.forEach(function (s) { s.mode = 'muet'; }); saveSims(); simUi(); });
  function renderSimsActive() {
    var act = sims.filter(function (s) { return s.mode !== 'muet' && s.room !== 'X'; });
    el('simsActive').textContent = act.length ? 'Actives : ' + act.map(function (s) { return s.name + ' (' + s.room + ', ' + s.mode + ')'; }).join(', ') + ' — tant qu\'une voix atteint l\'objet, il ne se vide pas.' : 'Aucune voix simulée active.';
    el('simsActive').style.color = act.length ? 'var(--warn)' : '';
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function simTarget(s, now) {
    if (s.force > now) return 0.92;
    var t = now / 1000;
    if (s.mode === 'curseur') return s.slider;
    if (s.mode === 'muet') return 0;
    if (t >= s.until) {
      s.on = !s.on;
      var on = s.on;
      if (s.mode === 'chuchote') { s.until = t + (on ? rnd(1, 3) : rnd(0.4, 1.2)); s.lvl = rnd(0.06, 0.11); }
      else if (s.mode === 'converse') { s.until = t + (on ? rnd(0.4, 1.8) : rnd(0.3, 1.2)); s.lvl = s.r * rnd(0.9, 1.1); }
      else if (s.mode === 'cris') { s.until = t + (on ? rnd(0.4, 1.0) : rnd(3, 7)); s.lvl = rnd(0.85, 0.95); }
      else if (s.mode === 'panique') { s.until = t + (on ? rnd(1.5, 3) : rnd(0.1, 0.3)); s.lvl = rnd(0.8, 0.95); }
    }
    return s.on ? Math.min(1, s.lvl + (s.mode === 'chuchote' ? rnd(-0.015, 0.015) : rnd(-0.04, 0.04))) : 0;
  }
  function delayed(queue, now, lat) {                // dernière valeur émise avant now − lat
    var t = now - lat, v = 0;
    for (var i = queue.length - 1; i >= 0; i--) if (queue[i].t <= t) { v = queue[i].v; break; }
    return v;
  }

  // ============================================================ scène
  var cv = el('stage'), cx = cv.getContext('2d'), W = cv.width, H = cv.height;
  var WALL_X0 = 470, WALL_X1 = 490, DOOR_Y0 = 180, DOOR_Y1 = 290, SW = 130, SH = 56;
  var sofa = { x: 230, y: 240, tx: 230, ty: 240 }, dragging = false, everDragged = false;
  var SLOTS = { A: [[90, 90], [360, 400], [360, 90]], B: [[610, 90], [860, 400], [860, 90]] };

  function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
  cv.addEventListener('pointerdown', function (e) {
    dragging = true; cv.classList.add('dragging'); cv.setPointerCapture(e.pointerId);
    var p = pt(e); sofa.tx = p.x; sofa.ty = p.y;
    if (!everDragged) { everDragged = true; el('stageHint').hidden = true; }
    sound.ensure();
  });
  cv.addEventListener('pointermove', function (e) { if (dragging) { var p = pt(e); sofa.tx = p.x; sofa.ty = p.y; } });
  function endDrag() { dragging = false; cv.classList.remove('dragging'); }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  A.game = { setDrag: function (on, x, y) { dragging = on; if (x !== undefined) { sofa.tx = x; sofa.ty = y; } } };   // pour les vérifications

  function hitsWall(x, y) {
    var l = x - SW / 2, r = x + SW / 2, t = y - SH / 2, b = y + SH / 2;
    if (r <= WALL_X0 || l >= WALL_X1) return false;
    return t < DOOR_Y0 || b > DOOR_Y1;
  }
  function roomOf(x) { return x < (WALL_X0 + WALL_X1) / 2 ? 'A' : 'B'; }

  // ============================================================ son
  var sound = {
    ready: false,
    ensure: function () {
      if (this.ready) return;
      var ctx = A.ensureCtx(); this.ready = true;
      var nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.nb = nb;
      this.master = ctx.createGain(); this.master.connect(ctx.destination);
      this.frem = this.noiseChain('bandpass', 3800, 1.5);
      this.danger = this.noiseChain('lowpass', 150, 0.7);
      var o = ctx.createOscillator(); o.frequency.value = 52; this.hum = ctx.createGain(); this.hum.gain.value = 0; o.connect(this.hum); this.hum.connect(this.master); o.start();
      this.benchPulse = this.noiseChain('bandpass', 2400, 6);
      this.voices = sims.map(function (s) {
        var src = ctx.createBufferSource(); src.buffer = nb; src.loop = true; src.loopStart = Math.random();
        var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = s.f; f.Q.value = 2.5;
        var g = ctx.createGain(); g.gain.value = 0;
        var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
        src.connect(f); f.connect(g); g.connect(pan); pan.connect(sound.master); src.start();
        return { g: g, pan: pan };
      });
    },
    noiseChain: function (type, freq, q) {
      var ctx = A.ctx, src = ctx.createBufferSource(); src.buffer = this.nb; src.loop = true;
      var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      var g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(this.master); src.start();
      return g;
    },
    set: function (g, v) { g.gain.setTargetAtTime(v, A.ctx.currentTime, 0.03); },
    stinger: function () {
      var ctx = A.ctx, t = ctx.currentTime;
      var o = ctx.createOscillator(); o.frequency.value = rnd(85, 115);
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.2);
      var s = ctx.createBufferSource(); s.buffer = this.nb; s.loopStart = Math.random();
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = rnd(2500, 4000);
      var g2 = ctx.createGain(); g2.gain.setValueAtTime(0.35, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      s.connect(hp); hp.connect(g2); g2.connect(this.master); s.start(t, Math.random()); s.stop(t + 0.08);
    }
  };
  el('vol').addEventListener('input', function () { el('volV').textContent = el('vol').value + ' %'; });

  // ============================================================ modèle : hôte et client
  var host = P.newObject(), client = P.newObject();
  var eps = { A: P.newEpisodes(), B: P.newEpisodes() };
  A.game.host = host; A.game.client = client; A.game.eps = eps; A.game.sims = sims; A.game.sofa = sofa;
  var selfQueue = [], pubQueue = [], clientHist = [], acc = 0, simT = 0, desc = null, lastDesc = null;
  var heavy = A.load('heavy'); if (heavy === null) heavy = 1.1;
  el('heavy').value = heavy; el('heavyV').textContent = fmt(heavy, 2);
  el('heavy').addEventListener('input', function () { heavy = +el('heavy').value; el('heavyV').textContent = fmt(heavy, 2); A.store('heavy', heavy); });
  var shake = { until: 0, amp: 0 }, lastEvent = -1e9;
  var HIST = [];

  function voicesAt(now, forClient, objRoom) {
    var net = +el('netLat').value, role = el('netRole').value;
    var selfLat = (role === 'client' && !forClient) ? net : 0;
    var selfL = delayed(selfQueue, now, selfLat);
    var r = A.rPrime(), v = [{ L: selfL, raw: selfL, r: r > 0 ? r : 0, w: A.wPrime(), room: objRoom, who: 'toi' }];
    sims.forEach(function (s) {
      var lat = s.lat + (forClient && role === 'client' ? net : 0);
      var raw = delayed(s.queue, now, lat);
      var att = s.room === 'X' ? 0 : (s.room === objRoom ? 1 : 0.35);
      v.push({ L: raw * att, raw: raw, r: s.r, w: 0.12, room: s.room === 'X' ? 'X' : s.room, who: s.name });
    });
    return v;
  }

  A.subs.push(function (now, dt) {
    // entrées : ta voix, les voix simulées
    selfQueue.push({ t: now, v: A.L });
    while (selfQueue.length && selfQueue[0].t < now - 2000) selfQueue.shift();
    sims.forEach(function (s) {
      var tg = simTarget(s, now), tau = tg > s.x ? 0.015 : 0.150;
      s.x += (tg - s.x) * (1 - Math.exp(-dt / tau));
      if (tg === 0 && s.x < 0.01) s.x = 0;           // la porte de sonie : sous elle, zéro exact — sinon le silence est inatteignable
      s.L = P.loudness(Math.max(0, s.x), s1);
      s.queue.push({ t: now, v: s.L });
      while (s.queue.length && s.queue[0].t < now - 2000) s.queue.shift();
    });

    // hôte et prédiction du client, au tick fixe
    var role = el('netRole').value, net = +el('netLat').value, objRoom = roomOf(sofa.x);
    acc += dt;
    while (acc >= TICK) {
      acc -= TICK; simT += TICK;
      var hv = voicesAt(now, false, objRoom);
      P.tick(host, hv, objRoom, dragging, TICK, cfg, s1, now);
      if (host.event && role === 'hote') onEvent(now);
      // diagnostic : une descente depuis l'avertissement dure-t-elle Vidange, ou est-elle bloquée hors silence ?
      if (host.regime === 'ALARME') desc = null;
      else if (!desc && host.charge >= P.seuilAv(cfg)) desc = { t: 0, bloquee: 0, depart: host.charge, zmem: host.zmem };
      if (desc) {
        desc.t += TICK; if (host.regime !== 'SILENCE') desc.bloquee += TICK; desc.zmem = Math.max(desc.zmem, host.zmem);
        if (host.charge === 0) {
          lastDesc = desc; desc = null;
          A.log('descente', 'Retour au calme en ' + fmt(lastDesc.t, 2) + ' s, dont ' + fmt(lastDesc.bloquee, 2) + ' s sans silence complet',
            { total_s: +lastDesc.t.toFixed(2), bloquee_hors_silence_s: +lastDesc.bloquee.toFixed(2), depart: +lastDesc.depart.toFixed(3), Zmem: lastDesc.zmem, Vidange: cfg.Vidange, variante: cfg.zizanie, voix: sims.map(function (s) { return s.name + ':' + s.room + ':' + s.mode; }) });
        }
      }
      ['A', 'B'].forEach(function (room) {
        var n = P.zizanieCount(hv, room, cfg, s1), out = P.episodeTick(eps[room], n, simT, cfg, false);
        if (out) A.log('zizanie', 'Pièce ' + room + ' : épisode ' + out.verdict + ' (' + fmt(out.dur, 2) + ' s)', { piece: room, duree_s: +out.dur.toFixed(2), verdict: out.verdict, variante: cfg.zizanie });
        eps[room].n = n;
      });
      pubQueue.push({ t: now, v: host.charge, lourdeur: host.lourdeur });
      if (role === 'client') {
        var cvv = voicesAt(now, true, objRoom);
        P.tick(client, cvv, objRoom, dragging, TICK, cfg, s1, now);
        var recv = null;
        for (var i = pubQueue.length - 1; i >= 0; i--) if (pubQueue[i].t <= now - net) { recv = pubQueue[i]; break; }
        // réconciliation : l’état reçu de l’hôte reflète ta voix d’il y a deux latences — on le compare
        // à ce que tu prédisais à ce moment-là, pas à ta prédiction actuelle
        clientHist.push({ t: now, c: client.charge });
        while (clientHist.length > 1 && clientHist[1].t <= now - 2 * net - 100) clientHist.shift();
        var past = null;
        for (var q = clientHist.length - 1; q >= 0; q--) if (clientHist[q].t <= now - 2 * net) { past = clientHist[q]; break; }
        if (recv && past) {
          client.charge = Math.max(0, Math.min(1, client.charge + (recv.v - past.c) * (1 - Math.exp(-TICK / 1.0))));
          client.lourdeur = P.lourdeur(client.charge, cfg);
        }
        if (client.event) onEvent(now);
      }
    }
    while (pubQueue.length > 1 && pubQueue[0].t < now - 2000) pubQueue.shift();

    var view = role === 'client' ? client : host;          // ce que TON écran rend : l'avertissement
    var weight = host.lourdeur;
    if (role === 'client') {
      var got = null;
      for (var j = pubQueue.length - 1; j >= 0; j--) if (pubQueue[j].t <= now - net) { got = pubQueue[j]; break; }
      weight = got ? got.lourdeur : 0;
    }

    // portage : le canapé traîne derrière la souris selon le poids publié par l'hôte
    renderSimsActive();
    var follow = 15 + (heavy - 15) * weight, k = 1 - Math.exp(-follow * dt);
    if (dragging) {
      var nx = sofa.x + (sofa.tx - sofa.x) * k, ny = sofa.y + (sofa.ty - sofa.y) * k;
      nx = Math.max(SW / 2, Math.min(W - SW / 2, nx)); ny = Math.max(SH / 2 + 30, Math.min(H - SH / 2, ny));
      if (!hitsWall(nx, sofa.y)) sofa.x = nx;
      if (!hitsWall(sofa.x, ny)) sofa.y = ny;
    }

    renderSound(view, now);
    draw(view, weight, now, dt);
    if (el('chkDev').checked) dev(view, weight, now, objRoom);
    el('devPanel').hidden = !el('chkDev').checked;
  });

  // Rappel au moment où la limite du micro se fait sentir : ta voix basse a déclenché l'alarme
  var lastHint = -1e9;
  function micHint(now) {
    var p = A.profile;
    if (!p || !p.dyn || !p.dyn.ecrasee || now - lastHint < 45000) return;
    if (host.culprit !== 0 || !(A.x < A.rPrime())) return;
    lastHint = now;
    el('micHint').textContent = 'Ton micro a rapproché ta voix basse de ta voix normale : le jeu t\'a entendu parler. Couper le traitement de ton micro rendra le chuchotement plus sûr.';
    el('micHint').hidden = false;
    setTimeout(function () { el('micHint').hidden = true; }, 7000);
    A.log('rappel micro', 'Rappel affiché : voix basse entendue comme une voix normale', { position: +A.x.toFixed(3), r: +A.rPrime().toFixed(3), raisons: p.dyn.raisons, ancrage: cfg.ancrage });
  }

  function onEvent(now) {
    lastEvent = now;
    micHint(now);
    if (cfg.semantique === 'evenement') {
      if (el('chkSound').checked && sound.ready) sound.stinger();
      if (el('chkShake').checked) { shake.until = now + 280; shake.amp = el('chkShakeAmp').checked ? 7 : 2.5; }
    }
  }

  function renderSound(o, now) {
    if (!sound.ready) return;
    sound.master.gain.setTargetAtTime(+el('vol').value / 100, A.ctx.currentTime, 0.05);
    var on = el('chkSound').checked, sav = P.seuilAv(cfg), c = o.charge;
    var frem = on && o.regime !== 'SILENCE' && c > 0 && c < sav ? 0.05 * (0.4 + 0.6 * c / sav) : 0;
    var danger = on && c >= sav ? 0.05 + 0.2 * o.lourdeur : 0;
    var pulse = on && cfg.semantique === 'banc' && o.warnState ? 0.09 * (0.55 + 0.45 * Math.sin(now / 90)) : 0;
    sound.set(sound.frem, frem); sound.set(sound.danger, danger); sound.set(sound.hum, danger * 0.5); sound.set(sound.benchPulse, pulse);
    var objRoom = roomOf(sofa.x);
    sims.forEach(function (s, i) {
      var heard = el('chkSimAudio').checked ? delayed(s.queue, now, s.lat) : 0;
      var att = s.room === 'X' ? 0 : (s.room === objRoom ? 1 : 0.45);
      sound.set(sound.voices[i].g, heard * att * 0.35);
      if (sound.voices[i].pan.pan) {
        var slot = SLOTS[s.room === 'X' ? 'A' : s.room][i] || [W / 2, 0];
        sound.voices[i].pan.pan.value = Math.max(-1, Math.min(1, (slot[0] - sofa.x) / 480));
      }
    });
  }

  // ============================================================ dessin
  function draw(o, weight, now, dt) {
    var sx = 0, sy = 0, amp = 0;
    if (el('chkShake').checked) {
      if (now < shake.until) amp = shake.amp * (shake.until - now) / 280;
      if (cfg.semantique === 'banc' && o.warnState) amp = Math.max(amp, (el('chkShakeAmp').checked ? 5 : 1.8));
      if (o.charge >= P.seuilAv(cfg)) amp = Math.max(amp, 0.8 * o.lourdeur * (el('chkShakeAmp').checked ? 2.5 : 1));
      sx = (Math.random() - 0.5) * 2 * amp; sy = (Math.random() - 0.5) * 2 * amp;
    }
    cx.save(); cx.setTransform(1, 0, 0, 1, sx, sy);
    cx.fillStyle = '#14110F'; cx.fillRect(-10, -10, W + 20, H + 20);
    ['A', 'B'].forEach(function (room) {                      // ambiance de zizanie : la pièce bascule
      var x0 = room === 'A' ? 0 : WALL_X1, x1 = room === 'A' ? WALL_X0 : W;
      var ziz = eps[room].n >= 3;
      cx.fillStyle = ziz ? 'rgba(160,40,30,' + (0.18 + 0.06 * Math.sin(now / 120)).toFixed(3) + ')' : '#1E1A17';
      cx.fillRect(x0, 30, x1 - x0, H - 30);
      cx.fillStyle = '#5F564F'; cx.font = '12px system-ui'; cx.fillText('Pièce ' + room, x0 + 10, 50);
    });
    cx.fillStyle = '#332B24';
    cx.fillRect(WALL_X0, 30, WALL_X1 - WALL_X0, DOOR_Y0 - 30); cx.fillRect(WALL_X0, DOOR_Y1, WALL_X1 - WALL_X0, H - DOOR_Y1);

    // voix simulées et leurs Sonomètres (lus sur les autres)
    var off = [];
    sims.forEach(function (s, i) {
      var heard = delayed(s.queue, now, s.lat);
      s.needle += (heard - s.needle) * (1 - Math.exp(-dt / 0.25));
      if (s.room === 'X') { off.push(s); return; }
      var p = SLOTS[s.room][i];
      cx.fillStyle = s.color; cx.beginPath(); cx.arc(p[0], p[1] - 22, 10, 0, Math.PI * 2); cx.fill();
      cx.fillRect(p[0] - 9, p[1] - 10, 18, 26);
      gauge(p[0], p[1] + 2, s.needle + (Math.random() - 0.5) * 0.02);
      cx.fillStyle = '#8C817A'; cx.font = '11px system-ui'; cx.fillText(s.name, p[0] + 16, p[1] - 22);
    });
    if (off.length) { cx.fillStyle = '#5F564F'; cx.font = '11px system-ui'; cx.fillText('Hors de portée : ' + off.map(function (s) { return s.name; }).join(', '), W - 220, H - 10); }

    // le canapé, porté par toi
    var halo = el('chkHalo').checked, hc = null;
    if (halo) {
      if (cfg.semantique === 'banc' ? o.warnState : now - lastEvent < 400) hc = 'rgba(242,180,65,' + (0.55 + 0.45 * Math.sin(now / 90)).toFixed(2) + ')';
      else if (weight > 0.35) hc = 'rgba(232,98,44,' + (0.25 + weight * 0.5).toFixed(2) + ')';
    }
    var x = sofa.x - SW / 2, y = sofa.y - SH / 2;
    if (hc) { cx.strokeStyle = hc; cx.lineWidth = 2; cx.strokeRect(x - 7, y - 7, SW + 14, SH + 14); }
    cx.fillStyle = '#3A2F26'; cx.fillRect(x, y, SW, SH);
    cx.strokeStyle = '#55463A'; cx.lineWidth = 1.5; cx.strokeRect(x, y, SW, SH);
    cx.fillStyle = '#4A3C31'; cx.fillRect(x + 9, y + 9, SW / 2 - 14, 20); cx.fillRect(x + SW / 2 + 5, y + 9, SW / 2 - 14, 20);
    cx.fillStyle = dragging ? '#EDE6DE' : '#8C817A';
    cx.beginPath(); cx.arc(x - 12, sofa.y, 7, 0, Math.PI * 2); cx.fill();
    if (el('chkOwnVol').checked) gauge(x - 12, sofa.y + 22, A.L);   // option F3, pour soi seul
    cx.restore();

    var cut = A.source === 'aucune' || (A.track && (A.track.muted || A.track.readyState === 'ended'));
    el('micCut').style.display = cut ? 'block' : 'none';
    el('micCut').textContent = A.source === 'aucune' ? 'aucune source' : 'micro coupé';
  }
  function gauge(x, y, v) {
    cx.strokeStyle = '#5F564F'; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(x, y + 14, 13, Math.PI, 2 * Math.PI); cx.stroke();
    var a = Math.PI + Math.max(0, Math.min(1, v)) * Math.PI;
    cx.strokeStyle = v > 0.75 ? '#E8622C' : '#EDE6DE'; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(x, y + 14); cx.lineTo(x + Math.cos(a) * 12, y + 14 + Math.sin(a) * 12); cx.stroke();
  }

  // ============================================================ vue mesure
  var tl = el('timeline'), tx = tl.getContext('2d');
  function dev(o, weight, now, objRoom) {
    var sav = P.seuilAv(cfg), r = A.rPrime(), lines = [];
    lines.push('Régime ' + o.regime + ' · charge ' + fmt(o.charge, 3) + ' · seuil_av ' + fmt(sav, 3) + ' · plafond ' + fmt(cfg.k * sav, 3) +
      ' · lourdeur rendue ' + fmt(weight, 3) + ' · Zmém ' + fmt(o.zmem, 2) + ' · événements ' + o.events);
    lines.push('Pièce de l\'objet ' + objRoom + ' · N_z A ' + (eps.A.n || 0) + ' / B ' + (eps.B.n || 0) + ' · sémantique ' + (blind ? 'aveugle' : cfg.semantique) + ' · zizanie ' + cfg.zizanie + ' · objet porté ' + dragging);
    lines.push('Toi : position ' + fmt(A.x, 3) + ' · seuil ' + fmt(r > 0 ? P.seuilDe(cfg, { r: r, w: A.wPrime() }) : NaN, 3) + ' (ancrage ' + cfg.ancrage + ') · r′ ' + fmt(r, 3) + ' · chuchotement ' + fmt(A.wPrime(), 3));
    sims.forEach(function (s) {
      lines.push(s.name + ' (' + s.room + ') : position ' + fmt(s.x, 3) + ' · seuil ' + fmt(P.seuil(cfg.T_objet, s.r), 3) + ' · zizanie ' + fmt(P.seuilZizanie(s.r, cfg.k_z), 3));
    });
    el('devText').textContent = lines.join('\n');
    HIST.push({ t: now, c: o.charge, reg: o.regime, ev: o.event || now - lastEvent < 30, L: A.L });
    while (HIST.length && now - HIST[0].t > 10000) HIST.shift();
    var Wt = tl.width, Ht = tl.height;
    tx.fillStyle = '#14110F'; tx.fillRect(0, 0, Wt, Ht);
    HIST.forEach(function (p) {
      var px = Wt - (now - p.t) / 10000 * Wt;
      tx.fillStyle = p.reg === 'ALARME' ? 'rgba(232,98,44,.35)' : p.reg === 'MURMURE' ? 'rgba(127,167,217,.35)' : 'rgba(0,0,0,0)';
      tx.fillRect(px, Ht - 10, 3, 10);
      if (p.ev) { tx.fillStyle = '#F2B441'; tx.fillRect(px, 0, 2, Ht - 12); }
    });
    function yv(v) { return Ht - 14 - v * (Ht - 22); }
    tx.setLineDash([4, 4]); tx.strokeStyle = '#F2B441'; tx.beginPath(); tx.moveTo(0, yv(sav)); tx.lineTo(Wt, yv(sav)); tx.stroke();
    tx.strokeStyle = '#7FA7D9'; tx.beginPath(); tx.moveTo(0, yv(cfg.k * sav)); tx.lineTo(Wt, yv(cfg.k * sav)); tx.stroke(); tx.setLineDash([]);
    ['c', 'L'].forEach(function (key) {
      tx.beginPath();
      HIST.forEach(function (p, i) { var px = Wt - (now - p.t) / 10000 * Wt; if (i) tx.lineTo(px, yv(p[key])); else tx.moveTo(px, yv(p[key])); });
      tx.strokeStyle = key === 'c' ? '#E8622C' : '#5E9C87'; tx.lineWidth = key === 'c' ? 2 : 1; tx.stroke();
    });
  }

  // ============================================================ questions et journal
  function snapshot() {
    return {
      semantique: blind ? 'aveugle' : cfg.semantique, zizanie: cfg.zizanie, ancrage: cfg.ancrage, T_objet: cfg.T_objet,
      Avertissement_ms: Math.round(cfg.Avertissement * 1000), Remplissage: cfg.Remplissage, Vidange: cfg.Vidange,
      Amorcage: cfg.Amorcage, h: cfg.h, k: cfg.k, Lenteur: cfg.Lenteur, k_z: cfg.k_z, z: cfg.z,
      role: el('netRole').value, latence_ms: +el('netLat').value, mobilite_pleine_charge: heavy,
      son: el('chkSound').checked, tremblement: el('chkShake').checked, halo: el('chkHalo').checked,
      tau_attaque_ms: Math.round(s1.tauAttack * 1000), tau_relachement_ms: Math.round(s1.tauRelease * 1000), gamma: s1.gamma, Margin_dB: s1.Margin_dB,
      profil: A.profile ? { r: +A.rPrime().toFixed(3), w: A.wPrime() === null ? null : +A.wPrime().toFixed(3), lowRange: A.profile.lowRange, dynamique: A.profile.dyn ? A.profile.dyn.raisons : null, source: A.profile.source } : null,
      voix: sims.map(function (s) { return s.name + ':' + s.room + ':' + s.mode + ':r' + s.r + ':' + s.lat + 'ms'; })
    };
  }
  var LABELS = { phrase: '« J\'ai eu le temps de me taire »', precharge: 'Pré-charge (VO-49)', tremblement: 'Tremblement seul (VO-48)', conversation: 'Conversation soutenue (E4)', zizanie: 'Zizanie' };
  document.querySelectorAll('[data-q]').forEach(function (b) {
    b.addEventListener('click', function () {
      A.log(b.dataset.q, LABELS[b.dataset.q] + ' : ' + b.dataset.a, snapshot());
      el('qNote').textContent = '✓ Noté dans le journal — ' + LABELS[b.dataset.q] + ' : ' + b.dataset.a + ' (' + new Date().toLocaleTimeString('fr-FR') + ')';
      b.style.outline = '2px solid var(--calm)'; setTimeout(function () { b.style.outline = ''; }, 900);
      b.blur();
    });
  });

  var mystery = null;
  el('btnMystery').addEventListener('click', function () {
    var pool = sims.filter(function (s) { return s.room !== 'X'; });
    var box = el('mysteryAns'); box.innerHTML = '';
    if (!pool.length) { box.textContent = 'Toutes les voix sont hors de portée.'; return; }
    sound.ensure();
    var s = pool[Math.floor(Math.random() * pool.length)], now = performance.now();
    s.force = now + 1000;
    mystery = { who: s.name, t0: now };
    sims.concat([{ name: 'Je ne sais pas' }]).forEach(function (c) {
      var btn = document.createElement('button'); btn.className = 'ghost'; btn.textContent = c.name;
      btn.addEventListener('click', function () {
        if (!mystery) return;
        var ok = c.name === mystery.who;
        A.log('attribution', 'Cri mystère : ' + mystery.who + ' — réponse ' + c.name + (ok ? ' (juste)' : ' (fausse)'),
          { vrai: mystery.who, reponse: c.name, juste: ok, delai_ms: Math.round(performance.now() - mystery.t0), voix_audibles: el('chkSimAudio').checked, config: snapshot() });
        box.textContent = ok ? 'Juste.' : 'C\'était ' + mystery.who + '.';
        mystery = null;
      });
      box.appendChild(btn);
    });
  });
})(APP);
