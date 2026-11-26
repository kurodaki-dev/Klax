package dev.klax.app;

import android.content.Context;
import android.content.res.AssetManager;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Tiny dependency-free HTTP server.
 *
 *   GET  /                      web UI (editor + preview + export)
 *   GET  /api/info              server info (JSON)
 *   GET  /api/version           {"version":N,"wantPng":bool}  (polled by the UI)
 *   GET  /api/source            current .math source (text/plain)
 *   PUT  /api/source            replace the source (also POST). Body = .math text
 *   GET  /api/examples          list of bundled examples
 *   GET  /render.svg            SVG of the current source (rendered by the app UI)
 *   GET  /render.png            PNG of the current source (rendered by the app UI)
 *   PUT  /api/rendered/{svg|png}?v=N   used by the UI to hand back its render
 */
public final class KlaxServer {
    public static final KlaxServer I = new KlaxServer();
    static final String VERSION = "1.0.0";
    private static final int MAX_BODY = 32 * 1024 * 1024;

    private volatile ServerSocket socket;
    private ExecutorService pool;
    private Context ctx;
    private File sourceFile;
    public volatile int port;
    public volatile boolean lan;

    private final Object lock = new Object();
    private String source = "";
    private long version = 0;
    private byte[] svg, png;
    private long svgVer = -1, pngVer = -1;
    private volatile long wantPngUntil = 0;

    public boolean isRunning() { return socket != null && !socket.isClosed(); }

    public synchronized void start(Context c, int preferredPort, boolean lanAccess) throws IOException {
        stop();
        ctx = c.getApplicationContext();
        sourceFile = new File(ctx.getFilesDir(), "current.math");
        synchronized (lock) {
            if (version == 0 && sourceFile.exists()) {
                try { source = new String(readAll(new java.io.FileInputStream(sourceFile), 4 << 20), StandardCharsets.UTF_8); } catch (IOException ignored) { }
            }
        }
        IOException last = null;
        for (int p = preferredPort; p < preferredPort + 20 && p <= 65535; p++) {
            try {
                ServerSocket ss = new ServerSocket();
                ss.setReuseAddress(true);
                ss.bind(new InetSocketAddress(lanAccess ? InetAddress.getByName("0.0.0.0") : InetAddress.getByName("127.0.0.1"), p));
                socket = ss; port = p; lan = lanAccess;
                break;
            } catch (IOException e) { last = e; }
        }
        if (socket == null) throw last != null ? last : new IOException("No free port");
        pool = Executors.newCachedThreadPool();
        final ServerSocket ss = socket;
        Thread t = new Thread(() -> {
            while (!ss.isClosed()) {
                try {
                    final Socket s = ss.accept();
                    pool.execute(() -> handle(s));
                } catch (IOException e) { break; }
            }
        }, "klax-accept");
        t.setDaemon(true);
        t.start();
    }

    public synchronized void stop() {
        try { if (socket != null) socket.close(); } catch (IOException ignored) { }
        socket = null;
        if (pool != null) { pool.shutdownNow(); pool = null; }
    }

    public List<String> urls() {
        List<String> out = new ArrayList<>();
        out.add("http://127.0.0.1:" + port);
        if (lan) {
            try {
                for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                    if (!ni.isUp() || ni.isLoopback()) continue;
                    for (InetAddress a : Collections.list(ni.getInetAddresses())) {
                        if (a instanceof java.net.Inet4Address) out.add("http://" + a.getHostAddress() + ":" + port);
                    }
                }
            } catch (Exception ignored) { }
        }
        return out;
    }

    /* ------------------------------------------------------------------ */

    private void handle(Socket s) {
        try (Socket sock = s) {
            sock.setSoTimeout(15000);
            BufferedInputStream in = new BufferedInputStream(sock.getInputStream());
            OutputStream out = sock.getOutputStream();
            String reqLine = readLine(in);
            if (reqLine == null || reqLine.isEmpty()) return;
            String[] parts = reqLine.split(" ");
            if (parts.length < 2) { respond(out, 400, "text/plain", "Bad request"); return; }
            String method = parts[0].toUpperCase(Locale.ROOT), target = parts[1];
            Map<String, String> headers = new HashMap<>();
            String line;
            while ((line = readLine(in)) != null && !line.isEmpty()) {
                int i = line.indexOf(':');
                if (i > 0) headers.put(line.substring(0, i).trim().toLowerCase(Locale.ROOT), line.substring(i + 1).trim());
            }
            byte[] body = new byte[0];
            String cl = headers.get("content-length");
            if (cl != null) {
                long n;
                try { n = Long.parseLong(cl); } catch (NumberFormatException e) { n = -1; }
                if (n < 0 || n > MAX_BODY) { respond(out, 413, "text/plain", "Payload too large"); return; }
                body = new byte[(int) n];
                int off = 0;
                while (off < n) { int r = in.read(body, off, (int) n - off); if (r < 0) break; off += r; }
            }
            String path = target, query = "";
            int q = target.indexOf('?');
            if (q >= 0) { path = target.substring(0, q); query = target.substring(q + 1); }
            route(out, method, path, query, body);
        } catch (Exception ignored) { }
    }

    private void route(OutputStream out, String method, String path, String query, byte[] body) throws IOException {
        if (method.equals("OPTIONS")) { respond(out, 204, "text/plain", new byte[0]); return; }
        boolean write = method.equals("PUT") || method.equals("POST");

        switch (path) {
            case "/api/info":
                respond(out, 200, "application/json", info()); return;
            case "/api/version":
                synchronized (lock) {
                    respond(out, 200, "application/json", "{\"version\":" + version + ",\"wantPng\":" + (System.currentTimeMillis() < wantPngUntil && pngVer < version) + "}");
                }
                return;
            case "/api/source":
                if (write) {
                    if (body.length > (4 << 20)) { respond(out, 413, "text/plain", "Source too large"); return; }
                    long v = setSource(new String(body, StandardCharsets.UTF_8));
                    respond(out, 200, "application/json", "{\"version\":" + v + "}");
                } else {
                    synchronized (lock) { respond(out, 200, "text/plain; charset=utf-8", source.getBytes(StandardCharsets.UTF_8)); }
                }
                return;
            case "/api/examples":
                respond(out, 200, "application/json", examples()); return;
            case "/api/rendered/svg":
            case "/api/rendered/png":
                if (!write) { respond(out, 405, "text/plain", "Use PUT"); return; }
                synchronized (lock) {
                    long v = parseLong(param(query, "v"), version);
                    if (path.endsWith("svg")) { svg = body; svgVer = v; } else { png = body; pngVer = v; }
                    lock.notifyAll();
                }
                respond(out, 200, "application/json", "{\"ok\":true}");
                return;
            case "/render.svg":
            case "/render.png": {
                boolean isPng = path.endsWith("png");
                long deadline = System.currentTimeMillis() + 8000;
                byte[] data;
                synchronized (lock) {
                    if (isPng) wantPngUntil = deadline + 2000;
                    while ((isPng ? pngVer : svgVer) < version && System.currentTimeMillis() < deadline) {
                        try { lock.wait(200); } catch (InterruptedException e) { break; }
                    }
                    data = (isPng ? pngVer : svgVer) >= version ? (isPng ? png : svg) : null;
                }
                if (data == null) {
                    respond(out, 504, "text/plain", "The Klax app did not render in time. Keep the Klax app open (foreground) and retry.");
                } else {
                    respond(out, 200, isPng ? "image/png" : "image/svg+xml", data);
                }
                return;
            }
            default:
        }
        if (!method.equals("GET") && !method.equals("HEAD")) { respond(out, 405, "text/plain", "Method not allowed"); return; }
        serveAsset(out, path);
    }

    private long setSource(String text) {
        synchronized (lock) {
            if (!text.equals(source) || version == 0) { source = text; version++; }
            long v = version;
            try (FileOutputStream f = new FileOutputStream(sourceFile)) { f.write(text.getBytes(StandardCharsets.UTF_8)); } catch (IOException ignored) { }
            lock.notifyAll();
            return v;
        }
    }

    private String info() {
        StringBuilder sb = new StringBuilder("{\"name\":\"Klax\",\"version\":\"" + VERSION + "\",\"port\":" + port + ",\"lan\":" + lan + ",\"urls\":[");
        List<String> u = urls();
        for (int i = 0; i < u.size(); i++) sb.append(i > 0 ? "," : "").append('"').append(u.get(i)).append('"');
        synchronized (lock) { sb.append("],\"sourceVersion\":").append(version).append('}'); }
        return sb.toString();
    }

    private String examples() throws IOException {
        StringBuilder sb = new StringBuilder("[");
        String[] list = ctx.getAssets().list("web/examples");
        if (list != null) for (int i = 0; i < list.length; i++) sb.append(i > 0 ? "," : "").append('"').append(list[i]).append('"');
        return sb.append(']').toString();
    }

    private void serveAsset(OutputStream out, String path) throws IOException {
        if (path.equals("/")) path = "/index.html";
        if (path.contains("..") || path.contains("\\")) { respond(out, 400, "text/plain", "Bad path"); return; }
        AssetManager am = ctx.getAssets();
        try (InputStream is = am.open("web" + path)) {
            respond(out, 200, mime(path), readAll(is, 8 << 20));
        } catch (IOException e) {
            respond(out, 404, "text/plain", "Not found: " + path);
        }
    }

    /* ------------------------------------------------------------------ */

    private static String mime(String p) {
        p = p.toLowerCase(Locale.ROOT);
        if (p.endsWith(".html")) return "text/html; charset=utf-8";
        if (p.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (p.endsWith(".css")) return "text/css; charset=utf-8";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".math")) return "text/plain; charset=utf-8";
        return "application/octet-stream";
    }

    private static void respond(OutputStream out, int code, String type, String body) throws IOException {
        respond(out, code, type, body.getBytes(StandardCharsets.UTF_8));
    }

    private static void respond(OutputStream out, int code, String type, byte[] body) throws IOException {
        String status = code == 200 ? "OK" : code == 204 ? "No Content" : code == 400 ? "Bad Request" : code == 404 ? "Not Found"
                : code == 405 ? "Method Not Allowed" : code == 413 ? "Payload Too Large" : code == 504 ? "Gateway Timeout" : "Error";
        String head = "HTTP/1.1 " + code + " " + status + "\r\n"
                + "Content-Type: " + type + "\r\n"
                + "Content-Length: " + body.length + "\r\n"
                + "Access-Control-Allow-Origin: *\r\n"
                + "Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS\r\n"
                + "Access-Control-Allow-Headers: Content-Type\r\n"
                + "Access-Control-Allow-Private-Network: true\r\n"
                + "Cache-Control: no-store\r\n"
                + "Connection: close\r\n\r\n";
        out.write(head.getBytes(StandardCharsets.ISO_8859_1));
        out.write(body);
        out.flush();
    }

    private static String readLine(InputStream in) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        int c;
        while ((c = in.read()) >= 0) {
            if (c == '\n') break;
            if (c != '\r') b.write(c);
            if (b.size() > 16384) throw new IOException("Header too long");
        }
        if (c < 0 && b.size() == 0) return null;
        return b.toString("ISO-8859-1");
    }

    private static byte[] readAll(InputStream in, int max) throws IOException {
        try (InputStream is = in) {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int r;
            while ((r = is.read(buf)) > 0) { b.write(buf, 0, r); if (b.size() > max) throw new IOException("Too large"); }
            return b.toByteArray();
        }
    }

    private static String param(String query, String key) {
        for (String kv : query.split("&")) {
            int i = kv.indexOf('=');
            if (i > 0 && kv.substring(0, i).equals(key)) return kv.substring(i + 1);
        }
        return null;
    }

    private static long parseLong(String s, long dflt) {
        try { return s == null ? dflt : Long.parseLong(s); } catch (NumberFormatException e) { return dflt; }
    }
}
