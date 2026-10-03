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

Google sign-in requires `GOOGLE_WEB_CLIENT_ID`. Register Android package
`com.AIMarg.app` and its signing-certificate SHA-1 in Google Cloud Console, and
register the matching iOS bundle ID there for iOS builds. Configure the same web
client ID on the API server for ID-token verification. Client IDs are public
configuration values; never put client secrets in the app.

## Run

```sh
npm start
npm run android
npm run ios
```

The debug APK is for development only and is not size-optimized. To create a
smaller arm64-only release APK, run `npm run android:release`. The release build
enables code/resource shrinking, compresses native libraries, packages only the
Ionicons font actually used by the app, and uses a static brand mark instead of
the multi-megabyte animated logo. It packages only the `arm64-v8a` architecture;
it will not install on x86 emulators or 32-bit-only devices. The resulting APK
is under `android/app/build/outputs/apk/release/`.

For iOS, install CocoaPods dependencies from the `ios` directory with
`bundle exec pod install` (or `pod install`) before the first build.

## Validation

```sh
npm run typecheck
npm run lint
```

Auth tokens are stored with the platform keychain/Android Keystore. Do not
replace secure storage with AsyncStorage or log credentials or API payloads.
