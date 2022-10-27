package com.massive

import android.annotation.SuppressLint
import android.app.*
import android.app.NotificationManager.IMPORTANCE_HIGH
import android.app.NotificationManager.IMPORTANCE_LOW
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import kotlin.math.floor

class TimerService : Service() {
    private var countdownTimer: CountDownTimer? = null
    private var endMs: Int = 0
    private var currentMs: Long = 0
    private var vibrate: Boolean = true
    private var noSound: Boolean = false
    private var sound: String? = null

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        vibrate = intent?.extras?.getBoolean("vibrate") == true
        noSound = intent?.extras?.getBoolean("noSound") == true
        sound = intent?.extras?.getString("sound")
        val manager = getManager()
        manager.cancel(NOTIFICATION_ID_DONE)
        applicationContext.stopService(Intent(applicationContext, AlarmService::class.java))
        if (intent?.action == "add") {
            endMs = currentMs.toInt().plus(60000)
            applicationContext.stopService(Intent(applicationContext, AlarmService::class.java))
        } else {
            val ms = intent?.extras?.getInt("milliseconds")
            if (ms != null) endMs = ms;
        }
        Log.d("TimerService", "endMs=$endMs,currentMs=$currentMs,vibrate=$vibrate,sound=$sound")
        val builder = getBuilder(applicationContext)
        countdownTimer?.cancel()
        countdownTimer = getTimer(builder)
        countdownTimer?.start()
        return super.onStartCommand(intent, flags, startId)
    }

    private fun getTimer(builder: NotificationCompat.Builder): CountDownTimer {
        return object : CountDownTimer(endMs.toLong(), 1000) {
            @RequiresApi(Build.VERSION_CODES.O)
            override fun onTick(current: Long) {
                currentMs = current
                val seconds = floor((current / 1000).toDouble() % 60)
                    .toInt().toString().padStart(2, '0')
                val minutes = floor((current / 1000).toDouble() / 60)
                    .toInt().toString().padStart(2, '0')
                builder.setContentText("$minutes:$seconds")
                    .setAutoCancel(false)
                    .setDefaults(0)
                    .setProgress(endMs, current.toInt(), false)
                    .setCategory(NotificationCompat.CATEGORY_PROGRESS)
                    .priority = NotificationCompat.PRIORITY_LOW
                val manager = getManager()
                manager.notify(NOTIFICATION_ID_PENDING, builder.build())
            }

            @RequiresApi(Build.VERSION_CODES.O)
            override fun onFinish() {
                val finishIntent = Intent(applicationContext, StopAlarm::class.java)
                val finishPending =
                    PendingIntent.getActivity(
                        applicationContext,
                        0,
                        finishIntent,
                        PendingIntent.FLAG_IMMUTABLE
                    )
                val fullIntent = Intent(applicationContext, TimerDone::class.java)
                val fullPending =
                    PendingIntent.getActivity(
                        applicationContext,
                        0,
                        fullIntent,
                        PendingIntent.FLAG_IMMUTABLE
                    )
                builder.setContentText("Timer finished.")
                    .setProgress(0, 0, false)
                    .setAutoCancel(true)
                    .setOngoing(true)
                    .setFullScreenIntent(fullPending, true)
                    .setContentIntent(finishPending)
                    .setChannelId(CHANNEL_ID_DONE)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .priority = NotificationCompat.PRIORITY_HIGH
                val manager = getManager()
                manager.notify(NOTIFICATION_ID_DONE, builder.build())
                manager.cancel(NOTIFICATION_ID_PENDING)
                val alarmIntent = Intent(applicationContext, AlarmService::class.java).apply {
                    putExtra("vibrate", vibrate)
                    putExtra("sound", sound)
                    putExtra("noSound", noSound)
                }
                applicationContext.startService(alarmIntent)
            }
        }
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onDestroy() {
        Log.d("TimerService", "Destroying...")
        countdownTimer?.cancel()
        val manager = getManager()
        manager.cancel(NOTIFICATION_ID_PENDING)
        manager.cancel(NOTIFICATION_ID_DONE)
        super.onDestroy()
    }

    @SuppressLint("UnspecifiedImmutableFlag")
    @RequiresApi(Build.VERSION_CODES.M)
    private fun getBuilder(context: Context): NotificationCompat.Builder {
        val contentIntent = Intent(context, MainActivity::class.java)
        val pendingContent =
            PendingIntent.getActivity(context, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val stopIntent = Intent(context, StopTimer::class.java)
        val pendingStop =
            PendingIntent.getService(context, 0, stopIntent, PendingIntent.FLAG_IMMUTABLE)
        val addIntent = Intent(context, TimerService::class.java).apply {
            action = "add"
            putExtra("vibrate", vibrate)
            putExtra("sound", sound)
            putExtra("noSound", noSound)
            data = Uri.parse("$currentMs")
        }
        val pendingAdd = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.getService(context, 0, addIntent, PendingIntent.FLAG_MUTABLE)
        } else {
            PendingIntent.getService(context, 0, addIntent, PendingIntent.FLAG_UPDATE_CURRENT)
        }
        return NotificationCompat.Builder(context, CHANNEL_ID_PENDING)
            .setSmallIcon(R.drawable.ic_baseline_hourglass_bottom_24)
            .setContentTitle("Resting")
            .setContentIntent(pendingContent)
            .addAction(R.drawable.ic_baseline_stop_24, "Stop", pendingStop)
            .addAction(R.drawable.ic_baseline_stop_24, "Add 1 min", pendingAdd)
            .setDeleteIntent(pendingStop)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun getManager(): NotificationManager {
        val alarmsChannel = NotificationChannel(
            CHANNEL_ID_DONE,
            CHANNEL_ID_DONE,
            IMPORTANCE_HIGH
        )
        alarmsChannel.description = "Alarms for rest timers."
        alarmsChannel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        val notificationManager = applicationContext.getSystemService(
            NotificationManager::class.java
        )
        notificationManager.createNotificationChannel(alarmsChannel)
        val timersChannel =
            NotificationChannel(CHANNEL_ID_PENDING, CHANNEL_ID_PENDING, IMPORTANCE_LOW)
        timersChannel.setSound(null, null)
        timersChannel.description = "Progress on rest timers."
        notificationManager.createNotificationChannel(timersChannel)
        return notificationManager
    }

    companion object {
        private const val CHANNEL_ID_PENDING = "Timer"
        private const val CHANNEL_ID_DONE = "Alarm"
        private const val NOTIFICATION_ID_PENDING = 1
        private const val NOTIFICATION_ID_DONE = 2
    }
}