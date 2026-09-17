// PROTOTYPE - NOT FOR PRODUCTION
// Question: la calibration courte (voice-calibration.md) produit-elle un profil jouable, et où tombent
//           le chuchotement, la respiration et le silence par rapport à la porte personnelle (B1, B2, B3) ?
// Date: 2026-09-17

(function (A) {
  'use strict';
  var el = A.el, fmt = A.fmt;

  // ============================================================ calibration
  var C = { state: 'idle', t0: 0, refusals: 0, buf: {}, info: {} };
  var steps = document.querySelectorAll('#calSteps span');

  function showStep(n) {
    steps.forEach(function (s) {
      var k = +s.dataset.s;
      s.classList.toggle('on', k === n);
      s.classList.toggle('done', k < n);
    });
  }
  function ui(title, instr) { el('calTitle').textContent = title; el('calInstr').textContent = instr; }
  function show(ids, on) { ids.forEach(function (id) { el(id).hidden = !on; }); }
  function resetUi() {
    show(['calProgWrap', 'calPulseRow', 'calObj', 'calStop', 'calCancel', 'calResult'], false);
    el('calStart').hidden = true;
  }
  function result(html, buttons) {
    var box = el('calResult'); box.hidden = false; box.innerHTML = html;
    var row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '8px';
    (buttons || []).forEach(function (b) {
      var x = document.createElement('button'); x.textContent = b[0]; if (b[2]) x.className = b[2];
      x.addEventListener('click', b[1]); row.appendChild(x);
    });
    box.appendChild(row);
  }

  function goIdle(msg) {
    A.recStop();
    C.state = 'idle'; A.hideLevel = false;
    resetUi(); el('calStart').hidden = false; showStep(-1);
    ui('Mesurer ta voix', msg || 'Dans un instant, il faudra rester silencieux quelques secondes, parler normalement, puis hausser la voix à ton rythme. Si crier te fait mal, arrête-toi : tu peux toujours t\'arrêter.');
  }

  el('calStart').addEventListener('click', function () {
    if (!A.src) { ui('Il manque une source', 'Active le micro — ou le générateur de test — dans « Capture ».'); return; }
    C.refusals = 0; C.buf = {}; C.info = {};
    startPrep();
  });
  el('calCancel').addEventListener('click', function () { C.refusals = 0; goIdle(); });
  el('calStop').addEventListener('click', function () { if (C.state === 'peak') endPeak('arrêt demandé'); });

  function startPrep() {
    C.state = 'prep'; C.t0 = performance.now(); C.minSeen = Infinity;
    resetUi(); show(['calCancel'], true); showStep(0);
    ui('Préparation', 'Dis un mot, n\'importe lequel. On vérifie seulement que ton micro nous parvient.');
  }
  function startFloor() {
    C.state = 'floor'; C.t0 = performance.now(); C.samples = [];
    A.hideLevel = true;                                   // aucun indicateur de niveau à l'étape 1
    resetUi(); show(['calProgWrap', 'calCancel'], true); showStep(1);
    ui('Silence', 'Ne dis rien pendant quelques secondes. Respire normalement.');
    A.recStart('silence');
  }
  function startRest() {
    C.state = 'rest'; C.t0 = performance.now(); C.G = []; C.gated = 0; C.max2 = A.s1.MinDb;
    A.hideLevel = true;
    resetUi(); show(['calProgWrap', 'calPulseRow', 'calCancel'], true); showStep(2);
    ui('Parole posée', 'Parle normalement, comme si tu racontais ta journée à quelqu\'un assis en face de toi.');
    A.recStart('parole posee');
  }
  function startPeak() {
    C.state = 'peak'; C.t0 = performance.now(); C.M = A.s1.MinDb; C.hist = []; C.settle = 0;
    A.hideLevel = true;
    resetUi(); show(['calObj', 'calStop', 'calCancel'], true); showStep(3);
    ui('Montée', 'Monte progressivement, à ton rythme. Le meuble réagit à ta voix. Tu peux t\'arrêter quand tu veux.');
    A.recStart('montee');
  }

  A.subs.push(function (now, dt) {
    var t = (now - C.t0) / 1000, s6 = A.s6, s1 = A.s1;
    if (C.state === 'prep') {
      if (t > 0.3) C.minSeen = Math.min(C.minSeen, A.envDb);
      if (t > 0.3 && A.envDb - C.minSeen >= 12) { A.log('calibration', 'Étape 0 : signal reçu', { apres_s: +t.toFixed(2) }); startFloor(); }
      else if (t > s6.DeviceCheck) {
        C.state = 'wait'; resetUi(); show(['calCancel'], true);
        result('<div class="msg">On ne reçoit rien de ce micro — vérifie qu\'il est branché, sélectionné, et que le navigateur y a accès.</div>',
          [['Réessayer', startPrep]]);
      }
    } else if (C.state === 'floor') {
      el('calProg').style.width = Math.min(100, t / s6.step1 * 100) + '%';
      if (t > s6.WarmUp) C.samples.push(A.envDb);
      if (t >= s6.step1) {
        A.recStop();
        var p95 = P.percentile(C.samples, 0.95), p50 = P.percentile(C.samples, 0.5);
        C.buf.floor = Math.max(s1.MinDb + s6.FloorMargin, p95 + s6.FloorMargin);
        C.info.silence = { P95: +p95.toFixed(1), P50: +p50.toFixed(1), ecartP95_P50: +(p95 - p50).toFixed(1), trames: C.samples.length, Floor_dB: +C.buf.floor.toFixed(1) };
        A.log('calibration', 'Étape 1 : silence mesuré', C.info.silence);
        startRest();
      }
    } else if (C.state === 'rest') {
      var gate = C.buf.floor + s1.Margin_dB, on = A.envDb > gate;
      el('calPulse').classList.toggle('lit', on);
      if (on) { C.G.push(A.envDb); C.gated += dt; }
      C.max2 = Math.max(C.max2, A.envDb);
      el('calProg').style.width = Math.min(100, t / s6.Step2Timeout * 100) + '%';
      if (C.gated >= s6.VoicedMinSec || t >= s6.Step2Timeout) {
        A.recStop();
        if (C.gated < s6.VoicedMinSec) {
          C.state = 'wait'; resetUi(); show(['calCancel'], true);
          var none = C.G.length === 0;
          A.log('calibration', 'Étape 2 : trop peu de parole', { secondes_au_dessus_de_la_porte: +C.gated.toFixed(2) });
          result('<div class="msg">' + (none ? 'On ne t\'entend pas du tout — vérifie le micro sélectionné.' : 'Continue encore un peu, comme si tu racontais quelque chose.') + '</div>',
            [['Reprendre la parole posée', startRest]]);
          return;
        }
        C.buf.rest = P.median(C.G);
        C.info.parole = { Rest_dB: +C.buf.rest.toFixed(1), trames_G: C.G.length, max_etape2: +C.max2.toFixed(1), duree_s: +t.toFixed(1), PitchStatus: 'non mesuré (sans YIN)' };
        A.log('calibration', 'Étape 2 : parole posée mesurée', C.info.parole);
        startPeak();
      }
    } else if (C.state === 'peak' || C.state === 'settle') {
      var g3 = C.buf.floor + s1.Margin_dB;
      if (C.state === 'peak') {
        C.M = Math.max(C.M, A.envDb);
        C.hist.push({ t: t, M: C.M });
        var past = null;
        for (var i = C.hist.length - 1; i >= 0; i--) if (C.hist[i].t <= t - s6.PlateauHold) { past = C.hist[i]; break; }
        var plateau = t >= s6.PlateauHold && past && (C.M - past.M) < s6.PlateauDelta && (C.M - g3) >= s6.HardFloor;
        if (plateau) endPeak('plateau');
        else if (t >= s6.PeakTimeout) endPeak('délai écoulé');
      }
      drawObject(now, g3);
    }
  });

  function endPeak(why) {
    A.recStop();
    C.buf.scream = C.M;
    C.info.montee = { Scream_dB: +C.M.toFixed(1), fin: why, duree_s: +((performance.now() - C.t0) / 1000).toFixed(1) };
    A.log('calibration', 'Étape 3 : montée terminée (' + why + ')', C.info.montee);
    C.state = 'settle'; C.settleAt = performance.now();
    el('calStop').hidden = true;
    el('calInstr').textContent = 'Mesure faite.';
    setTimeout(validateNow, 700);
  }

  // l'objet de l'étape 3 : une conséquence, pas une jauge — échelle élastique, jamais de butée
  function drawObject(now, gate) {
    var cv = el('calObj'), cx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var span = Math.max(15, (C.M - gate) + 8);
    var r = C.state === 'settle' ? Math.max(0, 1 - (now - C.settleAt) / 600) * 0.3 : Math.max(0, Math.min(1, (A.envDb - gate) / span));
    C.draw = C.draw === undefined ? r : C.draw + (r - C.draw) * 0.25;
    var k = C.draw;
    cx.clearRect(0, 0, W, H);
    cx.fillStyle = '#14110F'; cx.fillRect(0, 0, W, H);
    cx.strokeStyle = '#332B24'; cx.beginPath(); cx.moveTo(0, H - 30.5); cx.lineTo(W, H - 30.5); cx.stroke();
    var jx = (Math.random() - 0.5) * 6 * k * k, jy = (Math.random() - 0.5) * 3 * k * k;
    var sink = 10 * k, squash = 1 - 0.18 * k;
    var w = 210, h = 70 * squash, x = W / 2 - w / 2 + jx, y = H - 30 - h + sink + jy;
    var c1 = [58, 47, 38], c2 = [120, 44, 30];
    var col = c1.map(function (v, i) { return Math.round(v + (c2[i] - v) * k); });
    cx.fillStyle = 'rgb(' + col.join(',') + ')'; cx.fillRect(x, y, w, h);
    cx.fillStyle = 'rgba(0,0,0,.25)'; cx.fillRect(x + 12, y + 10, w / 2 - 20, h * 0.35); cx.fillRect(x + w / 2 + 8, y + 10, w / 2 - 20, h * 0.35);
    cx.fillStyle = '#2A231D'; cx.fillRect(x + 14, y + h, 10, 8 - sink * 0.6); cx.fillRect(x + w - 24, y + h, 10, 8 - sink * 0.6);
    if (k > 0.35) {                                   // le sol peine
      cx.strokeStyle = 'rgba(232,98,44,' + (k - 0.35).toFixed(2) + ')';
      for (var i = 0; i < 4; i++) { var fx = x + 20 + i * 55; cx.beginPath(); cx.moveTo(fx, H - 26); cx.lineTo(fx + 12, H - 20); cx.stroke(); }
    }
  }

  function validateNow() {
    var p = { floor: C.buf.floor, rest: C.buf.rest, scream: C.buf.scream };
    var v = P.validate(p, A.s1, A.s6, false);
    C.state = 'result'; A.hideLevel = false;
    resetUi(); show(['calCancel'], true); showStep(4);
    ui('Résultat', '');
    var details = '<details style="margin-top:8px"><summary class="note">Vue mesure (le jeu ne l\'affiche pas)</summary><div class="kv" style="margin-top:6px">' +
      kv('Floor_dB', fmt(p.floor, 1)) + kv('Gate_dB', fmt(v.gate, 1)) + kv('Rest_dB', fmt(p.rest, 1)) +
      kv('Scream_dB', fmt(p.scream, 1)) + kv('Δ′', fmt(v.deltaP, 1) + ' dB') + kv("r′", fmt(v.r, 3)) +
      kv('Écart P95 − P50 du silence', fmt(C.info.silence.ecartP95_P50, 1) + ' dB (OQ-C3, sans seuil)') + '</div></details>';
    if (v.refusal) {
      C.refusals++;
      A.log('calibration', 'Refus ' + v.refusal + ' (refus consécutifs : ' + C.refusals + ')', { profil: p, deltaP: +v.deltaP.toFixed(1) });
      var msg = v.refusal === 'V1' ? 'On n\'a pas capté de montée — on refait juste cette étape, à ton rythme.'
        : 'On n\'arrive pas à distinguer ta voix calme de ta voix plus forte — rapproche un peu le micro.';
      var btns = [['Refaire la montée', startPeak]];
      if (C.refusals >= 2) {
        msg += '</div><div class="msg">Tu peux entrer avec une mesure approximative : le jeu réagira un peu moins finement, et tu pourras la refaire quand tu veux.';
        btns = [['Entrer avec une mesure approximative', approximate, 'calm'], ['Réessayer', startPeak, 'ghost']];
      }
      result('<div class="msg">' + msg + '</div>' + details, btns);
      return;
    }
    var msgs = [];
    if (v.reasons.indexOf('V2') >= 0) msgs.push('Ta plage est un peu étroite, le jeu s\'y adapte — rapprocher le micro peut aider.');
    if (v.reasons.indexOf('V3') >= 0) msgs.push('Ta voix de conversation est proche de ta voix forte — le jeu s\'y adapte ; tu pourras refaire la montée quand tu veux.');
    if (!msgs.length) msgs.push('C\'est bon, ta voix est mesurée.');
    msgs.push('<span class="note">Hauteur non mesurée dans ce prototype.</span>');
    A.log('calibration', 'Profil accepté' + (v.lowRange ? ' — LowRange (' + v.reasons.join(', ') + ')' : ''), { profil: p, r: +v.r.toFixed(3), deltaP: +v.deltaP.toFixed(1), infos: C.info });
    result(msgs.map(function (m) { return '<div class="msg">' + m + '</div>'; }).join('') + details,
      [['Utiliser ce profil', function () { A.setProfile(p, 'calibration'); C.refusals = 0; goIdle('Profil en place. Tu peux refaire ta mesure quand tu veux.'); }, 'calm'],
       ['Refaire la parole posée', startRest, 'ghost'], ['Refaire la montée', startPeak, 'ghost'], ['Tout refaire', startPrep, 'ghost']]);
  }
  function kv(k, v) { return '<span class="k">' + k + '</span><span class="v">' + v + '</span>'; }

  function approximate() {
    var p = { floor: C.buf.floor, rest: C.buf.rest, scream: Math.max(C.buf.scream, C.info.parole ? C.info.parole.max_etape2 : -Infinity), approximate: true };
    var v = P.validate(p, A.s1, A.s6, true);
    if (v.refusal) {
      A.log('calibration', 'Profil approximatif impossible — rien n\'a franchi la porte', p);
      resetUi(); show(['calCancel'], true);
      result('<div class="msg">Ton micro ne semble pas nous parvenir. Vérifie le périphérique sélectionné, puis recommence.</div>', [['Recommencer', startPrep]]);
      return;
    }
    A.setProfile(p, 'calibration approximative');
    C.refusals = 0;
    goIdle('Profil approximatif en place. Le refaire au calme rendra le jeu plus précis.');
  }

  goIdle();

  // ============================================================ points de mesure
  var M = { running: null };
  function needProfile() {
    if (!A.profile) { el('measStatus').innerHTML = '<span class="bad-text">Il faut un profil : calibre-toi ou prends le profil témoin.</span>'; return false; }
    if (!A.src) { el('measStatus').innerHTML = '<span class="bad-text">Active d\'abord une source.</span>'; return false; }
    if (M.running) return false;
    return true;
  }
  function run(label, seconds, done) {
    M.running = { label: label, t0: performance.now(), dur: seconds, warm: 0.6, frames: [] };   // 0,6 s écartées : l’enveloppe retombe du geste précédent
    A.hideLevel = true;
    A.recStart(label);
    document.querySelectorAll('[data-meas],#btnSil8,#btnSil30,#btnFlicker,#btnSameRoom').forEach(function (b) { b.disabled = true; });
    M.done = done;
  }
  A.subs.push(function (now) {
    var m = M.running; if (!m) return;
    var t = (now - m.t0) / 1000;
    if (t >= m.warm) m.frames.push({ env: A.envDb, L: A.L, x: A.x });
    el('measStatus').textContent = m.label + ' — ' + fmt(Math.max(0, m.dur + m.warm - t), 1) + ' s';
    if (t >= m.dur + m.warm) {
      M.running = null; A.hideLevel = false; A.recStop();
      document.querySelectorAll('[data-meas],#btnSil8,#btnSil30,#btnFlicker,#btnSameRoom').forEach(function (b) { b.disabled = false; });
      el('measStatus').textContent = '';
      M.done(m);
    }
  });

  function addRow(cells) {
    var tr = document.createElement('tr');
    cells.forEach(function (c, i) { var td = document.createElement('td'); if (i > 0 && i < 6) td.className = 'n'; td.textContent = c; tr.appendChild(td); });
    el('measTable').insertBefore(tr, el('measTable').firstChild);
  }

  document.querySelectorAll('[data-meas]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!needProfile()) return;
      run(b.dataset.meas, 4, function (m) {
        var p = A.profile, g = P.gateDb(p, A.s1), room = p.floor - A.s6.FloorMargin, r = A.rPrime();
        var envs = m.frames.map(function (f) { return f.env; }), xs = m.frames.map(function (f) { return f.x; });
        var med = P.median(envs), p90 = P.percentile(envs, 0.9), xm = P.median(xs), on = m.frames.filter(function (f) { return f.L > 0; }).length / m.frames.length;
        var lecture = on < 0.05 ? 'sous la porte : ne pèse rien'
          : P.percentile(xs, 0.9) < 0.4 * r ? 'murmure même sur un objet fragile'
          : P.percentile(xs, 0.9) < 0.7 * r ? 'murmure sur un objet ordinaire, alarme sur un fragile'
          : 'alarme sur un objet ordinaire';
        addRow([m.label, fmt(med, 1), fmt(med - room, 1), fmt(med - g, 1), fmt(xm, 3), Math.round(on * 100) + ' %', lecture]);
        A.log('B1', m.label + ' — ' + lecture, {
          mediane_dB: +med.toFixed(1), P90_dB: +p90.toFixed(1), au_dessus_P95_piece_dB: +(med - room).toFixed(1),
          vs_porte_dB: +(med - g).toFixed(1), position_mediane: +xm.toFixed(3), position_P90: +P.percentile(xs, 0.9).toFixed(3),
          part_trames_L_positive: +on.toFixed(3), r: +r.toFixed(3), seuil_ordinaire: +(0.7 * r).toFixed(3)
        });
      });
    });
  });

  function silence(seconds) {
    if (!needProfile()) return;
    run('Silence ' + seconds + ' s', seconds, function (m) {
      var p = m.frames.filter(function (f) { return f.L === 0; }).length / m.frames.length, p4 = Math.pow(p, 4);
      var eff = p4 > 0 ? A.s11.Vidange / p4 : Infinity, ok = p >= 0.84;
      addRow([m.label, '—', '—', '—', '—', Math.round((1 - p) * 100) + ' %',
        'p = ' + fmt(p, 3) + (ok ? ' ≥ 0,84' : ' < 0,84') + ' · à quatre : descente ≈ ' + (isFinite(eff) ? fmt(eff, 1) + ' s' : 'jamais')]);
      A.log(seconds > 10 ? 'AC-40' : 'B2', 'p = ' + fmt(p, 3) + (ok ? ' (cible atteinte)' : ' (sous la cible 0,84)'),
        { p: +p.toFixed(4), p4: +p4.toFixed(4), descente_effective_s: isFinite(eff) ? +eff.toFixed(2) : null, trames: m.frames.length });
    });
  }
  el('btnSil8').addEventListener('click', function () { silence(8); });
  el('btnSil30').addEventListener('click', function () { silence(30); });

  el('btnFlicker').addEventListener('click', function () {
    if (!needProfile()) return;
    run('Note douce sur la porte', 6, function (m) {
      var tr = 0, maxL = 0, pos = [];
      for (var i = 1; i < m.frames.length; i++) if ((m.frames[i].L > 0) !== (m.frames[i - 1].L > 0)) tr++;
      m.frames.forEach(function (f) { maxL = Math.max(maxL, f.L); if (f.L > 0) pos.push(f.L); });
      var rate = tr / m.dur;
      addRow([m.label, '—', '—', '—', '—', '—', fmt(rate, 1) + ' bascules/s · L max ' + fmt(maxL, 2) + ' · L médiane ' + fmt(P.median(pos), 2)]);
      A.log('B3', 'Scintillement : ' + fmt(rate, 1) + ' bascules par seconde', { bascules_par_s: +rate.toFixed(2), L_max: +maxL.toFixed(3), L_mediane_positive: pos.length ? +P.median(pos).toFixed(3) : null });
    });
  });

  el('btnSameRoom').addEventListener('click', function () {
    if (!needProfile()) return;
    var label = el('sameRoomLabel').value.trim() || 'sans étiquette';
    run('Même pièce (' + label + ')', 30, function (m) {
      var over = m.frames.filter(function (f) { return f.L > 0; }), g = P.gateDb(A.profile, A.s1);
      var frac = over.length / m.frames.length, xs = m.frames.map(function (f) { return f.x; });
      var med = over.length ? P.median(over.map(function (f) { return f.env - g; })) : NaN;
      var verdict = frac === 0 ? 'la voix de l\'autre ne franchit jamais la porte' : 'franchit la porte sur ' + Math.round(frac * 100) + ' % des trames';
      addRow([m.label, '—', '—', over.length ? '+' + fmt(med, 1) : '—', fmt(Math.max.apply(null, xs), 3), Math.round(frac * 100) + ' %', verdict]);
      A.log('même pièce', label + ' — ' + verdict, { part_trames_au_dessus_porte: +frac.toFixed(4), position_max: +Math.max.apply(null, xs).toFixed(3), position_P95: +P.percentile(xs, 0.95).toFixed(3), mediane_dB_au_dessus_porte: isFinite(med) ? +med.toFixed(1) : null });
    });
  });
})(APP);
