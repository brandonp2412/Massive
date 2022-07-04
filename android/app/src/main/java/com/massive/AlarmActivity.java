package com.massive;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class AlarmActivity extends Activity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        Log.d("AlarmActivity", "Call to AlarmActivity");
        super.onCreate(savedInstanceState);
        Context context = getApplicationContext();
        context.stopService(new Intent(context, AlarmService.class));
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull String name, @NonNull Context context, @NonNull AttributeSet attrs) {
        return super.onCreateView(name, context, attrs);
    }
}
