# Architecture

```
core/klax.js ─────────────┬─▶ plugin/  (concatenated into dist/plugin/main.js by scripts/build-plugin.js)
(parser + renderer)       └─▶ app/     (copied into the APK assets by Gradle, used by the web UI)
```

## Core (`core/klax.js`)
No dependencies, runs in browsers, Acode and Node (UMD). Public API:

| Function | Purpose |
|---|---|
| `Klax.parse(src)` | → `{config, items, errors, runtime}` |
| `Klax.render(src, options?)` | → `{svg, width, height, errors, config, view}`; `options` = export-time overrides `grid, axes, ticks, legend, title, background` |
| `Klax.parseColor(str)` | hex / `rgba()` / `hsl()` / names → `{color, opacity}` |
| `Klax.toRaster(result, mime, opts)` | browser only: SVG → PNG/JPEG/WEBP `Blob` through a canvas |
| `Klax.makePdf(jpegBytes, w, h)` | one-page PDF |
| `Klax.EXAMPLE`, `Klax.FUNCTIONS`, `Klax.CONSTANTS`, `Klax.version` | helpers |

### How a file is processed
1. **Comments stripped** (`//`, `/* */`). `SIZE://(…)` is special-cased so its `//` is not taken for a comment.
2. **Split into statements** on `;` and line breaks, remembering line numbers (quotes respected).
3. **Pass 1** collects function names, their arity, and constant names, so definitions can refer to each other in any order.
4. **Pass 2** handles each statement: `SIZE`, global settings, properties (applied to the previous item), shapes, definitions. Errors are collected with their line; a bad statement never stops the others.
5. **Expressions** are tokenised and compiled by a small recursive-descent parser into closures (no `eval`). Precedence: `^` (right-assoc) > unary minus > `* / %` and implicit multiplication > `+ -`.
6. **Rendering** samples each curve, auto-fits the Y range if none is given (2nd–98th percentile), builds grid, axes, curves, tick labels, title and legend as SVG. Breaks the path at `NaN`/∞ and at huge jumps (so `1/x` and `tan` do not draw vertical joins).
7. **Cutting**: each `setCut` interval is sampled separately and the pieces are separated by `NaN`; `setClipY` blanks samples outside the band.

## Plugin (`plugin/`)
`main.src.js` registers Ace commands, defines an Ace mode for `.math`, and builds a full-screen overlay for the preview. `scripts/build-plugin.js` prepends the core and zips `plugin.json`, `main.js`, `readme.md`, `icon.png`.

## App (`app/`)
| File | Role |
|---|---|
| `KlaxServer.java` | minimal HTTP/1.1 server on a `ServerSocket`; holds the current source, persists it, serves assets and the API |
| `ServerService.java` | foreground service that starts/stops the server; reads port and LAN flag from preferences |
| `MainActivity.java` | WebView host, file chooser, `KlaxNative` JavaScript bridge (`saveFile`, `applyConfig`, `quit`, `toast`, `config`) |
| `assets/web/*` | the UI (`index.html`, `app.js`, `style.css`); `klax.js` and `examples/` are copied in at build time |

The UI polls `/api/version` every 0.7 s; when the version changes (Acode pushed new code) it loads the source, re-renders, and hands the SVG back to the server (and a PNG when someone asked for `/render.png`).

## Tests
`scripts/test.js` (no dependencies) covers `SIZE` spellings, colours, the expression engine, error line numbers, discontinuities, `setCut`, `setClipY`, export overrides, polar/parametric curves, every bundled example, and the PDF structure. The Java app is verified by compiling it in CI; there are no on-device automated tests yet.
