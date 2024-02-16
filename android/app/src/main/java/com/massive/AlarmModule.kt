package com.massive

import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*

@RequiresApi(Build.VERSION_CODES.O)
class AlarmModule(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "AlarmModule"
    }

    @ReactMethod
    fun timer(milliseconds: Int, description: String) {
        Log.d("AlarmModule", "Queue alarm for $milliseconds delay")
        val intent = Intent(reactApplicationContext, TimerService::class.java)
        intent.putExtra("milliseconds", milliseconds)
        intent.putExtra("description", description)
        reactApplicationContext.startForegroundService(intent)
    }
}
