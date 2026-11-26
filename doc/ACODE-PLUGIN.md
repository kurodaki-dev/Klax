# Acode plugin

**Plugin id:** `dev.klax.math`. It adds the `.math` file type to Acode and does everything else too: preview, export, snippets, examples.

## Features
* Syntax highlighting for `.math` files.
* Live preview, refreshed about 0.3 s after you stop typing, with an error list (line numbers).
* Export to PNG, JPEG, WEBP, SVG and PDF with scale, background and element options.
* Snippets for every kind of statement, and new files from bundled examples.

## Floating buttons
Visible only while a `.math` file is the active file.

| Button | Icon | Action |
|---|---|---|
| Run | play | opens the live preview |
| Export | download | opens the preview with the export panel already open |
| Snippets | code | list of statements to insert at the cursor |

## Commands and shortcuts
Open the command palette and type **Klax**.

| Command | Shortcut | What it does |
|---|---|---|
| Klax: run (preview graph) | `Ctrl-Alt-P` | full-screen live preview |
| Klax: export image... | `Ctrl-Alt-E` | preview with the export panel open |
| Klax: save PNG now | `Ctrl-Alt-S` | saves a PNG with the current export options |
| Klax: save SVG now | - | saves an SVG with the current export options |
| Klax: copy SVG code | - | copies the SVG source to the clipboard |
| Klax: insert snippet | `Ctrl-Alt-I` | pick a statement to insert |
| Klax: new .math file | `Ctrl-Alt-N` | blank graph or one of the examples |

## The preview
| Control | Action |
|---|---|
| Close (x) | closes the preview |
| Fit / real size | toggles between fitting the screen and 1:1 |
| Copy | copies the SVG code |
| Export | shows or hides the export panel |

A checkerboard behind the graph stands for transparent areas. Errors appear in red under the graph as `line N: message`; the rest of the file still draws.

## The export panel
See [Export](EXPORT.md) for every option. Options are kept while the editor stays open and apply to the preview, to **Save image** and to the quick-save commands.

## Snippets
Function, parametric curve, polar curve, piece of a function (`setCut` with ends), horizontal band (`setClipY`), constant, points, circle, line, text, and a file header (`SIZE`, `BG`, `TITLE`, `RANGE`, `GRID`).

## Notes
* Icons are Google Material icons embedded in the plugin, so it works offline.
* The plugin is tested against simulated Acode objects. If a feature behaves differently in your Acode version, please report it with the version number.
* If your Acode version does not expose the editor's mode list, `.math` files work but are not coloured.
