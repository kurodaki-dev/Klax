# Troubleshooting

## The Acode plugin says "Klax unreachable"
* Is the Klax app running? A notification "Klax server" should be visible.
* Same phone? The address must be `http://127.0.0.1:<port>`. The port may not be 8080 if that one was busy: check ⚙ in the app, then set it in the plugin with ⚙.
* Another device? Turn **LAN** on in the app's ⚙ and use the phone's IP address (shown in the dialog).

## `/render.png` or `/render.svg` returns 504
The app page draws the image, so the app must be open on screen. Open Klax, then retry. See [Server API](SERVER-API.md).

## "App not installed" when updating
The new APK is signed with a different key than the installed one. Uninstall the old version, or set permanent signing secrets ([Build & release](BUILD-AND-RELEASE.md)).

## My file shows errors
Errors are listed under the editor/preview as `line N: message`; the rest of the file still renders.
| Message | Meaning |
|---|---|
| `Unrecognised statement` | missing `;` between statements on one line, or a typo in a keyword |
| `Unknown function 'foo'` / `Unknown variable 'a'` | name not defined (functions/constants can be defined in any order, but must exist) |
| `Property with no preceding function…` | a `setColor -> …` line came before any function |
| `SIZE too small / too large` | sizes are limited to 16–8000 px per side |
| `Invalid colour: …` | use `#rgb`, `#rrggbb`, `rgba(r,g,b,a)`, `hsl(h,s%,l%)` or a CSS name |
| `… each interval needs min < max` | `setCut -> 3, 1` is reversed |

## The graph looks squashed or circles are ovals
Add `ASPECT: equal;` or give a `RANGE` matching the image's proportions.

## A curve is missing or cut off
* Is it outside `RANGE`? Remove `RANGE` to let Klax fit the Y axis automatically.
* A `setCut` or `setClipY` may be hiding it.
* A function that is undefined (`sqrt(-1)`, `1/0`) leaves a gap by design.

## The exported JPEG/PDF has a white background
JPEG and PDF cannot be transparent. Export PNG, WEBP or SVG.

## Export fails with "Image too large"
Lower the **Scale**, or the `SIZE`. Browsers refuse canvases above about 16 000 px per side.

## Nothing is saved on export
Check that Klax has storage access on Android 8–9, and look in `Downloads/Klax/`. The toast shows the exact name.
