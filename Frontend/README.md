# Resume Builder frontend

## Run locally

From `Frontend/`, install dependencies with `npm install`, then start the app with
`npm run dev`. The Vite development server proxies `/api` requests to
`http://127.0.0.1:8000` by default.

Set `VITE_API_URL` to the backend base URL when it is hosted elsewhere. The same
base URL is used for authentication, resume requests, and AI summary generation.

## AI summary integration

The Generate with AI action sends an authenticated `POST /ai/generate-summary`
request with the user's name, experience entries, and current summary. The
backend should return JSON containing a non-empty `summary` string. Keep any AI
provider credentials on the backend; this frontend only calls the backend API.
