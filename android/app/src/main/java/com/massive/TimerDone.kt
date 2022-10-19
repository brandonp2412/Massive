package com.massive

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View

class TimerDone : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_timer_done)
    }

    fun stop(view: View) {
        Log.d("TimerDone", "Stopping...")
        applicationContext.stopService(Intent(applicationContext, TimerService::class.java))
        applicationContext.stopService(Intent(applicationContext, AlarmService::class.java))
        val intent = Intent(applicationContext, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        applicationContext.startActivity(intent)
    }
}