# BUMPitup

Hackathon patient and physiotherapist demo in one React app. The patient screens come from the Linda frontend on `main`, the camera tracker from `cv`, and the Firebase assignment and communication flow from `Jenny`. Use fictional data only.

## Run

```sh
cd apps/web
npm install
cp .env.example .env.local
# Fill in the Firebase web app values in .env.local
npm run dev
```

Open the URL Vite prints. The patient app is at `/`; the existing physiotherapist view is at `/?view=physio`. Open them in separate tabs to see live updates. `npm run build`, `npm run lint`, and `npm run test` are the verification commands.

The local integration checkout already has an ignored `apps/web/.env.local` copied from the prior Jenny checkout. On another machine, obtain the six `VITE_FIREBASE_*` values from Firebase Console → Project settings → General → Your apps → Web app → Config. These are public browser config values, not Firestore security credentials. Restart Vite after changing the environment.

For AI chat and the physiotherapist's AI summary, put your **OpenAI or Gemini API key** in the ignored `apps/web/.env` file as `OPENAI_API_KEY=...` or `GEMINI_API_KEY=...`, then restart `npm run dev`. One provider key runs both features. With both keys, the chat uses OpenAI and the summary uses Gemini. The key stays in the local API server, not the Vite browser bundle. The `npm run dev` command now starts both the API on port 3001 and Vite; a static deployment needs an equivalent API host. The AI assistant is separate from the Firestore Care team conversation and does not message a clinician. Summaries are generated on demand from five recent fictional logs and require clinician review.

## Firebase demo setup

In the **default Cloud Firestore database**, create or confirm `patients/demo-patient-01` with a fictional `name` string and a numeric `pregnancyWeek`. The app currently reports that this document is missing in the configured project. The provider dashboard reads it, and the patient app uses it for the greeting and pregnancy week. Assignments, check-ins, sessions and messages all use the same patient ID.

The checked-in [demo rules](firestore.demo.rules) need to be published separately: Firebase Console → Firestore Database → Rules → paste the file → **Publish**. They grant unauthenticated read/write access to specific fictional demo collections until **November 9, 2026 at 00:00 UTC**. No authentication distinguishes a patient from a provider; the URL switch is only a view switch. Use a dedicated demo project, never real patient data, and replace these rules with restrictive rules immediately after the demo. The repository does not deploy rules automatically. Existing published rules may accept older manual sessions but reject the new CV summary fields until you publish this version.

## Connected demo flow

1. The physiotherapist assigns or adjusts one of four exercises with repetition and duration targets and optional instructions. The newest assignment for each exercise is the patient's current plan.
2. The patient receives the plan live, sees provider instructions, and starts an assigned exercise.
3. Seated arm raises and wide-stance squats use the `cv` branch's MediaPipe tracker in the browser. The tracker asks for camera permission and loads the pose model/WASM from external URLs. Video stays on the device and is not uploaded. If the camera or tracking fails, the patient can enter repetitions manually. Bird-dog and wall push-ups use manual logging for now.
4. On completion, the patient reports pain and difficulty. One summary goes to `sessions`, linked to the exact assignment. Only actual measured movement range is saved; heart rate remains `null` until real sensor integration exists.
5. The provider sees the session and daily check-ins live. Patient questions and provider feedback appear in both views through `messages`.

The patient Calendar's older charts are **illustrative sample history**, labeled as such in the app; the Recent sessions list comes from Firestore. The home plan, care-team messages, weekly active minutes, check-in status, and session results use Firestore data. No live ESP32 or heart-rate bridge is connected yet. CV angles are 2D estimates, not a clinical safety assessment.

## Quick checks

- Assign seated arm raises in the provider tab. Confirm the patient plan and instructions update without refreshing.
- Submit a daily check-in from the patient tab. Confirm it appears in the provider tab.
- Complete an assigned exercise, report pain and difficulty, and confirm the session appears with a tracking mode and optional estimated range.
- Send a message each way. Confirm it appears in the other tab.
- Open Ask AI and ask an educational question. Generate the AI summary in the physiotherapist tab after check-ins or sessions exist. These require an AI API key in `apps/web/.env`.

If a write is denied, check the published rules and expiry. If the camera does not start, check browser permission and access to the MediaPipe model files. The manual fallback should still be available.
