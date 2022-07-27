#!/bin/sh

set -ex
cd android || exit 1
target=app/build.gradle 
newVersion=$(grep '^\s*versionCode [0-9]*$' "$target" | awk '{print $2+1}')
sed -i "s/\(^\s*\)versionCode [0-9]*$/\1versionCode $newVersion/" \
  "$target"
./gradlew bundleRelease 
git add app/build.gradle 
git commit -m "Bundle version $newVersion"
cd ..
