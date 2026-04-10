# ReqFlow Frontend

ReqFlow Frontend is an interactive React-based prototype for a lightweight requirements management system designed for student projects and small teams. It supports requirement creation, refinement, clarification, assignment, approval, rejection, traceability, and version comparison through role-based interfaces for clients, team members, and managers.

## Tech Stack

- React 18
- Vite
- React Router DOM
- CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/ReqFlow-Frontend.git
cd ReqFlow-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open the local link shown in terminal (usually http://localhost:5173)

## Project Structure

```
ReqFlow-Frontend/
├── public/
├── src/
│   ├── assets/        # Images, icons, and static files
│   ├── components/    # Reusable UI components
│   ├── data/          # Mock data and constants
│   ├── layouts/       # Layout components
│   ├── pages/         # Page components
│   ├── styles/        # CSS stylesheets
│   ├── App.jsx        # Main application component
│   ├── App.css        # App-level styles
│   ├── main.jsx       # Application entry point
│   └── index.css      # Global styles
├── README.md
├── package.json
├── .gitignore
└── vite.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Branch Strategy

- `main` - Stable production-ready code
- `development` - Integration branch for team work
- `feature/*` - Feature branches (e.g., feature/auth-ui, feature/client-pages)

## Demo Accounts

Use these credentials to log in with different user roles:

| Role | Email | Password |
|------|-------|----------|
| **Client** | `abdullah@kfupm.edu.sa` | `abdullah123` |
| **Manager** | `khalid@kfupm.edu.sa` | `khalid123` |
| **Team Member** | `omar@kfupm.edu.sa` | `omar123` |

### Role Capabilities

- **Client**: Create requirements, view status, respond to clarifications, track progress
- **Manager**: Full access, approve/reject requirements, assign to team, manage workflow
- **Team Member**: View assigned work, refine requirements, submit for review

## Team Testing Assignments

### Tester 1 — Client Role
**Login:** `abdullah@kfupm.edu.sa` / `abdullah123`

**Test these features:**
- Create a new requirement
- View requirement status and details
- Respond to clarification requests
- Track progress of submitted requirements

**Write down:** Any bugs, confusing UI, or suggestions.

---

### Tester 2 — Manager Role
**Login:** `khalid@kfupm.edu.sa` / `khalid123`

**Test these features:**
- Approve/reject requirements
- Assign requirements to team members
- View all requirements and team activity
- Manage overall workflow

**Write down:** Any bugs, confusing UI, or suggestions.

---

### Tester 3 — Team Member Role
**Login:** `omar@kfupm.edu.sa` / `omar123`

**Test these features:**
- View assigned requirements
- Refine requirement details
- Submit requirements for review
- Check workflow transitions

**Write down:** Any bugs, confusing UI, or suggestions.

---

**Each tester should note:**
1. Steps to reproduce any bugs
2. What they expected vs. what happened
3. Any UI/UX improvements they suggest

## Features

- Login and role-based authentication
- Dashboard for each user role
- Requirement list and details view
- Create and edit requirements
- Clarification threads
- Approve/reject workflows
- Assign/reassign requirements
- Acceptance criteria management
- Linked requirements and traceability
- Version history and comparison
