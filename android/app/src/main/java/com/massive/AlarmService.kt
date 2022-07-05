package com.massive

import android.app.Service
import android.media.MediaPlayer.OnPreparedListener
import android.media.MediaPlayer
import android.os.Vibrator
import androidx.annotation.RequiresApi
import android.content.Intent
import android.media.AudioAttributes
import android.os.Build
import android.os.VibrationEffect
import android.os.IBinder

class AlarmService : Service(), OnPreparedListener {
    var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null

    @RequiresApi(api = Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        mediaPlayer = MediaPlayer.create(applicationContext, R.raw.argon)
        mediaPlayer?.start()
        mediaPlayer?.setOnCompletionListener { vibrator?.cancel() }
        val pattern = longArrayOf(0, 300, 1300, 300, 1300, 300)
        vibrator = applicationContext.getSystemService(VIBRATOR_SERVICE) as Vibrator
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .build()
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
        mediaPlayer?.release()
        vibrator?.cancel()
    }
}