/* Klax web UI — runs inside the Android WebView and in any browser that can reach the server. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var native = window.KlaxNative && window.KlaxNative.available && window.KlaxNative.available();
  var ed = $('#editor'), view = $('#view');
  var myVersion = 0, pushTimer = 0, renderTimer = 0, lastPlain = null, busy = false;
  var LS = 'klax.source';

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function msg(t, bad) { var m = $('#exportMsg'); m.textContent = t; m.style.color = bad ? '#fca5a5' : ''; if (native) KlaxNative.toast(t); }

  /* ---------- export options ---------- */
  function bgValue() {
    var mode = $('#bgMode').value;
    if (mode === 'file') return undefined;
    if (mode === 'transparent') return 'transparent';
    var hex = $('#bgColor').value, a = parseFloat($('#bgAlpha').value);
    var n = parseInt(hex.slice(1), 16);
    return a >= 1 ? hex : 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function renderOptions() {
    return {
      grid: $('#oGrid').checked, axes: $('#oAxes').checked, ticks: $('#oTicks').checked,
      legend: $('#oLegend').checked ? undefined : false, title: $('#oTitle').checked ? undefined : false,
      background: bgValue()
    };
  }
  function syncExportUi() {
    var mode = $('#bgMode').value, fmt = $('#fmt').value;
    $('#bgCustom').hidden = mode !== 'custom';
    $('#bgAlphaWrap').hidden = mode !== 'custom';
    $('#qWrap').style.display = (fmt === 'jpg' || fmt === 'webp' || fmt === 'pdf') ? '' : 'none';
    $('#qVal').textContent = Math.round($('#quality').value * 100) + '%';
    $('#bgAlphaVal').textContent = Math.round($('#bgAlpha').value * 100) + '%';
    var transparent = mode === 'transparent' || (mode === 'custom' && $('#bgAlpha').value < 1);
    var note = $('#bgNote');
    if ((fmt === 'jpg' || fmt === 'pdf') && transparent) { note.hidden = false; note.textContent = (fmt === 'jpg' ? 'JPEG' : 'PDF') + ' cannot store transparency — it will be flattened on white. Choose PNG, WEBP or SVG to keep it.'; }
    else if (fmt === 'svg') { note.hidden = false; note.textContent = 'SVG is vector: the scale setting is ignored and transparency is kept.'; }
    else if (mode === 'transparent') { note.hidden = false; note.textContent = 'The checkerboard in the preview stands for the transparent areas.'; }
    else note.hidden = true;
    renderPreview();
  }

  /* ---------- rendering ---------- */
  var current = null;
  function renderPreview() {
    var res = Klax.render(ed.value, renderOptions());
    current = res;
    view.innerHTML = res.svg;
    $('#dims').textContent = res.width + ' × ' + res.height + ' px';
    var er = $('#errors');
    if (res.errors.length) { er.hidden = false; er.textContent = res.errors.map(function (e) { return 'line ' + e.line + ': ' + e.message; }).join('\n'); }
    else er.hidden = true;
  }
  function onEdit() {
    lsSet(LS, ed.value);
    clearTimeout(renderTimer); renderTimer = setTimeout(renderPreview, 120);
    clearTimeout(pushTimer); pushTimer = setTimeout(pushSource, 450);
  }

  /* ---------- server sync ---------- */
  function api(path, opt) { return fetch(path, opt); }
  function pushSource() {
    return api('/api/source', { method: 'PUT', headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: ed.value })
      .then(function (r) { return r.json(); })
      .then(function (j) { myVersion = j.version; return pushRendered(j.version, false); })
      .catch(function () { setStatus(false); });
  }
  function plainRender() { return Klax.render(ed.value, {}); }
  function pushRendered(v, withPng) {
    var res = plainRender();
    var p = api('/api/rendered/svg?v=' + v, { method: 'PUT', body: res.svg });
    if (!withPng) return p;
    return p.then(function () { return Klax.toRaster(res, 'image/png', { scale: 1 }); })
      .then(function (blob) { return api('/api/rendered/png?v=' + v, { method: 'PUT', body: blob }); });
  }
  function setStatus(ok, text) {
    var s = $('#status'); s.className = 'pill ' + (ok ? 'ok' : 'bad');
    s.textContent = ok ? (text || 'online') : 'offline';
  }
  function poll() {
    if (busy) return;
    busy = true;
    api('/api/version').then(function (r) { return r.json(); }).then(function (j) {
      setStatus(true, location.host);
      if (j.version < myVersion) { myVersion = 0; return pushSource(); }          // server restarted
      if (j.version > myVersion) {                                                  // changed from outside (Acode…)
        return api('/api/source').then(function (r) { return r.text(); }).then(function (t) {
          myVersion = j.version;
          if (t !== ed.value) { ed.value = t; lsSet(LS, t); renderPreview(); }
          return pushRendered(j.version, j.wantPng);
        });
      }
      if (j.wantPng) return pushRendered(j.version, true);
    }).catch(function () { setStatus(false); }).then(function () { busy = false; });
  }

  /* ---------- files ---------- */
  function toB64(blob) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1]); };
      r.onerror = rej; r.readAsDataURL(blob);
    });
  }
  function saveBlob(blob, name, mime) {
    if (native) return toB64(blob).then(function (b64) { return KlaxNative.saveFile(name, mime, b64) ? 'Saved to Downloads/Klax/' + name : 'Save failed'; });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    return Promise.resolve('Downloaded ' + name);
  }
  function download() {
    var res = Klax.render(ed.value, renderOptions()), fmt = $('#fmt').value, name = ($('#fname').value || 'klax').replace(/\.[^.]+$/, '');
    var scale = parseFloat($('#scale').value), q = parseFloat($('#quality').value);
    var p;
    if (fmt === 'svg') p = Promise.resolve(new Blob([res.svg], { type: 'image/svg+xml' }));
    else if (fmt === 'png') p = Klax.toRaster(res, 'image/png', { scale: scale });
    else if (fmt === 'webp') p = Klax.toRaster(res, 'image/webp', { scale: scale, quality: q });
    else if (fmt === 'jpg') p = Klax.toRaster(res, 'image/jpeg', { scale: scale, quality: q, opaque: true, background: '#ffffff' });
    else p = Klax.toRaster(res, 'image/jpeg', { scale: 1, quality: q, opaque: true, background: '#ffffff' })
      .then(function (b) { return b.arrayBuffer(); })
      .then(function (buf) { return new Blob([Klax.makePdf(new Uint8Array(buf), res.width, res.height)], { type: 'application/pdf' }); });
    var mimes = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', pdf: 'application/pdf' };
    msg('Exporting…');
    return p.then(function (blob) { return saveBlob(blob, name + '.' + fmt, mimes[fmt]); })
      .then(function (t) { msg(t); })
      .catch(function (e) { msg('Export failed: ' + e.message, true); });
  }
  function copyText(t, ok) {
    var done = function () { msg(ok); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
    function fallback() { var x = document.createElement('textarea'); x.value = t; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); done(); } catch (e) { msg('Copy failed', true); } x.remove(); }
  }
  window.klaxLoad = function (text) { ed.value = text; onEdit(); renderPreview(); showTab('code'); };

  /* ---------- UI wiring ---------- */
  function showTab(name) {
    document.querySelectorAll('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === name); });
    ['code', 'view', 'export'].forEach(function (t) { $('#pane' + t[0].toUpperCase() + t.slice(1)).classList.toggle('on', t === name); });
    if (name === 'view' || name === 'export') renderPreview();
  }
  document.querySelectorAll('.tabs button').forEach(function (b) { b.onclick = function () { showTab(b.dataset.tab); }; });

  ed.addEventListener('input', onEdit);
  ed.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var s = ed.selectionStart, t = ed.selectionEnd;
      ed.value = ed.value.slice(0, s) + '  ' + ed.value.slice(t);
      ed.selectionStart = ed.selectionEnd = s + 2; onEdit();
    }
  });
  ['#bgMode', '#fmt', '#oGrid', '#oAxes', '#oTicks', '#oLegend', '#oTitle'].forEach(function (s) { $(s).addEventListener('change', syncExportUi); });
  ['#bgColor', '#bgAlpha', '#quality'].forEach(function (s) { $(s).addEventListener('input', syncExportUi); });
  ['#ffffff', '#000000', '#0f172a', '#f8f5ec', '#fef3c7', '#dbeafe', '#fce7f3', '#14532d'].forEach(function (c) {
    var i = document.createElement('i'); i.style.background = c; i.title = c;
    i.onclick = function () { $('#bgMode').value = 'custom'; $('#bgColor').value = c; syncExportUi(); };
    $('#swatches').appendChild(i);
  });
  $('#btnFit').onclick = function () { view.classList.toggle('fit'); };
  $('#btnDownload').onclick = download;
  $('#btnCopySvg').onclick = function () { copyText(Klax.render(ed.value, renderOptions()).svg, 'SVG code copied'); };
  $('#btnCopyUrl').onclick = function () { copyText(location.origin + '/render.svg', 'Copied ' + location.origin + '/render.svg'); };

  $('#btnNew').onclick = function () { if (confirm('Start a new file? The current code will be replaced.')) { window.klaxLoad('SIZE: {1200px, 800px};\nf(x) = sin(x); setColor -> #2563eb;\n'); } };
  $('#btnOpen').onclick = function () {
    var f = document.createElement('input'); f.type = 'file'; f.accept = '.math,.txt,text/plain';
    f.onchange = function () { if (f.files[0]) { var r = new FileReader(); r.onload = function () { window.klaxLoad(String(r.result)); }; r.readAsText(f.files[0]); } };
    f.click();
  };
  $('#btnSaveSrc').onclick = function () {
    var name = ($('#fname').value || 'klax').replace(/\.[^.]+$/, '') + '.math';
    saveBlob(new Blob([ed.value], { type: 'text/plain' }), name, 'text/plain').then(msg);
  };
  var ex = $('#examples');
  api('/api/examples').then(function (r) { return r.json(); }).then(function (l) {
    l.forEach(function (n) { var o = document.createElement('option'); o.value = n; o.textContent = n.replace(/\.math$/, ''); ex.appendChild(o); });
  }).catch(function () { });
  ex.onchange = function () {
    if (!ex.value) return;
    api('/examples/' + ex.value).then(function (r) { return r.text(); }).then(function (t) { window.klaxLoad(t); ex.value = ''; });
  };

  /* settings dialog */
  var dlg = $('#dlg');
  $('#btnSettings').onclick = function () {
    api('/api/info').then(function (r) { return r.json(); }).then(function (i) {
      $('#urls').innerHTML = i.urls.map(function (u) { return u; }).join('<br>');
      $('#sPort').value = i.port; $('#sLan').checked = i.lan;
    }).catch(function () { });
    $('#sApply').hidden = $('#sQuit').hidden = !native;
    $('#sPort').disabled = $('#sLan').disabled = !native;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  };
  $('#sApply').onclick = function (e) { e.preventDefault(); dlg.close(); if (native) KlaxNative.applyConfig(parseInt($('#sPort').value, 10) || 8080, $('#sLan').checked); };
  $('#sQuit').onclick = function (e) { e.preventDefault(); dlg.close(); if (native) KlaxNative.quit(); };

  /* ---------- start ---------- */
  $('#fname').value = 'klax';
  showTab('code');
  api('/api/source').then(function (r) { return r.text(); }).then(function (t) {
    ed.value = t.trim() ? t : lsGet(LS, Klax.EXAMPLE);
  }).catch(function () { ed.value = lsGet(LS, Klax.EXAMPLE); }).then(function () {
    syncExportUi();
    pushSource();
    setInterval(poll, 700);
  });
})();
