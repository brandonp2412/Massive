package com.massive

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import kotlin.math.floor

class TimerService : Service() {
    private var notificationManager: NotificationManager? = null
    private var endMs: Int? = null
    private var currentMs: Long? = null
    private var countdownTimer: CountDownTimer? = null
    private var vibrate: Boolean = true

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("TimerService", "Started timer service.")
        Log.d("TimerService", "endMs=$endMs,currentMs=$currentMs")
        vibrate = intent!!.extras!!.getBoolean("vibrate")
        if (intent.action == "add") {
            endMs = currentMs!!.toInt().plus(60000)
            applicationContext.stopService(Intent(applicationContext, AlarmService::class.java))
        }
        else {
            endMs = intent.extras!!.getInt("milliseconds")
        }
        Log.d("TimerService", "endMs=$endMs,currentMs=$currentMs")
        notificationManager = getManager(applicationContext)
        val builder = getBuilder(applicationContext)
        countdownTimer?.cancel()
        countdownTimer = getTimer(builder, notificationManager!!)
        countdownTimer!!.start()
        return super.onStartCommand(intent, flags, startId)
    }

    private fun getTimer(builder: NotificationCompat.Builder, notificationManager: NotificationManager): CountDownTimer {
       return object : CountDownTimer(endMs!!.toLong(), 1000) {
           override fun onTick(current: Long) {
               currentMs = current
               val seconds = floor((current / 1000).toDouble() % 60)
                   .toInt().toString().padStart(2, '0')
               val minutes = floor((current / 1000).toDouble() / 60)
                   .toInt().toString().padStart(2, '0')
               builder.setContentText("$minutes:$seconds")
                   .setAutoCancel(false)
                   .setDefaults(0)
                   .setProgress(endMs!!, current.toInt(), false)
                   .setCategory(NotificationCompat.CATEGORY_PROGRESS)
                   .priority = NotificationCompat.PRIORITY_LOW
               notificationManager.notify(NOTIFICATION_ID, builder.build())
           }
           @RequiresApi(Build.VERSION_CODES.M)
           override fun onFinish() {
               val finishIntent = Intent(applicationContext, StopAlarm::class.java)
               val finishPending =
                   PendingIntent.getActivity(applicationContext, 0, finishIntent, PendingIntent.FLAG_IMMUTABLE)
               builder.setContentText("Timer finished.")
                   .setAutoCancel(true)
                   .setOngoing(false)
                   .setContentIntent(finishPending)
                   .setCategory(NotificationCompat.CATEGORY_ALARM)
                   .priority = NotificationCompat.PRIORITY_HIGH
               notificationManager.notify(NOTIFICATION_ID, builder.build())
               val alarmIntent = Intent(applicationContext, AlarmService::class.java)
               alarmIntent.putExtra("vibrate", vibrate)
               applicationContext.startService(alarmIntent)
           }
       }
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        Log.d("TimerService", "Destroying...")
        countdownTimer?.cancel()
        notificationManager?.cancel(NOTIFICATION_ID)
        super.onDestroy()
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun getBuilder(context: Context): NotificationCompat.Builder {
        val contentIntent = Intent(context, MainActivity::class.java)
        val pendingContent =
            PendingIntent.getActivity(context, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val stopIntent = Intent(context, StopTimer::class.java)
        val pendingStop =
            PendingIntent.getService(context, 0, stopIntent, PendingIntent.FLAG_IMMUTABLE)
        val addIntent = Intent(context, TimerService::class.java)
        addIntent.action = "add"
        addIntent.putExtra("vibrate", vibrate)
        val pendingAdd = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.getService(context, 0, addIntent, PendingIntent.FLAG_MUTABLE)
        } else {
            PendingIntent.getService(context, 0, addIntent, PendingIntent.FLAG_UPDATE_CURRENT)
        }
        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_baseline_hourglass_bottom_24)
            .setContentTitle("Resting")
            .setContentIntent(pendingContent)
            .addAction(R.drawable.ic_baseline_stop_24, "Stop", pendingStop)
            .addAction(R.drawable.ic_baseline_stop_24, "Add 1 min", pendingAdd)
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