# Android app

Minimum Android version: **8.0 (API 26)**.

## Screens
The app is a web interface served by its own server and shown in a full-screen WebView. On a phone it has three tabs; on a wide screen the three panels sit side by side.

| Tab | Content |
|---|---|
| **Code** | editor (Tab key inserts two spaces), error list, quick syntax hint |
| **Preview** | live image, size in pixels, **Fit / 100%** switch |
| **Export** | file name, format, scale, quality, background, elements, **Download**, **Copy SVG code**, **Copy render URL** |

Header buttons: **New**, **Open** (a `.math` file), **Save .math**, **Examples…** (bundled samples), **⚙** (server settings).
Opening a `*.math` file from a file manager with Klax loads it in the editor.

## The server
* Starts when the app starts, in a foreground service with a notification (**Stop** button included).
* Default port **8080**. If it is busy the next free port (up to +19) is used; the notification and ⚙ show the real one.
* **⚙ → Port / LAN**: pick another port (1024–65535) and decide who can connect.
  * LAN **off** (default): only apps on this phone (`127.0.0.1`).
  * LAN **on**: other devices on the same network can use it too. The API has **no password** — enable it only on networks you trust.
* **Stop server & quit** ends the service. Pressing *Back* only sends the app to the background; the server keeps running.

## Your code is kept
The current code is saved by the server (`current.math` in the app's private storage) and by the web UI, so it survives restarts.

## Permissions
| Permission | Why |
|---|---|
| Internet | the local HTTP server |
| Foreground service | keep the server alive while you work in Acode |
| Notifications | show the server notification (Android 13+) |
| Storage (Android 8–9 only) | save exports into `Downloads/Klax` |

Exports are written to **Downloads/Klax/**.

## Notes
* `GET /render.svg` and `/render.png` are drawn by the app's screen, so keep the app open (not swiped away) when you use them; see [Server API](SERVER-API.md).
* The app's WebView talks to `http://127.0.0.1` over plain HTTP; this is why cleartext traffic is enabled in the manifest.
