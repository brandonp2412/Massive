package com.massive

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactApplicationContext

class StopTimer : Service() {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("StopTimer", "onStartCommand")
        applicationContext.stopService(Intent(applicationContext, AlarmService::class.java))
        val manager = getManager();
        manager.cancel(AlarmModule.NOTIFICATION_ID_DONE)
        manager.cancel(AlarmModule.NOTIFICATION_ID_PENDING)
        val mod = AlarmModule(applicationContext as ReactApplicationContext?)
        Log.d("StopTimer", "countdownTimer=${mod.countdownTimer}")
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null
    }


    @RequiresApi(Build.VERSION_CODES.O)
    private fun getManager(): NotificationManager {
        val alarmsChannel = NotificationChannel(
            AlarmModule.CHANNEL_ID_DONE,
            AlarmModule.CHANNEL_ID_DONE,
            NotificationManager.IMPORTANCE_HIGH
        )
        alarmsChannel.description = "Alarms for rest timers."
        alarmsChannel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        val notificationManager = applicationContext.getSystemService(
            NotificationManager::class.java
        )
        notificationManager.createNotificationChannel(alarmsChannel)
        val timersChannel =
            NotificationChannel(AlarmModule.CHANNEL_ID_PENDING, AlarmModule.CHANNEL_ID_PENDING, NotificationManager.IMPORTANCE_LOW)
        timersChannel.setSound(null, null)
        timersChannel.description = "Progress on rest timers."
        notificationManager.createNotificationChannel(timersChannel)
        return notificationManager
    }
}