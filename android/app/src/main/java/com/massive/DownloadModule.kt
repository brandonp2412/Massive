package com.massive

import android.app.DownloadManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.NotificationManager.IMPORTANCE_DEFAULT
import android.app.PendingIntent
import android.app.PendingIntent.FLAG_IMMUTABLE
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.core.net.toUri
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class DownloadModule internal constructor(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "DownloadModule"
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun show(name: String) {
        val channel = NotificationChannel(CHANNEL_ID, CHANNEL_ID, IMPORTANCE_DEFAULT)
        channel.description = "Notifications for downloaded files."
        val manager =
            reactApplicationContext.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
        val intent = Intent(DownloadManager.ACTION_VIEW_DOWNLOADS)
        val pendingIntent =
            PendingIntent.getActivity(reactApplicationContext, 0, intent, FLAG_IMMUTABLE)
        val builder = NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_baseline_arrow_downward_24)
            .setContentTitle("Downloaded $name")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
        manager.notify(NOTIFICATION_ID, builder.build())
    }

    companion object {
        private const val CHANNEL_ID = "MassiveDownloads"
        private const val NOTIFICATION_ID = 3
    }
}