# BumpBridge

A React + Vite JavaScript hackathon demo using the modular Firebase SDK. No login or separate backend. Use fictional data only.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173) in two tabs:

- Patient: http://localhost:5173/
- Physiotherapist: http://localhost:5173/?view=physio

`npm run build` builds to `dist`; `npm run preview` serves that build locally.

## Firebase configuration

This setup copied the project's existing Firebase web configuration into ignored `.env.local`. Verify those values belong to your intended demo project. On another machine, copy `.env.example` to `.env.local` and fill it in.

Find the configuration in **Firebase Console → Project settings → General → Your apps → Web app → SDK setup and configuration → Config**. Register a web app if needed.

| Vite variable | Firebase config property |
| --- | --- |
| VITE_FIREBASE_API_KEY | apiKey |
| VITE_FIREBASE_AUTH_DOMAIN | authDomain |
| VITE_FIREBASE_PROJECT_ID | projectId |
| VITE_FIREBASE_STORAGE_BUCKET | storageBucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId |
| VITE_FIREBASE_APP_ID | appId |

`apiKey`, `projectId`, and `appId` are required by this app's setup check. Copy all six from the same web app. Analytics `measurementId` and Realtime Database `databaseURL` aren't needed. Restart Vite after environment changes; rebuild for preview/hosting. Vite embeds these public configuration values in the browser bundle: environment variables do not secure Firestore. Never put service-account credentials here.

In the **Cloud Firestore default database**, retain/create `patients/demo-patient-01` with `name` (fictional string, e.g. Alex Demo) and `pregnancyWeek` (number, e.g. 24). Both dashboards read this document. No patient record is automatically overwritten or seeded.

## Publish demo-only rules manually

**These rules allow anyone to read and submit this demo patient's data without logging in. They are not production security.** Use only a dedicated fictional-data demo database. They restrict collections, fields and ranges, block updates/deletes, and expire **November 9, 2026 at 00:00 UTC**. Anyone can still impersonate this patient or generate submissions and costs before expiry.

1. Open your demo project in Firebase Console → Build → Firestore Database → Rules. Confirm you are editing Cloud Firestore, not Realtime Database.
2. Save a copy of the existing rules. Replace the editor contents with `firestore.demo.rules`. Do not append these to a broad allow-all rule, because matching allow rules are additive.
3. If your hackathon is on a different day, change `timestamp.date(2026, 11, 9)` to the UTC day after the demo.
4. Click **Publish**. Rule propagation can take a few minutes; reload both tabs afterward.
5. After the demo, restore restrictive rules or replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

No rules are deployed by this repository. Before real patient use, implement authentication, patient/provider authorization, and appropriate privacy/security review.

Official instructions: https://firebase.google.com/docs/firestore/security/get-started

## Demo verification

1. Confirm the fictional patient name and pregnancy week appear in both tabs. If that read is denied, publish the latest demo rules.
2. Submit a daily check-in in the patient tab. It should appear in the physiotherapist tab without refreshing.
3. In the physiotherapist tab, select one of the four exercises, set targets, and save an assignment. It should appear under the patient’s approved exercises automatically.
4. In the patient tab, choose **Log this exercise**, enter actual repetitions, duration, pain, difficulty, and optional heart-rate values, then save. The provider should see the session automatically. Blank heart-rate fields are stored as `null`.
5. Send feedback in the provider tab and a question from the patient tab. Both should appear in the other tab without refreshing.
6. Change the target for the same exercise and save another assignment. The patient should see the newest target.

Check-ins, assignments, sessions, and messages are append-only demo records with `patientId: demo-patient-01` and a Firestore server timestamp. The dashboard listeners filter by patient ID and sort locally. Multiple check-ins per day are allowed. Permission errors appear in the UI; check the Firebase project, published rules, and expiry. A missing patient message means `patients/demo-patient-01` must be created in the default Firestore database. Cached results are labeled separately from a live server connection.

## Provider assignments and patient feedback

The physiotherapist dashboard now selects one of the four POC exercises and saves repetition and duration targets plus optional instructions to `assignments`. Assigning the same exercise again creates a new plan revision; the newest revision appears as the current plan on both dashboards. The patient sees approved assignments live and can log a manual session against a specific assignment ID. The session includes reported reps, duration, pain, difficulty, notes, and optional heart-rate readings. Blank sensor fields remain `null`—the app does not invent measurements. The provider sees the session live and can send feedback through `messages`. The patient can send a question or adjustment request through the same collection.

This pass is the Firebase data flow from the POC. The four exercises are in a shared JavaScript catalogue. Automatic camera tracking, live sensor connection, movement analysis, trimester suggestions, and visual design remain separate work. The app stays in JavaScript as requested for this repository.

**Republish the updated `firestore.demo.rules` in Firebase Console** to enable the new `assignments`, `messages`, and linked-session fields. Publishing these rules grants anonymous demo access; the URL switch does not authenticate a provider. The local file alone has no effect on Firestore. A quick two-tab test: create an assignment in the provider tab, see it on the patient tab, log a session, and send feedback from the provider tab. Every change should appear in the other tab without refreshing.
