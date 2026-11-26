# Getting started

## 1. Get the files
Every push to `main` publishes a GitHub Release containing:
* `klax.apk` — the Android app
* `klax-math-plugin.zip` — the Acode plugin

Download them from the repository's **Releases** page (or from **Actions → Build Klax → Artifacts**).

## 2. Install the app
1. Open `klax.apk` on your phone and allow "install unknown apps" for your browser/file manager when asked.
2. Start **Klax**. It starts a local server (default port **8080**) and shows a notification while it runs.
3. The app opens with an example already loaded: edit the code on the **Code** tab, look at the **Preview** tab, and download from the **Export** tab.

> Releases built without your own signing key use a throw-away key, so a new build cannot update an installed one:
> uninstall first. See [Build & release](BUILD-AND-RELEASE.md) to set a permanent key.

## 3. Install the Acode plugin
1. In Acode open **Settings → Plugins** and install from file, choosing `klax-math-plugin.zip`.
2. Create or open a file whose name ends in `.math`.
3. Open the command palette and type **Klax**.

## 4. Draw something
Create `hello.math`:

```
SIZE: {1200px, 800px};
BG: #0f172a;
TITLE: "Hello Klax";

f(x) = sin(x);        setColor -> #38bdf8; setWidth -> 3;
g(x) = x^2 / 10 - 2;  setColor -> rgba(251, 146, 60, 0.9);
```

* **Klax: preview graph** (Ctrl-Alt-P) shows it right inside Acode, refreshing as you type.
* **📡 Server** in the preview (or Ctrl-Alt-S) sends the code to the Klax app, where you can export it.
* Use the **Export** panel / 🎛 button to remove the grid or choose a transparent or coloured background.

Next: the [language reference](LANGUAGE.md) and the [cookbook](COOKBOOK.md).
