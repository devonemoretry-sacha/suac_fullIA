// PROTOTYPE - NOT FOR PRODUCTION
// Question: le modèle du système 11 (voice-object-effect.md, Formulas §1–§4) se ressent-il comme prévu ?
// Date: 2026-09-17
//
// Fonctions pures : chaîne du système 1 (voice-analysis.md §1, §1a) et modèle du système 11.
// Chargé par la page (global P) et par Node (module.exports) pour les vérifications.

(function (root) {
  'use strict';

  // ---------------------------------------------------------------- système 1
  var S1 = {
    MinDb: -120,        // liste canonique du système 1
    Margin_dB: 7,
    gamma: 0.65,
    tauAttack: 0.015,   // attaque 10–20 ms
    tauRelease: 0.150,  // relâchement 120–200 ms
    lowRangeFactor: 1.5
  };

  function rmsToDb(rms, cfg) {
    var floorAmp = Math.pow(10, cfg.MinDb / 20);
    return 20 * Math.log10(Math.max(rms, floorAmp));
  }

  // c = exp(−Δt/τ) ; LowRange multiplie τ, jamais c ; E_0 = MinDb
  function envelopeStep(prevDb, rawDb, dt, cfg, lowRange) {
    var tau = rawDb > prevDb ? cfg.tauAttack : cfg.tauRelease;
    if (lowRange) tau *= cfg.lowRangeFactor;
    var c = tau <= 0 ? 0 : Math.exp(-dt / tau);
    var e = rawDb + (prevDb - rawDb) * c;
    return Math.max(cfg.MinDb, Math.min(0, e));
  }

  function gateDb(profile, cfg) { return profile.floor + cfg.Margin_dB; }

  function position(rmsDb, profile, cfg) {           // x'
    var g = gateDb(profile, cfg), d = profile.scream - g;
    if (!(d > 0)) return 0;                           // garde Scream_dB > Gate_dB
    return Math.max(0, Math.min(1, (rmsDb - g) / d));
  }
  function loudness(x, cfg) { return x <= 0 ? 0 : Math.pow(x, cfg.gamma); }
  function toPosition(L, cfg) { return L <= 0 ? 0 : Math.pow(L, 1 / cfg.gamma); }
  function restPosition(profile, cfg) {               // r'
    var g = gateDb(profile, cfg);
    return (profile.rest - g) / (profile.scream - g);
  }

  // ---------------------------------------------------------------- système 11
  var S11 = {
    Avertissement: 0.350, Remplissage: 1.5, Vidange: 1.5, Amorcage: 0.15,
    h: 0.2, k: 0.85, Lenteur: 10, T_objet: 0.7, k_z: 0.4, z: 0.5,
    DureeMin: 1.0, FusionMax: 10, Expiration: 0.200,
    semantique: 'evenement',   // 'evenement' | 'banc'
    zizanie: 'duree',          // 'duree' | 'debit'
    ancrage: 'voix',           // 'voix' (GDD : T_objet · r') | 'chuchotement' (piste du 2026-09-17)
    montee: 'palier'           // 'palier' (GDD : la charge monte à max(L)) | 'progressive' (piste du 2026-09-18 :
                               // la vitesse suit le dépassement du seuil, nulle au seuil, pleine au cri)
  };

  function configErrors(c) {
    var e = [];
    if (!(c.Avertissement > 0 && c.Avertissement < c.Remplissage)) e.push('Avertissement doit être entre 0 et Remplissage');
    if (!(c.k > 0 && c.k < 1)) e.push('k hors ]0 ; 1[');
    if (!(c.h > 0 && c.h < 1)) e.push('h hors ]0 ; 1[');
    if (!(c.Lenteur >= 1)) e.push('Lenteur < 1');
    if (!(c.Vidange > 0)) e.push('Vidange ≤ 0');
    if (!(c.T_objet > 0 && c.T_objet <= 2)) e.push('T_objet hors ]0 ; 2]');
    if (!(c.k_z > 0 && c.k_z < 1)) e.push('k_z hors ]0 ; 1[');
    if (!(c.z >= 0)) e.push('z < 0');
    return e;
  }

  function seuil(T, r) { return T <= 1 ? T * r : r + (T - 1) * (1 - r); }
  // Piste du 2026-09-17 : le seuil part du chuchotement mesuré du joueur (w, en position) au lieu de 0.
  // Si le chuchotement atteint la voix posée, plus rien ne les sépare : le seuil tombe sur la voix posée.
  function seuilAncre(T, r, w) {
    if (T > 1) return seuil(T, r);
    if (!(w >= 0)) return seuil(T, r);
    if (w >= r) return r;
    return w + T * (r - w);
  }
  function seuilDe(c, v) { return c.ancrage === 'chuchotement' && v.w !== undefined && v.w !== null ? seuilAncre(c.T_objet, v.r, v.w) : seuil(c.T_objet, v.r); }
  function seuilZizanie(r, kz) { return r + kz * (1 - r); }
  function seuilAv(c) { return c.Avertissement / c.Remplissage; }

  function lourdeur(charge, c) {
    var sav = seuilAv(c);
    var am = c.Amorcage * Math.min(charge / sav, 1);
    var pr = Math.max(0, (charge - sav) / (1 - sav));
    return Math.min(1, am + pr * (1 - c.Amorcage));
  }

  // Z d'une pièce, compté sur les positions brutes des joueurs présents
  function zizanieCount(voices, room, c, s1) {
    var n = 0;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v.room !== room || !(v.r > 0)) continue;
      if (toPosition(v.raw, s1) >= seuilZizanie(v.r, c.k_z)) n++;
    }
    return n;
  }
  function zizanieFactor(n, c) { return n >= 3 ? 1 + c.z * (n - 2) : 1; }

  function newObject() {
    return { charge: 0, zmem: 1, armed: true, warnState: false, regime: 'SILENCE', lastEvent: -1, events: 0 };
  }

  // voices : [{ L (atténuée), raw (brute), r, room }] ; renvoie l'état après le tick
  function tick(o, voices, objRoom, carried, dt, c, s1, now) {
    var allZero = true, alarm = false, sum = 0, max = 0, who = -1, exces = 0, quiExces = -1;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      var L = (v.r > 0) ? v.L : 0;                    // r' non reçu → 0
      if (L > 0) allZero = false;
      sum += L;
      if (L > max) { max = L; who = i; }
      if (L > 0) {
        var xi = toPosition(L, s1), si = seuilDe(c, v);
        if (xi >= si) {
          alarm = true;
          var e = si >= 1 ? 0 : (xi - si) / (1 - si);     // dépassement, 0 au seuil et 1 au cri
          if (e > exces) { exces = e; quiExces = i; }
        }
      }
    }
    var regime = allZero ? 'SILENCE' : (alarm ? 'ALARME' : 'MURMURE');
    var Z = zizanieFactor(zizanieCount(voices, objRoom, c, s1), c);
    if (o.charge > 0) o.zmem = Math.max(o.zmem, Z);

    var sav = seuilAv(c), plafond = c.k * sav, prev = o.charge;
    var vid = c.zizanie === 'duree' ? c.Vidange * o.zmem : c.Vidange;

    if (carried) {
      if (regime === 'SILENCE') o.charge -= dt / vid;
      else if (regime === 'MURMURE') {
        if (o.charge < plafond) o.charge = Math.min(o.charge + Math.min(1, sum) * dt / (c.Remplissage * c.Lenteur), plafond);
      } else {
        var base = c.montee === 'progressive' ? exces : max;
        var rate = c.zizanie === 'debit' ? base * Z : base;
        o.charge += rate * dt / c.Remplissage;
      }
    } else if (regime === 'SILENCE') {
      o.charge -= dt / vid;
    }
    o.charge = Math.max(0, Math.min(1, o.charge));
    if (o.charge === 0) o.zmem = 1;

    // avertissement
    var event = false;
    if (c.semantique === 'evenement') {
      if (o.armed && prev < sav && o.charge >= sav) { event = true; o.armed = false; }
      else if (!o.armed && o.charge < sav * (1 - c.h)) o.armed = true;
      o.warnState = o.charge >= sav;
    } else {
      // banc : état allumé dès l'attaque au-dessus du seuil, éteint au silence ou à 1,6 × seuil
      var was = o.warnState;
      o.warnState = o.charge > 0 && o.charge < sav * 1.6 && regime === 'ALARME';
      if (o.warnState && !was) event = true;
    }
    if (event) { o.events++; o.lastEvent = now; }

    o.regime = regime; o.Z = Z; o.exces = exces;
    o.culprit = regime === 'ALARME' ? (c.montee === 'progressive' ? quiExces : who) : -1;
    o.lourdeur = lourdeur(o.charge, c);
    o.event = event;
    return o;
  }

  // ---------------------------------------------------------------- épisodes de zizanie
  function newEpisodes() { return { state: 'Closed', openedAt: 0, closedAt: 0, log: [] }; }
  function episodeTick(ep, n, now, c, contractEnd) {
    var out = null;
    function close(at) {
      var dur = at - ep.openedAt;
      out = { opened: ep.openedAt, dur: dur, verdict: dur >= c.DureeMin ? 'Committed' : 'Discarded' };
      ep.log.push(out);
    }
    if (contractEnd) {
      if (ep.state === 'Open') close(now);
      else if (ep.state === 'PendingClose') close(ep.closedAt);
      ep.state = 'Closed'; return out;
    }
    if (ep.state === 'Closed') {
      if (n >= 3) { ep.state = 'Open'; ep.openedAt = now; }
    } else if (ep.state === 'Open') {
      if (n < 3) { ep.state = 'PendingClose'; ep.closedAt = now; }
    } else if (ep.state === 'PendingClose') {
      if (n >= 3 && now - ep.closedAt < c.DureeMin) {
        if (now - ep.openedAt < c.FusionMax) ep.state = 'Open';
        else { close(ep.closedAt); ep.state = 'Open'; ep.openedAt = now; }
      } else if (now - ep.closedAt >= c.DureeMin) {
        close(ep.closedAt); ep.state = 'Closed';
      }
    }
    return out;
  }

  // ---------------------------------------------------------------- système 6 — validation
  var S6 = {
    step1: 7, WarmUp: 0.5, FloorMargin: 3, DeviceCheck: 5,
    VoicedMinSec: 2.0,      // VoicedMin = 100 trames à 50 Hz
    Step2Timeout: 15, PlateauDelta: 1.5, PlateauHold: 1.2, PlateauMinDuree: 2, PeakTimeout: 10,
    HardFloor: 6, QualityBand: 13, RestMax: 0.80,
    WhisperMin: 4, WhisperTimeout: 12,
    // diagnostic du prototype : une chaîne de capture qui écrase la dynamique, jamais un refus
    // Séparation mesurée : avec Blue VO!CE 0,5 et 5,5 dB ; sans 7,1 et 14,5 dB. La marge est mince :
    // le message reste une hypothèse, et la montée faible est testée avant d'accuser le micro.
    EcartCriVoixMin: 12, EcartVoixChuchoteMin: 6
  };

  function percentile(arr, p) {
    if (!arr.length) return NaN;
    var a = arr.slice().sort(function (x, y) { return x - y; });
    var idx = Math.min(a.length - 1, Math.max(0, Math.ceil(p * a.length) - 1));
    return a[idx];
  }
  function median(arr) {
    if (!arr.length) return NaN;
    var a = arr.slice().sort(function (x, y) { return x - y; }), m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  // Ce que la chaîne de capture laisse passer de la dynamique du joueur — signale, ne refuse jamais
  function dynamique(p, s6) {
    var raisons = [];
    if (p.scream - p.rest < s6.EcartCriVoixMin) raisons.push('cri');
    if (p.whisper !== undefined && p.whisper !== null && p.rest - p.whisper < s6.EcartVoixChuchoteMin) raisons.push('chuchotement');
    return { ecrasee: raisons.length > 0, raisons: raisons, criMoinsVoix: p.scream - p.rest,
      voixMoinsChuchotement: (p.whisper !== undefined && p.whisper !== null) ? p.rest - p.whisper : null };
  }

  function validate(p, s1, s6, approximate) {
    var g = p.floor + s1.Margin_dB, dP = p.scream - g;
    var res = { gate: g, deltaP: dP, r: NaN, refusal: null, lowRange: false, reasons: [] };
    if (!(g < p.rest && p.rest < p.scream)) { res.refusal = 'V1'; return res; }
    res.r = (p.rest - g) / dP;
    if (!approximate && dP < s6.HardFloor) { res.refusal = 'V2'; return res; }
    if (dP < s6.QualityBand) { res.lowRange = true; res.reasons.push('V2'); }
    if (res.r >= s6.RestMax) { res.lowRange = true; res.reasons.push('V3'); }
    return res;
  }

  var P = {
    S1: S1, S11: S11, S6: S6,
    rmsToDb: rmsToDb, envelopeStep: envelopeStep, gateDb: gateDb, position: position,
    loudness: loudness, toPosition: toPosition, restPosition: restPosition,
    configErrors: configErrors, seuil: seuil, seuilAncre: seuilAncre, seuilDe: seuilDe, dynamique: dynamique, seuilZizanie: seuilZizanie, seuilAv: seuilAv,
    lourdeur: lourdeur, zizanieCount: zizanieCount, zizanieFactor: zizanieFactor,
    newObject: newObject, tick: tick, newEpisodes: newEpisodes, episodeTick: episodeTick,
    percentile: percentile, median: median, validate: validate
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
  else root.P = P;
})(this);
