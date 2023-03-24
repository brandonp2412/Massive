package com.massive

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Environment
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.util.*


class BackupModule constructor(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {
    val context: ReactApplicationContext = reactApplicationContext

    private val copyReceiver = object : BroadcastReceiver() {
        @RequiresApi(Build.VERSION_CODES.O)
        override fun onReceive(context: Context?, intent: Intent?) {
            val sourceFile = File(context?.getDatabasePath("massive.db")!!.path)
            val targetDir =
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val targetFile = File(targetDir, "massive.db")

            try {
                val input = FileInputStream(sourceFile)
                val output = FileOutputStream(targetFile)
                input.copyTo(output)
                input.close()
                output.close()
            } catch (e: IOException) {
                Toast.makeText(
                    reactApplicationContext,
                    "Access to massive.db is denied. Try deleting it first.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun start() {
        val permission: Int =
            ActivityCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            )
        if (permission != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                currentActivity!!,
                arrayOf<String>(
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                ),
                1
            )
        }

        val alarmMgr = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(COPY_BROADCAST)
        val pendingIntent =
            PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        pendingIntent.send()

        val calendar = Calendar.getInstance().apply {
            timeInMillis = System.currentTimeMillis()
            set(Calendar.HOUR_OF_DAY, 6)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
        }

        alarmMgr.setRepeating(
            AlarmManager.RTC_WAKEUP,
            calendar.timeInMillis,
            AlarmManager.INTERVAL_DAY,
            pendingIntent
        )
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun stop() {
        val alarmMgr = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(COPY_BROADCAST)
        val pendingIntent =
            PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        alarmMgr.cancel(pendingIntent)
    }

    init {
        reactApplicationContext.registerReceiver(copyReceiver, IntentFilter(COPY_BROADCAST))
    }

    companion object {
        const val COPY_BROADCAST = "copy-event"
    }

    override fun getName(): String {
        return "BackupModule"
    }
}
