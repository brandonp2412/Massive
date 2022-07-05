package com.massive

import androidx.annotation.RequiresApi
import android.content.Intent
import android.app.NotificationManager
import android.app.NotificationChannel
import com.massive.MyBroadcastReceiver
import com.massive.AlarmService
import com.massive.AlarmActivity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class MyBroadcastReceiver : BroadcastReceiver() {
    @RequiresApi(api = Build.VERSION_CODES.M)
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("MyBroadcastReceiver", "Received intent for BroadcastReceiver.")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_ID, importance)
            channel.description = "Alarms for rest timings."
            val notificationManager = context.getSystemService(
                NotificationManager::class.java
            )
            notificationManager.createNotificationChannel(channel)
        }
        context.startService(Intent(context, AlarmService::class.java))
        val contentIntent = Intent(context.applicationContext, AlarmActivity::class.java)
        val pendingContent =
            PendingIntent.getActivity(context, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_baseline_timer_24)
            .setContentTitle("Rest")
            .setContentText("Break times over!")
            .setContentIntent(pendingContent)
            .setAutoCancel(true)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
        val notificationManager = NotificationManagerCompat.from(context)
        notificationManager.notify(ALARM_ID, builder.build())
    }

    companion object {
        private const val CHANNEL_ID = "MassiveAlarm"
        private const val ALARM_ID = 1
    }
}