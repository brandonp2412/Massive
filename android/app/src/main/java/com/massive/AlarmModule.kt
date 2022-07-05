package com.massive

import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AlarmModule internal constructor(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "AlarmModule"
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    fun timer(milliseconds: Int) {
        Log.d("AlarmModule", "Queue alarm for $milliseconds delay")
        val intent = Intent(reactApplicationContext, TimerService::class.java)
        intent.putExtra("milliseconds", milliseconds)
        reactApplicationContext.startService(intent)
    }
}
