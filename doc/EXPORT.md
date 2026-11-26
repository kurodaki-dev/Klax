# Exporting images

Open the export panel from the floating Download button, the **Export** button in the preview, or `Ctrl-Alt-E`.

## Formats
| Format | Transparency | Notes |
|---|---|---|
| **PNG** | yes | default; best for slides and web |
| **WEBP** | yes | smaller than PNG; quality slider |
| **JPEG** | no (flattened on white) | quality slider |
| **SVG** | yes | vector, infinitely scalable, editable in Inkscape or Figma; scale is ignored |
| **PDF** | no (flattened on white) | one page, exactly the image size |

**Scale** (0.5x to 4x) multiplies the pixel size of raster formats: `SIZE: {1200px, 1300px}` at 2x gives 2400 x 2600 px.
Exports above about 16 000 px on a side are refused by the browser engine.

## Background
| Mode | Result |
|---|---|
| *As in the file* | uses the `BG:` statement (white if none) |
| *Transparent* | no background at all (PNG, WEBP, SVG) |
| *Custom colour* | any colour plus an **opacity** slider |

Text, grid and axis colours adapt: a dark background gives light lines and labels, and vice versa.

## Elements
Tick or untick: **Grid lines**, **Axes**, **Numbers**, **Legend**, **Title**.
Unticking only affects the image, the `.math` file is not changed.

Recipe for a clean curve on a transparent background: *Transparent*, untick all five elements, format **PNG**.

## File name and location
The **File name** field defaults to the name of the open file. Images are saved to the `Download` folder of your storage (or through a normal browser download when Acode does not allow it). A message shows the saved name.

## Quick save
`Ctrl-Alt-S` saves a PNG immediately, **Klax: save SVG now** an SVG, both using the options currently set in the export panel.

## Doing the same inside the file
```
BG: transparent;   // or rgba(255,255,255,0.5), #f8f5ec ...
GRID: off;
AXES: off;
TICKS: off;
LEGEND: off;
```
