package com.massive

import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi

class TimerService : Service() {
    private var countdownTimer: CountDownTimer? = null

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("TimerService", "Started timer service.")
        val endMs = intent!!.extras!!.getInt("milliseconds")
        countdownTimer?.cancel()
        countdownTimer = object : CountDownTimer(endMs.toLong(), 1000) {
            override fun onTick(currentMs: Long) {
                val broadcastIntent = Intent(applicationContext, TimerBroadcast::class.java)
                broadcastIntent.putExtra("endMs", endMs)
                broadcastIntent.putExtra("currentMs", currentMs)
                broadcastIntent.action = "tick"
                sendBroadcast(broadcastIntent)
            }
            override fun onFinish() {
                val broadcastIntent = Intent(applicationContext, TimerBroadcast::class.java)
                broadcastIntent.action = "finish"
                sendBroadcast(broadcastIntent)
            }
        }
        countdownTimer!!.start()
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        Log.d("TimerService", "Destroying...")
        countdownTimer?.cancel()
        val broadcastIntent = Intent(applicationContext, TimerBroadcast::class.java)
        broadcastIntent.action = "stop"
        sendBroadcast(broadcastIntent)
        super.onDestroy()
    }
}