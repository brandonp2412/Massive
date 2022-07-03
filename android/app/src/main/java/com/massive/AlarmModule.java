package com.massive; // replace com.your-app-name with your app’s name

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

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
        WorkRequest request = new PeriodicWorkRequest.Builder(
                AlarmWorker.class, milliseconds, TimeUnit.MILLISECONDS
        )
                .build();
        Log.d("AlarmModule", "Queue alarm for " + milliseconds + " delay");
        WorkManager.getInstance(getReactApplicationContext())
                .enqueue(request);
    }
}
