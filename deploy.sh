#!/bin/bash

set -ex

yarn tsc
yarn lint
git push origin HEAD

cd android || exit 1

build=app/build.gradle
versionCode=$(
	grep '^\s*versionCode [0-9]*$' "$build" | awk '{print $2+1}'
)
major=$(
	grep '^\s*versionName "[0-9]*\.[0-9]*"' "$build" |
		sed 's/"//g' | cut -d '.' -f 1 | awk '{print $2}'
)
minor=$(
	grep '^\s*versionName "[0-9]*\.[0-9]*"' "$build" |
		sed 's/"//g' | cut -d '.' -f 2
)
minor=$((minor + 1))

sed -i "s/\(^\s*\)versionCode [0-9]*$/\1versionCode $versionCode/" \
	"$build"
sed -i "s/\(^\s*\)versionName \"[0-9]*.[0-9]*\"$/\1versionName \"$major.$minor\"/" "$build"
sed -i "s/\"version\": \"[0-9]*.[0-9]*\"/\"version\": \"$major.$minor\"/" ../package.json

[ "$1" != "--nobundle" ] && ./gradlew bundleRelease

set +x
source ~/.cache/yay/rvm/rvm.sh
rvm use ruby-2.7.5
set -x

fastlane supply --aab app/build/outputs/bundle/release/app-release.aab

git add app/build.gradle ../package.json
git commit --no-verify --message "Set versionCode=$versionCode"
git tag "$versionCode"
git push origin HEAD &
git push --tags

cd ..
./install.sh
