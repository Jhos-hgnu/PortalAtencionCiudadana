# Portal de Atención Ciudadana

Sistema web de quejas ciudadanas: Portal público + Panel de Administración Municipal.

**Stack:** React + Vite + Tailwind (frontend) · Node/Express + TypeScript (API) · Firebase Firestore (capa gratuita).

## Desarrollo
```bash
npm run install:all
cp backend/.env.example backend/.env   # completar credenciales de Firebase
npm run dev:back    # http://localhost:3000
npm run dev:front   # http://localhost:5173 (proxy /api -> 3000)
```
