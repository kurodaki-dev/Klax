# Klax Math

Draw mathematical functions by writing a `.math` file, right inside Acode.

```
SIZE: {1200px, 1300px};
BG: #0f172a;
f(x) = sin(x); setColor -> #38bdf8;
g(x) = x^2/10; setColor -> rgba(251,146,60,0.9);
```

## Buttons
When a `.math` file is open, three floating buttons appear: **Play** (live preview), **Download** (export panel), **Code** (insert snippet).
The preview toolbar has fit / real size, copy SVG code and the **Export** panel.

## Settings
The gear in the preview (or `Ctrl-Alt-K`) opens the settings: show/hide the floating buttons, turn autocomplete on/off, and **change every keyboard shortcut**.

## Autocomplete and file icon
Suggestions for statements, functions, colours and your own names appear as you type in a `.math` file, and `.math` files get the Klax logo.

## Commands and shortcuts (command palette: type "Klax")
| Command | Shortcut |
|---|---|
| Run (preview graph) | Ctrl-Alt-P |
| Export image | Ctrl-Alt-E |
| Save PNG now | Ctrl-Alt-S |
| Save SVG now | - |
| Copy SVG code | - |
| Insert snippet | Ctrl-Alt-I |
| New .math file (blank or from an example) | Ctrl-Alt-N |
| Settings and shortcuts | Ctrl-Alt-K |

## Export
PNG, JPEG, WEBP, SVG, PDF. Scale 0.5x to 4x. Background as in the file, transparent, or any colour with opacity.
Grid lines, axes, numbers, legend and title can each be left out.

Open source (MIT): https://github.com/kurodaki-dev/Klax
Full documentation: the `doc/` folder of the repository.
