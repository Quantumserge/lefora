# Plant-Readiness Next.js Front-end

A **Next.js** front-end for the plant transplant-readiness system.
It talks to the Flask backend in `backend/app.py` through proxy API routes.
It is also installable on Android as a Progressive Web App (PWA), so the same
dashboard and feedback workflow can be launched from the phone's home screen.

## Pages

- `/` — species-level dashboard: choose a species, view the latest cloud
  observation cohort, and get a readiness prediction.
- `/feedback` — readiness assessment, transplant record, 14-day follow-up,
  reference baseline, and prediction evaluation.

The transplant form records optional soil moisture and observed transplant-day
weather (temperature, humidity, condition, rainfall, and wind speed). These are
manual observations; the app does not fetch weather forecasts or historical
weather from an external service.

## Prerequisites

- Node >= 18
- The Flask backend running on `http://localhost:8000`

## Setup

```bash
cd nextjs
npm install
```

## Development

```bash
# terminal 1: backend
python backend/app.py

# terminal 2: front-end
npm run dev            # http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```

## Install on Android

Deploy the front end over HTTPS and make sure its Flask backend is reachable
through `PYTHON_BACKEND_URL`. Open the deployed site in Chrome on Android and
choose **Install app** when the button appears, or use Chrome's menu and choose
**Install app** / **Add to Home screen**. The PWA caches the page shell; live
predictions, record loading, and submissions still need a connection to the
backend.

## Environment variables

- `PYTHON_BACKEND_URL` — URL of the Flask backend (default `http://localhost:8000`).

## Styling

The design system lives in `styles/globals.css` (neutral surfaces, restrained
green accent, no emoji).
