package dev.klax.app;

import android.Manifest;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private static final int REQ_FILE = 11;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private int waited = 0;

    private final BroadcastReceiver quit = new BroadcastReceiver() {
        @Override public void onReceive(Context c, Intent i) { finishAndRemoveTask(); }
    };

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                    startActivityForResult(Intent.createChooser(i, "Open a .math file"), REQ_FILE);
                } catch (Exception e) { fileCallback = null; return false; }
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "KlaxNative");
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(quit, new IntentFilter("dev.klax.app.QUIT"), Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(quit, new IntentFilter("dev.klax.app.QUIT"));
        ServerService.start(this);
        waitForServer();
    }

    private void waitForServer() {
        if (KlaxServer.I.isRunning()) { web.loadUrl("http://127.0.0.1:" + KlaxServer.I.port + "/"); handleIntent(getIntent()); return; }
        if (++waited > 40) { web.loadData("<h3 style='font-family:sans-serif;color:#fff'>The Klax server could not start.</h3>", "text/html", "utf-8"); return; }
        ui.postDelayed(this::waitForServer, 150);
    }

    @Override protected void onNewIntent(Intent i) { super.onNewIntent(i); setIntent(i); handleIntent(i); }

    /** Opens a .math file shared/opened from a file manager (or from Acode). */
    private void handleIntent(Intent i) {
        if (i == null || !Intent.ACTION_VIEW.equals(i.getAction()) || i.getData() == null) return;
        try (InputStream in = getContentResolver().openInputStream(i.getData())) {
            java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream();
            byte[] buf = new byte[8192]; int r;
            while ((r = in.read(buf)) > 0 && b.size() < (4 << 20)) b.write(buf, 0, r);
            final String text = new String(b.toByteArray(), "UTF-8");
            final String js = "window.klaxLoad && window.klaxLoad(" + org.json.JSONObject.quote(text) + ")";
            ui.postDelayed(() -> web.evaluateJavascript(js, null), 800);
        } catch (Exception e) { Toast.makeText(this, "Cannot open file: " + e.getMessage(), Toast.LENGTH_LONG).show(); }
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE && fileCallback != null) {
            Uri[] r = (res == RESULT_OK && data != null && data.getData() != null) ? new Uri[]{data.getData()} : null;
            fileCallback.onReceiveValue(r);
            fileCallback = null;
        } else super.onActivityResult(req, res, data);
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else moveTaskToBack(true); // the server keeps running
    }

    @Override protected void onDestroy() {
        try { unregisterReceiver(quit); } catch (Exception ignored) { }
        if (web != null) web.destroy();
        super.onDestroy();
    }

    /** Functions exposed to the web UI as window.KlaxNative. */
    public class Bridge {
        @JavascriptInterface public boolean available() { return true; }

        @JavascriptInterface public String config() {
            return "{\"port\":" + KlaxServer.I.port + ",\"lan\":" + KlaxServer.I.lan + "}";
        }

        @JavascriptInterface public void applyConfig(int port, boolean lan) {
            if (port < 1024 || port > 65535) { toast("Port must be between 1024 and 65535"); return; }
            ServerService.prefs(MainActivity.this).edit().putInt("port", port).putBoolean("lan", lan).apply();
            ui.post(() -> { ServerService.start(MainActivity.this); waited = 0; web.stopLoading(); ui.postDelayed(MainActivity.this::waitForServer, 400); });
        }

        @JavascriptInterface public void quit() {
            startService(new Intent(MainActivity.this, ServerService.class).setAction(ServerService.ACTION_STOP));
        }

        @JavascriptInterface public void toast(String m) { ui.post(() -> Toast.makeText(MainActivity.this, m, Toast.LENGTH_SHORT).show()); }

        /** Saves a file (base64) into Downloads/Klax. Returns a human-readable location, or "" on failure. */
        @JavascriptInterface public String saveFile(String name, String mime, String base64) {
            try {
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                name = name.replaceAll("[\\\\/:*?\"<>|]", "_");
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    v.put(MediaStore.Downloads.MIME_TYPE, mime);
                    v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Klax");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (uri == null) throw new Exception("MediaStore refused the file");
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) { os.write(data); }
                } else {
                    File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "Klax");
                    if (!dir.exists() && !dir.mkdirs()) throw new Exception("Cannot create " + dir);
                    try (FileOutputStream os = new FileOutputStream(new File(dir, name))) { os.write(data); }
                }
                toast("Saved to Downloads/Klax/" + name);
                return "Downloads/Klax/" + name;
            } catch (Exception e) {
                toast("Save failed: " + e.getMessage());
                return "";
            }
        }
    }
}
