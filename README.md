# Klax

Write maths in a text file, get an image — entirely inside **Acode**.

```
SIZE: {1200px, 1300px};
BG: #0f172a;
f(x) = sin(x) * x / 2; setColor -> #38bdf8;
g(x) = x^2 / 10 - 4;   setColor -> rgba(251, 146, 60, 0.95);
```

Klax is an Acode plugin: open a `.math` file, press the play button, see the graph, save it as an image.

| Folder | What |
|---|---|
| `core/` | `.math` parser, expression engine, SVG renderer, PNG/JPEG/WEBP/PDF export |
| `plugin/` | the Acode plugin |
| `examples/` | sample `.math` files (also bundled in the plugin) |
| `doc/` | full documentation, start with [doc/README.md](doc/README.md) |

## Install
Every push to `main` publishes a GitHub Release with `klax-math-plugin.zip`.
Download it, then in Acode: **Settings, Plugins, install from file** and choose the zip.

## Use
Open or create a `*.math` file. A floating button bar appears:

| Button | Does |
|---|---|
| Play | live preview of the graph |
| Download | opens the export panel (format, scale, background, grid, axes...) |
| Code | inserts a snippet at the cursor |

Everything is also in the command palette (type "Klax") and on shortcuts:
`Ctrl-Alt-P` run, `Ctrl-Alt-E` export, `Ctrl-Alt-S` save PNG now, `Ctrl-Alt-I` insert snippet, `Ctrl-Alt-N` new file, `Ctrl-Alt-K` settings.
**All shortcuts can be changed** in the plugin's settings (gear icon in the preview, or `Ctrl-Alt-K`).

While you type in a `.math` file, Klax suggests statements, functions, colours and your own names. `.math` files get the Klax logo.

Export formats: **PNG, JPEG, WEBP, SVG, PDF**, with or without grid/axes/numbers/legend/title, transparent or custom background.

## Open source
Klax is open source under the [MIT license](LICENSE). Source code: [github.com/kurodaki-dev/Klax](https://github.com/kurodaki-dev/Klax).

## Support
If Klax is useful to you, you can sponsor its author: [github.com/kurodaki-dev](https://github.com/kurodaki-dev).

## Develop
```sh
node scripts/test.js           # tests (language, docs recipes, plugin bundle)
node scripts/build-plugin.js   # builds dist/klax-math-plugin.zip
```
