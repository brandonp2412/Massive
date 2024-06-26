package com.massive

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.*
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.*
import java.util.*

@SuppressLint("UnspecifiedRegisterReceiverFlag")
class BackupModule(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {
    val context: ReactApplicationContext = reactApplicationContext

    private val copyReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val targetDir = intent?.getStringExtra("targetDir")
            Log.d("BackupModule", "onReceive $targetDir")
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

    @ReactMethod
    fun once(target: String, promise: Promise) {
        Log.d("BackupModule", "once $target")
        try {
            val treeUri: Uri = Uri.parse(target)
            val documentFile = context.let { DocumentFile.fromTreeUri(it, treeUri) }
            val file = documentFile?.createFile("application/octet-stream", "massive.db")
            val output = context.contentResolver?.openOutputStream(file!!.uri)
            val sourceFile = File(context.getDatabasePath("massive.db")!!.path)
            val input = FileInputStream(sourceFile)
            if (output != null) {
                input.copyTo(output)
            }
            output?.flush()
            output?.close()
            promise.resolve(0)
        }
        catch (error: Exception) {
            promise.reject("ERROR", error)
        }
    }

    @ReactMethod
    fun start(baseUri: String) {
        Log.d("BackupModule", "start $baseUri")
        val alarmMgr = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(COPY_BROADCAST)
        intent.putExtra("targetDir", baseUri)
        val pendingIntent =
            PendingIntent.getBroadcast(context, baseUri.hashCode(), intent, PendingIntent.FLAG_IMMUTABLE)
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

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun stop() {
        val alarmMgr = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(COPY_BROADCAST)
        val pendingIntent =
            PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        alarmMgr.cancel(pendingIntent)
    }

    @ReactMethod
    fun exportPlans(target: String, promise: Promise) {
        try {
            val db = DatabaseHelper(reactApplicationContext)
            db.exportPlans(target, reactApplicationContext)
            promise.resolve("Export successful!")
        }
        catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }

    @ReactMethod
    fun exportSets(target: String, promise: Promise) {
        try {
            val db = DatabaseHelper(reactApplicationContext)
            db.exportSets(target, reactApplicationContext)
            promise.resolve("Export successful!")
        }
        catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }

    init {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactApplicationContext.registerReceiver(copyReceiver, IntentFilter(COPY_BROADCAST),
                Context.RECEIVER_NOT_EXPORTED)
        }
        else {
            reactApplicationContext.registerReceiver(copyReceiver, IntentFilter(COPY_BROADCAST))
        }
    }

    companion object {
        const val COPY_BROADCAST = "copy-event"
    }

    override fun getName(): String {
        return "BackupModule"
    }
}
