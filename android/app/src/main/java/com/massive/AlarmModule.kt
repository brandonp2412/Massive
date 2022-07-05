package com.massive

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import android.app.PendingIntent
import android.app.AlarmManager
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactMethod
import android.content.Intent
import com.massive.MyBroadcastReceiver
import android.app.AlarmManager.AlarmClockInfo
import android.content.Context
import android.os.Build
import android.util.Log

// replace com.your-app-name with your app’s name
class AlarmModule internal constructor(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {
    private var pendingIntent: PendingIntent? = null
    private var alarmManager: AlarmManager? = null
    override fun getName(): String {
        return "AlarmModule"
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    fun timer(milliseconds: Int) {
        Log.d("AlarmModule", "Queue alarm for $milliseconds delay")
        val intent = Intent(reactApplicationContext, MyBroadcastReceiver::class.java)
        pendingIntent = PendingIntent.getBroadcast(
            reactApplicationContext, 69, intent, PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager =
            reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val info = AlarmClockInfo(System.currentTimeMillis() + milliseconds, pendingIntent)
        alarmManager!!.setAlarmClock(info, pendingIntent)

    }

    @ReactMethod
    fun stop() {
        Log.d("AlarmModule", "Request to stop timer.")
        alarmManager?.cancel(pendingIntent)
        reactApplicationContext.stopService(Intent(reactApplicationContext, AlarmService::class.java))
    }
}