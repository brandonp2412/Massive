#!/bin/sh

set -ex
git push origin HEAD > /dev/null &
cd android || exit 1
build=app/build.gradle 
versionCode=$(
  grep '^\s*versionCode [0-9]*$' "$build" | awk '{print $2+1}'
)
major=$(
  grep '^\s*versionName "[0-9]*\.[0-9]*"' "$build" \
    | sed 's/"//g' | cut -d '.' -f 1 | awk '{print $2}'
)
minor=$(
  grep '^\s*versionName "[0-9]*\.[0-9]*"' "$build" \
    | sed 's/"//g' | cut -d '.' -f 2
)
sed -i "s/\(^\s*\)versionCode [0-9]*$/\1versionCode $versionCode/" \
  "$build"
sed -i "s/\(^\s*\)versionName \"[0-9]*.[0-9]*\"$/\1versionName \"$major.$((minor+1))\"/" "$build"
sed -i "s/\"version\": \"[0-9]*.[0-9]*\"/\"version\": \"$major.$((minor+1))\"/" ../package.json
[ "$1" != "--nobundle" ] && ./gradlew bundleRelease 
git add app/build.gradle 
git commit --no-verify --message "Set versionCode=$versionCode"
git tag "$major.$minor"
git push origin HEAD & git push --tags
cd ..
