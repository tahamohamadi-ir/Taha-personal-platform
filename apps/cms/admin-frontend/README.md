# taha-cms-admin

Scaffold of the custom React admin SPA for the Taha personal platform
(ADR-0026, phase ADM-1). Replaces the Wagtail admin with a Persian/RTL
frontend (React 18 + Vite + TypeScript + Tailwind CSS v4) talking to the
Django Ninja admin APIs under `/api/v1/admin/*`.

## Run

```sh
npm install
npm run dev     # http://localhost:5173 — proxies /api to Django on 127.0.0.1:8000
npm run build   # tsc -b && vite build
npm run check   # typecheck only
npm run preview # serve the production build
```

## Env vars

- `VITE_ADMIN_API_BASE` — optional API base URL (default `/api/v1/admin`).

## Notes

- Auth flow: `GET /auth/csrf` → `POST /auth/login` → `GET /auth/me`, all with
  `credentials: "include"` and the `X-CSRFToken` header.
- No component libraries; plain React + Tailwind only.
- Dev-server proxy assumes Django runs on `http://127.0.0.1:8000`.
