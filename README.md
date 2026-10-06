# AIMarg Mobile

Native Android and iOS app built with the React Native Community CLI. Navigation
uses React Navigation; Expo SDK and Expo Router are not used.

## Requirements

- Node.js 22.11 or newer
- npm
- Android Studio, Android SDK, and an emulator or connected Android device
- macOS and Xcode for iOS builds

## Setup

```sh
npm ci
```

Copy `.env.example` to `.env`, then set `API_URL` to an API server reachable by
the device. Use `http://10.0.2.2:5000/api/v1` for the Android emulator, the
development computer's LAN IP for a physical device, or `http://localhost:5000/api/v1`
for the iOS simulator. Release builds require HTTPS.

For Android, set `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` in `.env` and create an
Android OAuth client in Google Cloud Console for package `com.AIMarg.app` and
the build signing-certificate SHA-1. This repository's current debug keystore
(also used to sign its local release APK) has SHA-1
`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`. If you sign a
build with another key, register that key's SHA-1 instead. Android uses the
native Google sign-in flow and sends its Google access token to the API; the API
validates the token with Google and checks that its audience matches an ID in
the backend's `GOOGLE_CLIENT_IDS`.
No Web OAuth client ID is required for Android sign-in. For iOS, set
`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, and
register the matching bundle ID. Add the Android client ID (and the iOS client
IDs where applicable) to the backend's `GOOGLE_CLIENT_IDS` list. These IDs are
public configuration values; never put client secrets in the app. Rebuild the
app after changing `.env`.

Manual signup offers `User` and `HR` account roles. Google signup applies the
selected role only when creating a new account; signing into an existing Google
account preserves its current roles.

## Run

```sh
npm start
npm run android
npm run ios
```

Screens with fresh server data support pull-to-refresh: pull down on the page
to reload its current data.

The debug APK is for development only and is not size-optimized. To create a
release APK, run `npm run android:release`. The release build enables
code/resource shrinking, compresses native libraries, packages only the
Ionicons font actually used by the app, and uses a static brand mark instead of
the multi-megabyte animated logo. It builds `armeabi-v7a`, `arm64-v8a`, `x86`,
and `x86_64` variants, plus a universal APK that supports all four architectures.
Use the universal APK when sharing a single installer; it is larger than an
architecture-specific APK. The APKs are under
`android/app/build/outputs/apk/release/`.

### Troubleshooting: "Unable to load script"

This screen means the app cannot load its JavaScript bundle; it does not by
itself indicate that the phone is unsupported. A debug APK needs Metro running
on the development computer. Start it with `npm start` from this directory and
keep the device connected to the same development setup. For a standalone
install, build and install a release APK from
`android/app/build/outputs/apk/release/`; release APKs include the JavaScript
bundle and do not need Metro.

For iOS, install CocoaPods dependencies from the `ios` directory with
`bundle exec pod install` (or `pod install`) before the first build.

## Validation

```sh
npm run typecheck
npm run lint
```

Auth tokens are stored with the platform keychain/Android Keystore. Do not
replace secure storage with AsyncStorage or log credentials or API payloads.
