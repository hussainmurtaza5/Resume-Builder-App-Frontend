# Resume Builder frontend

## Run locally

From `Frontend/`, install dependencies with `npm install`, then start the app with
`npm run dev`. The Vite development server proxies `/api` requests to
`http://127.0.0.1:8000` by default.

Set `VITE_API_URL` to the backend base URL when it is hosted elsewhere. The same
base URL is used for authentication, resume requests, and AI summary generation.

## Deploy to GitHub Pages

The repository deploys the frontend to GitHub Pages after every push to `main`.
In the repository settings, set **Pages → Build and deployment → Source** to
**GitHub Actions**. The project is published at
`https://hussainmurtaza5.github.io/Resume-Builder-App-Frontend/`.

To enable authentication, resume management, and AI features, add a repository
Actions variable named `VITE_API_URL` containing the publicly reachable backend
base URL (for example, `https://api.example.com`). The backend must allow requests
from the GitHub Pages origin. GitHub Pages only hosts static files and cannot
run the backend; without this variable, the frontend uses its default `/api`
URL, which is not served by Pages.

## AI summary integration

The Generate with AI action sends an authenticated `POST /ai/generate-summary`
request with the user's name, experience entries, and current summary. The
backend should return JSON containing a non-empty `summary` string. Keep any AI
provider credentials on the backend; this frontend only calls the backend API.
