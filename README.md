# SchemaFlow

SchemaFlow is a modern, web-based database schema design and visualization tool. It allows developers to define their database schemas using a powerful domain-specific language (DSL) while instantly seeing a live, interactive entity-relationship (ER) diagram.

## Features

- **Code-First Design**: Write your schema in an intuitive, developer-friendly DSL with full syntax highlighting and live linting.
- **Interactive Canvas**: Drag and drop tables, view relationships, and organize your ER diagram visually using React Flow.
- **Real-Time Synchronization**: Any changes made in the code editor instantly reflect on the visual canvas, and vice-versa.
- **Projects & Workspaces**: Organize your diagrams into projects.
- **Role-Based Collaboration**: Add members to your projects as `EDITOR` or `VIEWER`. Viewers are completely restricted from modifying the diagram or its DSL.
- **Secure Authentication**: JWT-based authentication system with secure session management.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript, Vite
- **Styling**: TailwindCSS, Radix UI (shadcn/ui style components)
- **State Management**: Zustand, React Query
- **Canvas & Editor**: React Flow, CodeMirror 6
- **Routing**: Wouter

### Backend
- **Framework**: Node.js, Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access + Refresh Tokens)
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Running locally or remotely)
- PM2 (Optional, for running production-like local processes)

### 1. Clone & Install
```bash
git clone <repository-url>
cd schemaFlow

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
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/schemaflow"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

### 3. Database Setup
Ensure PostgreSQL is running and your `DATABASE_URL` is set correctly.
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Running the App

You can run both the frontend and backend simultaneously using the provided scripts.

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

*(Optional)* You can also use PM2 to manage the backend process if you are running it in a more persistent local setup:
```bash
pm2 start dist/server.js --name schemaflow-backend
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

## License

This project is licensed under the MIT License.
