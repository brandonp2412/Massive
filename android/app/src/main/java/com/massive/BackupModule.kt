package com.massive

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.*
import android.net.Uri
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.documentfile.provider.DocumentFile
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.*
import java.util.*

class BackupModule constructor(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {
    val context: ReactApplicationContext = reactApplicationContext
    private var targetDir: String? = null

    private val copyReceiver = object : BroadcastReceiver() {
        @RequiresApi(Build.VERSION_CODES.O)
        override fun onReceive(context: Context?, intent: Intent?) {
            val treeUri: Uri = Uri.parse(targetDir)
            val documentFile = context?.let { DocumentFile.fromTreeUri(it, treeUri) }
            val file = documentFile?.createFile("application/octet-stream", "massive.db")
            val output = context?.contentResolver?.openOutputStream(file!!.uri)
            val sourceFile = File(context?.getDatabasePath("massive.db")!!.path)
            val input = FileInputStream(sourceFile)
            if (output != null) {
                input.copyTo(output)
            }
            output?.flush()
            output?.close()
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun start(baseUri: String) {
        targetDir = baseUri
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
