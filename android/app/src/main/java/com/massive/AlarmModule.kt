package com.massive

import android.annotation.SuppressLint
import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.CountDownTimer
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.floor

@SuppressLint("UnspecifiedRegisterReceiverFlag")
class AlarmModule(context: ReactApplicationContext?) :
        ReactContextBaseJavaModule(context), LifecycleEventListener {

    private var countdownTimer: CountDownTimer? = null
    var currentMs: Long = 0
    private var running = false
    private var currentDescription = ""

    override fun getName(): String {
        return "AlarmModule"
    }

    private val stopReceiver =
            object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    Log.d("AlarmModule", "Received stop broadcast intent")
                    stop()
                }
            }

    private val addReceiver =
            object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    add()
                }
            }

    init {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactApplicationContext.registerReceiver(stopReceiver, IntentFilter(STOP_BROADCAST),
                Context.RECEIVER_NOT_EXPORTED)
            reactApplicationContext.registerReceiver(addReceiver, IntentFilter(ADD_BROADCAST),
                Context.RECEIVER_NOT_EXPORTED)
        }
        else {
            reactApplicationContext.registerReceiver(stopReceiver, IntentFilter(STOP_BROADCAST))
            reactApplicationContext.registerReceiver(addReceiver, IntentFilter(ADD_BROADCAST))
        }
    }

    override fun onHostDestroy() {
        reactApplicationContext.unregisterReceiver(stopReceiver)
        reactApplicationContext.unregisterReceiver(addReceiver)
    }

    @ReactMethod
    fun add() {
        Log.d("AlarmModule", "Add 1 min to alarm.")
        countdownTimer?.cancel()
        val newMs = if (running) currentMs.toInt().plus(60000) else 60000
        countdownTimer = getTimer(newMs)
        countdownTimer?.start()
        running = true
        val manager = getManager()
        manager.cancel(AlarmService.NOTIFICATION_ID_DONE)
        val intent = Intent(reactApplicationContext, AlarmService::class.java)
        reactApplicationContext.stopService(intent)
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getCurrent(): Int {
        Log.d("AlarmModule", "currentMs=$currentMs")
        if (running) return currentMs.toInt()
        return 0
    }

    @ReactMethod
    fun stop() {
        Log.d("AlarmModule", "Stop alarm.")
        countdownTimer?.cancel()
        running = false
        val intent = Intent(reactApplicationContext, AlarmService::class.java)
        reactApplicationContext?.stopService(intent)
        val manager = getManager()
        manager.cancel(AlarmService.NOTIFICATION_ID_DONE)
        manager.cancel(NOTIFICATION_ID_PENDING)
        val params =
                Arguments.createMap().apply {
                    putString("minutes", "00")
                    putString("seconds", "00")
                }
        reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("tick", params)
    }

    @ReactMethod
    fun timer(milliseconds: Int, description: String) {
        Log.d("AlarmModule", "Queue alarm for $milliseconds delay")
        currentDescription = description
        val manager = getManager()
        manager.cancel(AlarmService.NOTIFICATION_ID_DONE)
        val intent = Intent(reactApplicationContext, AlarmService::class.java)
        reactApplicationContext.stopService(intent)
        countdownTimer?.cancel()
        countdownTimer = getTimer(milliseconds)
        countdownTimer?.start()
        running = true
    }

    private fun getTimer(
            endMs: Int,
    ): CountDownTimer {
        val builder = getBuilder()
        return object : CountDownTimer(endMs.toLong(), 1000) {
            override fun onTick(current: Long) {
                currentMs = current
                val seconds =
                        floor((current / 1000).toDouble() % 60).toInt().toString().padStart(2, '0')
                val minutes =
                        floor((current / 1000).toDouble() / 60).toInt().toString().padStart(2, '0')
                builder.setContentText("$minutes:$seconds")
                        .setAutoCancel(false)
                        .setDefaults(0)
                        .setProgress(endMs, current.toInt(), false)
                        .setCategory(NotificationCompat.CATEGORY_PROGRESS)
                        .priority = NotificationCompat.PRIORITY_LOW
                val manager = getManager()
                manager.notify(NOTIFICATION_ID_PENDING, builder.build())
                val params =
                        Arguments.createMap().apply {
                            putString("minutes", minutes)
                            putString("seconds", seconds)
                        }
                reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("tick", params)
            }

            override fun onFinish() {
                val context = reactApplicationContext
                val intent = Intent(context, AlarmService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                }
                else {
                    context.startService(intent)
                }
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit(
                                "tick",
                                Arguments.createMap().apply {
                                    putString("minutes", "00")
                                    putString("seconds", "00")
                                }
                        )
            }
        }
    }

    @SuppressLint("UnspecifiedImmutableFlag")
    private fun getBuilder(): NotificationCompat.Builder {
        val context = reactApplicationContext
        val contentIntent = Intent(context, MainActivity::class.java)
        val pendingContent =
                PendingIntent.getActivity(context, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val addBroadcast = Intent(ADD_BROADCAST).apply { setPackage(context.packageName) }
        val pendingAdd =
                PendingIntent.getBroadcast(context, 0, addBroadcast, PendingIntent.FLAG_MUTABLE)
        val stopBroadcast = Intent(STOP_BROADCAST)
        stopBroadcast.setPackage(context.packageName)
        val pendingStop =
                PendingIntent.getBroadcast(context, 0, stopBroadcast, PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(context, CHANNEL_ID_PENDING)
                .setSmallIcon(R.drawable.ic_baseline_hourglass_bottom_24)
                .setContentTitle(currentDescription)
                .setContentIntent(pendingContent)
                .addAction(R.drawable.ic_baseline_stop_24, "Stop", pendingStop)
                .addAction(R.drawable.ic_baseline_stop_24, "Add 1 min", pendingAdd)
                .setDeleteIntent(pendingStop)
    }

    private fun getManager(): NotificationManager {
        val notificationManager =
            reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val timersChannel =
                NotificationChannel(
                    CHANNEL_ID_PENDING,
                    CHANNEL_ID_PENDING,
                    NotificationManager.IMPORTANCE_LOW
                )
            timersChannel.setSound(null, null)
            timersChannel.description = "Progress on rest timers."
            notificationManager.createNotificationChannel(timersChannel)
        }

        return notificationManager
    }

    companion object {
        const val STOP_BROADCAST = "stop-timer-event"
        const val ADD_BROADCAST = "add-timer-event"
        const val CHANNEL_ID_PENDING = "Timer"
        const val NOTIFICATION_ID_PENDING = 1
    }

    override fun onHostResume() {
        TODO("Not yet implemented")
    }

    override fun onHostPause() {
        TODO("Not yet implemented")
    }
}
