#!/bin/sh

cd android && ./gradlew assembleRelease
adb install android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
