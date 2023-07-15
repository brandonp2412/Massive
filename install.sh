#!/bin/sh

set -ex
cd android
[ "$1" != "--nobuild" ] && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
adb -d install app/build/outputs/apk/release/app-release.apk
