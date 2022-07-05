package com.massive

import android.app.Service
import android.content.Intent
import android.os.IBinder

class StopTimer : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        applicationContext.stopService(Intent(applicationContext, TimerService::class.java))
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null
    }
}