# Klax Math

Draw mathematical functions by writing a `.math` file, right inside Acode.

```
SIZE: {1200px, 1300px};
BG: #0f172a;
f(x) = sin(x); setColor -> #38bdf8;
g(x) = x^2/10; setColor -> rgba(251,146,60,0.9);
```

## Commands (open the Acode command palette and type "Klax")
| Command | Shortcut |
|---|---|
| Preview graph (live) | Ctrl-Alt-P |
| Send to Klax server | Ctrl-Alt-S |
| Export PNG / SVG | — |
| New .math file | — |
| Server address | — |

The preview exports **PNG, JPEG, WEBP, SVG and PDF**. "📡 Server" pushes your code to the Klax Android app
(`http://127.0.0.1:8080` by default). Full language reference: `docs/LANGUAGE.md` in the repository.
