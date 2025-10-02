# Frontend OAuth Integration

This frontend expects a backend providing the OAuth endpoints at `/auth`.

Environment variable (frontend `.env`):

- `REACT_APP_BACKEND_URL` - e.g. `http://localhost:5000`

Routes used:

- `GET ${REACT_APP_BACKEND_URL}/auth/google` - start Google OAuth
- `GET ${REACT_APP_BACKEND_URL}/auth/github` - start GitHub OAuth
- `GET ${REACT_APP_BACKEND_URL}/auth/me` - returns `{ authenticated: true, user: { id, name, email } }` when logged in (cookie)
- `POST ${REACT_APP_BACKEND_URL}/auth/logout` - clears auth cookie

Notes:

- Cookies are used with `credentials: 'include'` so the backend must allow CORS with credentials if on different origin.
- Client secrets must never be included in the frontend.
