# Massive

Massive tracks your reps and sets at the gym. No internet connectivity or high spec device is required.
<br />
<br />
<img src="https://img.shields.io/f-droid/v/com.massive.svg?logo=F-Droid" />

## Features

- Track weight, reps and sets
- Rest timers after each set
- Progress graphs
- Day planner

<a href="https://play.google.com/store/apps/details?id=com.massive&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
  <img height="75" alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"/>
</a>
<a href="https://f-droid.org/en/packages/com.massive">
  <img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png" height="75">
</a>

# Screenshots

<img src="metadata/en-US/images/phoneScreenshots/home.png" width="318"/>
<img src="metadata/en-US/images/phoneScreenshots/edit.png" width="318"/>
<img src="metadata/en-US/images/phoneScreenshots/timer.png" width="318"/>
<img src="metadata/en-US/images/phoneScreenshots/plans.png" width="318"/>
<img src="metadata/en-US/images/phoneScreenshots/plan-edit.png" width="318"/>
<img src="metadata/en-US/images/phoneScreenshots/best-view.png" width="318"/>
<img src="metadata/en-US/images/phoneScreenshots/settings.png" width="318"/>
<img src="metadata/en-US/images/phoneScreenshots/drawer.png" width="318"/>

# Building from Source

First follow the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup). Then run the following command:

```sh
cd android
./gradlew assembleRelease
```

The apk file can be found at `android/app/build/outputs/apk/release/app-*-release.apk`
The APKs are separated by architecture, for example we have:
- `app-arm64-v8a-release.apk`
- `app-armeabi-v7a-release.apk`
- `app-x86_64-release.apk`
- `app-x86-release.apk`

Your phone is probably `app-arm64-v8a-release.apk`.

# Running in Development

First ensure Node.js dependencies are installed:

```
yarn install
```

Then start the metro server:

```
yarn start
```

Then (in a separate terminal) run the `android` script:

```
yarn android
```

# Fdroid Metadata

You can find the metadata yaml file in the fdroiddata repository: 
https://gitlab.com/fdroid/fdroiddata/-/blob/master/metadata/com.massive.yml

# Relevant Documentation

- Android https://developer.android.com/docs
- TypeScript https://www.typescriptlang.org/docs/
- JavaScript https://developer.mozilla.org/en-US/docs/Web/JavaScript
- SQLite https://sqlite.org/docs.html
