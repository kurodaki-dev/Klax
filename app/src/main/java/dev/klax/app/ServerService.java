package dev.klax.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

/** Foreground service keeping the Klax HTTP server alive while Acode is in the foreground. */
public class ServerService extends Service {
    static final String ACTION_START = "dev.klax.app.START";
    static final String ACTION_STOP = "dev.klax.app.STOP";
    static final String CHANNEL = "klax-server";
    static final int DEFAULT_PORT = 8080;

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("klax", MODE_PRIVATE); }

    static void start(Context c) {
        Intent i = new Intent(c, ServerService.class).setAction(ACTION_START);
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            KlaxServer.I.stop();
            stopForeground(true);
            stopSelf();
            sendBroadcast(new Intent("dev.klax.app.QUIT").setPackage(getPackageName()));
            return START_NOT_STICKY;
        }
        SharedPreferences p = prefs(this);
        String error = null;
        try {
            KlaxServer.I.start(this, p.getInt("port", DEFAULT_PORT), p.getBoolean("lan", false));
        } catch (Exception e) {
            error = e.getMessage();
        }
        startForegroundCompat(error);
        return START_STICKY;
    }

    private void startForegroundCompat(String error) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) nm.createNotificationChannel(new NotificationChannel(CHANNEL, "Klax server", NotificationManager.IMPORTANCE_LOW));
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1, new Intent(this, ServerService.class).setAction(ACTION_STOP), PendingIntent.FLAG_IMMUTABLE);
        String text = error != null ? "Could not start: " + error : "Listening on http://127.0.0.1:" + KlaxServer.I.port + (KlaxServer.I.lan ? "  (LAN open)" : "");
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        Notification n = b.setSmallIcon(android.R.drawable.ic_menu_edit).setContentTitle("Klax server")
                .setContentText(text).setContentIntent(open).setOngoing(true)
                .addAction(new Notification.Action.Builder(android.R.drawable.ic_delete, "Stop", stop).build()).build();
        if (Build.VERSION.SDK_INT >= 34) startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(1, n);
    }

    @Override public void onDestroy() { KlaxServer.I.stop(); super.onDestroy(); }
    @Override public IBinder onBind(Intent intent) { return null; }
}
