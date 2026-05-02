# ReqFlow Setup Guide

This guide explains how to run ReqFlow locally for frontend development, backend integration, and final QA checks. Follow it from top to bottom when setting up the project on a new machine.

## 1. Required Tools

Install these tools first:

- Git
- Node.js v18 or newer
- npm
- A code editor such as VS Code
- MongoDB Atlas or another MongoDB connection if backend database features are being tested

Check the installed versions:

```bash
git --version
node --version
npm --version
```

## 2. Clone The Repository

Clone the project and enter the repository folder:

```bash
git clone https://github.com/1Baleid/ReqFlow-Frontend.git
cd ReqFlow-Frontend
```

If the repository was already cloned, move into the existing folder:

```bash
cd ReqFlow-Frontend
```

## 3. Install Frontend Dependencies

Install dependencies from the repository root:

```bash
npm install
```

This installs React, Vite, React Router, ESLint, and other frontend dependencies.

## 4. Run The Frontend

Start the Vite development server:

```bash
npm run dev
```

Open the local URL shown in the terminal. The default Vite URL is usually:

```text
http://localhost:5173
```

If port `5173` is already busy, Vite may use a different port. Use the exact URL shown in the terminal.

## 5. Install Backend Dependencies

The backend is inside the `server/` folder.

```bash
cd server
npm install
```

Return to the repository root when needed:

```bash
cd ..
```

## 6. Configure Backend Environment

Create a local `.env` file inside `server/`:

```bash
cd server
cp .env.example .env
```

Update the values in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
DNS_SERVERS=8.8.8.8,1.1.1.1
```

Important notes:

- Do not commit `server/.env`.
- Keep `JWT_SECRET` private.
- Make sure `CLIENT_URL` matches the frontend URL from Vite.
- If Vite starts on another port, update `CLIENT_URL`.

## 7. Run The Backend

From the `server/` folder:

```bash
npm run dev
```

The server should start on:

```text
http://localhost:5000
```

Use the health route to confirm the backend is responding:

```text
http://localhost:5000/api/health
```

## 8. Running Frontend And Backend Together

Use two terminal windows:

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
cd server
npm run dev
```

Confirm both are running:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 9. Demo Login Accounts

Use these accounts to test role-based flows:

| Role | Email | Password |
|------|-------|----------|
| Client | `abdullah@kfupm.edu.sa` | `abdullah123` |
| Manager | `khalid@kfupm.edu.sa` | `khalid123` |
| Team Member | `omar@kfupm.edu.sa` | `omar123` |

Test at least one flow for each role before final submission.

## 10. Quality Checks

Run these commands before pushing changes:

```bash
npm run build
npm run lint
```

For backend-only changes, also make sure the server starts:

```bash
cd server
npm run dev
```

If a lint issue appears in code that was not part of the current change, write it in the PR notes instead of hiding it.

## 11. Responsive QA

Check the main screens at these widths:

| Device Type | Width |
|-------------|-------|
| Small mobile | 360px |
| Large mobile | 430px |
| Tablet | 768px |
| Laptop | 1366px |
| Desktop | 1440px+ |

Screens to check:

- Login
- Signup
- Forgot password
- Dashboard
- Requirements list
- Requirement details
- Create requirement
- Edit requirement
- Version history
- Profile and settings screens

## 12. Troubleshooting

### Frontend Port Is Busy

Use the new port printed by Vite. If the backend is running, update `CLIENT_URL` in `server/.env`.

### Backend Does Not Start

Check that `server/.env` exists and includes `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.

### Database Connection Fails

Confirm that the MongoDB connection string is correct, the username and password are valid, and the database network access allows your current IP address.

### Login State Looks Wrong

Clear browser storage for the local development URL, refresh the page, and log in again.

### Build Fails After Pulling New Code

Run `npm install` again in the root folder. If backend dependencies changed, also run `npm install` inside `server/`.

## 13. Safe Git Workflow

Before starting work:

```bash
git status
git pull --rebase origin main
```

Create or switch to the Member D branch when required:

```bash
git checkout -b feature/member-d/settings-quality
```

Use small commits:

```bash
git add <files>
git commit -m "docs: add setup guide"
```

Do not commit:

- `.env` files
- `node_modules/`
- personal editor files
- local screenshots unless they are required for documentation
- temporary test output

## 14. Final Setup Checklist

- Frontend dependencies installed.
- Backend dependencies installed.
- `server/.env` created locally.
- Frontend starts successfully.
- Backend starts successfully.
- Health route responds.
- Demo accounts can be tested.
- Build command passes.
- Lint command has been reviewed.
- README and setup guide match the current project structure.
