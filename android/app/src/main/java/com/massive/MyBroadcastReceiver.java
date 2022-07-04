package com.massive;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class MyBroadcastReceiver extends BroadcastReceiver {
    private static final String CHANNEL_ID = "MassiveAlarm";
    private static final int ALARM_ID = 59;

    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("MyBroadcastReceiver", "Received intent for BroadcastReceiver.");
        String action = intent.getAction();
        Log.d("MyBroadcastReceiver", "Action: " + action);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_ID, importance);
            channel.setDescription("Alarms for rest timings.");
            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
        context.startService(new Intent(context, AlarmService.class));
        Intent contentIntent = new Intent(context.getApplicationContext(), AlarmActivity.class);
        PendingIntent pendingContent = PendingIntent.getActivity(context, 0,  contentIntent, PendingIntent.FLAG_IMMUTABLE);
        long[] pattern = {0, 100, 1000, 200, 2000};
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.rn_edit_text_material)
                .setContentTitle("Rest")
                .setContentText("Break times over!")
                .setContentIntent(pendingContent)
                .setAutoCancel(true)
                .setVibrate(pattern)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setPriority(NotificationCompat.PRIORITY_HIGH);
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.notify(ALARM_ID, builder.build());
    }

    private void vibrate(Context context) {
    }
}


