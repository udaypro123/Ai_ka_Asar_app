# AIMarg Mobile

Expo Router application for Android and iOS.

## Requirements

- Node.js 20.9 or newer
- npm
- Expo development build or simulator for native SecureStore and notification behavior

## Local Setup

From this directory, in PowerShell:

```powershell
npm ci
Copy-Item .env.example .env
```

Set `EXPO_PUBLIC_API_URL` to an API host reachable from the target device. Use `http://10.0.2.2:5000/api/v1` for the Android emulator, `http://localhost:5000/api/v1` for the iOS simulator, or the development computer's LAN IP for a physical device. Production builds reject non-HTTPS API URLs. `EXPO_PUBLIC_*` values are embedded in the app and must never contain secrets.

Start Expo with `npm start`. Run `npm run typecheck` and `npm run lint` before shipping. Auth tokens are stored in platform SecureStore; never replace that with AsyncStorage or log request/response payloads.
