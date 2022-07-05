package com.massive

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.os.Environment
import android.provider.DocumentsContract
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import okhttp3.internal.notify
import java.io.File
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class ExportModule internal constructor(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "ExportModule"
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("Recycle", "Range")
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun sets(): String {
        Log.d("ExportModule", "Exporting sets...")
        val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val current = LocalDateTime.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val formatted = current.format(formatter)
        val sets = File(dir, "sets$formatted.csv")
        sets.createNewFile()
        sets.setWritable(true)
        sets.setReadable(true)
        sets.writeText("id,name,reps,weight,created,unit\n")
        val db = MassiveHelper(reactApplicationContext).readableDatabase
        db.use {
            with (it.query("sets", null, null, null, null, null, null)) {
                while (moveToNext()) {
                    val id = getInt(getColumnIndex("id"))
                    val name = getString(getColumnIndex("name"))
                    val reps = getInt(getColumnIndex("reps"))
                    val weight = getInt(getColumnIndex("weight"))
                    val created = getString(getColumnIndex("created"))
                    val unit = getString(getColumnIndex("unit"))
                    sets.appendText("$id,$name,$reps,$weight,$created,$unit\n")
                }
            }
        }

        val notificationManager = NotificationManagerCompat.from(reactApplicationContext)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_ID, importance)
            channel.description = "Alarms for rest timings."
            notificationManager.createNotificationChannel(channel)
        }

        val contentIntent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "text/csv"
        }
        val pendingContent =
            PendingIntent.getActivity(reactApplicationContext, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val builder = NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_baseline_arrow_downward_24)
            .setContentTitle("Downloaded sets")
            .setContentIntent(pendingContent)
            .setAutoCancel(true)
        notificationManager.notify(NOTIFICATION_ID, builder.build())

        return sets.absolutePath
    }

    companion object {
        private const val CHANNEL_ID = "Exports"
        private const val NOTIFICATION_ID = 2
    }
}