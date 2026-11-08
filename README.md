# BumpBridge

**Pregnancy exercise support that connects patients and physiotherapists.**

BumpBridge gives patients a clear exercise plan and a simple way to share how they are feeling. Physiotherapists can assign exercises, shape the weekly schedule, and follow progress from a separate dashboard. Changes and new entries appear in both views in real time.

## What you can do

### Patient experience

- **Follow a weekly plan.** See today's assigned exercise on the home screen and the full repeating schedule in the calendar.
- **Exercise with guidance.** The camera tracker gives movement feedback for squats, bird-dog, wall push-ups, and seated arm raises. Patients can enter results manually when camera tracking is unavailable.
- **Record how you feel.** Daily check-ins capture pain, fatigue, discomfort location, and notes. Completed sessions record exercise results and how difficult they felt.
- **Stay in touch.** Send messages to the physiotherapist in the care-team chat, and ask the AI assistant general educational questions from the same conversation screen.
- **Make the app yours.** Update profile details and choose a language for the patient interface.

During squat sessions, a connected Arduino wristband can display live heart rate in Chrome or Edge. Camera processing happens in the browser; video is not uploaded.

### Physiotherapist experience

- Assign any of the four exercises with targets and instructions.
- Set an exercise or rest day for each day of a repeating weekly schedule.
- Review check-ins, recent exercise sessions, and progress charts as new entries arrive.
- Message the patient and generate a brief, on-demand AI summary of recent activity.

## How it works

BumpBridge is a React app built with Vite. Firebase Cloud Firestore stores the profile, assignments, weekly schedule, check-ins, sessions, and messages. Real-time Firestore listeners keep the patient and physiotherapist views in sync. MediaPipe Pose handles camera-based movement tracking, Web Serial reads the Arduino wristband, and Recharts draws the physio graphs.

A small Node.js API handles AI requests so provider keys stay out of the browser bundle. OpenAI or Gemini can power Ask AI and the physio summary; OpenAI powers interface translation when a patient selects another language. Some chart history is illustrative, while submitted check-ins, sessions, messages, assignments, and schedules come from Firestore.

## Get started

```sh
cd apps/web
npm install
cp .env.example .env.local
```

Add your Firebase web app values to the six `VITE_FIREBASE_*` fields in `apps/web/.env.local`. Find them under **Firebase Console → Project settings → General → Your apps → Web app → Config**.

For AI features, create `apps/web/.env` and add `OPENAI_API_KEY=...` or `GEMINI_API_KEY=...`. Interface translation requires OpenAI. Keep these keys out of `VITE_` variables and version control.

```sh
npm run dev
```

Open the Vite URL for the **patient view**. Add `?view=physio` to the URL for the **physiotherapist view**. Open both at once to see updates appear without refreshing. Run `npm run test`, `npm run lint`, and `npm run build` from `apps/web` to check the project.

### Firestore setup

In the default Firestore database, create `patients/demo-patient-01` with a `name` string and numeric `pregnancyWeek`. Publish [firestore.demo.rules](firestore.demo.rules) in **Firebase Console → Firestore Database → Rules**. These rules expire on **November 9, 2026 at 00:00 UTC** and must be updated if the demo runs later.

This repository uses one demonstration patient and has no authentication or provider access controls. Use demonstration data only; a real healthcare deployment needs authenticated access and restrictive Firestore rules.
