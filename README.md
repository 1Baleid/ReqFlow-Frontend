# ReqFlow Frontend

ReqFlow Frontend is an interactive React-based prototype for a lightweight requirements management system designed for student projects and small teams. It supports requirement creation, refinement, clarification, assignment, approval, rejection, traceability, and version comparison through role-based interfaces for clients, team members, and managers.

## Figma Design Reference

- [Figma Prototype](https://www.figma.com/design/NsP8x9mWNgFU6T3YU8TLNQ/Untitled?node-id=0-1&t=ZPY055T7Ey6CtXSr-1)

## Contribution Clarification

Commit distribution in this repository may not look perfectly even by commit count. At project kickoff, Abdullah led the initial planning meeting, and the team produced the baseline on one device (Abdullah's device) to align structure, routing, and shared UI conventions before splitting work.

After the baseline was created, Faisal, Abdulmajeed, and Rayan each reviewed and tested the frontend individually, then pushed targeted fixes and improvements from their own accounts. This included validation fixes, role-flow corrections, UI behavior adjustments, and final rubric compliance updates.

The practical workload was collaborative and iterative, even where early foundational commits were concentrated.

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
git clone <your-repository-url>
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
- **Project-Scoped Roles (Notion-like)**: Roles are scoped per project. A user can be a Team Member in one project and create/manage another project where they are the Manager.

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
- Requirement type classification (Functional / Non-Functional)
- Set deadlines with date picker
- Clarification threads and discussions
- Approve/reject workflows with justification
- Lock approved requirements
- Assign/reassign requirements
- Mark and merge duplicate requirements
- Acceptance criteria management (add/view)
- Linked requirements with search modal
- Version history and comparison
- Responsive design for desktop and mobile
- Workflow settings configuration
