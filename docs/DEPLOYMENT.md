# SchemaFlow Deployment Guide

This guide will walk you through deploying SchemaFlow for free using the recommended stack: **Vercel** (Frontend), **Render** (Backend), and **Neon.tech** (PostgreSQL).

## 1. Database (Neon.tech)

1. Go to [Neon.tech](https://neon.tech/) and sign up.
2. Click **New Project** and name it `schemaflow-db`.
3. Select **Postgres 16** (or the latest version).
4. Once created, copy the **Connection String** from the dashboard.
   It should look something like:
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
5. Keep this connection string handy, you will need it for the Backend.

---

## 2. Backend (Render.com)

We will use Render to host the Node.js Fastify backend.

### Setup Configuration

Render can use a `render.yaml` Blueprint file to automatically configure your web service.

Create a file named `render.yaml` in the **root** of your repository with the following content:

```yaml
services:
  - type: web
    name: schemaflow-backend
    env: node
    rootDir: backend
    buildCommand: npm install && npx prisma generate && npx prisma db push && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: FRONTEND_URL
        value: https://your-frontend-url.vercel.app # UPDATE THIS LATER
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_URL
        sync: false # YOU MUST ADD THIS MANUALLY IN RENDER DASHBOARD
```

### Deployment Steps
1. Push your code to a GitHub repository.
2. Go to [Render.com](https://render.com/) and sign up.
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub account and select your SchemaFlow repository.
5. Render will read the `render.yaml` file. Click **Apply**.
6. **Important:** Go to your newly created Web Service -> **Environment**, and add your `DATABASE_URL` (paste the connection string from Neon.tech).
7. Wait for the build to finish. Once done, copy your backend URL (e.g., `https://schemaflow-backend.onrender.com`).

---

## 3. Frontend (Vercel)

We will use Vercel to host the Vite + React frontend.

### Setup Configuration

Create a file named `vercel.json` in the **root** of your repository:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/frontend/dist/index.html"
    }
  ]
}
```
*(Alternatively, you can just configure Vercel entirely via their UI by selecting `frontend` as the Root Directory).*

### Deployment Steps
1. Push the `vercel.json` to your GitHub repository.
2. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
3. Click **Add New... -> Project**.
4. Import your SchemaFlow repository.
5. Under **Framework Preset**, select **Vite**.
6. Under **Root Directory**, click Edit and select `frontend`.
7. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: Paste your Render backend URL with `/api/v1` appended. 
     *(Example: `https://schemaflow-backend.onrender.com/api/v1`)*
8. Click **Deploy**.

---

## 4. Final Hookup

1. Once your frontend is deployed on Vercel, copy its URL.
2. Go back to the **Render Dashboard**.
3. Open your backend web service -> **Environment**.
4. Update the `FRONTEND_URL` variable to your Vercel URL so CORS works correctly.
5. Click **Save Changes** (Render will restart your backend).

**Congratulations! Your full-stack collaborative schema editor is now live for free!**
