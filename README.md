# LnkShrt Mobile

Your link workspace, in your pocket. An Android-first React Native app built with Expo and TypeScript, using the existing LnkShrt backend.

## Included

- Email/password login, registration with 4-digit email verification, and password reset.
- Native secure session storage and single-flight refresh-token rotation.
- Dashboard, paginated link search, and link creation with custom aliases, passwords, tags and expiry.
- Native link sharing, clipboard copy, on-device QR generation and confirmed deletion.
- Click trends, visitors, countries, devices and referrers with 7-day, 30-day and all-time ranges.
- Explicit local demo mode with fictional data and reserved example URLs.

## Run

Requires Node.js 22.13+ (Node 24 recommended).

```bash
npm ci
cp .env.example .env
npm start
```

On Windows, copy `.env.example` to `.env` using File Explorer or `Copy-Item .env.example .env` in PowerShell. Scan the terminal QR with a compatible Expo Go version. This project uses Expo SDK 58; if your installed Expo Go does not support it, use a development build or the preview APK build below.

```bash
npm run android
npm run web
```

The Android command requires an emulator or connected device. Web is a convenient preview of the React Native screens; browser preview sessions remain in memory. Native sessions use Expo SecureStore. EXPO_PUBLIC variables are public app configuration, never secrets. HTTPS is required except for local emulator hosts.

## Checks

```bash
npm run typecheck
npm test
npm run export:android
```

## Build an installable Android APK

```bash
npx eas-cli login
npx eas-cli build:configure
npm run build:apk
```

These steps require your Expo account and project association. `preview` produces an APK; `production` produces a Play Store AAB. No signed APK has been built or published by this source submission. Replace the starter app icons before store release.

## Backend compatibility

Source inspected: `Utpalsonowal7/link-shortner-backend` at `0ec5a8c809965a9e7ce1c889e2849c49fae805d9`.

The client uses bearer authentication and sends refresh tokens in JSON with cookies omitted. Routes intentionally match the existing backend, including its spelling:

| Feature | Route |
| --- | --- |
| Login / registration | POST `/auth/login`, `/auth/register` |
| Verify / resend | POST `/auth/verify-otp`, `/auth/resend-otp` |
| Password recovery | POST `/auth/forgot-password`, `/auth/reset-password` |
| Refresh / logout | POST `/auth/refresh-token`, `/auth/logout` |
| Search links | GET `/links?page=1&limit=20&search=...` |
| Create / delete | POST `/links`, DELETE `/links/:id` |
| Summary | GET `/links/stats` |
| Overall analytics | GET `/links/overall-analytcs?range=7` (`data.analytcs`) |
| Link analytics | GET `/links/:id?range=7` |

The current backend logout invalidates all of the user's sessions; the confirmation discloses that behavior. Google OAuth currently redirects to the web frontend and requires a mobile callback/exchange before it can be offered safely in the app. Editing destinations and pausing links are not offered because the inspected API does not implement them. The API health endpoint responded during development; authenticated live flows still require device testing with a real account. Demo ranges use the same labelled sample snapshot.
