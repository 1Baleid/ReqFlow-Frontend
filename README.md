# ReqFlow Frontend

ReqFlow Frontend is an interactive React-based prototype for a lightweight requirements management system designed for student projects and small teams. It supports requirement creation, refinement, clarification, assignment, approval, rejection, traceability, and version comparison through role-based interfaces for clients, team members, and managers.

## Figma Design Reference

- [Figma Prototype](https://www.figma.com/) — *(Replace with your actual Figma link)*

## Team Members

| Name | Role | GitHub |
|------|------|--------|
| Abdullah Al-Rashid | Client / Frontend Developer | [@abdullah](https://github.com/) |
| Khalid Hassan | Manager / Frontend Developer | [@khalid](https://github.com/) |
| Omar Faisal | Team Member / Frontend Developer | [@omar](https://github.com/) |
| Rayan | Frontend Developer | [@rayan](https://github.com/) |

> **Note:** Replace the names, roles, and GitHub links above with your actual team members.

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

> **Important:** Replace `YOUR_USERNAME` with your actual GitHub username.

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
