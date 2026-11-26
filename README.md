# Klax

Write maths in a text file, get an image.

```
SIZE: {1200px, 1300px};
BG: #0f172a;
f(x) = sin(x) * x / 2; setColor -> #38bdf8;
g(x) = x^2 / 10 - 4;   setColor -> rgba(251, 146, 60, 0.95);
```

Klax is three pieces that share one language core (`core/klax.js`):

| Folder | What |
|---|---|
| `core/` | `.math` parser, expression engine, SVG renderer, PNG/JPEG/WEBP/PDF export |
| `plugin/` | **Acode plugin** — syntax highlighting, live preview, export, send-to-server |
| `app/` | **Android app (APK)** — editor, preview, export panel, and an **HTTP server on a port** |
| `examples/` | sample `.math` files |
| `docs/LANGUAGE.md` | language reference |

## Getting the APK and the plugin (GitHub Actions)
Push to GitHub → **Actions → Build Klax** produces two artifacts:
* `klax-apk` → `klax.apk` (install on Android; allow "install unknown apps")
* `klax-math-acode-plugin` → `klax-math-plugin.zip`

Pushing a tag `vX.Y.Z` also attaches both files to a GitHub Release.
The APK is signed with a throw-away key unless you add the secrets `KLAX_KEYSTORE_BASE64`, `KLAX_KEYSTORE_PASSWORD`, `KLAX_KEY_ALIAS`, `KLAX_KEY_PASSWORD`
(a persistent key is needed to update the app in place).

## Install the Acode plugin
Acode → **Settings → Plugins → ⋮ / “Install from file”** (or open the zip) → pick `klax-math-plugin.zip`.
Open or create a `*.math` file, then open the command palette and type **Klax**:
`Preview graph` (Ctrl-Alt-P), `Send to Klax server` (Ctrl-Alt-S), `Export as PNG / SVG`, `New .math file`, `Server address`.
The preview has export buttons (PNG, JPEG, WEBP, SVG, PDF), a 🎛 panel (grid / axes / numbers / legend / title, transparent or custom background) and **📡 Server**.
While the preview is open every edit is pushed live to the Klax app.

## The Klax server
Opening the app starts a foreground service with an HTTP server (default **port 8080**, falls back to the next free port).
Change the port, or allow other devices on your Wi-Fi, from ⚙ in the app (LAN is **off** by default; the API has no password).

| Request | Description |
|---|---|
| `GET /` | the web UI (the app shows it; a browser on your LAN can too when LAN is on) |
| `PUT /api/source` | send `.math` code as the body — the app updates instantly |
| `GET /api/source` | current code |
| `GET /api/info` · `GET /api/version` | server info / change counter |
| `GET /render.svg` · `GET /render.png` | image of the current code (rendered by the app UI; keep the app open) |

```sh
curl -X PUT --data-binary @examples/demo.math http://127.0.0.1:8080/api/source
curl -o out.png http://127.0.0.1:8080/render.png
```

## Develop
```sh
node scripts/test.js          # language tests
node scripts/build-plugin.js  # → dist/klax-math-plugin.zip
gradle :app:assembleRelease   # needs the Android SDK (CI does it for you)
```
