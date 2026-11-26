# Cookbook

Copy a block into a `.math` file. Every recipe on this page is rendered by the test suite, so they work as written.

## Dark theme, two curves and a legend
```math
SIZE: {1200px, 800px};
BG: #0f172a;
TITLE: "Sine and cosine";
RANGE: x(-2*pi, 2*pi) y(-1.5, 1.5);
f(x) = sin(x); setColor -> #38bdf8; setLabel -> "sin(x)";
g(x) = cos(x); setColor -> #f472b6; setLabel -> "cos(x)";
```

## Clean curve for a slide (transparent, no grid)
Write it in the file…
```math
SIZE: {1000px, 600px};
BG: transparent;
GRID: off;
AXES: off;
TICKS: off;
f(x) = exp(-x^2); setColor -> #2563eb; setWidth -> 6;
```
…or keep the file normal and untick the elements in the [export panel](EXPORT.md).

## Piecewise function with open and closed ends
```math
SIZE: {1000px, 700px};
RANGE: x(-4, 4) y(-1, 5);
f(x) = x^2;      setCut -> -3, 1;  setColor -> #2563eb; setEnds -> closed;
g(x) = 4 - x;    setCut -> 1, 4;   setColor -> #dc2626; setEnds -> open;
```

## Only the part of a curve inside a band
```math
SIZE: {1000px, 700px};
RANGE: x(-10, 10) y(-4, 4);
f(x) = 3*sin(x); setColor -> #bbbbbb;
g(x) = 3*sin(x); setColor -> #16a34a; setWidth -> 5; setClipY -> 0, 2;
```

## Skipping a hole (two pieces of 1/x)
```math
SIZE: {900px, 700px};
RANGE: x(-5, 5) y(-5, 5);
f(x) = 1 / x; setCut -> [-5, -0.2] [0.2, 5]; setColor -> #9333ea;
```

## Shading the area under a curve
```math
SIZE: {1000px, 700px};
RANGE: x(-4, 4) y(-0.2, 1.2);
f(x) = exp(-x^2/2); setColor -> #0891b2; setFill -> rgba(8, 145, 178, 0.25); setCut -> -2, 2;
```

## Using constants and your own functions
```math
SIZE: {1000px, 700px};
a = 2;
b = 0.5;
wave(x, amp, freq) = amp * sin(freq * x);
f(x) = wave(x, a, b) + wave(x, 0.5, 4);
g(x) = wave(x, a, b); setColor -> #aaaaaa; setDash -> dashed;
```

## Circle, parametric curve and points (equal scale)
```math
SIZE: {900px, 900px};
ASPECT: equal;
RANGE: x(-6, 6);
circle(0, 0, 4); setColor -> #dc2626;
c(t) = (2*cos(t) + 1, 2*sin(t)); setColor -> #2563eb;
point(0, 0, 4, 0); setColor -> #111827; setRadius -> 6;
text(0.2, 0.3, "origin");
```

## Lissajous curve
```math
SIZE: {900px, 900px};
ASPECT: equal;
BG: #111827;
l(t) = (sin(3*t), sin(2*t)); setCut -> 0, 2*pi; setColor -> #fde047; setWidth -> 4;
```

## Polar rose and spiral
```math
SIZE: {1000px, 1000px};
ASPECT: equal;
BG: #111827;
rose(t) = 5*cos(4*t); setPolar -> on; setColor -> #f43f5e;
spiral(t) = 0.3*t; setPolar -> on; setCut -> 0, 6*pi; setColor -> #22d3ee;
```

## Tangent without the vertical joins
```math
SIZE: {1000px, 700px};
RANGE: x(-2*pi, 2*pi) y(-6, 6);
f(x) = tan(x); setColor -> #db2777;
```

## Light "paper" look
```math
SIZE: {1200px, 800px};
BG: #f8f5ec;
GRIDCOLOR: rgba(120, 90, 40, 0.2);
AXISCOLOR: #5b4636;
TEXTCOLOR: #5b4636;
f(x) = x^3 / 6 - x; setColor -> #b45309; setWidth -> 4;
```

## Normal distribution with `gauss`
```math
SIZE: {1000px, 600px};
RANGE: x(-5, 5);
f(x) = gauss(x, 0, 1); setColor -> #2563eb; setLabel -> "μ=0, σ=1";
g(x) = gauss(x, 1, 0.5); setColor -> #dc2626; setLabel -> "μ=1, σ=0.5";
```
