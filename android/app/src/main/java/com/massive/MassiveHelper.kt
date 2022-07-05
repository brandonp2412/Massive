package com.massive

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class MassiveHelper(context: Context) : SQLiteOpenHelper(context, "massive.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        return
    }

    override fun onUpgrade(p0: SQLiteDatabase?, p1: Int, p2: Int) {
        return
    }
}