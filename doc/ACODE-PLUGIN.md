# Acode plugin

**Plugin id:** `dev.klax.math`. It adds the `.math` file type to Acode and does everything else too: preview, export, snippets, examples.

## Features
* Autocomplete suggestions while you type in a `.math` file.
* A logo for `.math` files.
* A settings page, with customizable keyboard shortcuts.
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
| Klax: settings and shortcuts | `Ctrl-Alt-K` | opens the settings page |

All of these shortcuts can be changed: see [Settings](#settings-and-custom-shortcuts).
## The preview
| Control | Action |
|---|---|
| Close (x) | closes the preview |
| Fit / real size | toggles between fitting the screen and 1:1 |
| Copy | copies the SVG code |
| Settings (gear) | opens the settings page |
| Export | shows or hides the export panel |

A checkerboard behind the graph stands for transparent areas. Errors appear in red under the graph as `line N: message`; the rest of the file still draws.

## Autocomplete
While a `.math` file is open, suggestions appear as you type (Ace's live autocompletion is switched on for `.math` files and restored to your own setting when you leave them).

| You type | Klax suggests |
|---|---|
| at the start of a statement | `SIZE`, `BG`, `TITLE`, `RANGE`, `GRID`... with ready-made lines, templates (function, parametric, polar, piece, band, constant) and shapes |
| after a function line | `setColor`, `setWidth`, `setCut`, `setClipY`, `setEnds`... |
| inside an expression (`f(x) = ...`) | maths functions with their arguments (`atan2(y, x)`), constants (`pi`, `tau`), and **your own** functions and constants |
| after `setColor ->`, `setFill ->`, `BG:` | a palette of colours, including `rgba(...)` ones |
| after `setEnds ->` | `closed`, `open`, `none` |
| after `setDash ->` | `dashed`, `dotted`, `solid`, `6,4`... |
| after `GRID:`, `AXES:`, `TICKS:`, `LEGEND:`, `setPolar ->` | `on`, `off` |

Choosing a suggestion that has placeholders puts the cursor on the first one; press Tab to jump to the next. Turn the suggestions off in the settings if you prefer.

## Settings and custom shortcuts
Open the settings with the gear in the preview, the command **Klax: settings and shortcuts**, or `Ctrl-Alt-K`.

* **Floating buttons on .math files**: show or hide the three buttons.
* **Autocomplete suggestions in .math files**: on or off.
* **Keyboard shortcuts**: tap a command to change its shortcut.
  * Pick the modifiers (**Ctrl**, **Alt**, **Shift**) and type the key (a letter, a digit, `F1` to `F12`, `Enter`, `Space`, `Tab`, arrows, `Home`, `End`, `PageUp`, `PageDown`, `Delete`, `Backspace`, `Insert`, `Esc`).
  * With a hardware keyboard, tap **Capture from keyboard** and press the combination.
  * A plain letter needs a modifier so typing is never hijacked. A shortcut already used by another Klax command is refused, with the name of that command.
  * **No shortcut** removes it, **Default** restores it, **Reset all shortcuts** restores everything.
* Settings are saved on the device and applied immediately.

## File icon
`.math` files get the Klax logo (a sine and a cosine curve on a dark tile) in Acode's file lists and tabs, and in the preview toolbar.

## The export panel
See [Export](EXPORT.md) for every option. Options are kept while the editor stays open and apply to the preview, to **Save image** and to the quick-save commands.

## Snippets
Function, parametric curve, polar curve, piece of a function (`setCut` with ends), horizontal band (`setClipY`), constant, points, circle, line, text, and a file header (`SIZE`, `BG`, `TITLE`, `RANGE`, `GRID`).

## Notes
* Icons are Google Material icons embedded in the plugin, so it works offline.
* The plugin is tested against simulated Acode objects. If a feature behaves differently in your Acode version, please report it with the version number.
* If your Acode version does not expose the editor's mode list, `.math` files work but are not coloured.
* The file icon relies on how your Acode version names file icons; if the logo does not show in the file list, it still shows in the preview toolbar.
* Suggestions need Acode's autocompletion component; if your version does not include it, typing works as usual without suggestions.
