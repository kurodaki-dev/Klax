/* Klax Math - Acode plugin.
 * The language core (Klax) and the bundled examples (KLAX_EXAMPLES) are prepended
 * to this file by scripts/build-plugin.js. */
(function () {
  var PLUGIN_ID = 'dev.klax.math';

  /* ---------------- Material icons (Google, Apache License 2.0), 24px filled ---------------- */
  var ICONS = {
    play_arrow: 'M8 5v14l11-7z',
    close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    open_in_full: 'M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z',
    content_copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
    tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
    note_add: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z',
    library_books: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z',
    code: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
    error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    keyboard: 'M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z',
    refresh: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
  };
  function icon(name, size) {
    var s = size || 22;
    return '<svg class="ki" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  }

  /* Klax logo: used for .math files and in the preview toolbar */
  var LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f172a"/>' +
    '<path d="M10 32h44M32 10v44" stroke="#64748b" stroke-width="1.6" fill="none"/>' +
    '<path d="M10 32C16 8 24 8 32 32S48 56 54 32" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
    '<path d="M10 42C22 22 38 22 54 26" stroke="#f472b6" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';
  var LOGO_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent(LOGO_SVG);

  /* ---------------- Settings (kept in localStorage) ---------------- */
  var SETTINGS_KEY = 'klax.settings';
  var settings = null;
  function getSettings() {
    if (settings) return settings;
    var raw = {};
    try { raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; } catch (e) { raw = {}; }
    settings = { fab: raw.fab !== false, complete: raw.complete !== false, keys: KlaxKeys.sanitize(raw.keys, commands) };
    return settings;
  }
  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ } }

  var overlay = null, current = null, liveTimer = null, changeListener = null, bound = null, fab = null, fabTimer = null, modal = null;
  var opts = { format: 'png', scale: 1, quality: 0.92, filename: '', grid: true, axes: true, ticks: true, legend: true, title: true, bg: 'file', color: '#ffffff', alpha: 1 };

  /* ---------------- helpers ---------------- */
  function $(tag, attrs, html) {
    var el = document.createElement(tag);
    for (var k in (attrs || {})) el.setAttribute(k, attrs[k]);
    if (html != null) el.innerHTML = html;
    return el;
  }
  function toast(msg) { try { window.toast(msg, 3000); } catch (e) { console.log('[Klax]', msg); } }
  function activeFile() { try { return editorManager.activeFile; } catch (e) { return null; } }
  function source() { var f = activeFile(); return f && f.session ? f.session.getValue() : ''; }
  function fileName() { var f = activeFile(); return (f && f.name) || 'klax.math'; }
  function baseName() { return fileName().replace(/\.[^.]+$/, '') || 'klax'; }
  function isMath() { return /\.math$/i.test(fileName()); }

  function bgValue() {
    if (opts.bg === 'transparent') return 'transparent';
    if (opts.bg !== 'custom') return undefined;
    var n = parseInt(opts.color.slice(1), 16), a = opts.alpha;
    return a >= 1 ? opts.color : 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function renderOpts() {
    return {
      grid: opts.grid, axes: opts.axes, ticks: opts.ticks,
      legend: opts.legend ? undefined : false, title: opts.title ? undefined : false, background: bgValue()
    };
  }
  function renderNow() { return Klax.render(source(), renderOpts()); }

  /* ---------------- Syntax highlighting (Ace) ---------------- */
  function registerMode() {
    try {
      ace.define('ace/mode/klaxmath_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function (require, exports) {
        var oop = require('ace/lib/oop'), Rules = require('ace/mode/text_highlight_rules').TextHighlightRules;
        var Hl = function () {
          var funcs = Klax.FUNCTIONS.join('|');
          this.$rules = {
            start: [
              { token: 'comment', regex: '//.*$' },
              { token: 'comment', regex: '/\\*', next: 'comment' },
              { token: 'keyword', regex: '\\b(?:SIZE|BG|BACKGROUND|FOND|RANGE|XRANGE|YRANGE|VIEW|GRID|AXES|AXIS|TICKS|LABELS|LEGEND|TITLE|ASPECT|GRIDCOLOR|AXISCOLOR|TEXTCOLOR|PADDING)\\b', caseInsensitive: true },
              { token: 'support.function', regex: '\\b(?:set)?(?:color|colour|width|thickness|dash|dashed|label|name|opacity|alpha|domain|fill|polar|radius|style)(?=\\s*(?:->|=>))', caseInsensitive: true },
              { token: 'keyword.operator', regex: '->|=>' },
              { token: 'string', regex: '"[^"]*"' },
              { token: 'string', regex: "'[^']*'" },
              { token: 'constant.other.color', regex: '#[0-9a-fA-F]{3,8}\\b' },
              { token: 'support.function', regex: '\\b(?:rgba?|hsla?)(?=\\()' },
              { token: 'constant.language', regex: '\\b(?:on|off|true|false|pi|tau|e|phi|inf|equal)\\b' },
              { token: 'constant.numeric', regex: '\\b\\d+(?:\\.\\d+)?(?:px)?\\b|\\.\\d+' },
              { token: 'entity.name.function', regex: '\\b[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\([^)]*\\)\\s*=)' },
              { token: 'support.function', regex: '\\b(?:' + funcs + '|points?|line|circle|text)(?=\\()' },
              { token: 'variable.parameter', regex: '\\b[tx]\\b' },
              { token: 'keyword.operator', regex: '[+\\-*/^%=]' },
              { token: 'punctuation.operator', regex: '[;,]' },
              { token: 'paren.lparen', regex: '[(\\[{]' },
              { token: 'paren.rparen', regex: '[)\\]}]' }
            ],
            comment: [{ token: 'comment', regex: '\\*/', next: 'start' }, { defaultToken: 'comment' }]
          };
        };
        oop.inherits(Hl, Rules);
        exports.KlaxMathHighlightRules = Hl;
      });
      ace.define('ace/mode/klaxmath', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/klaxmath_highlight_rules'], function (require, exports) {
        var oop = require('ace/lib/oop'), Text = require('ace/mode/text').Mode, Rules = require('ace/mode/klaxmath_highlight_rules').KlaxMathHighlightRules;
        var Mode = function () { this.HighlightRules = Rules; this.$behaviours = new (require('ace/mode/behaviour/cstyle').CstyleBehaviour)(); };
        oop.inherits(Mode, Text);
        (function () { this.lineCommentStart = '//'; this.blockComment = { start: '/*', end: '*/' }; this.$id = 'ace/mode/klaxmath'; }).call(Mode.prototype);
        exports.Mode = Mode;
      });
      var modelist = ace.require('ace/ext/modelist');
      if (modelist && modelist.modes && !modelist.modesByName.klaxmath) {
        var m = new modelist.Mode('klaxmath', 'Klax Math', 'math');
        modelist.modes.push(m); modelist.modesByName.klaxmath = m;
      }
    } catch (e) { console.warn('[Klax] Ace mode not registered:', e); }
  }


  /* ---------------- Saving ---------------- */
  function saveBlob(blob, filename) {
    return new Promise(function (resolve) {
      var done = function (where) { toast('Saved: ' + where); resolve(true); };
      try {
        var fsOp = acode.require('fsOperation');
        var dir = (window.cordova && cordova.file && cordova.file.externalRootDirectory) ? cordova.file.externalRootDirectory + 'Download' : null;
        if (dir && fsOp) {
          var reader = new FileReader();
          reader.onload = function () { fsOp(dir).createFile(filename, reader.result).then(function () { done('Download/' + filename); }, fallback); };
          reader.onerror = fallback;
          reader.readAsArrayBuffer(blob);
          return;
        }
      } catch (e) { /* fall through */ }
      fallback();
      function fallback() {
        try {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = filename;
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
          done(filename);
        } catch (e) { toast('Save failed: ' + e.message); resolve(false); }
      }
    });
  }

  function exportImage(format) {
    var fmt = format || opts.format, res = renderNow();
    if (res.errors.length && !res.svg) { toast('Nothing to export'); return Promise.resolve(false); }
    var name = (opts.filename || baseName()).replace(/\.[^.]+$/, '');
    var q = opts.quality, sc = opts.scale, p;
    if (fmt === 'svg') p = Promise.resolve(new Blob([res.svg], { type: 'image/svg+xml' }));
    else if (fmt === 'png') p = Klax.toRaster(res, 'image/png', { scale: sc });
    else if (fmt === 'webp') p = Klax.toRaster(res, 'image/webp', { scale: sc, quality: q });
    else if (fmt === 'jpg') p = Klax.toRaster(res, 'image/jpeg', { scale: sc, quality: q, opaque: true, background: '#ffffff' });
    else if (fmt === 'pdf') {
      p = Klax.toRaster(res, 'image/jpeg', { scale: 1, quality: q, opaque: true, background: '#ffffff' })
        .then(function (b) { return b.arrayBuffer(); })
        .then(function (buf) { return new Blob([Klax.makePdf(new Uint8Array(buf), res.width, res.height)], { type: 'application/pdf' }); });
    } else return Promise.resolve(false);
    toast('Exporting...');
    return p.then(function (blob) { return saveBlob(blob, name + '.' + fmt); })
      .catch(function (e) { toast('Export failed: ' + e.message); return false; });
  }

  function copySvg() {
    var svg = renderNow().svg;
    var done = function () { toast('SVG code copied'); };
    try { cordova.plugins.clipboard.copy(svg); done(); return; } catch (e) { /* next */ }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(svg).then(done, function () { toast('Copy failed'); });
    else toast('Copy not available');
  }

  /* ---------------- Modal list (examples, snippets) ---------------- */
  function pick(title, items, onPick) {
    closeModal();
    modal = $('div', { id: 'klax-modal' });
    var card = $('div', { 'class': 'km-card' });
    var head = $('div', { 'class': 'km-head' }, '<span>' + title + '</span>');
    var x = $('button', { 'class': 'ki-btn', 'aria-label': 'Close' }, icon('close')); x.onclick = closeModal; head.appendChild(x);
    card.appendChild(head);
    items.forEach(function (it) {
      var row = $('button', { 'class': 'km-row' }, '<b>' + it.label + '</b><small>' + (it.hint || '') + '</small>');
      row.onclick = function () { closeModal(); onPick(it); };
      card.appendChild(row);
    });
    modal.appendChild(card);
    modal.onclick = function (e) { if (e.target === modal) closeModal(); };
    document.body.appendChild(modal);
  }
  function closeModal() { if (modal) { modal.remove(); modal = null; } }

  var SNIPPETS = [
    { label: 'Function', hint: 'f(x) = ...', text: 'f(x) = sin(x); setColor -> #2563eb; setWidth -> 3; setLabel -> "f(x)";\n' },
    { label: 'Parametric curve', hint: 'c(t) = (x(t), y(t))', text: 'c(t) = (3*cos(t), 3*sin(t)); setColor -> #db2777; setCut -> 0, 2*pi;\n' },
    { label: 'Polar curve', hint: 'r(t) with setPolar', text: 'r(t) = 4*cos(3*t); setPolar -> on; setColor -> #16a34a;\n' },
    { label: 'Piece of a function', hint: 'setCut + closed / open ends', text: 'g(x) = x^2; setCut -> -2, 2; setEnds -> closed; setColor -> #dc2626;\n' },
    { label: 'Keep a horizontal band', hint: 'setClipY', text: 'h(x) = 3*sin(x); setClipY -> 0, 2; setColor -> #9333ea;\n' },
    { label: 'Constant', hint: 'a = 2;', text: 'a = 2;\n' },
    { label: 'Points', hint: 'point(x1, y1, x2, y2)', text: 'point(0, 0, 1, 1); setColor -> #111827; setRadius -> 6;\n' },
    { label: 'Circle', hint: 'circle(cx, cy, r)', text: 'circle(0, 0, 3); setColor -> #0891b2; setFill -> rgba(8,145,178,0.15);\n' },
    { label: 'Line', hint: 'line(x1, y1, x2, y2)', text: 'line(-3, -1, 3, 2); setColor -> #d97706; setDash -> dashed;\n' },
    { label: 'Text', hint: 'text(x, y, "...")', text: 'text(1, 1, "label");\n' },
    { label: 'Header', hint: 'SIZE, BG, TITLE, RANGE', text: 'SIZE: {1200px, 800px};\nBG: #ffffff;\nTITLE: "My graph";\nRANGE: x(-10, 10) y(-6, 6);\nGRID: on;\n\n' }
  ];

  function insertSnippet() {
    pick('Insert snippet', SNIPPETS, function (it) {
      try { editorManager.editor.insert(it.text); editorManager.editor.focus(); } catch (e) { toast('Cannot insert here'); }
    });
  }
  function newFromExample() {
    var names = Object.keys(KLAX_EXAMPLES);
    var items = [{ label: 'Blank graph', hint: 'minimal file', text: 'SIZE: {1200px, 800px};\nf(x) = sin(x); setColor -> #2563eb;\n', name: 'graph.math' }]
      .concat(names.map(function (n) { return { label: n.replace(/\.math$/, ''), hint: 'example', text: KLAX_EXAMPLES[n], name: n }; }));
    pick('New .math file', items, function (it) {
      try { var EditorFile = acode.require('editorFile'); new EditorFile(it.name, { text: it.text }); }
      catch (e) { toast('Could not create the file'); }
    });
  }

  /* ---------------- Preview overlay ---------------- */
  var CSS = [
    '#klax-ov{position:fixed;inset:0;z-index:99999;background:#0b1020;display:none;flex-direction:column;color:#e5e7eb;font:14px/1.4 system-ui,sans-serif}',
    '#klax-ov *{box-sizing:border-box}',
    '.ki{fill:currentColor;flex:0 0 auto;display:block}',
    '.ki-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:40px;height:40px;padding:0 10px;background:transparent;color:#e5e7eb;border:0;border-radius:20px;font:inherit}',
    '.ki-btn:active{background:#ffffff22}',
    '.ki-btn.fill{background:#2563eb;color:#fff;padding:0 16px}',
    '.ki-btn.tonal{background:#1e293b}',
    '#klax-ov .kb{display:flex;gap:2px;align-items:center;padding:4px 6px;background:#111827;border-bottom:1px solid #1f2937;flex:0 0 auto}',
    '#klax-ov .kt{font-weight:600;margin:0 auto 0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#klax-ov .kv{flex:1 1 auto;overflow:auto;padding:10px;background:repeating-conic-gradient(#0f172a 0 25%,#0b1020 0 50%) 0 0/20px 20px}',
    '#klax-ov .kv svg{display:block;margin:0 auto;max-width:100%;height:auto;box-shadow:0 4px 24px #0008}',
    '#klax-ov .kv.full svg{max-width:none}',
    '#klax-ov .ke{flex:0 0 auto;max-height:25%;overflow:auto;background:#2a1215;color:#fecaca;padding:8px 12px;font:12px/1.5 monospace;display:none;white-space:pre-wrap}',
    '#klax-ov .ke .ki{display:inline;vertical-align:-5px;margin-right:4px}',
    '#klax-ov .ks{flex:0 0 auto;max-height:68%;overflow:auto;background:#111827;border-top:1px solid #1f2937;padding:12px 14px;display:none}',
    '#klax-ov .ks h4{margin:14px 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8}',
    '#klax-ov .ks h4:first-child{margin-top:0}',
    '#klax-ov .kg{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '#klax-ov label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:#94a3b8}',
    '#klax-ov label.ck{flex-direction:row;align-items:center;gap:8px;color:#e5e7eb;font-size:14px;background:#0d1426;border:1px solid #1f2937;border-radius:10px;padding:9px 10px}',
    '#klax-ov select,#klax-ov input[type=text],#klax-ov input[type=color]{width:100%;background:#0d1426;color:#e5e7eb;border:1px solid #374151;border-radius:8px;padding:8px;font:inherit}',
    '#klax-ov input[type=color]{height:40px;padding:2px}',
    '#klax-ov input[type=range]{width:100%}',
    '#klax-ov .kr{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}',
    '#klax-ov .kn{margin-top:8px;padding:8px 10px;border-radius:8px;background:#1e293b;color:#cbd5e1;font-size:12.5px}',
    '#klax-fab{position:fixed;right:16px;bottom:84px;z-index:9998;display:none;flex-direction:column;gap:12px;align-items:flex-end}',
    '#klax-fab button{display:flex;align-items:center;justify-content:center;border:0;color:#fff;box-shadow:0 3px 10px #0007}',
    '#klax-fab .main{width:56px;height:56px;border-radius:18px;background:#2563eb}',
    '#klax-fab .mini{width:44px;height:44px;border-radius:14px;background:#1e293b}',
    '#klax-modal{position:fixed;inset:0;z-index:100000;background:#000a;display:flex;align-items:flex-end;justify-content:center}',
    '#klax-modal .km-card{width:100%;max-width:520px;max-height:75%;overflow:auto;background:#111827;color:#e5e7eb;border-radius:18px 18px 0 0;padding:6px 0 12px;font:14px/1.4 system-ui,sans-serif}',
    '#klax-modal .km-head{display:flex;align-items:center;justify-content:space-between;padding:6px 8px 6px 16px;font-weight:600}',
    '#klax-modal .km-row{display:flex;flex-direction:column;align-items:flex-start;width:100%;background:transparent;border:0;color:inherit;text-align:left;padding:10px 16px;font:inherit}',
    '#klax-modal .km-row:active{background:#ffffff18}',
    '#klax-modal .km-row small{color:#94a3b8}',
    '#klax-modal .km-sec{padding:14px 16px 4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8}',
    '#klax-modal .km-sw{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px}',
    '#klax-modal .km-sw input{width:22px;height:22px}',
    '#klax-modal .km-mods{display:flex;gap:8px;padding:6px 16px}',
    '#klax-modal .km-input{display:block;width:calc(100% - 32px);margin:6px 16px;background:#0d1426;color:#e5e7eb;border:1px solid #374151;border-radius:8px;padding:10px;font:inherit}',
    '#klax-modal .km-msg{margin:4px 16px 10px;padding:8px 10px;border-radius:8px;background:#1e293b;color:#cbd5e1;font-size:13px}',
    '#klax-modal .km-msg.bad{background:#3b1519;color:#fecaca}',
    '#klax-modal .km-actions{display:flex;flex-wrap:wrap;gap:8px;padding:10px 16px}',
    '#klax-modal .km-reset{margin:12px 16px 4px}',
    '#klax-modal .km-capture{margin:4px 16px}',
    '#klax-modal .ki-btn{color:#e5e7eb}#klax-modal .ki-btn.fill{background:#2563eb;color:#fff}#klax-modal .ki-btn.tonal{background:#1e293b}',
    '#klax-modal .kchip{display:inline-flex;align-items:center;height:36px;padding:0 16px;border-radius:18px;border:1px solid #374151;background:transparent;color:#94a3b8;font:inherit}',
    '#klax-modal .kchip.on{background:#1d3a8a;border-color:#2563eb;color:#fff}',
    '.ki-logo{width:22px;height:22px;border-radius:5px;margin:0 8px 0 4px;flex:0 0 auto}'
  ].join('');

  function buildOverlay() {
    document.head.appendChild($('style', { id: 'klax-style' }, CSS));
    overlay = $('div', { id: 'klax-ov' });

    var bar = $('div', { 'class': 'kb' });
    var close = $('button', { 'class': 'ki-btn', 'aria-label': 'Close preview' }, icon('close')); close.onclick = hidePreview;
    var logo = $('img', { 'class': 'ki-logo', alt: '', src: LOGO_URI });
    var title = $('span', { 'class': 'kt' }, 'Klax');
    var fit = $('button', { 'class': 'ki-btn', 'aria-label': 'Fit or real size' }, icon('open_in_full')); fit.onclick = function () { view.classList.toggle('full'); };
    var copy = $('button', { 'class': 'ki-btn', 'aria-label': 'Copy SVG code' }, icon('content_copy')); copy.onclick = copySvg;
    var cog = $('button', { 'class': 'ki-btn', 'aria-label': 'Settings and shortcuts' }, icon('settings')); cog.onclick = openSettings;
    var exp = $('button', { 'class': 'ki-btn tonal', 'aria-label': 'Export' }, icon('tune') + '<span>Export</span>'); exp.onclick = toggleSheet;
    [close, logo, title, fit, copy, cog, exp].forEach(function (b) { bar.appendChild(b); });

    var view = $('div', { 'class': 'kv' });
    var err = $('div', { 'class': 'ke' });
    var sheet = buildSheet();
    overlay.appendChild(bar); overlay.appendChild(view); overlay.appendChild(err); overlay.appendChild(sheet);
    overlay._view = view; overlay._err = err; overlay._sheet = sheet; overlay._title = title;
    document.body.appendChild(overlay);
  }

  function option(label, control) { var l = $('label'); l.appendChild(document.createTextNode(label)); l.appendChild(control); return l; }
  function checkbox(label, key) {
    var l = $('label', { 'class': 'ck' }), c = $('input', { type: 'checkbox' });
    c.checked = opts[key]; c.onchange = function () { opts[key] = c.checked; syncSheet(); refresh(); };
    l.appendChild(c); l.appendChild(document.createTextNode(label)); return l;
  }

  function buildSheet() {
    var sheet = $('div', { 'class': 'ks' }), ui = {};
    sheet.appendChild($('h4', {}, 'File'));
    var g1 = $('div', { 'class': 'kg' });
    ui.format = $('select', {}, '<option value="png">PNG (transparency)</option><option value="jpg">JPEG</option><option value="webp">WEBP (transparency)</option><option value="svg">SVG (vector)</option><option value="pdf">PDF</option>');
    ui.format.onchange = function () { opts.format = ui.format.value; syncSheet(); };
    ui.scale = $('select', {}, '<option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option><option value="3">3x</option><option value="4">4x</option>');
    ui.scale.onchange = function () { opts.scale = parseFloat(ui.scale.value); };
    ui.name = $('input', { type: 'text', placeholder: 'file name' });
    ui.name.oninput = function () { opts.filename = ui.name.value; };
    ui.quality = $('input', { type: 'range', min: '0.3', max: '1', step: '0.01' });
    ui.quality.oninput = function () { opts.quality = parseFloat(ui.quality.value); };
    g1.appendChild(option('Format', ui.format)); g1.appendChild(option('Scale', ui.scale));
    g1.appendChild(option('File name', ui.name)); ui.qualityWrap = option('Quality (JPEG, WEBP, PDF)', ui.quality); g1.appendChild(ui.qualityWrap);
    sheet.appendChild(g1);

    sheet.appendChild($('h4', {}, 'Background'));
    var g2 = $('div', { 'class': 'kg' });
    ui.bg = $('select', {}, '<option value="file">As in the file</option><option value="transparent">Transparent</option><option value="custom">Custom colour</option>');
    ui.bg.onchange = function () { opts.bg = ui.bg.value; syncSheet(); refresh(); };
    ui.color = $('input', { type: 'color' });
    ui.color.oninput = function () { opts.color = ui.color.value; opts.bg = 'custom'; syncSheet(); refresh(); };
    ui.alpha = $('input', { type: 'range', min: '0', max: '1', step: '0.01' });
    ui.alpha.oninput = function () { opts.alpha = parseFloat(ui.alpha.value); refresh(); };
    g2.appendChild(option('Mode', ui.bg)); ui.colorWrap = option('Colour', ui.color); g2.appendChild(ui.colorWrap);
    ui.alphaWrap = option('Opacity', ui.alpha); g2.appendChild(ui.alphaWrap);
    sheet.appendChild(g2);
    ui.note = $('div', { 'class': 'kn' }); sheet.appendChild(ui.note);

    sheet.appendChild($('h4', {}, 'Elements'));
    var g3 = $('div', { 'class': 'kg' });
    [['Grid lines', 'grid'], ['Axes', 'axes'], ['Numbers', 'ticks'], ['Legend', 'legend'], ['Title', 'title']].forEach(function (c) { g3.appendChild(checkbox(c[0], c[1])); });
    sheet.appendChild(g3);

    var row = $('div', { 'class': 'kr' });
    var save = $('button', { 'class': 'ki-btn fill' }, icon('download') + '<span>Save image</span>'); save.onclick = function () { exportImage(); };
    var copy = $('button', { 'class': 'ki-btn tonal' }, icon('content_copy') + '<span>Copy SVG</span>'); copy.onclick = copySvg;
    row.appendChild(save); row.appendChild(copy); sheet.appendChild(row);

    sheet._ui = ui; sheet._sync = function () {
      ui.format.value = opts.format; ui.scale.value = String(opts.scale); ui.name.value = opts.filename; ui.quality.value = opts.quality;
      ui.bg.value = opts.bg; ui.color.value = opts.color; ui.alpha.value = opts.alpha;
      var f = opts.format, transparent = opts.bg === 'transparent' || (opts.bg === 'custom' && opts.alpha < 1);
      ui.qualityWrap.style.display = (f === 'jpg' || f === 'webp' || f === 'pdf') ? '' : 'none';
      ui.colorWrap.style.display = ui.alphaWrap.style.display = opts.bg === 'custom' ? '' : 'none';
      var msg = '';
      if ((f === 'jpg' || f === 'pdf') && transparent) msg = (f === 'jpg' ? 'JPEG' : 'PDF') + ' cannot be transparent: it is flattened on white. Choose PNG, WEBP or SVG to keep transparency.';
      else if (f === 'svg') msg = 'SVG is vector: the scale is ignored and transparency is kept.';
      else if (opts.bg === 'transparent') msg = 'The checkerboard in the preview stands for transparent areas.';
      ui.note.style.display = msg ? '' : 'none'; ui.note.textContent = msg;
    };
    sheet._sync();
    return sheet;
  }
  function syncSheet() { if (overlay) overlay._sheet._sync(); }
  function toggleSheet(force) {
    var s = overlay._sheet, show = typeof force === 'boolean' ? force : s.style.display !== 'block';
    s.style.display = show ? 'block' : 'none';
  }

  function showPreview(openSheet) {
    if (!overlay) buildOverlay();
    overlay.style.display = 'flex';
    toggleSheet(openSheet === true);
    refresh();
    startLive();
  }
  function hidePreview() { if (overlay) overlay.style.display = 'none'; stopLive(); }

  function refresh() {
    if (!overlay || overlay.style.display === 'none') return;
    var res = renderNow();
    current = res;
    overlay._title.textContent = fileName() + '  -  ' + res.width + ' x ' + res.height + ' px';
    overlay._view.innerHTML = res.svg;
    var e = overlay._err;
    if (res.errors.length) {
      e.style.display = 'block';
      e.innerHTML = res.errors.map(function (x) { return icon('error', 16) + 'line ' + x.line + ': ' + String(x.message).replace(/</g, '&lt;'); }).join('<br>');
    } else e.style.display = 'none';
  }

  function startLive() {
    stopLive();
    var f = activeFile(); if (!f || !f.session) return;
    bound = f.session;
    changeListener = function () { clearTimeout(liveTimer); liveTimer = setTimeout(refresh, 300); };
    bound.on('change', changeListener);
  }
  function stopLive() {
    clearTimeout(liveTimer);
    if (bound && changeListener) try { bound.off('change', changeListener); } catch (e) { /* ignore */ }
    bound = null; changeListener = null;
  }

  /* ---------------- Autocomplete suggestions ---------------- */
  var completer = null, savedEditorOpts = null;
  function registerCompleter() {
    try {
      var tools = ace.require('ace/ext/language_tools');
      completer = {
        id: 'klax',
        getCompletions: function (editor, session, pos, prefix, callback) {
          if (!getSettings().complete || !isMath()) return callback(null, []);
          var line = session.getLine(pos.row).slice(0, pos.column);
          callback(null, Klax.complete(line, session.getValue()).map(function (it) {
            return { caption: it.caption, value: it.value, snippet: it.snippet, meta: it.meta, score: it.score, completer: completer };
          }));
        },
        // replace the whole word before the cursor (colours start with '#', which Ace does not count as a word character)
        insertMatch: function (editor, data) {
          var pos = editor.getCursorPosition(), line = editor.session.getLine(pos.row).slice(0, pos.column);
          var tok = /[#A-Za-z0-9_.]*$/.exec(line)[0];
          editor.session.remove({ start: { row: pos.row, column: pos.column - tok.length }, end: pos });
          if (data.snippet) ace.require('ace/snippets').snippetManager.insertSnippet(editor, data.snippet);
          else editor.insert(data.value || data.caption);
        }
      };
      tools.addCompleter(completer);
    } catch (e) { completer = null; console.warn('[Klax] autocomplete not available:', e); }
  }
  function unregisterCompleter() {
    try {
      var tools = ace.require('ace/ext/language_tools'), i = tools.completers ? tools.completers.indexOf(completer) : -1;
      if (i >= 0) tools.completers.splice(i, 1);
    } catch (e) { /* ignore */ }
    completer = null;
  }
  /** Turns on Ace's live suggestions while a .math file is open, and puts the user's own choice back afterwards. */
  function syncEditorOptions(onMath) {
    try {
      var ed = editorManager.editor, want = onMath && getSettings().complete && completer;
      if (want && !savedEditorOpts) {
        savedEditorOpts = { basic: ed.getOption('enableBasicAutocompletion'), live: ed.getOption('enableLiveAutocompletion'), snip: ed.getOption('enableSnippets') };
        ed.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion: true, enableSnippets: true });
      } else if (!want && savedEditorOpts) {
        ed.setOptions({ enableBasicAutocompletion: savedEditorOpts.basic, enableLiveAutocompletion: savedEditorOpts.live, enableSnippets: savedEditorOpts.snip });
        savedEditorOpts = null;
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------------- File icon for .math ---------------- */
  var iconStyle = null, origIconFn = null, helpersRef = null;
  function installFileIcon() {
    iconStyle = $('style', { id: 'klax-fileicon' },
      '.file_type_math,.icon.file_type_math,.file.file_type_math{background-image:url("' + LOGO_URI + '")!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important;color:transparent!important}');
    document.head.appendChild(iconStyle);
    try { // make Acode pick the "math" icon class for .math files
      helpersRef = acode.require('helpers');
      if (helpersRef && typeof helpersRef.getIconForFile === 'function' && !helpersRef.getIconForFile._klax) {
        origIconFn = helpersRef.getIconForFile;
        var wrapped = function (name) { return /\.math$/i.test(String(name || '')) ? 'file file_type_math' : origIconFn.apply(this, arguments); };
        wrapped._klax = true; helpersRef.getIconForFile = wrapped;
      }
    } catch (e) { /* the CSS alone still applies where Acode already uses that class */ }
  }
  function uninstallFileIcon() {
    if (iconStyle) { iconStyle.remove(); iconStyle = null; }
    try { if (helpersRef && origIconFn) helpersRef.getIconForFile = origIconFn; } catch (e) { /* ignore */ }
  }

  /* ---------------- Settings and keyboard shortcuts ---------------- */
  function cmdLabel(c) { return c.description.replace(/^Klax:\s*/, '').replace(/^./, function (m) { return m.toUpperCase(); }); }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function openSettings() {
    closeModal();
    modal = $('div', { id: 'klax-modal' });
    var card = $('div', { 'class': 'km-card' });
    modal.appendChild(card);
    modal.onclick = function (e) { if (e.target === modal) closeModal(); };
    document.body.appendChild(modal);
    renderSettings(card);
  }

  function modalHead(card, title, onBack) {
    var head = $('div', { 'class': 'km-head' }, '<span>' + title + '</span>');
    var x = $('button', { 'class': 'ki-btn', 'aria-label': onBack ? 'Back' : 'Close' }, icon('close'));
    x.onclick = onBack || closeModal; head.appendChild(x); card.appendChild(head);
  }

  function renderSettings(card) {
    card.innerHTML = '';
    var st = getSettings(), map = KlaxKeys.effective(commands, st.keys);
    modalHead(card, 'Klax settings');

    card.appendChild($('div', { 'class': 'km-sec' }, 'General'));
    [['Floating buttons on .math files', 'fab'], ['Autocomplete suggestions in .math files', 'complete']].forEach(function (o) {
      var row = $('label', { 'class': 'km-sw' }), c = $('input', { type: 'checkbox' });
      c.checked = st[o[1]]; c.onchange = function () { st[o[1]] = c.checked; saveSettings(); tick(); };
      row.appendChild($('span', {}, o[0])); row.appendChild(c); card.appendChild(row);
    });

    card.appendChild($('div', { 'class': 'km-sec' }, 'Keyboard shortcuts'));
    commands.forEach(function (c) {
      var row = $('button', { 'class': 'km-row' },
        '<b>' + esc(cmdLabel(c)) + '</b><small>' + (map[c.name] ? esc(map[c.name]) : 'no shortcut') +
        (st.keys.hasOwnProperty(c.name) ? ' (custom)' : '') + '</small>');
      row.onclick = function () { renderShortcutEditor(card, c); };
      card.appendChild(row);
    });
    var reset = $('button', { 'class': 'ki-btn tonal km-reset' }, '<span>Reset all shortcuts</span>');
    reset.onclick = function () { st.keys = {}; saveSettings(); applyShortcuts(); renderSettings(card); toast('Shortcuts reset'); };
    card.appendChild(reset);
  }

  function renderShortcutEditor(card, cmd) {
    card.innerHTML = '';
    var st = getSettings(), map = KlaxKeys.effective(commands, st.keys), cur = KlaxKeys.parse(map[cmd.name]);
    var stopCapture = function () { document.removeEventListener('keydown', onKey, true); capBtn.classList.remove('fill'); };
    var back = function () { stopCapture(); renderSettings(card); };
    modalHead(card, esc(cmdLabel(cmd)), back);

    var mods = $('div', { 'class': 'km-mods' }), chips = {};
    [['ctrl', 'Ctrl'], ['alt', 'Alt'], ['shift', 'Shift']].forEach(function (m) {
      var b = $('button', { 'class': 'kchip' + (cur[m[0]] ? ' on' : '') }, m[1]);
      b.onclick = function () { cur[m[0]] = !cur[m[0]]; b.classList.toggle('on', cur[m[0]]); preview(); };
      chips[m[0]] = b; mods.appendChild(b);
    });
    card.appendChild(mods);
    var keyIn = $('input', { type: 'text', maxlength: '10', placeholder: 'Key: a letter, F5, Enter...', 'class': 'km-input' });
    keyIn.value = cur.key; keyIn.oninput = function () { cur.key = keyIn.value; preview(); };
    card.appendChild(keyIn);
    var msg = $('div', { 'class': 'km-msg' }); card.appendChild(msg);

    function result() { return KlaxKeys.build(cur, cur.key); }
    function preview() {
      var r = result();
      if (!r.ok) { msg.className = 'km-msg bad'; msg.textContent = r.error; return; }
      var other = KlaxKeys.conflict(map, cmd.name, r.shortcut);
      msg.className = 'km-msg' + (other ? ' bad' : '');
      msg.textContent = other ? r.shortcut + ' is already used by "' + cmdLabel(commands.filter(function (c) { return c.name === other; })[0]) + '".' : 'New shortcut: ' + r.shortcut;
    }

    // capture from a hardware keyboard
    var capBtn = $('button', { 'class': 'ki-btn tonal km-capture' }, icon('keyboard') + '<span>Capture from keyboard</span>');
    function onKey(e) {
      if (['Control', 'Alt', 'Shift', 'Meta'].indexOf(e.key) >= 0) return;
      e.preventDefault(); e.stopPropagation();
      var k = e.key, code = /^Key([A-Z])$/.exec(e.code || '') || /^Digit(\d)$/.exec(e.code || '');
      if (code) k = code[1];
      cur.ctrl = e.ctrlKey || e.metaKey; cur.alt = e.altKey; cur.shift = e.shiftKey; cur.key = KlaxKeys.normalizeKey(k) || '';
      keyIn.value = cur.key;
      ['ctrl', 'alt', 'shift'].forEach(function (m) { chips[m].classList.toggle('on', cur[m]); });
      stopCapture(); preview();
    }
    capBtn.onclick = function () {
      document.addEventListener('keydown', onKey, true); capBtn.classList.add('fill');
      msg.className = 'km-msg'; msg.textContent = 'Press the shortcut you want...';
    };
    card.appendChild(capBtn);

    var row = $('div', { 'class': 'km-actions' });
    var save = $('button', { 'class': 'ki-btn fill' }, '<span>Save</span>');
    save.onclick = function () {
      var r = result();
      if (!r.ok) return preview();
      if (KlaxKeys.conflict(map, cmd.name, r.shortcut)) return preview();
      st.keys[cmd.name] = r.shortcut; saveSettings(); applyShortcuts(); toast(cmdLabel(cmd) + ': ' + r.shortcut); back();
    };
    var none = $('button', { 'class': 'ki-btn tonal' }, '<span>No shortcut</span>');
    none.onclick = function () { st.keys[cmd.name] = ''; saveSettings(); applyShortcuts(); back(); };
    var dflt = $('button', { 'class': 'ki-btn tonal' }, '<span>Default' + (cmd.key ? ' (' + cmd.key + ')' : '') + '</span>');
    dflt.onclick = function () { delete st.keys[cmd.name]; saveSettings(); applyShortcuts(); back(); };
    [save, none, dflt].forEach(function (b) { row.appendChild(b); });
    card.appendChild(row);
    preview();
  }

  /* ---------------- Floating action buttons ---------------- */
  function buildFab() {
    if (!document.getElementById('klax-style')) document.head.appendChild($('style', { id: 'klax-style' }, CSS));
    fab = $('div', { id: 'klax-fab' });
    var snip = $('button', { 'class': 'mini', 'aria-label': 'Insert snippet' }, icon('code')); snip.onclick = insertSnippet;
    var exp = $('button', { 'class': 'mini', 'aria-label': 'Export image' }, icon('download')); exp.onclick = function () { showPreview(true); };
    var run = $('button', { 'class': 'main', 'aria-label': 'Run: preview graph' }, icon('play_arrow', 30)); run.onclick = function () { showPreview(false); };
    [snip, exp, run].forEach(function (b) { fab.appendChild(b); });
    document.body.appendChild(fab);
    // Show the buttons only while a .math file is open
    fabTimer = setInterval(tick, 500);
    tick();
  }
  function tick() {
    var onMath = isMath();
    if (fab) fab.style.display = (onMath && getSettings().fab && (!overlay || overlay.style.display === 'none')) ? 'flex' : 'none';
    syncEditorOptions(onMath);
  }

  /* ---------------- Lifecycle ---------------- */
  var commands = [
    { name: 'klax-run', description: 'Klax: run (preview graph)', key: 'Ctrl-Alt-P', exec: function () { showPreview(false); } },
    { name: 'klax-export', description: 'Klax: export image...', key: 'Ctrl-Alt-E', exec: function () { showPreview(true); } },
    { name: 'klax-save-png', description: 'Klax: save PNG now', key: 'Ctrl-Alt-S', exec: function () { exportImage('png'); } },
    { name: 'klax-save-svg', description: 'Klax: save SVG now', key: '', exec: function () { exportImage('svg'); } },
    { name: 'klax-copy-svg', description: 'Klax: copy SVG code', key: '', exec: copySvg },
    { name: 'klax-snippet', description: 'Klax: insert snippet', key: 'Ctrl-Alt-I', exec: insertSnippet },
    { name: 'klax-new', description: 'Klax: new .math file', key: 'Ctrl-Alt-N', exec: newFromExample },
    { name: 'klax-settings', description: 'Klax: settings and shortcuts', key: 'Ctrl-Alt-K', exec: openSettings }
  ];

  /** (Re)registers every command with the shortcut currently chosen in the settings. */
  function applyShortcuts() {
    var map = KlaxKeys.effective(commands, getSettings().keys);
    commands.forEach(function (c) {
      try { editorManager.editor.commands.removeCommand(c.name); } catch (e) { /* not registered yet */ }
      var key = map[c.name];
      editorManager.editor.commands.addCommand({
        name: c.name, description: c.description,
        bindKey: key ? { win: key, mac: key.replace('Ctrl', 'Cmd') } : undefined, exec: c.exec
      });
    });
  }

  acode.setPluginInit(PLUGIN_ID, function () {
    registerMode();
    applyShortcuts();
    registerCompleter();
    installFileIcon();
    try {
      var modelist = ace.require('ace/ext/modelist'), orig = modelist.getModeForPath;
      if (orig && !orig._klax) {
        var wrap = function (p) { return /\.math$/i.test(p || '') ? modelist.modesByName.klaxmath || orig(p) : orig.apply(this, arguments); };
        wrap._klax = true; modelist.getModeForPath = wrap; modelist._origGetModeForPath = orig;
      }
    } catch (e) { /* optional */ }
    buildFab();
    toast('Klax Math ready: use the play button on a .math file');
  });

  acode.setPluginUnmount(PLUGIN_ID, function () {
    hidePreview(); closeModal();
    clearInterval(fabTimer);
    syncEditorOptions(false); unregisterCompleter(); uninstallFileIcon();
    commands.forEach(function (c) { try { editorManager.editor.commands.removeCommand(c.name); } catch (e) { /* ignore */ } });
    try { var ml = ace.require('ace/ext/modelist'); if (ml._origGetModeForPath) ml.getModeForPath = ml._origGetModeForPath; } catch (e) { /* ignore */ }
    [overlay, fab, document.getElementById('klax-style')].forEach(function (n) { if (n) n.remove(); });
    overlay = fab = null;
  });
})();
