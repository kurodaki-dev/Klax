/* Klax keyboard-shortcut helpers (pure functions, no Acode needed). Exposed as KlaxKeys. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KlaxKeys = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NAMED = ['Enter', 'Space', 'Tab', 'Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PageUp', 'PageDown', 'Delete', 'Backspace', 'Insert', 'Esc'];
  var PUNCT = '`-=[]\;\',./';

  /** Canonical spelling of a key name, or null when it is not accepted. */
  function normalizeKey(key) {
    var k = String(key == null ? '' : key).trim();
    if (!k) return null;
    if (k.length === 1) {
      if (/[A-Za-z0-9]/.test(k)) return k.toUpperCase();
      return PUNCT.indexOf(k) >= 0 ? k : null;
    }
    if (/^f([1-9]|1[0-2])$/i.test(k)) return 'F' + k.slice(1);
    for (var i = 0; i < NAMED.length; i++) if (NAMED[i].toLowerCase() === k.toLowerCase()) return NAMED[i];
    if (/^(escape)$/i.test(k)) return 'Esc';
    if (/^(return)$/i.test(k)) return 'Enter';
    if (/^(del)$/i.test(k)) return 'Delete';
    if (/^(arrowup|arrowdown|arrowleft|arrowright)$/i.test(k)) return k.slice(5, 6).toUpperCase() + k.slice(6).toLowerCase();
    return null;
  }

  /**
   * Build a shortcut such as "Ctrl-Alt-P" from modifier flags and a key.
   * A plain printable key needs a modifier, so typing in the editor is never hijacked.
   */
  function build(mods, key) {
    mods = mods || {};
    var k = normalizeKey(key);
    if (!k) return { ok: false, error: 'Unknown key "' + key + '". Use a letter, a digit, F1-F12, Enter, Space, Tab, arrows, Home, End, PageUp, PageDown, Delete, Backspace, Insert or Esc.' };
    var hasMod = !!(mods.ctrl || mods.alt || mods.shift);
    var special = /^F\d+$/.test(k) || ['Esc', 'Insert', 'PageUp', 'PageDown', 'Home', 'End', 'Delete'].indexOf(k) >= 0;
    if (!hasMod && !special) return { ok: false, error: 'Add Ctrl, Alt or Shift so the shortcut does not interfere with typing.' };
    var parts = [];
    if (mods.ctrl) parts.push('Ctrl');
    if (mods.alt) parts.push('Alt');
    if (mods.shift) parts.push('Shift');
    parts.push(k);
    return { ok: true, shortcut: parts.join('-') };
  }

  /** Reverse of build(): "Ctrl-Alt-P" -> {ctrl:true, alt:true, shift:false, key:'P'} */
  function parse(shortcut) {
    var out = { ctrl: false, alt: false, shift: false, key: '' };
    if (!shortcut) return out;
    var parts = String(shortcut).split('-');
    // a trailing "-" key ("Ctrl--") leaves an empty last part
    var key = parts.pop();
    if (key === '' && parts.length) key = '-';
    parts.forEach(function (p) { var l = p.toLowerCase(); if (l === 'ctrl') out.ctrl = true; else if (l === 'alt') out.alt = true; else if (l === 'shift') out.shift = true; });
    out.key = key;
    return out;
  }

  /**
   * Effective shortcut of every command: user override first (empty string = no shortcut), then the default.
   * @param {{name:string, key?:string}[]} commands
   * @param {Object<string,string>} overrides
   */
  function effective(commands, overrides) {
    var out = {};
    commands.forEach(function (c) {
      var o = overrides && Object.prototype.hasOwnProperty.call(overrides, c.name) ? overrides[c.name] : undefined;
      out[c.name] = typeof o === 'string' ? o : (c.key || '');
    });
    return out;
  }

  /** Name of another Klax command already using `shortcut`, or null. */
  function conflict(map, name, shortcut) {
    if (!shortcut) return null;
    var wanted = shortcut.toLowerCase();
    for (var n in map) if (n !== name && map[n] && map[n].toLowerCase() === wanted) return n;
    return null;
  }

  /** Drops unknown commands and malformed values from stored overrides. */
  function sanitize(overrides, commands) {
    var out = {}, known = {};
    commands.forEach(function (c) { known[c.name] = true; });
    for (var n in (overrides || {})) {
      if (!known[n] || typeof overrides[n] !== 'string') continue;
      var v = overrides[n];
      if (v === '') { out[n] = ''; continue; }
      var p = parse(v), b = build(p, p.key);
      if (b.ok) out[n] = b.shortcut;
    }
    return out;
  }

  return { normalizeKey: normalizeKey, build: build, parse: parse, effective: effective, conflict: conflict, sanitize: sanitize };
});
