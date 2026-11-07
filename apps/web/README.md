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


## OpenAI chat setup

1. From `apps/web`, install dependencies with `npm install`.
2. Copy `.env.example` to `.env` (or use the blank `.env` file included in the project).
3. Open `apps/web/.env` and paste your OpenAI API key after `OPENAI_API_KEY=`.
4. Run `npm run dev` from `apps/web`.
5. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

The `dev` script starts both the local chat API (port 3001) and Vite. Vite proxies `/api` requests to the backend. The API key is read only by the backend and must never be placed in frontend code or committed to Git.

The Care screen is an AI educational chat, not a clinician messaging system. It does not notify or send messages to a doctor. Do not use it for emergencies or individualized medical advice.
