// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ----------------------------------------------------
  // Konfiguracja serwera deweloperskiego i PROXY
  // ----------------------------------------------------
  server: {
    proxy: {
      // 1. Definiujemy, że żądania zaczynające się od '/api'
      '/api': {
        // 2. Przekierowujemy je do serwera Django
        target: 'http://127.0.0.1:8000',
        
        // 3. Wymuszamy zmianę nagłówka Origin, aby Django myślało,
        //    że żądanie pochodzi z tego samego hosta (wymagane w wielu przypadkach)
        changeOrigin: true,
        
        // 4. (Opcjonalne, ale pomocne) Wyłączamy sprawdzanie certyfikatów SSL
        secure: false, 
      }
    }
  }
  // ----------------------------------------------------
});