package com.massive; // replace com.your-app-name with your app’s name

import static android.content.Context.ALARM_SERVICE;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.WorkRequest;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.time.Duration;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

public class AlarmModule extends ReactContextBaseJavaModule {
    AlarmModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "AlarmModule";
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod(isBlockingSynchronousMethod = true)
    public void timer(int milliseconds) {
        Log.d("AlarmModule", "Queue alarm for " + milliseconds + " delay");
        Intent intent = new Intent(getReactApplicationContext(), MyBroadcastReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                getReactApplicationContext(), 69, intent, PendingIntent.FLAG_IMMUTABLE);
        AlarmManager alarmManager = (AlarmManager) getReactApplicationContext().getSystemService(ALARM_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Log.d("AlarmModule", "Can schedule: " + alarmManager.canScheduleExactAlarms());
        }
        AlarmManager.AlarmClockInfo info = new AlarmManager.AlarmClockInfo(System.currentTimeMillis() + milliseconds, pendingIntent);
        alarmManager.setAlarmClock(info, pendingIntent);
    }
}
