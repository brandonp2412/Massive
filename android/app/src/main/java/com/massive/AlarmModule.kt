package com.massive

import android.annotation.SuppressLint
import android.app.*
import android.content.ActivityNotFoundException
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.CountDownTimer
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.floor


class AlarmModule constructor(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {

    var countdownTimer: CountDownTimer? = null
    var currentMs: Long = 0
    var running = false

    override fun getName(): String {
        return "AlarmModule"
    }

    private val stopReceiver = object : BroadcastReceiver() {
        @RequiresApi(Build.VERSION_CODES.O)
        override fun onReceive(context: Context?, intent: Intent?) {
            Log.d("AlarmModule", "Received stop broadcast intent")
            stop()
        }
    }

    private val addReceiver = object : BroadcastReceiver() {
        @RequiresApi(Build.VERSION_CODES.O)
        override fun onReceive(context: Context?, intent: Intent?) {
            Log.d("AlarmModule", "Received add broadcast intent")
            val vibrate = intent?.extras?.getBoolean("vibrate") == true
            val sound = intent?.extras?.getString("sound")
            val noSound = intent?.extras?.getBoolean("noSound") == true
            add(vibrate, sound, noSound)
        }
    }


    init {
        reactApplicationContext.registerReceiver(stopReceiver, IntentFilter(STOP_BROADCAST))
        reactApplicationContext.registerReceiver(addReceiver, IntentFilter(ADD_BROADCAST))
    }

    override fun onCatalystInstanceDestroy() {
        reactApplicationContext.unregisterReceiver(stopReceiver)
        reactApplicationContext.unregisterReceiver(addReceiver)
        super.onCatalystInstanceDestroy()
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    fun add(vibrate: Boolean, sound: String?, noSound: Boolean = false) {
        Log.d("AlarmModule", "Add 1 min to alarm.")
        countdownTimer?.cancel()
        val newMs = if (running) currentMs.toInt().plus(60000) else 60000
        countdownTimer = getTimer(newMs, vibrate, sound, noSound)
        countdownTimer?.start()
        running = true
        val manager = getManager()
        manager.cancel(NOTIFICATION_ID_DONE)
        reactApplicationContext.stopService(
            Intent(
                reactApplicationContext,
                AlarmService::class.java
            )
        )
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    fun stop() {
        Log.d("AlarmModule", "Stop alarm.")
        countdownTimer?.cancel()
        running = false
        reactApplicationContext?.stopService(
            Intent(
                reactApplicationContext,
                AlarmService::class.java
            )
        )
        val manager = getManager()
        manager.cancel(NOTIFICATION_ID_DONE)
        manager.cancel(NOTIFICATION_ID_PENDING)
        val params = Arguments.createMap().apply {
            putString("minutes", "00")
            putString("seconds", "00")
        }
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("tick", params)
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    fun timer(milliseconds: Int, vibrate: Boolean, sound: String?, noSound: Boolean = false) {
        Log.d("AlarmModule", "Queue alarm for $milliseconds delay")
        val manager = getManager()
        manager.cancel(NOTIFICATION_ID_DONE)
        reactApplicationContext.stopService(
            Intent(
                reactApplicationContext, AlarmService::class.java
            )
        )
        countdownTimer?.cancel()
        countdownTimer = getTimer(milliseconds, vibrate, sound, noSound)
        countdownTimer?.start()
        running = true
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun ignoringBattery(callback: Callback) {
        val packageName = reactApplicationContext.packageName
        val pm = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            callback.invoke(pm.isIgnoringBatteryOptimizations(packageName))
        } else {
            callback.invoke(true)
        }
    }

    @SuppressLint("BatteryLife")
    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun ignoreBattery() {
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        intent.data = Uri.parse("package:" + reactApplicationContext.packageName)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        try {
            reactApplicationContext.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(
                reactApplicationContext,
                "Requests to ignore battery optimizations are disabled on your device.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun getTimer(
        endMs: Int,
        vibrate: Boolean,
        sound: String?,
        noSound: Boolean
    ): CountDownTimer {
        val builder = getBuilder()
        return object : CountDownTimer(endMs.toLong(), 1000) {
            @RequiresApi(Build.VERSION_CODES.O)
            override fun onTick(current: Long) {
                currentMs = current
                val seconds =
                    floor((current / 1000).toDouble() % 60).toInt().toString().padStart(2, '0')
                val minutes =
                    floor((current / 1000).toDouble() / 60).toInt().toString().padStart(2, '0')
                builder.setContentText("$minutes:$seconds").setAutoCancel(false).setDefaults(0)
                    .setProgress(endMs, current.toInt(), false)
                    .setCategory(NotificationCompat.CATEGORY_PROGRESS).priority =
                    NotificationCompat.PRIORITY_LOW
                val manager = getManager()
                manager.notify(NOTIFICATION_ID_PENDING, builder.build())
                val params = Arguments.createMap().apply {
                    putString("minutes", minutes)
                    putString("seconds", seconds)
                }
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("tick", params)
            }

            @RequiresApi(Build.VERSION_CODES.O)
            override fun onFinish() {
                val context = reactApplicationContext
                val finishIntent = Intent(context, StopAlarm::class.java)
                val finishPending = PendingIntent.getActivity(
                    context, 0, finishIntent, PendingIntent.FLAG_IMMUTABLE
                )
                val fullIntent = Intent(context, TimerDone::class.java)
                val fullPending = PendingIntent.getActivity(
                    context, 0, fullIntent, PendingIntent.FLAG_IMMUTABLE
                )
                builder.setContentText("Timer finished.").setProgress(0, 0, false)
                    .setAutoCancel(true).setOngoing(true).setFullScreenIntent(fullPending, true)
                    .setContentIntent(finishPending).setChannelId(CHANNEL_ID_DONE)
                    .setCategory(NotificationCompat.CATEGORY_ALARM).priority =
                    NotificationCompat.PRIORITY_HIGH
                val manager = getManager()
                manager.notify(NOTIFICATION_ID_DONE, builder.build())
                manager.cancel(NOTIFICATION_ID_PENDING)
                val alarmIntent = Intent(context, AlarmService::class.java).apply {
                    putExtra("vibrate", vibrate)
                    putExtra("sound", sound)
                    putExtra("noSound", noSound)
                }
                context.startService(alarmIntent)
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("finish", Arguments.createMap())
            }
        }
    }

    @SuppressLint("UnspecifiedImmutableFlag")
    @RequiresApi(Build.VERSION_CODES.M)
    private fun getBuilder(): NotificationCompat.Builder {
        val context = reactApplicationContext
        val contentIntent = Intent(context, MainActivity::class.java)
        val pendingContent =
            PendingIntent.getActivity(context, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val addBroadcast = Intent(ADD_BROADCAST).apply {
            setPackage(reactApplicationContext.packageName)
        }
        val pendingAdd =
            PendingIntent.getBroadcast(context, 0, addBroadcast, PendingIntent.FLAG_IMMUTABLE)
        val stopBroadcast = Intent(STOP_BROADCAST)
        stopBroadcast.setPackage(reactApplicationContext.packageName)
        val pendingStop =
            PendingIntent.getBroadcast(context, 0, stopBroadcast, PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(context, CHANNEL_ID_PENDING)
            .setSmallIcon(R.drawable.ic_baseline_hourglass_bottom_24).setContentTitle("Resting")
            .setContentIntent(pendingContent)
            .addAction(R.drawable.ic_baseline_stop_24, "Stop", pendingStop)
            .addAction(R.drawable.ic_baseline_stop_24, "Add 1 min", pendingAdd)
            .setDeleteIntent(pendingStop)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun getManager(): NotificationManager {
        val alarmsChannel = NotificationChannel(
            CHANNEL_ID_DONE, CHANNEL_ID_DONE, NotificationManager.IMPORTANCE_HIGH
        )
        alarmsChannel.description = "Alarms for rest timers."
        alarmsChannel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        val notificationManager = reactApplicationContext.getSystemService(
            NotificationManager::class.java
        )
        notificationManager.createNotificationChannel(alarmsChannel)
        val timersChannel = NotificationChannel(
            CHANNEL_ID_PENDING, CHANNEL_ID_PENDING, NotificationManager.IMPORTANCE_LOW
        )
        timersChannel.setSound(null, null)
        timersChannel.description = "Progress on rest timers."
        notificationManager.createNotificationChannel(timersChannel)
        return notificationManager
    }

    companion object {
        const val STOP_BROADCAST = "stop-timer-event"
        const val ADD_BROADCAST = "add-timer-event"
        const val CHANNEL_ID_PENDING = "Timer"
        const val CHANNEL_ID_DONE = "Alarm"
        const val NOTIFICATION_ID_PENDING = 1
        const val NOTIFICATION_ID_DONE = 2
    }
}
