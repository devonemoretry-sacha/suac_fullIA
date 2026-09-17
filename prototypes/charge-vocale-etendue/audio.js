// PROTOTYPE - NOT FOR PRODUCTION
// Question: le modèle révisé des systèmes 1, 6 et 11 se ressent-il comme prévu ?
// Date: 2026-09-17
//
// Socle : état partagé, onglets, journal, capture (micro ou générateur), chaîne du système 1,
// enregistrement brut (B7), profil actif.

var APP = (function () {
  'use strict';
  var el = function (id) { return document.getElementById(id); };
  var fmt = function (n, d) { return (isFinite(n) ? n.toFixed(d) : '—').replace('.', ','); };

  var A = {
    el: el, fmt: fmt,
    s1: P.S1, s6: P.S6, s11: P.S11,
    profile: null,
    journal: [],
    subs: [],
    hideLevel: false,
    ctx: null, src: null, analyser: null, buf: null, source: 'aucune', track: null,
    rawDb: P.S1.MinDb, envDb: P.S1.MinDb, x: 0, L: 0,
    applyLowRange: true
  };

  // ------------------------------------------------------------ persistance (confort)
  A.store = function (key, val) {
    try { localStorage.setItem('cve.' + key, JSON.stringify(val)); } catch (e) { /* stockage indisponible */ }
  };
  A.load = function (key) {
    try { var v = localStorage.getItem('cve.' + key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  };

  // ------------------------------------------------------------ journal
  A.log = function (type, text, data) {
    var e = { t: new Date().toISOString(), type: type, text: text || '', data: data || null };
    A.journal.unshift(e);
    A.store('journal', A.journal);
    renderJournal();
    return e;
  };
  function renderJournal() {
    var box = el('journalList'); box.innerHTML = '';
    if (!A.journal.length) { box.innerHTML = '<div class="note">Journal vide.</div>'; return; }
    A.journal.forEach(function (e) {
      var d = document.createElement('div'); d.className = 'jentry';
      var t = document.createElement('span'); t.className = 't'; t.textContent = e.t.replace('T', ' ').slice(0, 19);
      var ty = document.createElement('span'); ty.className = 'ty'; ty.textContent = e.type;
      var tx = document.createElement('span'); tx.textContent = e.text;
      d.appendChild(t); d.appendChild(ty); d.appendChild(tx);
      if (e.data) { var pre = document.createElement('pre'); pre.textContent = JSON.stringify(e.data); d.appendChild(pre); }
      box.appendChild(d);
    });
  }
  function download(name, blob) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  A.download = download;

  // ------------------------------------------------------------ onglets
  document.querySelectorAll('nav button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('nav button').forEach(function (x) { x.classList.toggle('on', x === b); });
      ['calib', 'jeu', 'journal'].forEach(function (t) { el('tab-' + t).hidden = t !== b.dataset.tab; });
    });
  });

  // ------------------------------------------------------------ capture
  A.ensureCtx = function () {
    if (!A.ctx) {
      A.ctx = new (window.AudioContext || window.webkitAudioContext)();
      A.analyser = A.ctx.createAnalyser();
      A.analyser.fftSize = 1024;                         // ≈ 21 ms à 48 kHz
      A.buf = new Float32Array(A.analyser.fftSize);
      setupRecorder();
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return A.ctx;
  };

  function attach(node, name) {
    if (A.src) { try { A.src.disconnect(); } catch (e) { } }
    A.src = node; A.source = name;
    node.connect(A.analyser);
    node.connect(A.recNode);
    renderHygiene();
  }

  el('btnMic').addEventListener('click', function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      el('capNote').innerHTML = '<strong class="bad-text">Capture indisponible.</strong> Contexte sécurisé : <code>' +
        window.isSecureContext + '</code> · premier niveau : <code>' + (window.top === window.self) +
        '</code>. Ouvre <code>http://localhost:4322</code>.';
      return;
    }
    A.ensureCtx();
    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 }
    }).then(function (stream) {
      A.track = stream.getAudioTracks()[0];
      attach(A.ctx.createMediaStreamSource(stream), 'micro');
      el('btnMic').textContent = 'Micro actif'; el('btnMic').classList.add('calm');
      el('genBox').hidden = true;
      el('capNote').textContent = 'Capture brute en cours. Rien ne quitte cette page.';
      A.log('capture', 'Micro activé', hygieneData());
    }).catch(function (err) {
      el('capNote').innerHTML = '<strong class="bad-text">Micro indisponible — <code>' + (err && err.name) +
        '</code></strong>. Contexte sécurisé : <code>' + window.isSecureContext + '</code>.';
    });
  });

  var gen = null;
  el('btnGen').addEventListener('click', function () {
    var ctx = A.ensureCtx();
    if (!gen) {
      var osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 140;
      var lfo = ctx.createOscillator(); lfo.frequency.value = 5.5;
      var lfoG = ctx.createGain(); lfoG.gain.value = 4; lfo.connect(lfoG); lfoG.connect(osc.frequency);
      var vg = ctx.createGain(); vg.gain.value = 0; osc.connect(vg);
      var nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
      var ng = ctx.createGain(); ns.connect(ng);
      var bus = ctx.createGain(); vg.connect(bus); ng.connect(bus);
      osc.start(); lfo.start(); ns.start();
      gen = { vg: vg, ng: ng, bus: bus };
    }
    A.track = null;
    attach(gen.bus, 'générateur');
    el('genBox').hidden = false;
    el('btnGen').classList.add('calm');
    syncGen();
  });
  function syncGen() {
    var v = +el('genVoice').value, n = +el('genNoise').value;
    el('genVoiceV').textContent = '−' + Math.abs(v) + ' dB';
    el('genNoiseV').textContent = '−' + Math.abs(n) + ' dB';
    if (!gen) return;
    var t = A.ctx.currentTime;
    gen.vg.gain.setTargetAtTime(v <= -90 ? 0 : Math.pow(10, v / 20) * 1.7, t, 0.02);   // scie ≈ −4,8 dB RMS
    gen.ng.gain.setTargetAtTime(Math.pow(10, n / 20) * 1.73, t, 0.02);                 // blanc uniforme ≈ −4,8 dB RMS
  }
  el('genVoice').addEventListener('input', syncGen);
  el('genNoise').addEventListener('input', syncGen);
  document.querySelectorAll('[data-gen]').forEach(function (b) {
    b.addEventListener('click', function () { el('genVoice').value = b.dataset.gen; syncGen(); });
  });
  A.setGenVoice = function (db) { el('genVoice').value = db; syncGen(); };   // pour les vérifications

  function hygieneData() {
    var s = A.track && A.track.getSettings ? A.track.getSettings() : {};
    return {
      source: A.source, sampleRateContexte: A.ctx ? A.ctx.sampleRate : null,
      sampleRatePiste: s.sampleRate || null, echoCancellation: s.echoCancellation,
      noiseSuppression: s.noiseSuppression, autoGainControl: s.autoGainControl,
      channelCount: s.channelCount || null, label: A.track ? A.track.label : null
    };
  }
  A.hygieneData = hygieneData;
  function renderHygiene() {
    var h = hygieneData(), box = el('hygiene'); box.innerHTML = '';
    function row(k, v, bad) {
      var a = document.createElement('span'); a.className = 'k'; a.textContent = k;
      var b = document.createElement('span'); b.className = 'v' + (bad ? ' bad-text' : ''); b.textContent = v;
      box.appendChild(a); box.appendChild(b);
    }
    row('Source', h.source);
    row('Fréquence du contexte', h.sampleRateContexte ? h.sampleRateContexte + ' Hz' : '—',
      h.sampleRateContexte && h.sampleRateContexte % 24000 !== 0);
    if (A.source === 'micro') {
      row('echoCancellation', String(h.echoCancellation), h.echoCancellation === true);
      row('noiseSuppression', String(h.noiseSuppression), h.noiseSuppression === true);
      row('autoGainControl', String(h.autoGainControl), h.autoGainControl === true);
      row('Périphérique', h.label || '—');
    }
  }

  // ------------------------------------------------------------ enregistrement brut (B7)
  A.rec = { active: false, label: '', chunks: [], takes: [] };
  function setupRecorder() {
    A.recNode = A.ctx.createScriptProcessor(4096, 1, 1);
    var mute = A.ctx.createGain(); mute.gain.value = 0;
    A.recNode.connect(mute); mute.connect(A.ctx.destination);
    A.recNode.onaudioprocess = function (ev) {
      if (A.rec.active) A.rec.chunks.push(new Float32Array(ev.inputBuffer.getChannelData(0)));
    };
  }
  A.recStart = function (label) {
    if (!el('chkRecord').checked || !A.ctx) return;
    A.rec.active = true; A.rec.label = label; A.rec.chunks = [];
  };
  A.recStop = function () {
    if (!A.rec.active) return;
    A.rec.active = false;
    var n = 0; A.rec.chunks.forEach(function (c) { n += c.length; });
    var all = new Float32Array(n), o = 0, sum = 0;
    A.rec.chunks.forEach(function (c) { all.set(c, o); o += c.length; });
    for (var i = 0; i < n; i++) sum += all[i];
    var take = { label: A.rec.label, sr: A.ctx.sampleRate, samples: all, dc: n ? sum / n : 0, when: new Date() };
    A.rec.takes.push(take); A.rec.chunks = [];
    renderRecs();
    A.log('B7', 'Enregistrement brut : ' + take.label, { secondes: +(n / take.sr).toFixed(2), offsetDC: +take.dc.toExponential(3), sr: take.sr });
  };
  function wav(take) {
    var s = take.samples, buf = new ArrayBuffer(44 + s.length * 2), v = new DataView(buf);
    function str(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + s.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, take.sr, true); v.setUint32(28, take.sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, s.length * 2, true);
    for (var i = 0; i < s.length; i++) { var x = Math.max(-1, Math.min(1, s[i])); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true); }
    return new Blob([buf], { type: 'audio/wav' });
  }
  function renderRecs() {
    var box = el('recList'); box.innerHTML = '';
    A.rec.takes.forEach(function (t, i) {
      var r = document.createElement('div'); r.className = 'row';
      var s = document.createElement('span');
      s.textContent = t.label + ' — ' + fmt(t.samples.length / t.sr, 1) + ' s · offset DC ' + t.dc.toExponential(2);
      var b = document.createElement('button'); b.className = 'ghost'; b.textContent = 'WAV';
      b.addEventListener('click', function () {
        download('brut-' + (i + 1) + '-' + t.label.replace(/[^a-z0-9]+/gi, '-') + '.wav', wav(t));
      });
      r.appendChild(s); r.appendChild(b); box.appendChild(r);
    });
  }

  // ------------------------------------------------------------ système 1 : réglages
  function syncS1() {
    A.s1.tauAttack = +el('tauA').value / 1000;
    A.s1.tauRelease = +el('tauR').value / 1000;
    A.s1.gamma = +el('gammaIn').value;
    A.s1.Margin_dB = +el('marginIn').value;
    el('tauAV').textContent = el('tauA').value + ' ms';
    el('tauRV').textContent = el('tauR').value + ' ms';
    el('gammaV').textContent = fmt(A.s1.gamma, 2);
    el('marginV').textContent = fmt(A.s1.Margin_dB, 1) + ' dB';
    A.applyLowRange = el('chkLowRange').checked;
    renderProfile();
  }
  ['tauA', 'tauR', 'gammaIn', 'marginIn'].forEach(function (id) { el(id).addEventListener('input', syncS1); });
  el('chkLowRange').addEventListener('change', syncS1);

  // ------------------------------------------------------------ profil actif
  A.setProfile = function (p, source) {
    var v = P.validate(p, A.s1, A.s6, !!p.approximate);
    if (v.refusal) { A.log('profil', 'Profil refusé (' + v.refusal + ') — non appliqué', p); return v; }
    A.profile = {
      floor: p.floor, rest: p.rest, scream: p.scream, lowRange: v.lowRange,
      approximate: !!p.approximate, source: source
    };
    A.store('profile', A.profile);
    A.log('profil', 'Profil appliqué (' + source + ')', Object.assign({}, A.profile, { r: +v.r.toFixed(3), deltaP: +v.deltaP.toFixed(1), raisonsLowRange: v.reasons }));
    renderProfile();
    return v;
  };
  A.rPrime = function () { return A.profile ? P.restPosition(A.profile, A.s1) : 0; };
  function renderProfile() {
    var box = el('profileBox'); box.innerHTML = '';
    function row(k, v, cls) {
      var a = document.createElement('span'); a.className = 'k'; a.textContent = k;
      var b = document.createElement('span'); b.className = 'v' + (cls ? ' ' + cls : ''); b.textContent = v;
      box.appendChild(a); box.appendChild(b);
    }
    if (!A.profile) { row('Aucun', 'calibre-toi ou prends le profil témoin'); return; }
    var p = A.profile, g = P.gateDb(p, A.s1);
    row('Source', p.source);
    row('Floor_dB · Gate_dB', fmt(p.floor, 1) + ' · ' + fmt(g, 1));
    row('Rest_dB · Scream_dB', fmt(p.rest, 1) + ' · ' + fmt(p.scream, 1));
    row('Δ′', fmt(p.scream - g, 1) + ' dB');
    row("r′", fmt(P.restPosition(p, A.s1), 3));
    row('Drapeaux', (p.lowRange ? 'LowRange ' : '') + (p.approximate ? 'approximatif' : '') || '—', p.lowRange ? 'warn-text' : '');
    if (!(p.scream > g)) row('Garde', 'Scream_dB ≤ Gate_dB — profil invalide sous ce Margin_dB', 'bad-text');
  }
  el('btnWitness').addEventListener('click', function () {
    A.setProfile({ floor: -55, rest: -30, scream: -10 }, 'témoin');
  });
  el('btnManual').addEventListener('click', function () {
    A.setProfile({ floor: +el('pfFloor').value, rest: +el('pfRest').value, scream: +el('pfScream').value }, 'manuel');
  });

  // ------------------------------------------------------------ journal : boutons
  el('btnNote').addEventListener('click', function () {
    var t = el('noteText').value.trim(); if (!t) return;
    A.log('note', t); el('noteText').value = '';
  });
  el('btnExport').addEventListener('click', function () {
    download('journal-charge-vocale-etendue-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json',
      new Blob([JSON.stringify({ profil: A.profile, s1: A.s1, s6: A.s6, s11: A.s11, journal: A.journal }, null, 2)], { type: 'application/json' }));
  });
  el('btnCopy').addEventListener('click', function () {
    var txt = JSON.stringify({ profil: A.profile, journal: A.journal }, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
  });
  el('btnClearJ').addEventListener('click', function () {
    if (confirm('Effacer tout le journal de ce navigateur ?')) { A.journal = []; A.store('journal', []); renderJournal(); }
  });

  // ------------------------------------------------------------ boucle
  // ?horloge=timer : horloge de secours pour les vérifications dans un volet où requestAnimationFrame est suspendu
  var schedule = location.search.indexOf("horloge=timer") >= 0
    ? function (f) { setTimeout(function () { f(performance.now()); }, 16); }
    : function (f) { requestAnimationFrame(f); };
  var last = performance.now(), wasOn = false, tOn = 0, tStop = null, prevRaw = P.S1.MinDb;
  function frame(now) {
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (A.analyser && A.src) {
      A.analyser.getFloatTimeDomainData(A.buf);
      var s = 0; for (var i = 0; i < A.buf.length; i++) s += A.buf[i] * A.buf[i];
      A.rawDb = P.rmsToDb(Math.sqrt(s / A.buf.length), A.s1);
    } else A.rawDb = A.s1.MinDb;
    var lr = A.profile && A.profile.lowRange && A.applyLowRange;
    A.envDb = P.envelopeStep(A.envDb, A.rawDb, dt, A.s1, lr);
    if (A.profile && A.profile.scream > P.gateDb(A.profile, A.s1)) {
      A.x = P.position(A.envDb, A.profile, A.s1); A.L = P.loudness(A.x, A.s1);
      // B4 : temps de montée et de retombée, lus sur la sortie réelle
      var g = P.gateDb(A.profile, A.s1);
      if (A.L > 0 && !wasOn) tOn = now;
      if (A.L >= 0.5 && tOn) { el('attTime').textContent = Math.round(now - tOn) + ' ms'; tOn = 0; }
      if (prevRaw > g + 3 && A.rawDb <= g) tStop = now;
      if (A.L === 0 && wasOn && tStop) { el('relTime').textContent = Math.round(now - tStop) + ' ms'; tStop = null; }
      wasOn = A.L > 0;
    } else { A.x = 0; A.L = 0; }
    prevRaw = A.rawDb;

    el('liveBox').hidden = A.hideLevel;
    if (!A.hideLevel) {
      el('liveDb').textContent = A.src ? fmt(A.envDb, 1) + ' dB' + (A.profile ? ' · L ' + fmt(A.L, 2) : '') : '—';
      el('liveBar').style.width = Math.max(0, Math.min(100, (A.envDb + 90) / 90 * 100)) + '%';
    }
    for (var j = 0; j < A.subs.length; j++) A.subs[j](now, dt);
    schedule(frame);
  }

  // ------------------------------------------------------------ démarrage
  A.journal = A.load('journal') || [];
  renderJournal();
  syncS1();
  var saved = A.load('profile');
  if (saved) { A.profile = saved; renderProfile(); }
  schedule(frame);
  return A;
})();
