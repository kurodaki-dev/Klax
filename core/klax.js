/*!
 * Klax core — .math language: parser, expression evaluator, SVG renderer, raster/PDF export.
 * No dependencies. Works in a browser, in Acode and in Node.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Klax = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '1.0.0';
  var PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#db2777', '#65a30d'];
  var MAX_SIDE = 8000;

  var EXAMPLE = [
    '// Klax example. Every statement ends with ; (or a line break)',
    'SIZE: {1200px, 1300px};',
    'BG: #0f172a;',
    'TITLE: "Fonctions de base";',
    'RANGE: x(-10, 10) y(-6, 6);',
    'GRID: on;',
    '',
    'f(x) = sin(x) * x / 2; setColor -> #38bdf8; setWidth -> 3; setLabel -> "x·sin(x)/2";',
    'g(x) = x^2 / 10 - 4;   setColor -> rgba(251, 146, 60, 0.95); setLabel -> "x²/10 − 4";',
    'h(x) = 1 / x;          setColor -> #a3e635; setDash -> 6,4;',
    '',
    '// Parametric curve (circle)',
    'c(t) = (4*cos(t), 4*sin(t)); setColor -> #f472b6; setDomain -> 0, 2*pi;',
    'point(0, 0, 4, 0, 0, 4); setColor -> #ffffff; setRadius -> 5;',
    ''
  ].join('\n');

  /* ------------------------------------------------------------------ */
  /* Colours                                                            */
  /* ------------------------------------------------------------------ */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function hex2(n) { n = Math.round(clamp(n, 0, 255)); return (n < 16 ? '0' : '') + n.toString(16); }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function f(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }

  /** Returns {color:'#rrggbb'|'none'|CSS name, opacity:0..1} or null if invalid. */
  function parseColor(str) {
    if (str == null) return null;
    var s = String(str).trim().replace(/^["']|["']$/g, '');
    var m;
    if (/^(none|transparent)$/i.test(s)) return { color: 'none', opacity: 0 };
    if ((m = /^#([0-9a-f]{3,8})$/i.exec(s))) {
      var h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
      if (h.length === 6) return { color: '#' + h.toLowerCase(), opacity: 1 };
      if (h.length === 8) return { color: '#' + h.slice(0, 6).toLowerCase(), opacity: parseInt(h.slice(6), 16) / 255 };
      return null;
    }
    if ((m = /^rgba?\(([^)]*)\)$/i.exec(s))) {
      var p = m[1].split(/[\s,\/]+/).filter(Boolean);
      if (p.length < 3) return null;
      var c = p.slice(0, 3).map(function (v) { return /%$/.test(v) ? parseFloat(v) * 2.55 : parseFloat(v); });
      var a = p[3] != null ? (/%$/.test(p[3]) ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1;
      if (c.some(isNaN) || isNaN(a)) return null;
      return { color: '#' + hex2(c[0]) + hex2(c[1]) + hex2(c[2]), opacity: clamp(a, 0, 1) };
    }
    if ((m = /^hsla?\(([^)]*)\)$/i.exec(s))) {
      var q = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
      if (q.length < 3 || q.slice(0, 3).some(isNaN)) return null;
      var rgb = hslToRgb(q[0], clamp(q[1] / 100, 0, 1), clamp(q[2] / 100, 0, 1));
      return { color: '#' + hex2(rgb[0]) + hex2(rgb[1]) + hex2(rgb[2]), opacity: q[3] != null && !isNaN(q[3]) ? clamp(q[3], 0, 1) : 1 };
    }
    if (/^[a-z]{3,20}$/i.test(s)) return { color: s.toLowerCase(), opacity: 1 };
    return null;
  }

  function luminance(hex) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 1;
    var n = parseInt(m[1], 16);
    return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }

  /* ------------------------------------------------------------------ */
  /* Mathematical expressions                                           */
  /* ------------------------------------------------------------------ */
  function gamma(x) {
    if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
    x -= 1;
    var g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    var a = c[0], t = x + g + 0.5;
    for (var i = 1; i < g + 2; i++) a += c[i] / (x + i);
    return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
  }

  var CONSTS = { pi: Math.PI, 'π': Math.PI, e: Math.E, tau: 2 * Math.PI, phi: (1 + Math.sqrt(5)) / 2, inf: Infinity, infinity: Infinity };

  var FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, arcsin: Math.asin, acos: Math.acos, arccos: Math.acos, atan: Math.atan, arctan: Math.atan, atan2: Math.atan2,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
    sec: function (x) { return 1 / Math.cos(x); }, csc: function (x) { return 1 / Math.sin(x); }, cot: function (x) { return 1 / Math.tan(x); },
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp, ln: Math.log,
    log: function (x, b) { return b === undefined ? Math.log10(x) : Math.log(x) / Math.log(b); },
    log10: Math.log10, log2: Math.log2,
    floor: Math.floor, ceil: Math.ceil, round: Math.round, trunc: Math.trunc, sign: Math.sign,
    fract: function (x) { return x - Math.floor(x); },
    min: Math.min, max: Math.max, pow: Math.pow, hypot: Math.hypot,
    mod: function (a, b) { return ((a % b) + b) % b; },
    deg: function (x) { return x * 180 / Math.PI; }, rad: function (x) { return x * Math.PI / 180; },
    gamma: gamma, fact: function (n) { return Math.round(gamma(n + 1)); },
    clamp: function (x, a, b) { return Math.min(b, Math.max(a, x)); },
    step: function (x) { return x >= 0 ? 1 : 0; },
    sinc: function (x) { return x === 0 ? 1 : Math.sin(x) / x; },
    gauss: function (x, m, s) { m = m || 0; s = s || 1; return Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI)); },
    sum: null // reserved
  };
  delete FUNCS.sum;

  function tokenize(src) {
    var s = src.replace(/²/g, '^2').replace(/³/g, '^3').replace(/×|·/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/\*\*/g, '^');
    var out = [], i = 0, m, rest;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      rest = s.slice(i);
      if ((m = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest))) { out.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_π][A-Za-z0-9_π]*/.exec(rest))) { out.push({ t: 'id', v: m[0] }); i += m[0].length; continue; }
      if ('+-*/^%(),'.indexOf(c) >= 0) { out.push({ t: 'op', v: c }); i++; continue; }
      throw new Error("Unexpected character '" + c + "'");
    }
    return out;
  }

  /**
   * Compiles an expression into a closure (s) => number, where s is the array of parameter values.
   * scope: { params:[], fns:{nom:arity}, consts:{nom:true}, rt:{fns:{}, consts:{}} }
   */
  function compile(src, scope) {
    var tk = tokenize(src), p = 0, rt = scope.rt;
    function isOp(o) { var k = tk[p]; return !!k && k.t === 'op' && k.v === o; }
    function expect(o) { if (!isOp(o)) throw new Error("'" + o + "' expected"); p++; }

    function expr() {
      var l = term();
      while (isOp('+') || isOp('-')) {
        var o = tk[p++].v, a = l, b = term();
        l = o === '+' ? function (s) { return a(s) + b(s); } : function (s) { return a(s) - b(s); };
      }
      return l;
    }
    function term() {
      var l = unary();
      for (;;) {
        var k = tk[p], a = l, b;
        if (k && k.t === 'op' && (k.v === '*' || k.v === '/' || k.v === '%')) {
          p++; b = unary();
          if (k.v === '*') l = (function (a, b) { return function (s) { return a(s) * b(s); }; })(a, b);
          else if (k.v === '/') l = (function (a, b) { return function (s) { return a(s) / b(s); }; })(a, b);
          else l = (function (a, b) { return function (s) { return a(s) % b(s); }; })(a, b);
        } else if (k && (k.t === 'num' || k.t === 'id' || (k.t === 'op' && k.v === '('))) {
          b = power(); // implicit multiplication: 2x, 3(x+1), x sin(x)
          l = (function (a, b) { return function (s) { return a(s) * b(s); }; })(a, b);
        } else break;
      }
      return l;
    }
    function unary() {
      if (isOp('-')) { p++; var a = unary(); return function (s) { return -a(s); }; }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      var base = primary();
      if (isOp('^')) { p++; var e = unary(); return function (s) { return Math.pow(base(s), e(s)); }; }
      return base;
    }
    function args() {
      var list = [];
      expect('(');
      if (!isOp(')')) { do { list.push(expr()); } while (isOp(',') && ++p); }
      expect(')');
      return list;
    }
    function primary() {
      var k = tk[p++];
      if (!k) throw new Error('Incomplete expression');
      if (k.t === 'num') { var v = k.v; return function () { return v; }; }
      if (k.t === 'op' && k.v === '(') { var e = expr(); expect(')'); return e; }
      if (k.t === 'id') {
        var name = k.v, low = name.toLowerCase(), call = isOp('(');
        var pi = scope.params.indexOf(name);
        if (pi >= 0) return function (s) { return s[pi]; };
        if (call && Object.prototype.hasOwnProperty.call(scope.fns, name)) {
          var n = name, ar = scope.fns[name], al = args();
          if (al.length !== ar) throw new Error("'" + n + "' expects " + ar + ' argument(s)');
          return function (s) {
            var f = rt.fns[n]; if (!f) return NaN;
            var vals = new Array(al.length);
            for (var i = 0; i < al.length; i++) vals[i] = al[i](s);
            return f(vals);
          };
        }
        if (call && Object.prototype.hasOwnProperty.call(FUNCS, low)) {
          var fn = FUNCS[low], a2 = args();
          if (a2.length === 1) { var a0 = a2[0]; return function (s) { return fn(a0(s)); }; }
          return function (s) { var v = []; for (var i = 0; i < a2.length; i++) v.push(a2[i](s)); return fn.apply(null, v); };
        }
        if (Object.prototype.hasOwnProperty.call(scope.consts, name)) return function () { return rt.consts[name]; };
        if (Object.prototype.hasOwnProperty.call(CONSTS, low)) { var cv = CONSTS[low]; return function () { return cv; }; }
        if (call) throw new Error("Unknown function '" + name + "'");
        throw new Error("Unknown variable '" + name + "'");
      }
      throw new Error("Unexpected symbol '" + k.v + "'");
    }

    var f = expr();
    if (p < tk.length) throw new Error("Unexpected symbol '" + tk[p].v + "'");
    return f;
  }

  function splitTop(str, sep) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < str.length; i++) {
      var c = str[i];
      if (c === '(') depth++; else if (c === ')') depth--;
      if (c === sep && depth === 0) { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur);
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Parser for the .math language                                             */
  /* ------------------------------------------------------------------ */
  var CONFIG_KEYS = ['size', 'bg', 'background', 'range', 'xrange', 'yrange', 'view', 'grid', 'axes', 'axis',
    'ticks', 'labels', 'legend', 'title', 'aspect', 'gridcolor', 'axiscolor', 'textcolor', 'padding'];
  var PROP_KEYS = ['color', 'colour', 'width', 'thickness', 'dash', 'dashed', 'label', 'name', 'opacity', 'alpha',
    'domain', 'cut', 'clipy', 'ends', 'fill', 'polar', 'radius', 'style'];

  function stripComments(src) {
    // "SIZE://(...)": the // is part of the syntax, neutralise it before stripping comments.
    var s = src.replace(/(\bSIZE\b[ \t]*:?[ \t]*)\/\//gi, function (m, a) { return a + '  '; });
    s = s.replace(/\/\*[\s\S]*?\*\//g, function (m) { return m.replace(/[^\n]/g, ' '); });
    var out = '', inStr = false, q = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (inStr) { if (c === q) inStr = false; out += c; continue; }
      if (c === '"' || c === "'") { inStr = true; q = c; out += c; continue; }
      if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; out += '\n'; continue; }
      out += c;
    }
    return out;
  }

  function splitStatements(src) {
    var out = [], cur = '', line = 1, startLine = 1, inStr = false, q = '';
    function push() { var t = cur.trim(); if (t) out.push({ text: t, line: startLine }); cur = ''; }
    for (var i = 0; i < src.length; i++) {
      var c = src[i];
      if (inStr) { cur += c; if (c === q) inStr = false; if (c === '\n') line++; continue; }
      if (c === '"' || c === "'") { inStr = true; q = c; if (!cur.trim()) startLine = line; cur += c; continue; }
      if (c === ';' || c === '\n') { push(); if (c === '\n') line++; startLine = line; continue; }
      if (!cur.trim()) startLine = line;
      cur += c;
    }
    push();
    return out;
  }

  function parse(source) {
    var errors = [];
    var cfg = {
      width: 1200, height: 800, bg: { color: '#ffffff', opacity: 1 }, x: null, y: null,
      grid: true, axes: true, ticks: true, legend: null, title: '', equal: false,
      gridColor: null, axisColor: null, textColor: null, padding: 0
    };
    var items = [], rt = { fns: {}, consts: {} };
    var scope = { params: [], fns: {}, consts: {}, rt: rt };
    var stmts = splitStatements(stripComments(String(source || '')));
    var last = null;

    function err(st, msg) { errors.push({ line: st.line, message: msg, text: st.text }); }
    var DEF = /^([A-Za-z_π][A-Za-z0-9_π]*)\s*(?:\(\s*([^)]*?)\s*\))?\s*=(?!=)\s*(.+)$/;
    var CFG = new RegExp('^(' + CONFIG_KEYS.join('|') + ')\\s*(?::|->|=|\\()\\s*(.*)$', 'i');
    var PROP = /^(?:set)?([A-Za-z]+)\s*(?:->|=>|:)\s*(.+)$/i;

    // Pass 1: function/constant names and arities (allows forward references)
    stmts.forEach(function (st) {
      if (CFG.test(st.text)) return;
      var m = DEF.exec(st.text);
      if (!m) return;
      if (m[2] !== undefined && m[2] !== '') scope.fns[m[1]] = m[2].split(',').length;
      else if (m[2] === undefined && m[1] !== 'y') scope.consts[m[1]] = true;
    });

    function evalConst(str) {
      var f = compile(str, { params: [], fns: scope.fns, consts: scope.consts, rt: rt });
      var v = f([]);
      if (typeof v !== 'number' || isNaN(v)) throw new Error('Numeric value expected: ' + str);
      return v;
    }
    function numList(str) { return splitTop(str, ',').map(function (s) { return evalConst(s.trim()); }); }
    function parseIntervals(str) {
      var t = str.trim(), groups = [], depth = 0, start = -1;
      for (var i = 0; i < t.length; i++) {
        var c = t[i];
        if (c === '[' || c === '(') { if (depth === 0) start = i + 1; depth++; }
        else if (c === ']' || c === ')') { depth--; if (depth === 0 && start >= 0) { groups.push(t.slice(start, i)); start = -1; } }
      }
      if (depth !== 0) throw new Error('Unbalanced brackets in interval list');
      var rest = t.replace(/^\s+|\s+$/g, '');
      var list = groups.length && /^[\[(]/.test(rest) && /[\])]$/.test(rest) && groups.length * 2 <= rest.length ? groups : [t];
      return list.map(function (g) {
        var n = numList(g);
        if (n.length !== 2) throw new Error('An interval is "min, max"');
        return n;
      });
    }
    function bool(v) { return /^(on|true|yes|1)$/i.test(v.trim()); }
    function unq(v) { return v.trim().replace(/^["']|["']$/g, ''); }

    stmts.forEach(function (st) {
      try {
        var t = st.text, m;

        // SIZE
        if ((m = /^SIZE\b\s*(?::|=)?\s*[\(\{\[]?\s*([\d.]+)\s*(?:px)?\s*(?:[,xX×]\s*([\d.]+)\s*(?:px)?)?\s*[\)\}\]]?$/i.exec(t))) {
          var w = parseFloat(m[1]), h = m[2] ? parseFloat(m[2]) : w;
          if (!(w >= 16 && h >= 16)) throw new Error('SIZE too small (min 16px)');
          if (w > MAX_SIDE || h > MAX_SIDE) throw new Error('SIZE too large (max ' + MAX_SIDE + 'px)');
          cfg.width = Math.round(w); cfg.height = Math.round(h);
          return;
        }

        // Global settings
        if ((m = CFG.exec(t))) {
          var key = m[1].toLowerCase(), val = m[2].trim();
          switch (key) {
            case 'size': throw new Error('Format: SIZE: {1200px, 1300px}');
            case 'bg': case 'background':
              var c = parseColor(val); if (!c) throw new Error('Invalid colour: ' + val);
              cfg.bg = c; break;
            case 'gridcolor': case 'axiscolor': case 'textcolor':
              var c2 = parseColor(val); if (!c2) throw new Error('Invalid colour: ' + val);
              cfg[key.replace('color', 'Color')] = c2; break;
            case 'range': case 'view': {
              var mx = /x\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/i.exec(val), my = /y\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/i.exec(val);
              if (mx || my) {
                if (mx) cfg.x = [evalConst(mx[1]), evalConst(mx[2])];
                if (my) cfg.y = [evalConst(my[1]), evalConst(my[2])];
              } else {
                var n = numList(val.replace(/^\(|\)$/g, ''));
                if (n.length === 2) cfg.x = n; else if (n.length === 4) { cfg.x = [n[0], n[1]]; cfg.y = [n[2], n[3]]; }
                else throw new Error('RANGE: x(min,max) y(min,max)');
              }
              break;
            }
            case 'xrange': case 'yrange': {
              var n2 = numList(val.replace(/^\(|\)$/g, ''));
              if (n2.length !== 2) throw new Error(key.toUpperCase() + ': min, max');
              cfg[key === 'xrange' ? 'x' : 'y'] = n2; break;
            }
            case 'grid': cfg.grid = bool(val); break;
            case 'axes': case 'axis': cfg.axes = bool(val); break; // lines only; use TICKS: off for the numbers
            case 'ticks': case 'labels': cfg.ticks = bool(val); break;
            case 'legend': cfg.legend = bool(val); break;
            case 'title': cfg.title = unq(val); break;
            case 'aspect': cfg.equal = /^(equal|1|1:1|square)$/i.test(unq(val)); break;
            case 'padding': cfg.padding = clamp(evalConst(val), 0, 1000); break;
          }
          return;
        }

        // Properties (setColor -> ..., width -> ...) applied to the previous element
        if ((m = PROP.exec(t)) && PROP_KEYS.indexOf(m[1].toLowerCase()) >= 0) {
          if (!last) throw new Error('Property with no preceding function to apply it to');
          var pk = m[1].toLowerCase(), pv = m[2].trim(), pr = last.props;
          switch (pk) {
            case 'color': case 'colour': {
              var pc = parseColor(pv); if (!pc) throw new Error('Invalid colour: ' + pv);
              pr.color = pc; break;
            }
            case 'fill': {
              if (/^(on|true|yes)$/i.test(pv)) pr.fill = true;
              else if (/^(off|false|no)$/i.test(pv)) pr.fill = false;
              else { var fc = parseColor(pv); if (!fc) throw new Error('Invalid colour: ' + pv); pr.fill = fc; }
              break;
            }
            case 'width': case 'thickness': pr.width = clamp(evalConst(pv), 0.1, 200); break;
            case 'radius': pr.radius = clamp(evalConst(pv), 0.5, 500); break;
            case 'opacity': case 'alpha': pr.opacity = clamp(evalConst(pv), 0, 1); break;
            case 'dash': case 'dashed': case 'style': {
              var low = pv.toLowerCase();
              if (low === 'solid' || low === 'off' || low === 'none') pr.dash = null;
              else if (low === 'dashed' || low === 'dash' || low === 'true' || low === 'on') pr.dash = [8, 6];
              else if (low === 'dotted' || low === 'dot') pr.dash = [2, 6];
              else { var d = numList(pv.replace(/^\(|\)$/g, '')); pr.dash = d.length ? d : null; }
              break;
            }
            case 'label': case 'name': pr.label = unq(pv); break;
            case 'polar': pr.polar = /^(on|true|yes|1)$/i.test(pv); break;
            case 'domain': case 'cut': {
              // setCut -> -3, 3          one piece
              // setCut -> [-3,-1] [1,3]  several pieces (use inf / -inf for open ends)
              var iv = parseIntervals(pv);
              iv.forEach(function (d) { if (!(d[0] < d[1])) throw new Error(pk + ': each interval needs min < max'); });
              pr.cut = iv; break;
            }
            case 'clipy': {
              var cy = numList(pv.replace(/^[\[(]|[\])]$/g, ''));
              if (cy.length !== 2 || !(cy[0] < cy[1])) throw new Error('setClipY -> min, max (min < max)');
              pr.clipY = cy; break;
            }
            case 'ends': {
              var ev = pv.toLowerCase().replace(/["']/g, '');
              if (['open', 'closed', 'none'].indexOf(ev) < 0) throw new Error('setEnds -> open | closed | none');
              pr.ends = ev; break;
            }
          }
          return;
        }

        // Shapes: point(...), line(...), circle(...), text(...)
        if ((m = /^(points?|line|circle|text)\s*\((.*)\)$/i.exec(t))) {
          var kind = m[1].toLowerCase().replace(/^points$/, 'point'), item = { kind: kind, line: st.line, props: {} };
          if (kind === 'text') {
            var parts = splitTop(m[2], ',');
            if (parts.length < 3) throw new Error('text(x, y, "text")');
            item.x = evalConst(parts[0]); item.y = evalConst(parts[1]); item.text = unq(parts.slice(2).join(','));
          } else {
            var nums = numList(m[2]);
            if (kind === 'point') { if (!nums.length || nums.length % 2) throw new Error('point(x1, y1, x2, y2, …)'); item.pts = nums; }
            else if (kind === 'line') { if (nums.length !== 4) throw new Error('line(x1, y1, x2, y2)'); item.pts = nums; }
            else { if (nums.length !== 3) throw new Error('circle(cx, cy, r)'); item.pts = nums; }
          }
          items.push(item); last = item;
          return;
        }

        // Definitions: f(x) = ..., y = ..., a = 3, c(t) = (cos(t), sin(t))
        if ((m = DEF.exec(t))) {
          var name = m[1], rhs = m[3].trim();
          var hasParams = m[2] !== undefined && m[2] !== '';
          if (!hasParams && name !== 'y' && m[2] === undefined) {
            rt.consts[name] = evalConst(rhs);
            last = null;
            return;
          }
          var params = hasParams ? m[2].split(',').map(function (s) { return s.trim(); }) : ['x'];
          params.forEach(function (pn) { if (!/^[A-Za-z_π][A-Za-z0-9_π]*$/.test(pn)) throw new Error("Invalid parameter '" + pn + "'"); });
          var sc = { params: params, fns: scope.fns, consts: scope.consts, rt: rt };
          var inner = /^\((.*)\)$/.exec(rhs), comps = inner ? splitTop(inner[1], ',') : [rhs];
          var it = { kind: 'fn', name: name, params: params, line: st.line, props: {}, src: rhs };
          if (comps.length === 2) {
            if (params.length !== 1) throw new Error('A parametric curve takes a single parameter');
            it.kind = 'param'; it.fx = compile(comps[0], sc); it.fy = compile(comps[1], sc);
          } else if (comps.length === 1) {
            if (params.length !== 1) {
              // multi-parameter function: usable by others, not plotted
              var fN = compile(rhs, sc); rt.fns[name] = fN;
              last = null; return;
            }
            it.fn = compile(rhs, sc);
          } else throw new Error('Expression with 1 or 2 components expected');
          if (name !== 'y') rt.fns[name] = it.kind === 'fn' ? it.fn : null;
          items.push(it); last = it;
          return;
        }

        throw new Error('Unrecognised statement');
      } catch (e) {
        err(st, e.message);
      }
    });

    return { config: cfg, items: items, errors: errors, runtime: rt };
  }

  /* ------------------------------------------------------------------ */
  /* SVG rendering                                                           */
  /* ------------------------------------------------------------------ */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function r2(v) { return Math.round(v * 100) / 100; }

  function niceStep(range, target) {
    var raw = range / Math.max(1, target), mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
  }
  function fmt(v, step) {
    if (Math.abs(v) < step * 1e-9) return '0';
    var a = Math.abs(v);
    if (a >= 1e6 || a < 1e-4) return v.toExponential(1).replace('e+', 'e');
    var dec = clamp(-Math.floor(Math.log10(step) + 1e-9), 0, 8);
    return v.toFixed(dec);
  }

  function safe(f, s) { try { return f(s); } catch (e) { return NaN; } }

  function render(source, options) {
    var parsed = typeof source === 'string' ? parse(source) : source;
    var opt = options || {};
    // Export-time overrides (they never modify the .math source):
    //   grid / axes / ticks / legend / title : true | false
    //   background : 'transparent' | any colour accepted by parseColor (hex, rgba(), hsl(), name)
    var cfg = {}, items = parsed.items;
    for (var ck in parsed.config) cfg[ck] = parsed.config[ck];
    ['grid', 'axes', 'ticks', 'legend'].forEach(function (k) { if (typeof opt[k] === 'boolean') cfg[k] = opt[k]; });
    if (opt.title === false) cfg.title = '';
    if (opt.background) {
      var obg = parseColor(opt.background);
      if (obg) cfg.bg = obg;
    }
    var W = cfg.width, H = cfg.height;
    var bgHex = cfg.bg.color === 'none' ? '#ffffff' : cfg.bg.color;
    var dark = cfg.bg.opacity > 0.3 && luminance(bgHex) < 0.45;
    var gridC = cfg.gridColor || { color: dark ? '#ffffff' : '#000000', opacity: dark ? 0.1 : 0.08 };
    var axisC = cfg.axisColor || { color: dark ? '#e2e8f0' : '#1f2937', opacity: 0.85 };
    var textC = cfg.textColor || { color: dark ? '#cbd5e1' : '#374151', opacity: 1 };
    var fs = clamp(Math.min(W, H) / 55, 11, 30);
    var pad = cfg.padding || 0;
    var PW = W - 2 * pad, PH = H - 2 * pad;

    // -- X range
    var x0 = -10, x1 = 10;
    if (cfg.x) { x0 = cfg.x[0]; x1 = cfg.x[1]; }
    if (!(x1 > x0)) { x0 = -10; x1 = 10; }
    // -- Sampling (also used for Y auto-scaling)
    var N = clamp(Math.round(PW * 1.5), 200, 6000);
    var samples = [];
    function sampleIntervals(intervals, at) {
      // Samples each interval separately; NaN separates the pieces so they are never joined.
      var xs = [], ys = [], total = 0, ends = [];
      intervals.forEach(function (d) { total += d[1] - d[0]; });
      intervals.forEach(function (d, k) {
        var n = Math.max(40, Math.round(N * (d[1] - d[0]) / total));
        if (k > 0) { xs.push(NaN); ys.push(NaN); }
        for (var i = 0; i <= n; i++) { var t = d[0] + (d[1] - d[0]) * i / n, pt = at(t); xs.push(pt[0]); ys.push(pt[1]); }
        ends.push([at(d[0]), at(d[1])]);
      });
      return { xs: xs, ys: ys, ends: ends };
    }
    function finiteIv(list, lo, hi) {
      return list.map(function (d) { return [isFinite(d[0]) ? d[0] : lo, isFinite(d[1]) ? d[1] : hi]; }).filter(function (d) { return d[1] > d[0]; });
    }
    items.forEach(function (it, idx) {
      var pr = it.props, smp;
      if (it.kind === 'fn' && pr.polar) {
        smp = sampleIntervals(finiteIv(pr.cut || [[0, 2 * Math.PI]], 0, 2 * Math.PI), function (th) { var rr = safe(it.fn, [th]); return [rr * Math.cos(th), rr * Math.sin(th)]; });
      } else if (it.kind === 'fn') {
        smp = sampleIntervals(finiteIv(pr.cut || [[x0, x1]], x0, x1), function (xv) { return [xv, safe(it.fn, [xv])]; });
      } else if (it.kind === 'param') {
        smp = sampleIntervals(finiteIv(pr.cut || [[0, 2 * Math.PI]], 0, 2 * Math.PI), function (t) { return [safe(it.fx, [t]), safe(it.fy, [t])]; });
      } else return;
      if (pr.clipY) { // keep only the part of the stroke inside the y band
        for (var i = 0; i < smp.ys.length; i++) if (smp.ys[i] < pr.clipY[0] || smp.ys[i] > pr.clipY[1]) { smp.xs[i] = NaN; smp.ys[i] = NaN; }
      }
      samples[idx] = smp;
    });

    // No X range and only polar/parametric data: fit X to the data
    if (!cfg.x && items.length && items.every(function (it) { return it.kind === 'param' || (it.kind === 'fn' && it.props.polar) || it.kind === 'point' || it.kind === 'circle'; })) {
      var ex = collectExtent(items, samples, 'x');
      if (ex) { var mx = (ex[1] - ex[0]) * 0.1 || 1; x0 = ex[0] - mx; x1 = ex[1] + mx; }
    }

    var y0, y1;
    if (cfg.y) { y0 = cfg.y[0]; y1 = cfg.y[1]; }
    else {
      var vals = [];
      items.forEach(function (it, idx) {
        var s = samples[idx];
        if (s) for (var q = 0; q < s.ys.length; q++) {
          if (isFinite(s.ys[q]) && (it.kind !== 'param' && !it.props.polar ? true : s.xs[q] >= x0 && s.xs[q] <= x1)) vals.push(s.ys[q]);
        }
      });
      items.forEach(function (it) {
        if (it.kind === 'point') for (var q = 1; q < it.pts.length; q += 2) vals.push(it.pts[q]);
        if (it.kind === 'circle') { vals.push(it.pts[1] - it.pts[2], it.pts[1] + it.pts[2]); }
        if (it.kind === 'line') vals.push(it.pts[1], it.pts[3]);
      });
      if (!vals.length) { y0 = -10; y1 = 10; }
      else {
        vals.sort(function (a, b) { return a - b; });
        var lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.ceil(vals.length * 0.98) - 1];
        if (lo === hi) { lo -= 1; hi += 1; }
        var mg = (hi - lo) * 0.1; y0 = lo - mg; y1 = hi + mg;
        if (y0 > 0 && y0 < (y1 - y0) * 0.5) y0 = Math.min(y0, -(y1 - y0) * 0.05);
        if (y1 < 0 && -y1 < (y1 - y0) * 0.5) y1 = Math.max(y1, (y1 - y0) * 0.05);
      }
    }
    if (!(y1 > y0)) { y0 = -10; y1 = 10; }
    if (cfg.equal) {
      var ppu = PW / (x1 - x0), cy = (y0 + y1) / 2, hy = PH / ppu / 2;
      if (cfg.y) { var ppuY = PH / (y1 - y0); if (ppuY < ppu) { ppu = ppuY; var cx = (x0 + x1) / 2, hx = PW / ppu / 2; x0 = cx - hx; x1 = cx + hx; hy = PH / ppu / 2; } }
      y0 = cy - hy; y1 = cy + hy;
    }

    function sx(x) { return pad + (x - x0) / (x1 - x0) * PW; }
    function sy(y) { return pad + PH - (y - y0) / (y1 - y0) * PH; }
    function stroke(c, extra) { return 'stroke="' + c.color + '"' + (c.opacity < 1 ? ' stroke-opacity="' + r2(c.opacity) + '"' : '') + (extra || ''); }
    function fillA(c) { return 'fill="' + c.color + '"' + (c.opacity < 1 ? ' fill-opacity="' + r2(c.opacity) + '"' : ''); }

    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" font-family="Inter, \'Segoe UI\', Roboto, Arial, sans-serif">');
    out.push('<defs><clipPath id="klax-plot"><rect x="' + pad + '" y="' + pad + '" width="' + PW + '" height="' + PH + '"/></clipPath></defs>');
    if (cfg.bg.color !== 'none' && cfg.bg.opacity > 0) out.push('<rect width="' + W + '" height="' + H + '" ' + fillA(cfg.bg) + '/>');

    var stepX = niceStep(x1 - x0, PW / (fs * 7)), stepY = niceStep(y1 - y0, PH / (fs * 5));
    var gx = [], gy = [], v;
    for (v = Math.ceil(x0 / stepX - 1e-9) * stepX; v <= x1 + stepX * 1e-9; v += stepX) gx.push(Math.round(v / stepX) * stepX);
    for (v = Math.ceil(y0 / stepY - 1e-9) * stepY; v <= y1 + stepY * 1e-9; v += stepY) gy.push(Math.round(v / stepY) * stepY);

    if (cfg.grid) {
      out.push('<g clip-path="url(#klax-plot)" ' + stroke(gridC, ' stroke-width="1"') + '>');
      gx.forEach(function (g) { out.push('<line x1="' + r2(sx(g)) + '" y1="' + pad + '" x2="' + r2(sx(g)) + '" y2="' + (H - pad) + '"/>'); });
      gy.forEach(function (g) { out.push('<line x1="' + pad + '" y1="' + r2(sy(g)) + '" x2="' + (W - pad) + '" y2="' + r2(sy(g)) + '"/>'); });
      out.push('</g>');
    }
    var ax = sx(0), ay = sy(0);
    if (cfg.axes) {
      out.push('<g clip-path="url(#klax-plot)" ' + stroke(axisC, ' stroke-width="' + r2(Math.max(1.5, fs / 8)) + '"') + '>');
      if (ay >= pad && ay <= H - pad) out.push('<line x1="' + pad + '" y1="' + r2(ay) + '" x2="' + (W - pad) + '" y2="' + r2(ay) + '"/>');
      if (ax >= pad && ax <= W - pad) out.push('<line x1="' + r2(ax) + '" y1="' + pad + '" x2="' + r2(ax) + '" y2="' + (H - pad) + '"/>');
      out.push('</g>');
    }

    // -- Elements
    out.push('<g clip-path="url(#klax-plot)" fill="none" stroke-linecap="round" stroke-linejoin="round">');
    var legend = [];
    var colorIdx = 0;
    items.forEach(function (it, idx) {
      var pr = it.props;
      var col = pr.color || { color: PALETTE[colorIdx++ % PALETTE.length], opacity: 1 };
      if (pr.opacity != null) col = { color: col.color, opacity: col.opacity * pr.opacity };
      var sw = pr.width || Math.max(2, fs / 5.5);
      var dash = pr.dash ? ' stroke-dasharray="' + pr.dash.join(' ') + '"' : '';
      var label = pr.label || (cfg.legend === true && (it.kind === 'fn' || it.kind === 'param') ? (it.name + '(' + it.params.join(',') + ')') : '');
      if (label && (it.kind === 'fn' || it.kind === 'param')) legend.push({ label: label, col: col, dash: pr.dash });

      if (it.kind === 'fn' || it.kind === 'param') {
        var s = samples[idx], segs = [], cur = [], prev = null, big = H * 3;
        for (var i = 0; i < s.xs.length; i++) {
          var X = s.xs[i], Y = s.ys[i];
          if (!isFinite(X) || !isFinite(Y)) { if (cur.length) segs.push(cur); cur = []; prev = null; continue; }
          var px = sx(X), py = sy(Y);
          if (Math.abs(py) > 1e6 || Math.abs(px) > 1e6) { if (cur.length) segs.push(cur); cur = []; prev = null; continue; }
          if (prev && (Math.abs(py - prev[1]) > big || Math.abs(px - prev[0]) > big)) { if (cur.length) segs.push(cur); cur = []; }
          cur.push([px, py]); prev = [px, py];
        }
        if (cur.length) segs.push(cur);
        var d = '', fillD = '';
        var base = clamp(ay, pad, H - pad);
        segs.forEach(function (sg) {
          if (sg.length < 2) return;
          var part = 'M' + sg.map(function (p) { return r2(p[0]) + ' ' + r2(p[1]); }).join('L');
          d += part;
          fillD += part + 'L' + r2(sg[sg.length - 1][0]) + ' ' + r2(base) + 'L' + r2(sg[0][0]) + ' ' + r2(base) + 'Z';
        });
        if (pr.fill) {
          var fc = pr.fill === true ? { color: col.color, opacity: 0.18 } : pr.fill;
          out.push('<path d="' + fillD + '" ' + fillA(fc) + ' stroke="none"/>');
        }
        if (d) out.push('<path d="' + d + '" ' + stroke(col, ' stroke-width="' + r2(sw) + '"' + dash) + '/>');
        if (pr.ends && pr.ends !== 'none' && s.ends) {
          var er = Math.max(4, sw * 1.9), bgFill = cfg.bg.color === 'none' ? '#ffffff' : cfg.bg.color;
          s.ends.forEach(function (pair) {
            pair.forEach(function (pt) {
              if (!isFinite(pt[0]) || !isFinite(pt[1])) return;
              if (pr.clipY && (pt[1] < pr.clipY[0] || pt[1] > pr.clipY[1])) return;
              out.push('<circle cx="' + r2(sx(pt[0])) + '" cy="' + r2(sy(pt[1])) + '" r="' + r2(er) + '" ' +
                (pr.ends === 'open' ? 'fill="' + bgFill + '" ' + stroke(col, ' stroke-width="' + r2(sw) + '"') : fillA(col) + ' stroke="none"') + '/>');
            });
          });
        }
      } else if (it.kind === 'point') {
        var rad = pr.radius || Math.max(4, fs / 3);
        for (var q = 0; q < it.pts.length; q += 2) {
          out.push('<circle cx="' + r2(sx(it.pts[q])) + '" cy="' + r2(sy(it.pts[q + 1])) + '" r="' + r2(rad) + '" ' + fillA(col) + ' stroke="none"/>');
          if (pr.label) out.push('<text x="' + r2(sx(it.pts[q]) + rad + 4) + '" y="' + r2(sy(it.pts[q + 1]) - rad - 2) + '" font-size="' + r2(fs) + '" ' + fillA(textC) + ' stroke="none">' + esc(pr.label) + '</text>');
        }
      } else if (it.kind === 'line') {
        out.push('<line x1="' + r2(sx(it.pts[0])) + '" y1="' + r2(sy(it.pts[1])) + '" x2="' + r2(sx(it.pts[2])) + '" y2="' + r2(sy(it.pts[3])) + '" ' + stroke(col, ' stroke-width="' + r2(sw) + '"' + dash) + '/>');
        if (pr.label) legend.push({ label: pr.label, col: col, dash: pr.dash });
      } else if (it.kind === 'circle') {
        var fcc = pr.fill ? (pr.fill === true ? { color: col.color, opacity: 0.18 } : pr.fill) : null;
        out.push('<ellipse cx="' + r2(sx(it.pts[0])) + '" cy="' + r2(sy(it.pts[1])) + '" rx="' + r2(Math.abs(it.pts[2]) * PW / (x1 - x0)) + '" ry="' + r2(Math.abs(it.pts[2]) * PH / (y1 - y0)) + '" ' + (fcc ? fillA(fcc) : 'fill="none"') + ' ' + stroke(col, ' stroke-width="' + r2(sw) + '"' + dash) + '/>');
        if (pr.label) legend.push({ label: pr.label, col: col, dash: pr.dash });
      } else if (it.kind === 'text') {
        var tc = pr.color || textC;
        out.push('<text x="' + r2(sx(it.x)) + '" y="' + r2(sy(it.y)) + '" font-size="' + r2(pr.radius ? pr.radius * 3 : fs * 1.2) + '" ' + fillA(tc) + ' stroke="none">' + esc(it.text) + '</text>');
      }
    });
    out.push('</g>');

    // -- Tick labels
    if (cfg.ticks) {
      var halo = cfg.bg.color === 'none' ? '' : ' paint-order="stroke" stroke="' + bgHex + '" stroke-width="' + r2(fs / 3) + '" stroke-linejoin="round"';
      out.push('<g font-size="' + r2(fs) + '" ' + fillA(textC) + halo + '>');
      var ly = clamp(ay + fs + 5, pad + fs + 4, H - pad - 6);
      gx.forEach(function (g) {
        if (Math.abs(g) < stepX * 1e-9) return;
        var X = sx(g); if (X < pad + 8 || X > W - pad - 8) return;
        out.push('<text x="' + r2(X) + '" y="' + r2(ly) + '" text-anchor="middle">' + fmt(g, stepX) + '</text>');
      });
      var onRight = ax > W - pad - fs * 4;
      var lx = onRight ? W - pad - 6 : clamp(ax + 7, pad + 6, W - pad - fs * 4);
      gy.forEach(function (g) {
        if (Math.abs(g) < stepY * 1e-9) return;
        var Y = sy(g); if (Y < pad + fs || Y > H - pad - 4) return;
        out.push('<text x="' + r2(lx) + '" y="' + r2(Y - 4) + '"' + (onRight ? ' text-anchor="end"' : '') + '>' + fmt(g, stepY) + '</text>');
      });
      if (ax >= pad && ax <= W - pad && ay >= pad && ay <= H - pad) out.push('<text x="' + r2(ax + 7) + '" y="' + r2(Math.min(ay + fs + 5, H - pad - 6)) + '">0</text>');
      out.push('</g>');
    }

    // -- Title & legend
    var topY = pad;
    if (cfg.title) {
      out.push('<text x="' + W / 2 + '" y="' + r2(pad + fs * 2.1) + '" text-anchor="middle" font-size="' + r2(fs * 1.7) + '" font-weight="600" ' + fillA(textC) + '>' + esc(cfg.title) + '</text>');
      topY = pad + fs * 3;
    }
    if (legend.length && cfg.legend !== false) {
      var lw = Math.max.apply(null, legend.map(function (l) { return l.label.length; })) * fs * 0.62 + fs * 3.6, lh = legend.length * fs * 1.7 + fs;
      var lx0 = W - pad - lw - fs, ly0 = topY + fs;
      out.push('<g>');
      out.push('<rect x="' + r2(lx0) + '" y="' + r2(ly0) + '" width="' + r2(lw) + '" height="' + r2(lh) + '" rx="' + r2(fs / 2) + '" fill="' + (dark ? '#000000' : '#ffffff') + '" fill-opacity="0.55" stroke="' + axisC.color + '" stroke-opacity="0.25"/>');
      legend.forEach(function (l, i) {
        var yy = ly0 + fs * 1.5 + i * fs * 1.7;
        out.push('<line x1="' + r2(lx0 + fs * 0.7) + '" y1="' + r2(yy - fs * 0.3) + '" x2="' + r2(lx0 + fs * 2.3) + '" y2="' + r2(yy - fs * 0.3) + '" ' + stroke(l.col, ' stroke-width="3" stroke-linecap="round"' + (l.dash ? ' stroke-dasharray="' + l.dash.join(' ') + '"' : '')) + '/>');
        out.push('<text x="' + r2(lx0 + fs * 2.9) + '" y="' + r2(yy) + '" font-size="' + r2(fs) + '" ' + fillA(textC) + '>' + esc(l.label) + '</text>');
      });
      out.push('</g>');
    }
    out.push('</svg>');

    return {
      svg: out.join('\n'), width: W, height: H, errors: parsed.errors, config: cfg,
      view: { x: [x0, x1], y: [y0, y1] }
    };
  }

  function collectExtent(items, samples, axis) {
    var lo = Infinity, hi = -Infinity;
    items.forEach(function (it, idx) {
      var s = samples[idx];
      if (s) (axis === 'x' ? s.xs : s.ys).forEach(function (v) { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
      if (it.kind === 'point') for (var q = axis === 'x' ? 0 : 1; q < it.pts.length; q += 2) { lo = Math.min(lo, it.pts[q]); hi = Math.max(hi, it.pts[q]); }
      if (it.kind === 'circle') { var c = it.pts[axis === 'x' ? 0 : 1]; lo = Math.min(lo, c - it.pts[2]); hi = Math.max(hi, c + it.pts[2]); }
    });
    return isFinite(lo) && hi > lo ? [lo, hi] : null;
  }

  /* ------------------------------------------------------------------ */
  /* Export (browser): PNG / JPEG / WEBP / PDF                       */
  /* ------------------------------------------------------------------ */
  function toRaster(result, mime, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var sc = clamp(opts.scale || 1, 0.1, 8);
      var w = Math.round(result.width * sc), h = Math.round(result.height * sc);
      if (w > 16000 || h > 16000) { reject(new Error('Image too large to export (' + w + '×' + h + ')')); return; }
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var g = c.getContext('2d');
        if (mime !== 'image/png' || opts.opaque) { g.fillStyle = opts.background || '#ffffff'; g.fillRect(0, 0, w, h); }
        g.drawImage(img, 0, 0, w, h);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('Export ' + mime + ' not supported')); }, mime, opts.quality == null ? 0.92 : opts.quality);
      };
      img.onerror = function () { reject(new Error('Could not render the image')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result.svg);
    });
  }

  /** Minimal one-page PDF wrapping a JPEG. */
  function makePdf(jpeg, w, h) {
    var enc = function (s) { var a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 255; return a; };
    var parts = [], offsets = [], len = 0;
    function add(x) { var b = typeof x === 'string' ? enc(x) : x; parts.push(b); len += b.length; }
    function obj(n, body) { offsets[n] = len; add(n + ' 0 obj\n'); add(body); add('\nendobj\n'); }
    add('%PDF-1.4\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + w + ' ' + h + '] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>');
    var content = 'q ' + w + ' 0 0 ' + h + ' 0 0 cm /Im0 Do Q';
    obj(4, '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream');
    offsets[5] = len;
    add('5 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n');
    add(jpeg); add('\nendstream\nendobj\n');
    var xref = len, x = 'xref\n0 6\n0000000000 65535 f \n';
    for (var i = 1; i <= 5; i++) x += ('0000000000' + offsets[i]).slice(-10) + ' 00000 n \n';
    add(x + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    var out = new Uint8Array(len), o = 0;
    parts.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }


  /* ------------------------------------------------------------------ */
  /* Autocompletion (used by the Acode plugin, testable without Acode)  */
  /* ------------------------------------------------------------------ */
  var COLORS = [['#2563eb', 'blue'], ['#dc2626', 'red'], ['#16a34a', 'green'], ['#d97706', 'orange'], ['#9333ea', 'purple'],
    ['#0891b2', 'cyan'], ['#db2777', 'pink'], ['#65a30d', 'lime'], ['#38bdf8', 'sky'], ['#f472b6', 'rose'], ['#a3e635', 'light green'],
    ['#111827', 'near black'], ['#ffffff', 'white'], ['#0f172a', 'dark navy'], ['#f8f5ec', 'paper'],
    ['rgba(37, 99, 235, 0.5)', 'blue 50%'], ['rgba(220, 38, 38, 0.5)', 'red 50%'], ['rgba(0, 0, 0, 0.2)', 'black 20%'], ['transparent', 'no colour']];
  var STARTS = [
    ['SIZE', 'SIZE: {${1:1200}px, ${2:800}px};', 'image size'], ['BG', 'BG: ${1:#ffffff};', 'background'],
    ['TITLE', 'TITLE: "${1:My graph}";', 'title'], ['RANGE', 'RANGE: x(${1:-10}, ${2:10}) y(${3:-6}, ${4:6});', 'visible window'],
    ['XRANGE', 'XRANGE: ${1:-10}, ${2:10};', 'x window'], ['YRANGE', 'YRANGE: ${1:-6}, ${2:6};', 'y window'],
    ['GRID', 'GRID: ${1:on};', 'grid lines'], ['AXES', 'AXES: ${1:on};', 'axis lines'], ['TICKS', 'TICKS: ${1:on};', 'axis numbers'],
    ['LEGEND', 'LEGEND: ${1:on};', 'legend'], ['ASPECT', 'ASPECT: equal;', 'same scale on both axes'],
    ['GRIDCOLOR', 'GRIDCOLOR: ${1:rgba(0, 0, 0, 0.1)};', 'grid colour'], ['AXISCOLOR', 'AXISCOLOR: ${1:#1f2937};', 'axis colour'],
    ['TEXTCOLOR', 'TEXTCOLOR: ${1:#374151};', 'text colour'], ['PADDING', 'PADDING: ${1:40};', 'margin in px'],
    ['function', 'f(x) = ${1:sin(x)}; setColor -> ${2:#2563eb};', 'template'],
    ['parametric', 'c(t) = (${1:cos(t)}, ${2:sin(t)}); setColor -> ${3:#db2777}; setCut -> 0, 2*pi;', 'template'],
    ['polar', 'r(t) = ${1:4*cos(3*t)}; setPolar -> on; setColor -> ${2:#16a34a};', 'template'],
    ['piece', 'g(x) = ${1:x^2}; setCut -> ${2:-2}, ${3:2}; setEnds -> ${4:closed};', 'template: part of a function'],
    ['band', 'h(x) = ${1:3*sin(x)}; setClipY -> ${2:0}, ${3:2};', 'template: keep a y band'],
    ['constant', '${1:a} = ${2:2};', 'template'],
    ['point', 'point(${1:0}, ${2:0}); setColor -> ${3:#111827};', 'shape'], ['line', 'line(${1:-3}, ${2:-1}, ${3:3}, ${4:2}); setColor -> ${5:#d97706};', 'shape'],
    ['circle', 'circle(${1:0}, ${2:0}, ${3:3}); setColor -> ${4:#0891b2};', 'shape'], ['text', 'text(${1:1}, ${2:1}, "${3:label}");', 'shape']
  ];
  var PROPS = [
    ['setColor', 'setColor -> ${1:#2563eb};', 'stroke colour'], ['setWidth', 'setWidth -> ${1:3};', 'stroke width'],
    ['setDash', 'setDash -> ${1:dashed};', 'dash pattern'], ['setOpacity', 'setOpacity -> ${1:0.5};', '0 to 1'],
    ['setLabel', 'setLabel -> "${1:name}";', 'legend text'], ['setFill', 'setFill -> ${1:on};', 'fill under the curve'],
    ['setCut', 'setCut -> ${1:-3}, ${2:3};', 'keep only x from a to b'], ['setClipY', 'setClipY -> ${1:0}, ${2:2};', 'keep only y from a to b'],
    ['setEnds', 'setEnds -> ${1:closed};', 'dots at the ends'], ['setPolar', 'setPolar -> on;', 'polar curve'],
    ['setRadius', 'setRadius -> ${1:5};', 'point radius']
  ];
  var ARGS = { atan2: '${1:y}, ${2:x}', pow: '${1:x}, ${2:2}', mod: '${1:x}, ${2:2}', hypot: '${1:x}, ${2:y}', min: '${1:a}, ${2:b}',
    max: '${1:a}, ${2:b}', clamp: '${1:x}, ${2:0}, ${3:1}', gauss: '${1:x}, ${2:0}, ${3:1}', log: '${1:x}' };

  /**
   * Suggestions for the text before the cursor on the current line.
   * @param {string} before  the line up to the cursor
   * @param {string} [doc]   the whole file (to suggest your own functions and constants)
   * @returns {{caption:string, snippet?:string, value?:string, meta:string, score:number}[]}
   */
  function complete(before, doc) {
    var seg = String(before || '');
    seg = seg.slice(seg.lastIndexOf(';') + 1);
    var out = [], m;
    function add(caption, snippet, meta, score) { out.push({ caption: caption, snippet: snippet, meta: meta, score: score }); }
    function val(caption, meta, score) { out.push({ caption: caption, value: caption, meta: meta, score: score }); }
    function colors(extra) { COLORS.forEach(function (c, i) { val(c[0], c[1], 900 - i); }); (extra || []).forEach(function (e, i) { val(e, 'option', 990 - i); }); }

    // value positions
    if (/(?:^|\s)(?:set)?(?:color|colour)\s*(?:->|=>|:)[^;]*$/i.test(seg) || /^\s*(?:BG|BACKGROUND|GRIDCOLOR|AXISCOLOR|TEXTCOLOR)\s*[:=][^;]*$/i.test(seg)) { colors(); return out; }
    if (/(?:set)?fill\s*(?:->|=>|:)[^;]*$/i.test(seg)) { colors(['on', 'off']); return out; }
    if (/(?:set)?ends\s*(?:->|=>|:)[^;]*$/i.test(seg)) { ['closed', 'open', 'none'].forEach(function (v, i) { val(v, 'ends', 1000 - i); }); return out; }
    if (/(?:set)?(?:dash|dashed|style)\s*(?:->|=>|:)[^;]*$/i.test(seg)) {
      [['dashed', 'dashes'], ['dotted', 'dots'], ['solid', 'no dashes'], ['6,4', 'long dashes'], ['2,6', 'dots']].forEach(function (v, i) { val(v[0], v[1], 1000 - i); }); return out;
    }
    if (/(?:set)?polar\s*(?:->|=>|:)[^;]*$/i.test(seg) || /^\s*(?:GRID|AXES|AXIS|TICKS|LABELS|LEGEND)\s*[:=][^;]*$/i.test(seg)) { val('on', 'switch', 1000); val('off', 'switch', 999); return out; }
    if (/^\s*ASPECT\s*[:=][^;]*$/i.test(seg)) { val('equal', 'same scale', 1000); return out; }
    if (/->|=>/.test(seg)) return out; // other property values are free numbers or text

    var names = userNames(doc || '');
    var atStart = /^\s*[A-Za-z_]*$/.test(seg);
    var inExpr = /=/.test(seg) || /\(/.test(seg);
    if (atStart) {
      STARTS.forEach(function (k, i) { add(k[0], k[1], k[2], 800 - i); });
      PROPS.forEach(function (k, i) { add(k[0], k[1], k[2], 700 - i); });
    }
    if (inExpr || atStart) {
      names.fns.forEach(function (f) { add(f.name, f.name + '(' + f.params.map(function (p, i) { return '${' + (i + 1) + ':' + p + '}'; }).join(', ') + ')', 'your function', 650); });
      names.consts.forEach(function (c) { add(c, c, 'your constant', 640); });
    }
    if (inExpr) {
      FUNCS_LIST().forEach(function (f, i) { add(f, f + '(' + (ARGS[f] || '${1:x}') + ')', 'function', 600 - i * 0.1); });
      ['pi', 'tau', 'e', 'phi', 'inf'].forEach(function (c, i) { add(c, c, 'constant', 590 - i); });
      add('x', 'x', 'variable', 580); add('t', 't', 'variable', 579);
    }
    return out;
  }
  function FUNCS_LIST() { return Object.keys(FUNCS).sort(); }
  function userNames(doc) {
    var fns = [], consts = [], seen = {}, m, re = /^[ \t]*([A-Za-z_π][A-Za-z0-9_π]*)\s*(?:\(\s*([^)]*?)\s*\))?\s*=(?!=)/gm;
    while ((m = re.exec(doc))) {
      var n = m[1];
      if (seen[n] || CONFIG_KEYS.indexOf(n.toLowerCase()) >= 0) continue;
      seen[n] = true;
      if (m[2] !== undefined && m[2] !== '') fns.push({ name: n, params: m[2].split(',').map(function (x) { return x.trim(); }) });
      else if (m[2] === undefined && n !== 'y') consts.push(n);
      else if (m[2] === undefined) { /* y = ... */ }
    }
    return { fns: fns, consts: consts };
  }

  return {
    version: VERSION, complete: complete, EXAMPLE: EXAMPLE, parse: parse, render: render, parseColor: parseColor,
    toRaster: toRaster, makePdf: makePdf, MAX_SIDE: MAX_SIDE,
    FUNCTIONS: Object.keys(FUNCS), CONSTANTS: Object.keys(CONSTS)
  };
});
