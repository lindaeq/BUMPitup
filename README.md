# BumpBridge

Prenatal mobility and wellness app (Women in Engineering Hackathon, PointClickCare challenge).

## Run the patient app

```
cd apps/web
npm install
npm run dev
```

The app renders inside a phone-shaped frame and is fully clickable:
Home, Daily check-in, Exercise plan, Exercise detail, Live session (camera / wristband), Post-exercise report, Progress, Care team.

Camera and wristband sessions are simulated in `src/screens/Session.tsx`.
Swap the `ph`-derived values for live MediaPipe output or the BMX160 WebSocket bridge.
App state and demo data live in `src/store.ts`.

## to use
npm install
npm install firebase
add info to .env
./node_modules/.bin/vite
