package com.massive

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.net.Uri
import android.os.Environment
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import com.opencsv.CSVWriter
import java.io.File
import java.io.FileWriter

class DatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    companion object {
        private const val DATABASE_NAME = "massive.db"
        private const val DATABASE_VERSION = 1
    }

    fun exportToCSV(target: String, context: Context) {
        Log.d("DatabaseHelper", "exportToCSV $target")
        val treeUri: Uri = Uri.parse(target)
        val documentFile = context.let { DocumentFile.fromTreeUri(it, treeUri) }
        val file = documentFile?.createFile("application/octet-stream", "sets.csv") ?: return

        context.contentResolver.openOutputStream(file.uri).use { outputStream ->
            val csvWrite = CSVWriter(outputStream?.writer())
            val db = this.readableDatabase
            val cursor = db.rawQuery("SELECT * FROM sets", null)
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
