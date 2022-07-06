package com.massive

import android.annotation.SuppressLint
import android.app.*
import android.content.ContentValues
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi
import java.io.*

class ImportActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("ImportActivity", "Started ImportActivity.")
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
        }
        startActivityForResult(intent, OPEN_FILE, null)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @SuppressLint("Range")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        Log.d("ImportActivity", "Got activity result: requestCode=$requestCode,resultCode=$resultCode")
        val db = MassiveHelper(applicationContext).readableDatabase
        data?.data?.also { uri ->
            contentResolver.openInputStream(uri)?.use { inputStream ->
                BufferedReader(InputStreamReader(inputStream)).use { reader ->
                    reader.readLine()
                    var line: String? = reader.readLine()
                    while (line != null) {
                        Log.d("ImportActivity", "line: $line")
                        val split = line.split(",")
                        if (split.isEmpty()) continue
                        val set = ContentValues().apply {
                            put("name", split[1])
                            put("reps", split[2])
                            put("weight", split[3])
                            put("created", split[4])
                            put("unit", split[5])
                        }
                        db.insert("sets", null, set)
                        line = reader.readLine()
                    }
                }
            }
        }
        val mainIntent = Intent(applicationContext, MainActivity::class.java)
        mainIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        applicationContext.startActivity(mainIntent)
    }

    companion object {
        const val OPEN_FILE = 1
    }
}