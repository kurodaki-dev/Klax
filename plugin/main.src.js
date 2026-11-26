/* Klax Math — Acode plugin. The core (Klax) is prepended to this file by scripts/build-plugin.js */
(function () {
  var PLUGIN_ID = 'dev.klax.math';
  var LS_URL = 'klax.server', DEFAULT_URL = 'http://127.0.0.1:8080';
  var exportOpts = { grid: true, axes: true, ticks: true, legend: true, title: true, bg: 'file', color: '#ffffff' };
  var overlay = null, current = null, liveTimer = null, changeListener = null, bound = null;

  function $(tag, attrs, html) {
    var el = document.createElement(tag);
    for (var k in (attrs || {})) el.setAttribute(k, attrs[k]);
    if (html != null) el.innerHTML = html;
    return el;
  }
  function toast(msg) {
    try { window.toast(msg, 3000); } catch (e) { console.log('[Klax]', msg); }
  }
  function getUrl() { try { return localStorage.getItem(LS_URL) || DEFAULT_URL; } catch (e) { return DEFAULT_URL; } }
  function setUrl(v) { try { localStorage.setItem(LS_URL, v); } catch (e) {} }

  function renderOpts() {
    var o = { grid: exportOpts.grid, axes: exportOpts.axes, ticks: exportOpts.ticks };
    if (!exportOpts.legend) o.legend = false;
    if (!exportOpts.title) o.title = false;
    if (exportOpts.bg === 'transparent') o.background = 'transparent';
    else if (exportOpts.bg === 'custom') o.background = exportOpts.color;
    return o;
  }
  function renderNow() { return Klax.render(source(), renderOpts()); }

  function activeFile() { try { return editorManager.activeFile; } catch (e) { return null; } }
  function source() { var f = activeFile(); return f && f.session ? f.session.getValue() : ''; }
  function baseName() {
    var f = activeFile(); var n = (f && f.name) || 'klax.math';
    return n.replace(/\.[^.]+$/, '') || 'klax';
  }

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

  /* ---------------- Saving / sending ---------------- */
  function b64(bytes) {
    var s = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  }

  function saveBlob(blob, filename) {
    return new Promise(function (resolve) {
      var done = function (where) { toast('Saved: ' + where); resolve(true); };
      // 1) Acode fsOperation → Download folder
      try {
        var fsOp = acode.require('fsOperation');
        var dir = (window.cordova && cordova.file && cordova.file.externalRootDirectory) ? cordova.file.externalRootDirectory + 'Download' : null;
        if (dir && fsOp) {
          var reader = new FileReader();
          reader.onload = function () {
            fsOp(dir).createFile(filename, reader.result).then(function () { done('Download/' + filename); }, fallback);
          };
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

  function exportAs(fmt, res) {
    var name = baseName();
    if (fmt === 'svg') return saveBlob(new Blob([res.svg], { type: 'image/svg+xml' }), name + '.svg');
    if (fmt === 'pdf') {
      return Klax.toRaster(res, 'image/jpeg', { background: '#ffffff', opaque: true, quality: 0.95 })
        .then(function (b) { return b.arrayBuffer(); })
        .then(function (buf) { return saveBlob(new Blob([Klax.makePdf(new Uint8Array(buf), res.width, res.height)], { type: 'application/pdf' }), name + '.pdf'); });
    }
    var mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }[fmt];
    var opaque = fmt !== 'png', bg = '#ffffff'; // JPEG has no alpha: flatten on white
    return Klax.toRaster(res, mime, { scale: 1, opaque: opaque, background: bg, quality: 0.92 })
      .then(function (b) { return saveBlob(b, name + '.' + (fmt === 'jpeg' ? 'jpg' : fmt)); });
  }

  function sendToServer(src, silent) {
    var url = getUrl().replace(/\/+$/, '') + '/api/source';
    return fetch(url, { method: 'PUT', headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: src })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); if (!silent) toast('Sent to Klax (' + getUrl() + ')'); return true; })
      .catch(function (e) { if (!silent) toast('Klax unreachable (' + getUrl() + ') — is the app running?'); return false; });
  }

  /* ---------------- Preview ---------------- */
  var CSS = '#klax-ov{position:fixed;inset:0;z-index:99999;background:#0b1020;display:flex;flex-direction:column;color:#e5e7eb;font:14px/1.4 system-ui,sans-serif}' +
    '#klax-ov .kb{display:flex;gap:6px;align-items:center;padding:8px;background:#111827;border-bottom:1px solid #1f2937;overflow-x:auto;flex:0 0 auto}' +
    '#klax-ov button{background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:8px;padding:8px 12px;font:inherit;white-space:nowrap}' +
    '#klax-ov button.p{background:#2563eb;border-color:#2563eb;color:#fff}' +
    '#klax-ov .kt{font-weight:700;margin-right:auto;padding:0 6px;white-space:nowrap}' +
    '#klax-ov .kv{flex:1 1 auto;overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:10px;background:repeating-conic-gradient(#0f172a 0 25%,#0b1020 0 50%) 0 0/20px 20px}' +
    '#klax-ov .kv svg{max-width:100%;height:auto;box-shadow:0 4px 24px #0008}' +
    '#klax-ov .kv.full svg{max-width:none}' +
    '#klax-ov .ko{display:none;flex-wrap:wrap;gap:10px 16px;align-items:center;padding:8px 12px;background:#0f172a;border-bottom:1px solid #1f2937;font-size:13px}' +
    '#klax-ov .ko label{display:flex;gap:5px;align-items:center}#klax-ov .ko select,#klax-ov .ko input[type=color]{background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:6px;padding:4px}' +
    '#klax-ov .ke{flex:0 0 auto;max-height:28%;overflow:auto;background:#2a1215;color:#fecaca;padding:6px 12px;font:12px/1.5 monospace;display:none}';

  function showPreview() {
    if (!overlay) buildOverlay();
    overlay.style.display = 'flex';
    refresh();
    startLive();
  }
  function hidePreview() { if (overlay) overlay.style.display = 'none'; stopLive(); }

  function buildOverlay() {
    var st = $('style', {}, CSS); document.head.appendChild(st);
    overlay = $('div', { id: 'klax-ov' });
    var bar = $('div', { 'class': 'kb' });
    bar.appendChild($('span', { 'class': 'kt' }, 'Klax'));
    [['png', 'PNG'], ['jpg', 'JPEG'], ['webp', 'WEBP'], ['svg', 'SVG'], ['pdf', 'PDF']].forEach(function (f) {
      var b = $('button', {}, '⬇ ' + f[1]);
      b.onclick = function () { if (current) exportAs(f[0], current).catch(function (e) { toast('Export: ' + e.message); }); };
      bar.appendChild(b);
    });
    var send = $('button', { 'class': 'p' }, '📡 Server'); send.onclick = function () { sendToServer(source()); };
    var cfg = $('button', {}, '⚙'); cfg.onclick = askServer;
    var opt = $('button', {}, '🎛'); opt.onclick = function () { var d = overlay._opts.style.display; overlay._opts.style.display = d === 'flex' ? 'none' : 'flex'; };
    var zoom = $('button', {}, '⤢'); zoom.onclick = function () { view.classList.toggle('full'); };
    var close = $('button', {}, '✕'); close.onclick = hidePreview;
    [send, opt, cfg, zoom, close].forEach(function (b) { bar.appendChild(b); });
    var view = $('div', { 'class': 'kv' }), err = $('div', { 'class': 'ke' });
    var panel = $('div', { 'class': 'ko' });
    [['grid', 'Grid'], ['axes', 'Axes'], ['ticks', 'Numbers'], ['legend', 'Legend'], ['title', 'Title']].forEach(function (o) {
      var l = $('label'), c = $('input', { type: 'checkbox' });
      c.checked = exportOpts[o[0]]; c.onchange = function () { exportOpts[o[0]] = c.checked; refresh(); };
      l.appendChild(c); l.appendChild(document.createTextNode(o[1])); panel.appendChild(l);
    });
    var bgSel = $('select', {}, '<option value="file">Background: from file</option><option value="transparent">Background: transparent</option><option value="custom">Background: custom</option>');
    var bgCol = $('input', { type: 'color', value: exportOpts.color });
    bgSel.onchange = function () { exportOpts.bg = bgSel.value; refresh(); };
    bgCol.oninput = function () { exportOpts.color = bgCol.value; exportOpts.bg = 'custom'; bgSel.value = 'custom'; refresh(); };
    panel.appendChild(bgSel); panel.appendChild(bgCol);
    overlay.appendChild(bar); overlay.appendChild(panel); overlay.appendChild(view); overlay.appendChild(err);
    overlay._view = view; overlay._err = err; overlay._opts = panel;
    document.body.appendChild(overlay);
  }

  function refresh() {
    if (!overlay) return;
    var res = renderNow();
    current = res;
    overlay._view.innerHTML = res.svg;
    var e = overlay._err;
    if (res.errors.length) {
      e.style.display = 'block';
      e.textContent = res.errors.map(function (x) { return 'line ' + x.line + ': ' + x.message; }).join('\n');
    } else e.style.display = 'none';
  }

  function startLive() {
    stopLive();
    var f = activeFile(); if (!f || !f.session) return;
    bound = f.session;
    changeListener = function () {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () { refresh(); if (autoSend()) sendToServer(source(), true); }, 350);
    };
    bound.on('change', changeListener);
  }
  function stopLive() {
    clearTimeout(liveTimer);
    if (bound && changeListener) try { bound.off('change', changeListener); } catch (e) {}
    bound = null; changeListener = null;
  }
  function autoSend() { try { return localStorage.getItem('klax.auto') !== '0'; } catch (e) { return true; } }

  function askServer() {
    var ask = function (cb) {
      try { acode.require('prompt')('Klax server address', getUrl(), 'text').then(cb); }
      catch (e) { var v = window.prompt('Klax server address', getUrl()); if (v) cb(v); }
    };
    ask(function (v) {
      if (!v) return;
      if (!/^https?:\/\//i.test(v)) v = 'http://' + v;
      setUrl(v.replace(/\/+$/, '')); toast('Klax server: ' + getUrl());
    });
  }

  function newFile() {
    try {
      var EditorFile = acode.require('editorFile');
      new EditorFile('klax.math', { text: Klax.EXAMPLE });
    } catch (e) { toast('Could not create the file'); }
  }

  /* ---------------- Lifecycle ---------------- */
  var commands = [
    { name: 'klax-preview', description: 'Klax: preview graph', key: 'Ctrl-Alt-P', exec: showPreview },
    { name: 'klax-send', description: 'Klax: send to server', key: 'Ctrl-Alt-S', exec: function () { sendToServer(source()); } },
    { name: 'klax-export-png', description: 'Klax: export as PNG', exec: function () { exportAs('png', renderNow()); } },
    { name: 'klax-export-svg', description: 'Klax: export as SVG', exec: function () { exportAs('svg', renderNow()); } },
    { name: 'klax-new', description: 'Klax: new .math file', exec: newFile },
    { name: 'klax-server', description: 'Klax: server address', exec: askServer }
  ];

  acode.setPluginInit(PLUGIN_ID, function (baseUrl, $page, opts) {
    registerMode();
    try {
      var ext = acode.require('aceModes');
      if (ext && ext.addMode) ext.addMode('klaxmath', 'Klax Math', ['math']);
    } catch (e) { /* optional */ }
    try { editorManager.editor.setOption('enableLiveAutocompletion', true); } catch (e) {}
    commands.forEach(function (c) {
      editorManager.editor.commands.addCommand({
        name: c.name, description: c.description,
        bindKey: c.key ? { win: c.key, mac: c.key.replace('Ctrl', 'Cmd') } : undefined, exec: c.exec
      });
    });
    // Bind .math files to the mode
    try {
      var modelist = ace.require('ace/ext/modelist'), orig = modelist.getModeForPath;
      if (orig && !orig._klax) {
        var wrap = function (p) { return /\.math$/i.test(p || '') ? modelist.modesByName.klaxmath || orig(p) : orig.apply(this, arguments); };
        wrap._klax = true; modelist.getModeForPath = wrap; modelist._origGetModeForPath = orig;
      }
    } catch (e) {}
    toast('Klax Math ready — open the command palette and type “Klax”');
  });

  acode.setPluginUnmount(PLUGIN_ID, function () {
    hidePreview();
    commands.forEach(function (c) { try { editorManager.editor.commands.removeCommand(c.name); } catch (e) {} });
    try { var ml = ace.require('ace/ext/modelist'); if (ml._origGetModeForPath) ml.getModeForPath = ml._origGetModeForPath; } catch (e) {}
    if (overlay) { overlay.remove(); overlay = null; }
  });
})();
