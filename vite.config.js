import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Firebase's installed packages include multiple app SDK copies. Share one
  // registry so Firestore registers with the app used by initializeApp.
  resolve: { dedupe: ['@firebase/app'] },
});
