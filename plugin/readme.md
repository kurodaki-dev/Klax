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

## Export
PNG, JPEG, WEBP, SVG, PDF. Scale 0.5x to 4x. Background as in the file, transparent, or any colour with opacity.
Grid lines, axes, numbers, legend and title can each be left out.

Full documentation: the `doc/` folder of the repository.
