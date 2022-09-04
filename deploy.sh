#!/bin/sh

set -ex
yarn tsc && yarn lint
git push origin HEAD > /dev/null &
cd android || exit 1
target=app/build.gradle 
newVersion=$(grep '^\s*versionCode [0-9]*$' "$target" | awk '{print $2+1}')
sed -i "s/\(^\s*\)versionCode [0-9]*$/\1versionCode $newVersion/" \
  "$target"
[ "$1" != "--nobundle" ] && ./gradlew bundleRelease 
git add app/build.gradle 
git commit -m "Set versionCode=$newVersion"
git tag "$newVersion"
git push origin HEAD & git push --tags
cd ..
