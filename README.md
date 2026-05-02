# ReqFlow Frontend

ReqFlow is a React-based requirements management prototype for student projects and small teams. The application helps clients, managers, and team members capture requirements, clarify missing details, assign work, approve or reject submissions, track version history, and compare changes through role-based workflows.

This repository contains the frontend experience, shared UI structure, Playwright test setup, and a lightweight backend folder used by the team for authentication and API integration work.

## Figma Design Reference

- [Figma Prototype](https://www.figma.com/design/NsP8x9mWNgFU6T3YU8TLNQ/Untitled?node-id=0-1&t=ZPY055T7Ey6CtXSr-1)

## Current Scope

ReqFlow currently focuses on four major project areas:

- **Authentication and entry screens**: login, signup, forgot password, validation states, and error routing.
- **Dashboard and navigation**: sidebar, topbar, dashboard summaries, menus, filters, and responsive navigation behavior.
- **Core requirement flows**: create, edit, review, approve, reject, clarify, assign, link, duplicate handling, and version comparison.
- **Profile, settings, and repository quality**: setup documentation, environment notes, folder cleanup, QA guidance, and consistency checks.

## Tech Stack

- React 18
- Vite
- React Router DOM
- CSS
- ESLint
- Playwright
- Node.js / Express backend scaffold
- MongoDB connection support through the server package

## Prerequisites

Install these before running the project:

- Node.js v18 or newer
- npm
- Git
- MongoDB connection string if running the backend with database features

Recommended versions used during setup:

```bash
node --version
npm --version
```

## Quick Start

For a complete setup walkthrough, see [docs/setup-guide.md](docs/setup-guide.md).

Clone the repository:

```bash
git clone https://github.com/1Baleid/ReqFlow-Frontend.git
cd ReqFlow-Frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL printed in the terminal. Vite commonly starts on:

```text
http://localhost:5173
```

## Backend Setup

The repository includes a `server/` folder for backend integration work.

Install backend dependencies:

```bash
cd server
npm install
```

Create a backend environment file:

```bash
cp .env.example .env
```

Update `.env` with local values:

```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-local-secret>
CLIENT_URL=http://localhost:5173
DNS_SERVERS=8.8.8.8,1.1.1.1
```

Start the backend:

```bash
npm run dev
```

The backend health endpoint is available through:

```text
http://localhost:5000/api/health
```

## Environment Notes

- Keep local secrets in `.env` files only.
- Do not commit `.env`, database credentials, JWT secrets, or personal access tokens.
- Use `server/.env.example` as the shared template for teammates.
- When the frontend and backend run together, confirm that `CLIENT_URL` matches the Vite URL.
- If Vite changes ports because `5173` is busy, update backend CORS settings accordingly.

## Available Scripts

Frontend scripts from the repository root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the repository |

Backend scripts from `server/`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the server with watch mode |
| `npm start` | Start the server without watch mode |

## Project Structure

```text
ReqFlow-Frontend/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE/
│   └── workflows/
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── phase1/
│   └── testing/
├── public/
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── tests/
├── src/
│   ├── api/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── data/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   └── utils/
├── tests/
├── package.json
├── playwright.config.js
├── vite.config.js
└── README.md
```

## Feature Folder Guide

The `src/features/` folder is reserved for grouped product areas:

- `auth/` for authentication pages, validation, and API helpers.
- `dashboard/` for dashboard widgets, navigation states, and page-level dashboard logic.
- `projects/` for project list, project creation, and project-specific views.
- `requirements/` for requirement CRUD flows, validation, and workflow interactions.
- `settings/` for profile, account, preferences, and team settings.
- `shared/` for reusable guards, layouts, and shared UI utilities.
- `team/` for team member views and collaboration interfaces.

Shared components that are already used across multiple features should stay in `src/components/`. Feature-specific components should stay inside their feature folder once implemented.

## Demo Accounts

Use these credentials to test the role-based flows:

| Role | Email | Password |
|------|-------|----------|
| **Client** | `abdullah@kfupm.edu.sa` | `abdullah123` |
| **Manager** | `khalid@kfupm.edu.sa` | `khalid123` |
| **Team Member** | `omar@kfupm.edu.sa` | `omar123` |

### Role Capabilities

- **Client**: create requirements, view status, respond to clarifications, and track progress.
- **Manager**: approve or reject requirements, assign work, manage workflow, and review team activity.
- **Team Member**: view assigned work, refine requirements, and submit requirements for review.
- **Project-scoped roles**: roles are scoped per project, so a user can be a team member in one project and a manager in another.

## Features

- Login and role-based authentication
- Signup and forgot password entry flows
- Auth status and error screens
- Dashboard for each user role
- Sidebar and top navigation
- Requirement list and details view
- Create and edit requirements
- Requirement type classification
- Deadline selection
- Clarification threads and discussion states
- Approve and reject workflows with justification
- Locking behavior for approved requirements
- Assign and reassign requirements
- Duplicate requirement marking and merge support
- Acceptance criteria management
- Linked requirements with search modal
- Version history and comparison
- Responsive desktop and mobile layouts
- Workflow settings configuration

## QA Checklist

Before opening a pull request or marking a feature as complete, run through this checklist:

- The app starts with `npm run dev`.
- The production build passes with `npm run build`.
- The page works at desktop width.
- The page works at tablet width.
- The page works at mobile width.
- Forms show useful validation messages.
- Empty states are visible where data can be missing.
- Loading states are visible for async actions.
- Success and error feedback are clear.
- Buttons, links, and menus are keyboard reachable.
- Route changes preserve the expected user context.
- No local secrets or generated files are committed.

## Responsive Testing Guide

Recommended viewport checks:

| View | Width |
|------|-------|
| Mobile small | 360px |
| Mobile large | 430px |
| Tablet | 768px |
| Laptop | 1366px |
| Desktop | 1440px and above |

Areas that should always be checked after UI changes:

- Login, signup, and forgot password screens
- Dashboard layout and sidebar behavior
- Requirement list and detail pages
- Create and edit forms
- Modals and confirmation dialogs
- Settings/profile forms
- Error and empty states

## Testing Assignments

### Tester 1: Client Role

Login:

```text
abdullah@kfupm.edu.sa / abdullah123
```

Test these features:

- Create a new requirement.
- View requirement status and details.
- Respond to clarification requests.
- Track progress of submitted requirements.

### Tester 2: Manager Role

Login:

```text
khalid@kfupm.edu.sa / khalid123
```

Test these features:

- Approve and reject requirements.
- Assign requirements to team members.
- View all requirements and team activity.
- Manage the overall workflow.

### Tester 3: Team Member Role

Login:

```text
omar@kfupm.edu.sa / omar123
```

Test these features:

- View assigned requirements.
- Refine requirement details.
- Submit requirements for review.
- Check workflow transitions.

Each tester should record:

1. Steps to reproduce any bug.
2. Expected behavior.
3. Actual behavior.
4. Browser and screen size.
5. Suggested UI or workflow improvement.

## Branch Strategy

- `main` contains the stable integration version.
- `feature/member-a/auth-entry` contains authentication and entry screen work.
- `feature/member-b/dashboard-navigation` contains dashboard and navigation work.
- `feature/member-c/core-flows` contains main feature flow work.
- `feature/member-d/settings-quality` contains profile, settings, documentation, cleanup, and QA work.

Use small commits with one logical change each. Avoid mixing unrelated UI, logic, documentation, and cleanup work in the same commit.

## Pull Request Checklist

Each PR should include:

- A short summary of the change.
- Screenshots or screen recordings for UI changes.
- Testing notes with commands that were run.
- Any known limitations.
- Confirmation that secrets and local files were not committed.

For feature PRs, include at least one visible UI improvement and one interaction or logic improvement. Pure documentation PRs can skip the UI requirement.

## Contribution Clarification

Commit distribution in this repository may not look perfectly even by commit count. At project kickoff, Abdullah led the initial planning meeting, and the team produced the baseline on one device to align structure, routing, and shared UI conventions before splitting work.

After the baseline was created, Faisal, Abdulmajeed, and Rayan each reviewed and tested the frontend individually, then pushed targeted fixes and improvements from their own accounts. This included validation fixes, role-flow corrections, UI behavior adjustments, and final rubric compliance updates.

The practical workload was collaborative and iterative, even where early foundational commits were concentrated.

## Common Troubleshooting

### Vite Port Already In Use

If `npm run dev` starts on a different port, use the URL shown in the terminal. If the backend is also running, update `CLIENT_ORIGIN` in `server/.env`.

### Backend Cannot Connect To MongoDB

Check that `MONGODB_URI` is present in `server/.env`, the connection string is valid, and the database service is reachable.

### Login Flow Does Not Persist

Clear browser storage for the local development URL and log in again with one of the demo accounts.

### Lint Reports Node Globals

The repository includes frontend, backend, and Playwright files. If ESLint reports Node globals such as `process`, the ESLint environment configuration should be adjusted for Node-based files.

## Repository Hygiene

- Keep generated files out of commits unless they are intentionally part of the deliverable.
- Keep `.gitkeep` files only where empty folders are required for structure.
- Place shared utilities in `src/utils/` or `src/services/` instead of duplicating logic across pages.
- Keep page-level CSS close to the page when it is not shared.
- Move repeated UI patterns into reusable components after they are used in more than one place.
- Update this README when setup steps, scripts, ports, or folder ownership changes.
