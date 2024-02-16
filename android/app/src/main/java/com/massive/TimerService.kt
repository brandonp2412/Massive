package com.massive

import android.Manifest
import android.annotation.SuppressLint
import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.*
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class TimerService : Service() {

    private lateinit var timerHandler: Handler
    private var timerRunnable: Runnable? = null
    private var timeLeftInSeconds: Int = 0
    private var timeTotalInSeconds: Int = 0
    private var notificationId = 1

    private val stopReceiver =
        object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                Log.d("TimerService", "Received stop broadcast intent")
                stopSelf()
            }
        }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    override fun onCreate() {
        super.onCreate()
        timerHandler = Handler(Looper.getMainLooper())
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            applicationContext.registerReceiver(stopReceiver, IntentFilter(STOP_BROADCAST),
                Context.RECEIVER_NOT_EXPORTED)
        }
        else {
            applicationContext.registerReceiver(stopReceiver, IntentFilter(STOP_BROADCAST))
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        timeLeftInSeconds = (intent?.getIntExtra("milliseconds", 0) ?: 0) / 1000
        startForeground(notificationId, createNotification(timeLeftInSeconds))
        Log.d("TimerService", "onStartCommand seconds=$timeLeftInSeconds")
        timeTotalInSeconds = timeLeftInSeconds

        timerRunnable = object : Runnable {
            override fun run() {
                if (timeLeftInSeconds > 0) {
                    timeLeftInSeconds--
                    updateNotification(timeLeftInSeconds)
                    timerHandler.postDelayed(this, 1000)
                } else {
                    startAlarmService()
                    stopSelf()
                }
            }
        }
        timerHandler.postDelayed(timerRunnable!!, 1000)
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        timerHandler.removeCallbacks(timerRunnable!!)
        applicationContext.unregisterReceiver(stopReceiver)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun createNotification(timeLeftInSeconds: Int): Notification {
        val notificationTitle = "Timer"
        val notificationText = formatTime(timeLeftInSeconds)
        val notificationChannelId = "timer_channel"
        val notificationIntent = Intent(this, TimerService::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stopBroadcast = Intent(AlarmModule.STOP_BROADCAST)
        stopBroadcast.setPackage(applicationContext.packageName)
        val pendingStop =
            PendingIntent.getBroadcast(applicationContext, 0, stopBroadcast, PendingIntent.FLAG_IMMUTABLE)

        val notificationBuilder = NotificationCompat.Builder(this, notificationChannelId)
            .setContentTitle(notificationTitle)
            .setContentText(notificationText)
            .setSmallIcon(R.drawable.ic_baseline_timer_24)
            .setProgress(timeTotalInSeconds, timeLeftInSeconds, false)
            .setContentIntent(pendingIntent)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setAutoCancel(false)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setDeleteIntent(pendingStop)
            .addAction(R.drawable.ic_baseline_stop_24, "Stop", pendingStop)

        val notificationManager = NotificationManagerCompat.from(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                notificationChannelId,
                "Timer Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            notificationManager.createNotificationChannel(channel)
        }

        return notificationBuilder.build()
    }

    private fun updateNotification(timeLeftInSeconds: Int) {
        val notificationManager = NotificationManagerCompat.from(this)
        val notification = createNotification(timeLeftInSeconds)
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return
        }
        notificationManager.notify(notificationId, notification)
    }

    private fun formatTime(timeInSeconds: Int): String {
        val minutes = timeInSeconds / 60
        val seconds = timeInSeconds % 60
        return String.format("%02d:%02d", minutes, seconds)
    }

    private fun startAlarmService() {
        val intent = Intent(applicationContext, AlarmService::class.java)
        applicationContext.startService(intent)
    }

    companion object {
        const val STOP_BROADCAST = "stop-timer-event"
    }
}
