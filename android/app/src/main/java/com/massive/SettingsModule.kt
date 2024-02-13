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
import com.facebook.react.bridge.*

class SettingsModule constructor(context: ReactApplicationContext?) :
    ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "SettingsModule"
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun ignoringBattery(promise: Promise) {
        val packageName = reactApplicationContext.packageName
        val pm = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(pm.isIgnoringBatteryOptimizations(packageName))
        } else {
            promise.resolve(true)
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

    @ReactMethod
    fun is24(promise: Promise) {
        val is24 = android.text.format.DateFormat.is24HourFormat(reactApplicationContext)
        Log.d("SettingsModule", "is24=$is24")
        promise.resolve(is24)
    }
}