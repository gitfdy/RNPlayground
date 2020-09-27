package com.rnplayground.trans;

import android.annotation.SuppressLint;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.text.SimpleDateFormat;
import java.util.Date;

public class Trans extends ReactContextBaseJavaModule {
    private ReactContext mReactContext;

    public Trans(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "TransModule";
    }

    @ReactMethod
    public void getTime() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                String time = getTimeMillis();
                WritableMap writableMap = new WritableNativeMap();
                writableMap.putString("key", time);
                sendEvent(mReactContext, "NativeTime", writableMap);
            }
        }).start();
    }


    private String getTimeMillis() {
        SimpleDateFormat formatDate = new SimpleDateFormat("yyyy年MM月dd日  HH:mm:ss");
        Date date = new Date(System.currentTimeMillis());
        return formatDate.format(date);
    }

    /**
     * 使用原生端发送监听的方式
     *
     * @param reactContext
     * @param eventName
     * @param params
     */
    private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    /**
     * 使用回调方式从原生获取数据
     *
     * @param callback
     */
    @ReactMethod
    public void callBackTime(Callback callback) {
        callback.invoke(getTimeMillis());
    }

    @ReactMethod
    public void sendPromiseTime(Promise promise) {
        WritableMap writableMap = new WritableNativeMap();
        writableMap.putInt("年龄", 20);
        writableMap.putString("time", getTimeMillis());
        promise.resolve(writableMap);
    }
}
