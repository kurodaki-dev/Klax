# Architecture

```
core/klax.js      parser + renderer + exports (no dependencies)
examples/*.math   sample files
plugin/main.src.js  Acode integration (UI, commands, saving)
        |
        v   scripts/build-plugin.js  concatenates: core + examples + plugin
dist/plugin/main.js  ->  klax-math-plugin.zip
```

## Core (`core/klax.js`)
Runs in browsers, Acode and Node (UMD). Public API:

| Function | Purpose |
|---|---|
| `Klax.parse(src)` | returns `{config, items, errors, runtime}` |
| `Klax.render(src, options?)` | returns `{svg, width, height, errors, config, view}`; `options` are export-time overrides: `grid, axes, ticks, legend, title, background` |
| `Klax.parseColor(str)` | hex, `rgba()`, `hsl()` or name to `{color, opacity}` |
| `Klax.toRaster(result, mime, opts)` | browser only: SVG to PNG/JPEG/WEBP `Blob` through a canvas |
| `Klax.makePdf(jpegBytes, w, h)` | one-page PDF |

### How a file is processed
1. **Comments stripped** (`//`, `/* */`). `SIZE://(...)` is special-cased so its `//` is not taken for a comment.
2. **Split into statements** on `;` and line breaks, remembering line numbers (quotes respected).
3. **Pass 1** collects function names, arities and constant names, so definitions can refer to each other in any order.
4. **Pass 2** handles each statement: `SIZE`, global settings, properties (applied to the previous item), shapes, definitions. Errors are collected with their line; a bad statement never stops the others.
5. **Expressions** are tokenised and compiled by a small recursive-descent parser into closures (no `eval`). Precedence: `^` (right-assoc), unary minus, `* / %` with implicit multiplication, `+ -`.
6. **Rendering** samples each curve, fits the Y range if none is given (2nd to 98th percentile), then builds grid, axes, curves, tick labels, title and legend as SVG. Paths break at `NaN`, infinity and huge jumps, so `1/x` and `tan` have no vertical joins.
7. **Cutting**: each `setCut` interval is sampled separately and pieces are separated by `NaN`; `setClipY` blanks samples outside the band.

## Plugin (`plugin/main.src.js`)
* Registers Ace commands and an Ace mode for `.math`.
* Builds the full-screen preview with its toolbar and the export panel (plain DOM, no framework).
* Floating buttons are shown while the active file ends in `.math` (checked every 0.5 s).
* Saves through Acode's `fsOperation` into `Download`, falling back to a browser download.
* Icons are inline SVG paths from Google Material icons (Apache License 2.0).

## Tests (`scripts/test.js`)
No dependencies. Covers `SIZE` spellings, colours, the expression engine, error line numbers, discontinuities, `setCut`, `setClipY`, export overrides, polar and parametric curves, every bundled example, every ```` ```math ```` recipe in `doc/`, the PDF structure, that the plugin bundle builds and parses, and that no emoji appears in the repository.
