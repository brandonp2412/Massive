package com.massive

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import kotlin.math.floor

class TimerService : Service() {
    private lateinit var notificationManager: NotificationManagerCompat
    private lateinit var countdownTimer: CountDownTimer

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("TimerService", "Started timer service.")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_ID, importance)
            channel.description = "Alarms for rest timings."
            val notificationManager = applicationContext.getSystemService(
                NotificationManager::class.java
            )
            notificationManager.createNotificationChannel(channel)
        }

        val contentIntent = Intent(applicationContext, MainActivity::class.java)
        val pendingContent =
            PendingIntent.getActivity(applicationContext, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val actionIntent = Intent(applicationContext, StopTimer::class.java)
        val pendingAction =
            PendingIntent.getService(applicationContext, 0, actionIntent, PendingIntent.FLAG_IMMUTABLE)
        val builder = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_baseline_hourglass_bottom_24)
            .setContentTitle("Resting")
            .setContentIntent(pendingContent)
            .addAction(R.drawable.ic_baseline_stop_24, "STOP", pendingAction)

        val endMs = intent!!.extras!!.getInt("milliseconds")
        notificationManager = NotificationManagerCompat.from(applicationContext)
        countdownTimer = object : CountDownTimer(endMs.toLong(), 1000) {
            override fun onTick(currentMs: Long) {
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
                notificationManager.notify(ALARM_ID, builder.build())
            }
            override fun onFinish() {
                builder.setContentText("Timer finished.")
                    .clearActions()
                    .setAutoCancel(true)
                    .setOngoing(false)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .priority = NotificationCompat.PRIORITY_HIGH
                notificationManager.notify(ALARM_ID, builder.build())
                applicationContext.startService(Intent(applicationContext, AlarmService::class.java))
            }
        }

        countdownTimer.start()
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        countdownTimer.cancel()
        notificationManager.cancel(ALARM_ID)
        super.onDestroy()
    }

    companion object {
        private const val CHANNEL_ID = "Alarms"
        private const val ALARM_ID = 1
    }
}