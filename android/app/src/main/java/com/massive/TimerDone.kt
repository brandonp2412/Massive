package com.massive

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity

class TimerDone : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_timer_done)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @Suppress("UNUSED_PARAMETER")
    fun stop(view: View) {
        Log.d("TimerDone", "Stopping...")
        applicationContext.stopService(Intent(applicationContext, AlarmService::class.java))
        val manager = getManager()
        manager.cancel(AlarmService.NOTIFICATION_ID_DONE)
        manager.cancel(AlarmModule.NOTIFICATION_ID_PENDING)
        val intent = Intent(applicationContext, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        applicationContext.startActivity(intent)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun getManager(): NotificationManager {
        val alarmsChannel = NotificationChannel(
            AlarmService.CHANNEL_ID_DONE,
            AlarmService.CHANNEL_ID_DONE,
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Alarms for rest timers."
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }
        val timersChannel = NotificationChannel(
            AlarmModule.CHANNEL_ID_PENDING,
            AlarmModule.CHANNEL_ID_PENDING,
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            setSound(null, null)
            description = "Progress on rest timers."
        }
        val notificationManager = applicationContext.getSystemService(
            NotificationManager::class.java
        )
        notificationManager.createNotificationChannel(alarmsChannel)
        notificationManager.createNotificationChannel(timersChannel)
        return notificationManager
    }
}