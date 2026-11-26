# Build & release

Everything is built by GitHub Actions (`.github/workflows/build.yml`); you do not need Android Studio.

## Jobs
| Job | What it does |
|---|---|
| **Language tests + Acode plugin** | runs `node scripts/test.js`, builds `klax-math-plugin.zip` |
| **Android APK** | installs the SDK pieces, generates/loads a signing key, runs `gradle :app:assembleRelease`, uploads `klax.apk` |
| **Publish release** | creates a GitHub Release with both files (see below) |

The workflow runs on every push, every pull request, and manually (**Actions → Build Klax → Run workflow**).

## Automatic releases
* **Push to `main`** → release tagged `v1.0.<run number>`, with `klax.apk` and `klax-math-plugin.zip`, generated notes.
* **Push a tag `v*`** (for example `v2.0.0`) → release under that tag.
* Other branches and pull requests only build and upload artifacts — no release.

The APK's `versionCode` equals the run number and `versionName` is `1.0.<run number>`, so each build is newer than the previous.

## Signing
Android only updates an app if the new APK is signed with the **same key**.
* **Without secrets**: a throw-away key is generated for each run. APKs install fine but cannot update one another (uninstall first).
* **With secrets** (recommended): add these in **Settings → Secrets and variables → Actions**:

| Secret | Content |
|---|---|
| `KLAX_KEYSTORE_BASE64` | your `.jks` file, base64-encoded (`base64 -w0 klax.jks`) |
| `KLAX_KEYSTORE_PASSWORD` | keystore password |
| `KLAX_KEY_ALIAS` | key alias |
| `KLAX_KEY_PASSWORD` | key password (defaults to the keystore password) |

Create a key once with:
```sh
keytool -genkeypair -v -keystore klax.jks -alias klax -keyalg RSA -keysize 2048 -validity 10000
```
Keep the `.jks` safe: if you lose it you cannot update installed apps. Never commit it (it is git-ignored).

## Building locally
```sh
node scripts/test.js           # language tests
node scripts/build-plugin.js   # → dist/klax-math-plugin.zip
gradle :app:assembleRelease    # needs JDK 17 and the Android SDK (platform 34)
```
The app build copies `core/klax.js` and `examples/*.math` into the app's assets, so there is a single source of truth for the language.

## Plugin versions
The plugin version is in `plugin/plugin.json`; bump it when you change the plugin so Acode offers the update.
