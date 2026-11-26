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
    refresh: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
  };
  function icon(name, size) {
    var s = size || 22;
    return '<svg class="ki" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  }

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
    '#klax-modal .km-row small{color:#94a3b8}'
  ].join('');

  function buildOverlay() {
    document.head.appendChild($('style', { id: 'klax-style' }, CSS));
    overlay = $('div', { id: 'klax-ov' });

    var bar = $('div', { 'class': 'kb' });
    var close = $('button', { 'class': 'ki-btn', 'aria-label': 'Close preview' }, icon('close')); close.onclick = hidePreview;
    var title = $('span', { 'class': 'kt' }, 'Klax');
    var fit = $('button', { 'class': 'ki-btn', 'aria-label': 'Fit or real size' }, icon('open_in_full')); fit.onclick = function () { view.classList.toggle('full'); };
    var copy = $('button', { 'class': 'ki-btn', 'aria-label': 'Copy SVG code' }, icon('content_copy')); copy.onclick = copySvg;
    var exp = $('button', { 'class': 'ki-btn tonal', 'aria-label': 'Export' }, icon('tune') + '<span>Export</span>'); exp.onclick = toggleSheet;
    [close, title, fit, copy, exp].forEach(function (b) { bar.appendChild(b); });

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
    fabTimer = setInterval(function () {
      var visible = isMath() && (!overlay || overlay.style.display === 'none');
      fab.style.display = visible ? 'flex' : 'none';
    }, 500);
  }

  /* ---------------- Lifecycle ---------------- */
  var commands = [
    { name: 'klax-run', description: 'Klax: run (preview graph)', key: 'Ctrl-Alt-P', exec: function () { showPreview(false); } },
    { name: 'klax-export', description: 'Klax: export image...', key: 'Ctrl-Alt-E', exec: function () { showPreview(true); } },
    { name: 'klax-save-png', description: 'Klax: save PNG now', key: 'Ctrl-Alt-S', exec: function () { exportImage('png'); } },
    { name: 'klax-save-svg', description: 'Klax: save SVG now', exec: function () { exportImage('svg'); } },
    { name: 'klax-copy-svg', description: 'Klax: copy SVG code', exec: copySvg },
    { name: 'klax-snippet', description: 'Klax: insert snippet', key: 'Ctrl-Alt-I', exec: insertSnippet },
    { name: 'klax-new', description: 'Klax: new .math file', key: 'Ctrl-Alt-N', exec: newFromExample }
  ];

  acode.setPluginInit(PLUGIN_ID, function () {
    registerMode();
    commands.forEach(function (c) {
      editorManager.editor.commands.addCommand({
        name: c.name, description: c.description,
        bindKey: c.key ? { win: c.key, mac: c.key.replace('Ctrl', 'Cmd') } : undefined, exec: c.exec
      });
    });
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
    commands.forEach(function (c) { try { editorManager.editor.commands.removeCommand(c.name); } catch (e) { /* ignore */ } });
    try { var ml = ace.require('ace/ext/modelist'); if (ml._origGetModeForPath) ml.getModeForPath = ml._origGetModeForPath; } catch (e) { /* ignore */ }
    [overlay, fab, document.getElementById('klax-style')].forEach(function (n) { if (n) n.remove(); });
    overlay = fab = null;
  });
})();
