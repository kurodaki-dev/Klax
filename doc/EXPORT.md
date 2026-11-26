# Exporting images

Both the app (**Export** tab) and the Acode plugin (preview toolbar) export your graph.

## Formats
| Format | Transparency | Notes |
|---|---|---|
| **PNG** | yes | default; best for slides and web |
| **WEBP** | yes | smaller than PNG; quality slider |
| **JPEG** | no (flattened on white) | quality slider |
| **SVG** | yes | vector, infinitely scalable, editable in Inkscape/Figma; scale is ignored |
| **PDF** | no (flattened on white) | one page, exactly the image size |

**Scale** (app: 0.5× to 4×) multiplies the pixel size of raster formats: `SIZE: {1200px, 1300px}` at 2× gives 2400 × 2600 px.
Very large exports (over 16 000 px on a side) are refused by the browser engine.

## Background
| Mode | Result |
|---|---|
| *As defined in the .math file* | uses the `BG:` statement (white if none) |
| *Transparent* | no background at all (PNG, WEBP, SVG) |
| *Custom colour* | any colour picked, plus an **opacity** slider; quick swatches included |

Text, grid and axis colours adapt automatically: a dark background gives light lines and labels, and vice versa.

## Elements
Tick or untick, without editing your file: **Grid lines**, **Axes**, **Numbers**, **Legend**, **Title**.
Unticking only hides the element in the exported image — the `.math` file is not changed.

Typical recipe for a "clean curve on transparent background": *Transparent* + untick Grid, Axes, Numbers, Legend, Title → **PNG**.

## Where files go
* **App**: saved to `Downloads/Klax/` (a toast tells you the exact name). In a desktop browser they download normally.
* **Plugin**: saved to the `Download` folder of your storage when possible, otherwise through a normal browser download.

## Doing the same in the file itself
Everything above can also be written permanently in the `.math` file:

```
BG: transparent;   // or rgba(255,255,255,0.5), #f8f5ec …
GRID: off;
AXES: off;
TICKS: off;
LEGEND: off;
```
