# SchemaFlow

SchemaFlow is a modern, web-based database schema design and visualization tool. It allows developers to define their database schemas using a powerful domain-specific language (DSL) while instantly seeing a live, interactive entity-relationship (ER) diagram.

## Features

- **Code-First Design**: Write your schema in an intuitive, developer-friendly DSL with full syntax highlighting and live linting.
- **Interactive Canvas**: Drag and drop tables, view relationships, and organize your ER diagram visually using React Flow. Includes an advanced one-click **Auto-Layout Algorithm** built with Dagre to instantly untangle complex schemas.
- **Real-Time Collaboration**: Powered by WebSockets (Socket.io), multiple users can edit the DSL and see updates live. Built-in Optimistic Concurrency Control prevents version conflicts.
- **Guest Sandbox Mode**: Jump straight into a fully functional schema editor without creating an account. Your work is saved locally until you choose to register and save it to the cloud.
- **Role-Based Workspaces**: Organize your diagrams into projects. Add members to your projects as `EDITOR` or `VIEWER`. Viewers are completely restricted from modifying the diagram or its DSL.
- **Secure Authentication**: Google OAuth and JWT-based authentication system with secure session management.
- **Automated CI/CD**: Fully configured for zero-downtime automated deployments using Vercel (Frontend) and Render (Backend).

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript, Vite
- **Styling**: TailwindCSS, Radix UI (shadcn/ui style components)
- **State Management**: Zustand, React Query
- **Canvas & Editor**: React Flow, CodeMirror 6, Dagre (Auto-Layout)
- **Routing**: Wouter

### Backend
- **Framework**: Node.js, Fastify
- **Database**: PostgreSQL (Neon.tech Serverless Postgres) with Prisma ORM
- **WebSockets**: Socket.io for real-time multiplayer collaboration
- **Authentication**: Google OAuth2, JWT (Access + Refresh Tokens)
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Running locally or remotely via Neon.tech)

### 1. Clone & Install
```bash
git clone https://github.com/VinaySingh96/schemaflow.git
cd schemaflow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

**Backend (`backend/.env`):**
```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/schemaflow"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_TOKEN_URI="https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URI="https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/auth/google/callback"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL="http://localhost:4000/api/v1"
VITE_WS_URL="http://localhost:4000"
```

### 3. Database Setup
Ensure PostgreSQL is running and your `DATABASE_URL` is set correctly.
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Running the App

You can run both the frontend and backend simultaneously in separate terminal windows.

**Run Backend (Development):**
```bash
cd backend
npm run dev
```

**Run Frontend (Development):**
```bash
cd frontend
npm run dev
```

## DSL Syntax Guide

SchemaFlow uses a custom DSL designed to be intuitive and fast to write.

```text
// Define a users table
Table users {
  id uuid [pk, not null]
  email varchar [unique, not null]
  created_at timestamp
}

// Define a posts table
Table posts {
  id uuid [pk]
  title varchar
  author_id uuid
}

// Define a one-to-many relationship
Ref: users.id < posts.author_id
```

### Relationship Symbols
- `>` : Many-to-One
- `<` : One-to-Many
- `-` : One-to-One

## Deployment
SchemaFlow is production-ready and configured for modern serverless deployment platforms:
- **Frontend**: Deploy on [Vercel](https://vercel.com/) (configured via Ignored Build Steps to only build `main` branch).
- **Backend**: Deploy on [Render](https://render.com/).
- **Database**: Host on [Neon.tech](https://neon.tech/) Serverless Postgres.

*See `docs/DEPLOYMENT.md` for full step-by-step CI/CD setup instructions.*

## License

This project is licensed under the MIT License.
