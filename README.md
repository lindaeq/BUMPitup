# BumpBridge

Prenatal mobility and wellness app (Women in Engineering Hackathon, PointClickCare challenge).

## Run the patient app

```
cd apps/web
npm install
npm run dev
```

Demo patient: Selina (week 24). Care team: Dr. Meredith Grey.

The app renders inside a phone-shaped frame and is fully clickable:
Home, Daily check-in, Exercise plan, Exercise detail, Live session (camera / wristband), Post-exercise report, Progress, Care team.

Screens: Home (daily tip / myth buster), Daily check-in, Exercise plan, Exercise detail (stickman animation and tips),
Live session (camera / wristband), Post-exercise report, Calendar (Month, Year, Trends), Baby size (fruit comparison), Care team.

Where things live (`apps/web/src`):
- `data.ts`: generated demo history from May 23, 2026 to Nov 7, 2026, appointments, daily tips, fruit sizes
- `store.ts`: app state, types and exercises
- `components/StickFigure.tsx`: exercise animations (edit the two poses per exercise)
- `components/Charts.tsx`, `components/Fruit.tsx`: SVG charts and fruit drawings
- `screens/Session.tsx`: simulated camera / wristband tracking, swap in MediaPipe or the BMX160 bridge here

## to use
npm install
npm install firebase
add info to .env
./node_modules/.bin/vite
