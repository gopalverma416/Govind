# Govind Owner app

The Android app for running Govind Jewellers from your phone.

- **Dashboard**: who is on the website right now (signed-in customers by name), visitors today and this week, orders, revenue, most-viewed pieces.
- **Products**: add, edit and delete products with photos from your gallery or camera. Changes appear on the website immediately.
- **Orders**: every order with the customer's address, plus one-tap Call and WhatsApp.
- **Chats**: reply to customers who message you on the website. New messages arrive as push notifications, even when the app is closed.

The app talks to the same backend as the website (`https://govind-jwellers.onrender.com`). Only accounts with the **admin** role can sign in.

---

## One-time setup

### 1. Deploy the backend and set its environment variables

On Render, add these environment variables to the backend service, then redeploy:

| Variable | Value |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | from your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | a **newly generated** secret (the old one was published on GitHub; regenerate it in Cloudinary → Settings → API Keys) |

`MONGODB_URI` and `JWT_SECRET` should already be set.

### 2. Make your account the owner

Sign up on the website with your email, then from the repository root run (with `MONGODB_URI` in a local `.env`):

```bash
node scripts/make-admin.js you@example.com
```

### 3. Link the app to Expo (free account)

```bash
cd owner-app
npx eas-cli@latest login
npx eas-cli@latest init        # creates the EAS project and writes its id into app.json
```

### 4. Set up Firebase for Android push notifications (free)

Android delivers push notifications through Firebase Cloud Messaging. Follow Expo's guide:
https://docs.expo.dev/push-notifications/fcm-credentials/

In short:
1. Create a Firebase project at https://console.firebase.google.com and add an **Android app** with the package name `com.govindjewellers.owner`.
2. Download `google-services.json`, put it in `owner-app/`, and add `"googleServicesFile": "./google-services.json"` under `expo.android` in `app.json`.
3. In Firebase → Project settings → Service accounts, generate a private key (JSON).
4. Run `npx eas-cli@latest credentials`, choose Android → Google Service Account → **FCM V1**, and upload that JSON key.

### 5. Build the app and install it on your phone

```bash
npx eas-cli@latest build --platform android --profile preview
```

When the build finishes (about 10–15 minutes, in Expo's cloud), open the link on your Android phone, download the `.apk` and install it. Sign in with your owner account and allow notifications.

> Push notifications do **not** work inside the Expo Go app on Android. Use the installed build from step 5.

---

## Development

```bash
npm install
npx expo start                 # open on a phone with a development build
```

To try the app against a local backend:

```bash
EXPO_PUBLIC_API_BASE=http://<your-computer-ip>:5005 npx expo start
```

Checks to run before committing:

```bash
npx expo lint
npx -y expo-doctor
```
