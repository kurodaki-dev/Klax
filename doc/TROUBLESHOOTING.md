# Troubleshooting

## The floating buttons do not appear
They show only while the active file's name ends in `.math`. Rename the file, or run **Klax: new .math file** from the command palette. Check that the plugin is installed and enabled in **Settings, Plugins**.

## My file shows errors
Errors are listed under the graph as `line N: message`; the rest of the file still draws.

| Message | Meaning |
|---|---|
| `Unrecognised statement` | missing `;` between statements on one line, or a typo in a keyword |
| `Unknown function 'foo'` / `Unknown variable 'a'` | name not defined (functions and constants can be defined in any order, but must exist) |
| `Property with no preceding function...` | a `setColor -> ...` line came before any function |
| `SIZE too small / too large` | sizes are limited to 16-8000 px per side |
| `Invalid colour: ...` | use `#rgb`, `#rrggbb`, `rgba(r,g,b,a)`, `hsl(h,s%,l%)` or a CSS name |
| `... each interval needs min < max` | `setCut -> 3, 1` is reversed |

## The graph looks squashed or circles are ovals
Add `ASPECT: equal;` or give a `RANGE` matching the image's proportions.

## A curve is missing or cut off
* It may be outside `RANGE`: remove `RANGE` to let Klax fit the Y axis.
* A `setCut` or `setClipY` may be hiding it.
* A function that is undefined (`sqrt(-1)`, `1/0`) leaves a gap by design.

## The exported JPEG or PDF has a white background
JPEG and PDF cannot be transparent. Export PNG, WEBP or SVG.

## Export fails with "Image too large"
Lower the **Scale** or the `SIZE`. Browsers refuse canvases above about 16 000 px per side.

## Nothing seems saved
Look in the `Download` folder; a message shows the exact file name. If Acode cannot write there, the image is offered as a normal browser download instead.

## No suggestions while typing
Check **Klax settings, Autocomplete suggestions** is on, and that the active file's name ends in `.math`. Suggestions start after you type one letter or digit; after `->` or `:` type the first character of the value.

## A shortcut does not work
Open the settings (`Ctrl-Alt-K`, or the gear in the preview) to see the current shortcut of each command. Another Acode shortcut may use the same keys: choose a different combination. If you changed a shortcut and forgot it, **Reset all shortcuts** restores the defaults.

## The `.math` logo does not show in the file list
It depends on how your Acode version picks file icons. The logo always shows in the preview toolbar. Please report your Acode version if the file list still shows the default icon.

## `.math` files are not coloured
Your Acode version may not expose the editor's mode list. The plugin still works; only the colours are missing.
