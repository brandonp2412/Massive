package com.massive

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import android.widget.Toast
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
    fun add(milliseconds: Int, vibrate: Boolean, sound: String?) {
        Log.d("AlarmModule", "Add 1 min to alarm.")
        val addIntent = Intent(reactApplicationContext, TimerService::class.java)
        addIntent.action = "add"
        addIntent.putExtra("vibrate", vibrate)
        addIntent.putExtra("sound", sound)
        addIntent.data = Uri.parse("$milliseconds")
        reactApplicationContext.startService(addIntent)
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    fun stop() {
        Log.d("AlarmModule", "Stop alarm.")
        val timerIntent = Intent(reactApplicationContext, TimerService::class.java)
        reactApplicationContext.stopService(timerIntent)
        val alarmIntent = Intent(reactApplicationContext, AlarmService::class.java)
        reactApplicationContext.stopService(alarmIntent)
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

    @SuppressLint("BatteryLife")
    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun ignoreBattery() {
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        intent.data = Uri.parse("package:" + reactApplicationContext.packageName)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        try {
            reactApplicationContext.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(
                reactApplicationContext,
                "Requests to ignore battery optimizations are disabled on your device.",
                Toast.LENGTH_LONG
            ).show()
        }
    }
}
