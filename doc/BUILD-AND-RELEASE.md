# Build & release

Everything is built by GitHub Actions (`.github/workflows/build.yml`).

## Jobs
| Job | What it does |
|---|---|
| **Tests + Acode plugin** | runs `node scripts/test.js` and builds `klax-math-plugin.zip` |
| **Publish release** | creates a GitHub Release with the zip (see below) |

The workflow runs on every push, every pull request, and manually (**Actions, Build Klax, Run workflow**).

## Automatic releases
* **Push to `main`**: release tagged `v1.0.<run number>` with `klax-math-plugin.zip` and generated notes.
* **Push a tag `v*`** (for example `v2.0.0`): release under that tag.
* Other branches and pull requests only build and upload the zip as an artifact.

The plugin's version in `plugin.json` is set to `1.0.<run number>` during the build, so each release is newer than the previous one and Acode can offer the update.

## Building locally
```sh
node scripts/test.js                         # tests
node scripts/build-plugin.js                 # dist/klax-math-plugin.zip
KLAX_VERSION=1.2.3 node scripts/build-plugin.js   # choose the version
```
The build prepends `core/klax.js` and the files of `examples/` to `plugin/main.src.js`, then zips `plugin.json`, `main.js`, `readme.md` and `icon.png`.
