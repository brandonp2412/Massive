package com.massive

import android.Manifest
import android.annotation.SuppressLint
import android.app.*
import android.content.ActivityNotFoundException
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.*
import android.util.Log
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class Settings(val sound: String?, val noSound: Boolean, val vibrate: Boolean, val duration: Long)

@RequiresApi(Build.VERSION_CODES.O)
class TimerService : Service() {

    private lateinit var timerHandler: Handler
    private var timerRunnable: Runnable? = null
    private var secondsLeft: Int = 0
    private var secondsTotal: Int = 0
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var currentDescription = ""

    private val stopReceiver =
        object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                Log.d("TimerService", "Received stop broadcast intent")
                stopSelf()
            }
        }

    private val addReceiver =
        object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                secondsLeft += 60;
                secondsTotal += 60;
                updateNotification(secondsLeft)
                mediaPlayer?.stop()
                vibrator?.cancel()
            }
        }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    override fun onCreate() {
        super.onCreate()
        timerHandler = Handler(Looper.getMainLooper())
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            applicationContext.registerReceiver(
                stopReceiver, IntentFilter(STOP_BROADCAST),
                Context.RECEIVER_NOT_EXPORTED
            )
            applicationContext.registerReceiver(
                addReceiver, IntentFilter(ADD_BROADCAST),
                Context.RECEIVER_NOT_EXPORTED
            )
        } else {
            applicationContext.registerReceiver(stopReceiver, IntentFilter(STOP_BROADCAST))
            applicationContext.registerReceiver(addReceiver, IntentFilter(ADD_BROADCAST))
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        timerRunnable?.let { timerHandler.removeCallbacks(it) }
        secondsLeft = (intent?.getIntExtra("milliseconds", 0) ?: 0) / 1000
        currentDescription = intent?.getStringExtra("description").toString()
        secondsTotal = secondsLeft
        val startTime = System.currentTimeMillis()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(ONGOING_ID, getProgress(secondsLeft).build(), FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else
        {
            startForeground(ONGOING_ID, getProgress(secondsLeft).build())
        }

        battery()
        Log.d("TimerService", "onStartCommand seconds=$secondsTotal")

        timerRunnable = object : Runnable {
            override fun run() {
                val millisElapsed = System.currentTimeMillis() - startTime
                val secondsElapsed = (millisElapsed / 1000).toInt()
                if (secondsElapsed < secondsTotal) {
                    secondsLeft = secondsTotal - secondsElapsed
                    updateNotification(secondsLeft)
                    timerHandler.postDelayed(this, 1000 - millisElapsed % 1000)
                } else {
                    val settings = getSettings()
                    vibrate(settings)
                    playSound(settings)
                    notifyFinished()
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
        applicationContext.unregisterReceiver(addReceiver)
        mediaPlayer?.stop()
        mediaPlayer?.release()
        vibrator?.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    @SuppressLint("BatteryLife")
    fun battery() {
        val powerManager =
            applicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
        val ignoring =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                powerManager.isIgnoringBatteryOptimizations(
                    applicationContext.packageName
                )
            else true
        if (ignoring) return
        val intent = Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        intent.data = Uri.parse("package:" + applicationContext.packageName)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        try {
            applicationContext.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(
                applicationContext,
                "Requests to ignore battery optimizations are disabled on your device.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    @SuppressLint("Range")
    private fun getSettings(): Settings {
        val db = DatabaseHelper(applicationContext).readableDatabase
        val cursor = db.rawQuery("SELECT sound, noSound, vibrate, duration FROM settings", null)
        cursor.moveToFirst()
        val sound = cursor.getString(cursor.getColumnIndex("sound"))
        val noSound = cursor.getInt(cursor.getColumnIndex("noSound")) == 1
        val vibrate = cursor.getInt(cursor.getColumnIndex("vibrate")) == 1
        var duration = cursor.getLong(cursor.getColumnIndex("duration"))
        if (duration.toInt() == 0) duration = 300
        cursor.close()
        return Settings(sound, noSound, vibrate, duration)
    }

    private fun playSound(settings: Settings) {
        if (settings.noSound) return
        if (settings.sound == null) {
            mediaPlayer = MediaPlayer.create(applicationContext, R.raw.argon)
            mediaPlayer?.start()
            mediaPlayer?.setOnCompletionListener { vibrator?.cancel() }
        } else {
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
                setDataSource(applicationContext, Uri.parse(settings.sound))
                prepare()
                start()
                setOnCompletionListener { vibrator?.cancel() }
            }
        }
    }

    private fun getProgress(timeLeftInSeconds: Int): NotificationCompat.Builder {
        val notificationText = formatTime(timeLeftInSeconds)
        val notificationChannelId = "timer_channel"
        val notificationIntent = Intent(this, MainActivity::class.java)
        val contentPending = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stopBroadcast = Intent(STOP_BROADCAST)
        stopBroadcast.setPackage(applicationContext.packageName)
        val stopPending =
            PendingIntent.getBroadcast(
                applicationContext,
                0,
                stopBroadcast,
                PendingIntent.FLAG_IMMUTABLE
            )
        val addBroadcast =
            Intent(ADD_BROADCAST).apply { setPackage(applicationContext.packageName) }
        val addPending =
            PendingIntent.getBroadcast(
                applicationContext,
                0,
                addBroadcast,
                PendingIntent.FLAG_MUTABLE
            )

        val notificationBuilder = NotificationCompat.Builder(this, notificationChannelId)
            .setContentTitle(currentDescription)
            .setContentText(notificationText)
            .setSmallIcon(R.drawable.ic_baseline_timer_24)
            .setProgress(secondsTotal, timeLeftInSeconds, false)
            .setContentIntent(contentPending)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setAutoCancel(false)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setDeleteIntent(stopPending)
            .addAction(R.drawable.ic_baseline_stop_24, "Stop", stopPending)
            .addAction(R.drawable.ic_baseline_stop_24, "Add 1 min", addPending)

        val notificationManager = NotificationManagerCompat.from(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                notificationChannelId,
                "Timer Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            notificationManager.createNotificationChannel(channel)
        }

        return notificationBuilder
    }

    private fun vibrate(settings: Settings) {
        if (!settings.vibrate) return
        val pattern =
            longArrayOf(0, settings.duration, 1000, settings.duration, 1000, settings.duration)
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager =
                getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(VIBRATOR_SERVICE) as Vibrator
        }
        vibrator!!.vibrate(VibrationEffect.createWaveform(pattern, 2))
    }

    private fun notifyFinished() {
        val channelId = "finished_channel"
        val notificationManager = NotificationManagerCompat.from(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel =
                NotificationChannel(channelId, "Timer Finished Channel", NotificationManager.IMPORTANCE_HIGH)
            channel.setSound(null, null)
            channel.setBypassDnd(true)
            channel.enableVibration(false)
            channel.description = "Plays an alarm when a rest timer completes."
            channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            notificationManager.createNotificationChannel(channel)
        }

        val fullIntent = Intent(applicationContext, TimerDone::class.java)
        val fullPending = PendingIntent.getActivity(
            applicationContext, 0, fullIntent, PendingIntent.FLAG_MUTABLE
        )
        val finishIntent = Intent(applicationContext, StopAlarm::class.java)
        val finishPending = PendingIntent.getActivity(
            applicationContext, 0, finishIntent, PendingIntent.FLAG_IMMUTABLE
        )
        val stopBroadcast = Intent(STOP_BROADCAST)
        stopBroadcast.setPackage(applicationContext.packageName)
        val pendingStop =
            PendingIntent.getBroadcast(
                applicationContext,
                0,
                stopBroadcast,
                PendingIntent.FLAG_IMMUTABLE
            )

        val builder = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Timer finished")
            .setContentText(currentDescription)
            .setSmallIcon(R.drawable.ic_baseline_timer_24)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(finishPending)
            .setFullScreenIntent(fullPending, true)
            .setAutoCancel(true)
            .setDeleteIntent(pendingStop)

        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        notificationManager.notify(FINISHED_ID, builder.build())
    }

    private fun updateNotification(seconds: Int) {
        val notificationManager = NotificationManagerCompat.from(this)
        val notification = getProgress(seconds)
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        notificationManager.notify(ONGOING_ID, notification.build())
    }

    private fun formatTime(timeInSeconds: Int): String {
        val minutes = timeInSeconds / 60
        val seconds = timeInSeconds % 60
        return String.format("%02d:%02d", minutes, seconds)
    }

    companion object {
        const val STOP_BROADCAST = "stop-timer-event"
        const val ADD_BROADCAST = "add-timer-event"
        const val ONGOING_ID = 1
        const val FINISHED_ID = 1
    }
}
