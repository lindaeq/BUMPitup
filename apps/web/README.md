# PhysioFreaks / BumpBridge – web app

React + TypeScript + Vite + Tailwind CSS v4. Currently shows the static patient mobile app design (8 screens).

## Run it
```bash
cd apps/web
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:5173).

## Where things are
- `src/index.css` – Tailwind import, Inter font, colour palette (theme) and the `display` headline style
- `src/App.tsx` – lays out all screens side by side
- `src/screens/` – one file per screen (Home, CheckIn, Plan, Camera, Wristband, Report, Progress, Messages)
- `src/components/` – shared UI pieces (tab bar, buttons, chips, phone frame)
