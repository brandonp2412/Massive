#!/bin/sh

set -ex
cd android
./gradlew assembleRelease
adb -d install app/build/outputs/apk/release/app-arm64-v8a-release.apk
