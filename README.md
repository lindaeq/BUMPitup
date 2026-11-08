# BumpBridge

BumpBridge connects a pregnancy exercise app with a physiotherapist dashboard. A patient can follow a weekly plan, complete exercises with camera-guided movement tracking, submit daily check-ins, and message their care team. The physiotherapist can update the plan and see new activity as it arrives.

## Tech stack

| Part | Technology | What it does |
| --- | --- | --- |
| Patient and physio UI | React, TypeScript/JavaScript, Vite, Tailwind CSS and custom CSS | Runs both views in one web app. |
| Shared data | Firebase Cloud Firestore | Stores the patient profile, weekly schedule, assignments, check-ins, sessions and care-team messages. `onSnapshot()` keeps both views in sync. |
| Exercise tracking | MediaPipe Pose | Estimates movement from the camera in the browser. All four exercises have tracking configurations; manual entry is the fallback. Video is not uploaded. |
| Heart rate | Arduino + Web Serial | Reads the wristband during a squat session in a compatible browser. |
| Charts | Recharts | Shows trends on the physio dashboard. |
| AI features | Small local Node.js API + OpenAI or Gemini | Serves Ask AI and the on-demand physio summary. OpenAI also translates the patient interface when a language is selected. API keys stay outside the browser bundle. |

## Run locally

From the repository root:

```sh
cd apps/web
npm install
cp .env.example .env.local
```

Fill in the six `VITE_FIREBASE_*` fields in `apps/web/.env.local`. Find them in **Firebase Console → Project settings → General → Your apps → Web app → Config**. These are Firebase web app identifiers, not a substitute for Firestore security rules.

To enable AI, create the ignored file `apps/web/.env` with one provider key:

```dotenv
OPENAI_API_KEY=your_key_here
# or GEMINI_API_KEY=your_key_here
```

OpenAI is required for interface translation. If both keys are present, Ask AI uses OpenAI and the physio summary uses Gemini. Do not put a secret key in a `VITE_` variable. AI requests are made only when the relevant feature is used.

Start the web app and local AI API together:

```sh
npm run dev
```

Open the URL Vite prints. The **patient view** is at `/` and the **physiotherapist view** is at `/?view=physio`. Open both to watch Firestore updates appear without refreshing. Restart the server after changing either environment file. The AI API runs on port 3001; a static web deployment also needs an API host for AI features.

### Show the physio view on another device

Keep `npm run dev` running. In a second terminal in `apps/web`, run:

```sh
npm run dev:web -- --host 0.0.0.0 --port 5174
```

On a device connected to the same network, open `http://<your-laptop-IP>:5174/?view=physio`. On a Mac, `ipconfig getifaddr en0` usually prints the Wi-Fi IP. Some campus networks block connections between devices; a personal hotspot is an alternative. Keep the patient camera view on `localhost`, which browsers treat as a secure context.

## Firebase demo setup

Use the default Cloud Firestore database. Create `patients/demo-patient-01` with at least a `name` string and numeric `pregnancyWeek`. The patient profile editor can then save name, age, weight and due date. All other records use the same patient ID.

Publish [firestore.demo.rules](firestore.demo.rules) through **Firebase Console → Firestore Database → Rules → paste the file → Publish**. The repository does not publish rules for you. These rules expire **November 9, 2026 at 00:00 UTC**; update the expiry if your demo is later.

The rules allow unauthenticated access to the demo patient, and `?view=physio` is only a view switch. Use this setup only with demonstration data. Real patient data needs authentication, provider roles and restrictive rules.

## Demo walkthrough

1. In the physio view, assign an exercise and save a seven-day repeating schedule. The patient home and calendar update live.
2. In the patient view, complete a check-in or an assigned exercise. The physio view receives the entry live. Camera tracking supports squats, bird-dog, wall push-ups and seated arm raises; manual entry remains available.
3. Connect the Arduino wristband in Chrome or Edge during squats to show live heart rate. Close the Arduino IDE Serial Monitor before connecting the browser to the port.
4. Send a care-team message from either view. Generate the physio AI summary after entries exist; it appears as three short points.
5. Edit the patient profile in **You → Profile** or choose a language in **You → Language**. Translation is requested only when a different language is selected and is cached in that browser.

Some historical chart values are illustrative; live check-ins, sessions, messages, assignments and the schedule come from Firestore. Camera angles are two-dimensional estimates, not clinical measurements.

## Checks

From `apps/web`, run `npm run test`, `npm run lint` and `npm run build`. If a Firestore write is denied, check that the current demo rules are published and have not expired. If camera tracking cannot start, check browser permissions and access to the MediaPipe model files.
