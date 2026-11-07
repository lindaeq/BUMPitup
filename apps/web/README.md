# BumpBridge web app

Run from this folder with `npm install && npm run dev`. Patient view: `/`. Physiotherapist view: `/?view=physio`. `npm run dev` starts Vite and the local AI API.

Firebase browser configuration goes in `.env.local` using the `VITE_FIREBASE_*` fields from `.env.example`. The AI key goes in the ignored `.env` file: `OPENAI_API_KEY=...` or `GEMINI_API_KEY=...`. One key enables both the separate educational Ask AI tab and the physiotherapist's on-demand summary. Restart the dev server after adding a key. Never commit either key or use a `VITE_` prefix for it.

See the [repository README](../../README.md) for Firebase configuration, demo Firestore rules, and the integrated CV workflow.
