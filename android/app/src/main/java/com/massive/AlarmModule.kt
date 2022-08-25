package com.massive

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Callback
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
    fun timer(milliseconds: Int, vibrate: Boolean, sound: String?) {
        Log.d("AlarmModule", "Queue alarm for $milliseconds delay")
        val intent = Intent(reactApplicationContext, TimerService::class.java)
        intent.putExtra("milliseconds", milliseconds)
        intent.putExtra("vibrate", vibrate)
        intent.putExtra("sound", sound)
        reactApplicationContext.startService(intent)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun ignoringBattery(callback: Callback) {
        val packageName = reactApplicationContext.packageName
        val pm =
            reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            callback.invoke(pm.isIgnoringBatteryOptimizations(packageName))
        } else {
            callback.invoke(true)
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun openSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        intent.data = Uri.parse("package:" + reactApplicationContext.packageName)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactApplicationContext.startActivity(intent)
    }
}
