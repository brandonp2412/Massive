#!/bin/sh

cd android || exit 1
./gradlew assembleRelease
adb -d install app/build/outputs/apk/release/app-arm64-v8a-release.apk
