#!/bin/sh

cd android && ./gradlew assembleRelease
adb -d install android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
