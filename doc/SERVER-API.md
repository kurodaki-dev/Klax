# Server API

The app listens on `http://<host>:<port>` (default `http://127.0.0.1:8080`). CORS is open (`Access-Control-Allow-Origin: *`), responses are never cached, every connection is closed after one response.

## Endpoints
| Method & path | Body | Response |
|---|---|---|
| `GET /` and static files | — | the web UI |
| `GET /api/info` | — | `{"name":"Klax","version":"…","port":8080,"lan":false,"urls":["http://127.0.0.1:8080"],"sourceVersion":3}` |
| `GET /api/version` | — | `{"version":3,"wantPng":false}` — change counter, polled by the UI |
| `GET /api/source` | — | current `.math` code (`text/plain`) |
| `PUT` or `POST /api/source` | `.math` code (max 4 MB) | `{"version":N}` — the app updates immediately |
| `GET /api/examples` | — | `["demo.math","cut.math",…]` |
| `GET /examples/<name>` | — | an example file |
| `GET /render.svg` | — | SVG of the current code |
| `GET /render.png` | — | PNG of the current code, scale 1× |
| `PUT /api/rendered/svg?v=N`, `PUT /api/rendered/png?v=N` | image bytes | used internally by the UI to hand back its render |

Errors: `400` bad request, `404` unknown path, `405` wrong method, `413` body too large, `504` render not available in time.

## Examples
```sh
# send code
curl -X PUT --data-binary @examples/demo.math http://127.0.0.1:8080/api/source

# read it back
curl http://127.0.0.1:8080/api/source

# get the picture
curl -o out.svg http://127.0.0.1:8080/render.svg
curl -o out.png http://127.0.0.1:8080/render.png
```

From JavaScript:
```js
await fetch('http://127.0.0.1:8080/api/source', {
  method: 'PUT',
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  body: 'SIZE: 800px, 600px;\nf(x) = x^2; setColor -> #f00;'
});
```

## How `/render.*` works — and its limit
The server does not contain a maths renderer: the app's web page (in the WebView) does the drawing and hands the result back to the server.
When you request `/render.svg` or `/render.png` right after changing the source, the server waits up to **8 seconds** for the page to deliver a fresh render, then answers `504` if it did not.
This means **the Klax app must be open on screen** (or at least not frozen by Android) when you use these two endpoints. `PUT /api/source` and `GET /api/source` always work, because the server itself handles them.
Exports use the file's own settings (no export-time overrides); for those use the app's Export tab.

## Security
There is no authentication. By default the server only accepts connections from the phone itself. Turn **LAN** on only on networks you trust: anyone who can reach the port can read and replace the current code.
