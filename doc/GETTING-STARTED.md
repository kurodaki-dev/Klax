# Getting started

## 1. Install the plugin
Every push to `main` publishes a GitHub Release containing `klax-math-plugin.zip`.

1. Download `klax-math-plugin.zip` from the repository's **Releases** page (or from **Actions, Build Klax, Artifacts**).
2. In Acode open **Settings, Plugins** and install from file, choosing the zip.

## 2. Create a `.math` file
Create a file whose name ends in `.math`, or use the command palette (type **Klax**) and run **New .math file**: you can start from a blank graph or from a bundled example.

## 3. Draw something
```
SIZE: {1200px, 800px};
BG: #0f172a;
TITLE: "Hello Klax";

f(x) = sin(x);        setColor -> #38bdf8; setWidth -> 3;
g(x) = x^2 / 10 - 2;  setColor -> rgba(251, 146, 60, 0.9);
```
While a `.math` file is open, three floating buttons appear at the bottom right of the editor:

| Button | Action |
|---|---|
| Play (blue) | opens the live preview |
| Download | opens the export panel |
| Code | inserts a snippet at the cursor |

The same actions exist in the command palette and on keyboard shortcuts: see [Acode plugin](ACODE-PLUGIN.md).

## 4. Save the image
In the preview, tap **Export**: choose the format, scale and background, untick what you do not want (grid, axes, numbers, legend, title), then **Save image**. Files go to your `Download` folder.

Next: the [language reference](LANGUAGE.md) and the [cookbook](COOKBOOK.md).
