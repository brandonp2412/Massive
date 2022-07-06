package com.massive

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import java.io.*


class ExportActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("ExportActivity", "Started ExportActivity.")
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "text/csv"
            putExtra(Intent.EXTRA_TITLE, "sets.csv")
        }
        startActivityForResult(intent, CREATE_FILE, null)
    }

    @SuppressLint("Range")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        Log.d("ExportActivity", "Got activity result: requestCode=$requestCode,resultCode=$resultCode")
        data?.data?.also { uri ->
            contentResolver.openFileDescriptor(uri, "w")?.use { fd ->
                FileWriter(fd.fileDescriptor).use { fw ->
                    Log.d("ExportActivity", "Got file writer: $fw")
                    fw.write("id,name,reps,weight,created,unit\n")
                    val db = MassiveHelper(applicationContext).readableDatabase
                    db.use {
                        with(it.query("sets", null, null, null, null, null, null)) {
                            while (moveToNext()) {
                                val id = getInt(getColumnIndex("id"))
                                val name = getString(getColumnIndex("name"))
                                val reps = getInt(getColumnIndex("reps"))
                                val weight = getInt(getColumnIndex("weight"))
                                val created = getString(getColumnIndex("created"))
                                val unit = getString(getColumnIndex("unit"))
                                fw.appendLine("$id,$name,$reps,$weight,$created,$unit\n")
                            }
                        }
                    }
                    fw.flush()
                    fw.close()
                }
            }
        }
    }

    @Throws(IOException::class)
    fun getFile(context: Context, uri: Uri): File? {
        val destinationFilename =
            File(context.filesDir.path + File.separatorChar + queryName(context, uri))
        try {
            context.contentResolver.openInputStream(uri).use { ins ->
                if (ins != null) {
                    createFileFromStream(
                        ins,
                        destinationFilename
                    )
                }
            }
        } catch (ex: Exception) {
            Log.e("Save File", ex.message!!)
            ex.printStackTrace()
        }
        return destinationFilename
    }

    private fun createFileFromStream(ins: InputStream, destination: File?) {
        try {
            FileOutputStream(destination).use { os ->
                val buffer = ByteArray(4096)
                var length: Int
                while (ins.read(buffer).also { length = it } > 0) {
                    os.write(buffer, 0, length)
                }
                os.flush()
            }
        } catch (ex: Exception) {
            Log.e("Save File", ex.message!!)
            ex.printStackTrace()
        }
    }

    private fun queryName(context: Context, uri: Uri): String {
        val returnCursor: Cursor = context.contentResolver.query(uri, null, null, null, null)!!
        val nameIndex: Int = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
        returnCursor.moveToFirst()
        val name: String = returnCursor.getString(nameIndex)
        returnCursor.close()
        return name
    }


    companion object {
        const val CREATE_FILE = 1
    }
}