package com.massive

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import kotlin.math.floor

class TimerBroadcast : BroadcastReceiver() {
    @RequiresApi(api = Build.VERSION_CODES.O)
    override fun onReceive(context: Context, intent: Intent) {
        val notificationManager = getManager(context)
        val builder = getBuilder(context)
        if (intent.action == "tick") {
            val endMs = intent.extras!!.getInt("endMs")
            val currentMs = intent.extras!!.getLong("currentMs")
            val seconds = floor((currentMs / 1000).toDouble() % 60)
                .toInt().toString().padStart(2, '0')
            val minutes = floor((currentMs / 1000).toDouble() / 60)
                .toInt().toString().padStart(2, '0')
            builder.setContentText("$minutes:$seconds")
                .setAutoCancel(false)
                .setDefaults(0)
                .setProgress(endMs, currentMs.toInt(), false)
                .setCategory(NotificationCompat.CATEGORY_PROGRESS)
                .priority = NotificationCompat.PRIORITY_LOW
            notificationManager.notify(NOTIFICATION_ID, builder.build())
        }
        else if (intent.action === "finish") {
            Log.d("TimerBroadcast", "Finishing...")
            val finishIntent = Intent(context, StopAlarm::class.java)
            val finishPending =
                PendingIntent.getActivity(context, 0, finishIntent, PendingIntent.FLAG_IMMUTABLE)
            builder.setContentText("Timer finished.")
                .setAutoCancel(true)
                .setOngoing(false)
                .setContentIntent(finishPending)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .priority = NotificationCompat.PRIORITY_HIGH
            notificationManager.notify(NOTIFICATION_ID, builder.build())
            context.startService(Intent(context, AlarmService::class.java))
        }
        else if (intent.action === "stop") {
            notificationManager.cancel(NOTIFICATION_ID)
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun getBuilder(context: Context): NotificationCompat.Builder {
        val contentIntent = Intent(context, MainActivity::class.java)
        val pendingContent =
            PendingIntent.getActivity(context, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val actionIntent = Intent(context, StopTimer::class.java)
        val pendingAction =
            PendingIntent.getService(context, 0, actionIntent, PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_baseline_hourglass_bottom_24)
            .setContentTitle("Resting")
            .setContentIntent(pendingContent)
            .addAction(R.drawable.ic_baseline_stop_24, "STOP", pendingAction)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun getManager(context: Context): NotificationManager {
        val importance = NotificationManager.IMPORTANCE_LOW
        val channel = NotificationChannel(
            CHANNEL_ID,
            CHANNEL_ID, importance
        )
        channel.description = "Alarms for rest timings."
        val notificationManager = context.getSystemService(
            NotificationManager::class.java
        )
        notificationManager.createNotificationChannel(channel)
        return notificationManager
    }

    companion object {
        private const val CHANNEL_ID = "MassiveTimer"
        private const val NOTIFICATION_ID = 1
    }
}

