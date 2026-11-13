# Resume Builder frontend

## Run locally

From `Frontend/`, install dependencies with `npm install`, then start the app with
`npm run dev`. The Vite development server proxies `/api` requests to
`http://127.0.0.1:8000` by default.

Set `VITE_API_URL` to the backend base URL when it is hosted elsewhere. The
production build defaults to the deployed backend
(`https://resume-builder-app-orpin-mu.vercel.app`), while local development
continues to proxy `/api` to `http://127.0.0.1:8000`.

## Deploy to GitHub Pages

The repository deploys the frontend to GitHub Pages after every push to `main`.
In the repository settings, set **Pages → Build and deployment → Source** to
**GitHub Actions**. The project is published at
`https://hussainmurtaza5.github.io/Resume-Builder-App-Frontend/`.

To override the backend URL, add a repository Actions variable named
`VITE_API_URL`. The backend must allow requests from the GitHub Pages origin.
GitHub Pages only hosts static files and cannot run the backend.

## AI summary integration

The Generate with AI action sends an authenticated `POST /ai/generate-summary`
request with the user's name, experience entries, and current summary. The
backend should return JSON containing a non-empty `summary` string. Keep any AI
provider credentials on the backend; this frontend only calls the backend API.
