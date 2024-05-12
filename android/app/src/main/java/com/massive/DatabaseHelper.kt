package com.massive

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.net.Uri
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import com.opencsv.CSVWriter

class DatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    companion object {
        private const val DATABASE_NAME = "massive.db"
        private const val DATABASE_VERSION = 1
    }

    fun exportSets(target: String, context: Context) {
        Log.d("DatabaseHelper", "exportSets $target")
        val treeUri: Uri = Uri.parse(target)
        val documentFile = context.let { DocumentFile.fromTreeUri(it, treeUri) }
        val file = documentFile?.createFile("application/octet-stream", "sets.csv") ?: return

        context.contentResolver.openOutputStream(file.uri).use { outputStream ->
            val csvWrite = CSVWriter(outputStream?.writer())
            val db = this.readableDatabase

            val setCursor = db.rawQuery("SELECT * FROM sets", null)
            csvWrite.writeNext(setCursor.columnNames)

            var lastId = 0
            while(setCursor.moveToNext()) {
                val arrStr = arrayOfNulls<String>(setCursor.columnCount)
                for(i in 0 until setCursor.columnCount) {
                    arrStr[i] = setCursor.getString(i)
                }
                val id = arrStr[0]?.toInt()
                if (id != null && id > lastId) lastId = id
                csvWrite.writeNext(arrStr)
            }

            val weightCursor = db.rawQuery("SELECT * FROM weights", null)
            while (weightCursor.moveToNext()) {
                val arrStr = arrayOfNulls<String>(setCursor.columnCount)
                arrStr[0] = lastId++.toString()
                arrStr[1] = "Weight"
                arrStr[2] = "1"
                arrStr[3] = weightCursor.getString(1)
                arrStr[4] = weightCursor.getString(2)
                arrStr[5] = "kg"

                csvWrite.writeNext(arrStr)
            }

            csvWrite.close()
            setCursor.close()
            weightCursor.close()
        }
    }

    fun exportPlans(target: String, context: Context) {
        Log.d("DatabaseHelper", "exportPlans $target")
        val treeUri: Uri = Uri.parse(target)
        val documentFile = context.let { DocumentFile.fromTreeUri(it, treeUri) }
        val file = documentFile?.createFile("application/octet-stream", "plans.csv") ?: return

        context.contentResolver.openOutputStream(file.uri).use { outputStream ->
            val csvWrite = CSVWriter(outputStream?.writer())
            val db = this.readableDatabase
            val cursor = db.rawQuery("SELECT * FROM plans", null)
            csvWrite.writeNext(cursor.columnNames)

            while(cursor.moveToNext()) {
                val arrStr = arrayOfNulls<String>(cursor.columnCount)
                for(i in 0 until cursor.columnCount) {
                    arrStr[i] = cursor.getString(i)
                }
                csvWrite.writeNext(arrStr)
            }

            csvWrite.close()
            cursor.close()
        }
    }

    override fun onCreate(db: SQLiteDatabase) {
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    }

    override fun onDowngrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    }
}
