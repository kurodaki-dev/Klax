# The `.math` language

A `.math` file is a list of **statements**. A statement ends with `;` (a line break also ends one).
Comments: `// line` and `/* block */`.

```
SIZE: {1200px, 1300px};          // image size in pixels (first thing in the file)
f(x) = sin(x); setColor -> #38bdf8;
g(x) = x^2 / 10; setColor -> rgba(251, 146, 60, 0.9);
```

## Size
`SIZE: {1200px, 1300px};` — also accepted: `SIZE://(1200px, 1300px);`, `SIZE: 1200px, 1300px;`, `SIZE(1200, 1300);`.
One number makes a square. Limits: 16 px to 8000 px per side.

## Functions
| Syntax | Meaning |
|---|---|
| `f(x) = x^2 - 3;` | function of `x` (any name: `f`, `g`, `wave`…) |
| `y = sin(x);` | shorthand for a function of `x` |
| `c(t) = (cos(t), sin(t));` | parametric curve (default `t` in `[0, 2π]`) |
| `r(t) = 3*cos(2*t); setPolar -> on;` | polar curve `r(θ)` (default `θ` in `[0, 2π]`) |
| `a = 2.5;` | constant, usable everywhere |
| `h(a, b) = a*b;` | helper function with several parameters (not drawn) |

Functions can call each other (`k(x) = f(x) + g(x)`), in any order.

**Operators** `+ - * / % ^` (also `**`), implicit multiplication (`2x`, `3(x+1)`, `2pi`), `x²` / `x³`.
**Constants** `pi` (or `π`), `e`, `tau`, `phi`, `inf`.
**Functions** `sin cos tan asin acos atan atan2 sinh cosh tanh asinh acosh atanh sec csc cot sqrt cbrt abs exp ln log log10 log2 floor ceil round trunc sign fract min max pow hypot mod deg rad gamma fact clamp step sinc gauss`
(`log(x)` is base 10, `log(x, b)` is base `b`).

## Style — applied to the statement(s) just above
`name -> value;` (the `set` prefix is optional and case does not matter).

| Property | Example |
|---|---|
| `setColor` | `#38bdf8`, `#f00`, `#ff000080`, `rgba(255,0,0,0.5)`, `hsl(210,80%,50%)`, `tomato` |
| `setWidth` | `3` |
| `setDash` | `6,4` · `dashed` · `dotted` · `solid` |
| `setOpacity` | `0.5` |
| `setLabel` | `"my curve"` (shown in the legend) |
| `setFill` | `on` · `rgba(37,99,235,0.2)` — fills between the curve and the x axis |
| `setPolar` | `on` |
| `setRadius` | point radius (for `point`) |

## Cutting a function — keep only the strokes you want
| Property | Effect |
|---|---|
| `setCut -> a, b;` | draw only for `a ≤ x ≤ b` (alias: `setDomain`). For parametric/polar curves it limits `t` / `θ` |
| `setCut -> [-5,-1] [1,5];` | several separate pieces (never joined) |
| `setCut -> 1, inf;` | open-ended: from `1` to the edge of the view (`-inf` works too) |
| `setClipY -> lo, hi;` | keep only the part of the stroke whose `y` is between `lo` and `hi` |
| `setEnds -> closed \| open \| none;` | dot at each end of every piece (● closed, ○ open) — handy for piecewise functions |

```
f(x) = x^2/4;  setColor -> #2563eb; setCut -> -3, 2; setEnds -> closed;
g(x) = 1/x;    setColor -> #dc2626; setCut -> [-5,-0.5] [0.5,5]; setEnds -> open;
h(x) = 2*sin(x); setClipY -> 0, 1.5;
```

## Shapes
`point(x1, y1, x2, y2, …)` · `line(x1, y1, x2, y2)` · `circle(cx, cy, r)` · `text(x, y, "hello")`
Styled with the same properties (`setColor`, `setRadius`, `setLabel`, `setFill`, `setDash`, `setWidth`).

## Global settings
| Statement | Meaning |
|---|---|
| `BG: #0f172a;` | background — any colour, `rgba(...)`, or `transparent` |
| `RANGE: x(-10, 10) y(-5, 5);` | visible window (also `RANGE: -10, 10, -5, 5;`, `XRANGE: a, b;`, `YRANGE: a, b;`). Without `y`, it is fitted to the curves |
| `ASPECT: equal;` | same scale on both axes (circles stay round) |
| `TITLE: "Text";` | title |
| `GRID: on\|off;` `AXES: on\|off;` | grid lines / axis lines |
| `TICKS: on\|off;` | numbers along the axes |
| `LEGEND: on\|off;` | `on` also lists unlabeled curves; labelled curves show a legend by default |
| `GRIDCOLOR:` `AXISCOLOR:` `TEXTCOLOR:` | override the automatic light/dark colours |
| `PADDING: 40;` | margin (px) around the plot area |

## Export options (app and plugin)
The export panel can override, **without touching the file**: grid, axes, numbers, legend, title and background
(*as in file* / *transparent* / *custom colour with opacity*). Transparency is kept in PNG, WEBP and SVG; JPEG and PDF are flattened on white.
