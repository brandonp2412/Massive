package com.massive

import android.annotation.SuppressLint
import android.app.*
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.MediaPlayer.OnPreparedListener
import android.net.Uri
import android.os.*
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat

class Settings(val sound: String?, val noSound: Boolean, val vibrate: Boolean, val duration: Long)

class AlarmService : Service(), OnPreparedListener {
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null

    private fun getBuilder(): NotificationCompat.Builder {
        val context = applicationContext
        val contentIntent = Intent(context, MainActivity::class.java)
        val pendingContent =
            PendingIntent.getActivity(context, 0, contentIntent, PendingIntent.FLAG_IMMUTABLE)
        val addBroadcast = Intent(AlarmModule.ADD_BROADCAST).apply {
            setPackage(context.packageName)
        }
        val pendingAdd =
            PendingIntent.getBroadcast(context, 0, addBroadcast, PendingIntent.FLAG_MUTABLE)
        val stopBroadcast = Intent(AlarmModule.STOP_BROADCAST)
        stopBroadcast.setPackage(context.packageName)
        val pendingStop =
            PendingIntent.getBroadcast(context, 0, stopBroadcast, PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(context, AlarmModule.CHANNEL_ID_PENDING)
            .setSmallIcon(R.drawable.ic_baseline_hourglass_bottom_24).setContentTitle("Resting")
            .setSound(null)
            .setContentIntent(pendingContent)
            .addAction(R.drawable.ic_baseline_stop_24, "Stop", pendingStop)
            .addAction(R.drawable.ic_baseline_stop_24, "Add 1 min", pendingAdd)
            .setDeleteIntent(pendingStop)
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

    private fun doNotify(): Notification {
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val alarmsChannel = NotificationChannel(
                CHANNEL_ID_DONE,
                CHANNEL_ID_DONE,
                NotificationManager.IMPORTANCE_HIGH
            )
            alarmsChannel.description = "Alarms for rest timers."
            alarmsChannel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            alarmsChannel.setSound(null, null)
            manager.createNotificationChannel(alarmsChannel)
        }

        val builder = getBuilder()
        val context = applicationContext
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
        val notification = builder.build()
        manager.notify(NOTIFICATION_ID_DONE, notification)
        manager.cancel(AlarmModule.NOTIFICATION_ID_PENDING)
        return notification
    }

    @SuppressLint("Recycle")
    @RequiresApi(api = Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        val notification = doNotify()
        startForeground(NOTIFICATION_ID_DONE, notification)
        val settings = getSettings()
        playSound(settings)
        if (!settings.vibrate) return START_STICKY
        val pattern = longArrayOf(0, settings.duration, 1000, settings.duration, 1000, settings.duration)
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(VIBRATOR_SERVICE) as Vibrator
        }
        vibrator!!.vibrate(VibrationEffect.createWaveform(pattern, -1))

        val handler = Handler(Looper.getMainLooper())
        handler.postDelayed({ vibrator!!.cancel() }, 10000)
        return START_STICKY
    }

    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    override fun onPrepared(player: MediaPlayer) {
        player.start()
    }

    override fun onDestroy() {
        super.onDestroy()
        mediaPlayer?.stop()
        mediaPlayer?.release()
        vibrator?.cancel()
    }

    companion object {
        const val CHANNEL_ID_DONE = "Alarm"
        const val NOTIFICATION_ID_DONE = 2
    }
}