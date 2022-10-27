package com.massive

import android.app.Service
import android.content.Context
import android.media.MediaPlayer.OnPreparedListener
import android.media.MediaPlayer
import androidx.annotation.RequiresApi
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.*

class AlarmService : Service(), OnPreparedListener {
    var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null

    @RequiresApi(api = Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        if (intent.action == "stop") {
            onDestroy()
            return START_STICKY
        }
        val sound = intent.extras?.getString("sound")
        val noSound = intent.extras?.getBoolean("noSound") == true

        if (sound == null && !noSound) {
            mediaPlayer = MediaPlayer.create(applicationContext, R.raw.argon)
            mediaPlayer?.start()
            mediaPlayer?.setOnCompletionListener { vibrator?.cancel() }
        } else if (sound != null && !noSound) {
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
                setDataSource(applicationContext, Uri.parse(sound))
                prepare()
                start()
                setOnCompletionListener { vibrator?.cancel() }
            }
        }

        val pattern = longArrayOf(0, 300, 1300, 300, 1300, 300)
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager =
                getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(VIBRATOR_SERVICE) as Vibrator
        }
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .build()
        val vibrate = intent.extras!!.getBoolean("vibrate")
        if (vibrate)
            vibrator!!.vibrate(VibrationEffect.createWaveform(pattern, 1), audioAttributes)
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
}