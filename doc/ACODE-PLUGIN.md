# Acode plugin

**Plugin id:** `dev.klax.math` — adds the `.math` file type to Acode.

## Features
* Syntax highlighting (statements, properties such as `setColor`, colours, numbers, functions, comments).
* Live preview, refreshing about 0.35 s after you stop typing.
* Error list with line numbers under the preview.
* Export to PNG, JPEG, WEBP, SVG and PDF, with the same options as the app.
* Push your code to the Klax app's server.

## Commands
Open the command palette and type **Klax**.

| Command | Shortcut | What it does |
|---|---|---|
| Klax: preview graph | `Ctrl-Alt-P` | opens the full-screen live preview |
| Klax: send to server | `Ctrl-Alt-S` | `PUT`s the current file to the app |
| Klax: export as PNG | — | exports with the current export options |
| Klax: export as SVG | — | same, as vector |
| Klax: new .math file | — | creates a file with an example |
| Klax: server address | — | change the address of the app's server |

## The preview toolbar
| Button | Action |
|---|---|
| ⬇ PNG / JPEG / WEBP / SVG / PDF | export the graph as shown |
| 📡 Server | send the code to the Klax app |
| 🎛 | show the **export options**: Grid, Axes, Numbers, Legend, Title, and background (*from file* / *transparent* / *custom colour*) |
| ⚙ | set the server address |
| ⤢ | toggle fit-to-screen / real size |
| ✕ | close the preview |

A checkerboard behind the graph stands for transparent areas.

## Talking to the app
The default server address is `http://127.0.0.1:8080` (the app on the same phone). If the app is on another device, enable **LAN** in the app's settings and enter its address with **⚙**, e.g. `http://192.168.1.20:8080`.
While the preview is open, each edit is also pushed to the app automatically (silently, errors are ignored).

## Limits
* The plugin is tested with simulated Acode objects; if a feature behaves differently in your Acode version, please open an issue with the Acode version number.
* Colouring uses Ace's syntax-highlighting engine; if your Acode version does not expose the mode list, the file still works, only without colours.
