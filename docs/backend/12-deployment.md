# File

Projects/schemaFlow/docs/backend/12-deployment.md

---

# Deployment & Infrastructure Engineering Specification

**Document:** 12-deployment.md

**Project:** SchemaFlow

**Version:** Phase 1 (MVP)

---

# Purpose

This document defines the production deployment architecture for SchemaFlow.

The deployment architecture should satisfy the following goals:

- Reliable
- Easy to deploy
- Easy to debug
- Low operational cost
- Horizontally scalable
- Zero downtime deployments
- Secure by default

The Phase 1 infrastructure is intentionally simple while leaving room for future scaling.

---

# Phase 1 Scale

Target Users

```
50 Registered Users
```

Concurrent Users

```
10 Active Collaborators
```

Concurrent Diagram

```
10 Users
```

Database

```
< 20 GB
```

Traffic

```
< 500 Requests / Minute
```

---

# Technology Stack

Backend

```
Node.js

Fastify

TypeScript
```

Database

```
PostgreSQL
```

ORM

```
Prisma
```

Cache

```
Redis
```

Real Time

```
Socket.IO
```

Frontend

```
React

Vite

TypeScript
```

Containerization

```
Docker
```

Reverse Proxy

```
Nginx
```

CI/CD

```
GitHub Actions
```

Future Cloud

```
Google Cloud Run

GKE

Cloud SQL

Memorystore
```

---

# High Level Deployment

```
                Internet

                    │

             Cloudflare (Future)

                    │

                 Nginx

          ┌─────────┴─────────┐

          ▼                   ▼

      Frontend            Backend API

          │                   │

          │              Socket.IO

          │                   │

          └─────────┬─────────┘

                    ▼

             PostgreSQL

                    │

                    ▼

                 Redis
```

---

# Phase 1 Deployment

Single VPS

Recommended

```
4 vCPU

8 GB RAM

100 GB SSD
```

Run

```
Frontend

Backend

Redis

Postgres

Nginx
```

Inside Docker.

---

# Future Production

```
Frontend

↓

Cloudflare CDN

↓

Cloud Run

↓

Load Balancer

↓

Backend Pods

↓

Cloud SQL

↓

Redis Cluster
```

Minimal application changes required.

---

# Repository Structure

```
schemaFlow/

frontend/

backend/

docs/

docker/

infra/

.github/

docker-compose.yml
```

---

# Docker Structure

```
docker/

frontend/

backend/

nginx/

postgres/

redis/
```

---

# Containers

Phase 1

```
schemaflow-frontend

schemaflow-backend

schemaflow-postgres

schemaflow-redis

schemaflow-nginx
```

---

# Docker Compose

```
Frontend

↓

Nginx

↓

Backend

↓

Postgres

↓

Redis
```

Development

Single command

```
docker compose up
```

---

# Frontend Deployment

Build

```
pnpm build
```

Produces

```
dist/
```

Served by

Nginx.

---

# Backend Deployment

```
pnpm build

↓

node dist/server.js
```

Future

```
PM2

or

Cloud Run
```

---

# Reverse Proxy

Nginx routes

```
/

↓

Frontend
```

```
/api

↓

Backend
```

```
/socket.io

↓

Socket.IO
```

Supports

WebSocket Upgrade.

---

# HTTPS

Development

```
HTTP
```

Production

```
HTTPS

TLS 1.3
```

Certificates

```
Let's Encrypt
```

Future

Cloudflare.

---

# Environment Files

Frontend

```
.env

.env.production
```

Backend

```
.env

.env.production
```

Never commit

Secrets.

---

# Required Environment Variables

Frontend

```
VITE_API_URL

VITE_SOCKET_URL

VITE_GOOGLE_CLIENT_ID
```

Backend

```
PORT

DATABASE_URL

REDIS_URL

JWT_SECRET

COOKIE_SECRET

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

GOOGLE_CALLBACK_URL

NODE_ENV
```

---

# Secrets

Store using

Development

```
.env
```

Production

```
GitHub Secrets

Cloud Secret Manager (Future)
```

Never

Hardcode.

---

# CI Pipeline

Every PR

Runs

```
Install

↓

Lint

↓

Typecheck

↓

Unit Tests

↓

Build
```

PR cannot merge

On failure.

---

# CD Pipeline

On merge

```
Main Branch

↓

Docker Build

↓

Push Image

↓

Deploy

↓

Health Check

↓

Success
```

---

# GitHub Actions

Suggested Workflows

```
frontend-ci.yml

backend-ci.yml

deploy.yml
```

---

# Database Migrations

Deployment

```
New Image

↓

Prisma Migrate Deploy

↓

Start Server
```

Never

Generate migrations

In production.

---

# Prisma Commands

Development

```
prisma migrate dev
```

Production

```
prisma migrate deploy
```

---

# Health Checks

```
GET

/health
```

Checks

```
API

Database

Redis

Version
```

---

# Readiness

```
GET

/ready
```

Returns

Healthy only if

```
Database Connected

Redis Connected
```

---

# Logging

Structured JSON

Example

```json
{
  "level": "info",
  "requestId": "...",
  "userId": "...",
  "route": "/projects",
  "latency": 42
}
```

Development

Pretty logs.

Production

JSON only.

---

# Log Rotation

Phase 1

Docker logs.

Future

```
Loki

Cloud Logging

ELK
```

---

# Monitoring

Track

```
CPU

Memory

Disk

Connections

Latency

Errors

Socket Count

Redis Memory
```

---

# Metrics

Future

Prometheus

Expose

```
/metrics
```

Dashboard

Grafana.

---

# Database Backup

Daily

Automatic backup.

Retention

```
30 Days
```

Weekly

Off-site backup.

---

# Redis Persistence

Enable

```
AOF

+

RDB Snapshot
```

Presence loss acceptable.

Schema data

Never stored in Redis.

---

# Scaling Strategy

Phase 1

```
1 Backend

1 Database

1 Redis
```

Phase 2

```
2 Backend Instances

↓

Redis Adapter

↓

Load Balancer
```

Phase 3

```
Kubernetes

↓

Autoscaling

↓

Cloud SQL

↓

Managed Redis
```

---

# WebSocket Scaling

Current

Single instance.

Future

```
Socket.IO Redis Adapter

↓

Shared Rooms

↓

Multiple Backend Pods
```

---

# Resource Limits

Backend

```
CPU

1 Core

Memory

512 MB
```

Frontend

```
256 MB
```

Redis

```
256 MB
```

Postgres

```
2 GB
```

Adjust as usage grows.

---

# Security

Enable

```
Helmet

Rate Limiting

CORS

Secure Cookies

HTTPS

Content Security Policy
```

Disable

```
Directory Listing

Server Signature

Debug Endpoints
```

---

# Release Strategy

Phase 1

Rolling restart acceptable.

Future

Blue-Green deployment.

---

# Rollback Strategy

Deployment Failure

↓

Previous Docker Image

↓

Restart

↓

Healthy

Database migrations

Must be backward compatible.

---

# Disaster Recovery

Recover

```
Database Backup

↓

Redis Restart

↓

Redeploy

↓

Restore Service
```

Target Recovery Time

```
< 30 Minutes
```

---

# Performance Targets

API

```
P95 < 150 ms
```

Socket ACK

```
< 50 ms
```

Workspace Load

```
< 2 Seconds
```

Publish

```
< 500 ms
```

---

# Testing Before Deployment

Pipeline

```
Lint

↓

Typecheck

↓

Unit Tests

↓

Integration Tests

↓

Docker Build

↓

Smoke Tests
```

Deployment blocked

On failure.

---

# Acceptance Criteria

- Dockerized frontend and backend
- Docker Compose for local development
- Nginx reverse proxy configured
- PostgreSQL and Redis integrated
- GitHub Actions CI pipeline
- Automated deployment pipeline
- Prisma production migrations
- HTTPS ready
- Health and readiness endpoints configured
- Structured logging enabled
- Daily database backups configured
- Rollback strategy documented
- Horizontal scaling path documented
- Performance targets documented

---

# Phase 1 Backend Architecture Complete

The backend architecture documentation is now complete.

## Complete Documentation Index

```
docs/

frontend/
├── 01-frontend-foundation.md
├── 02-canvas-engine/
├── 03-dashboard/
├── 04-editor-sidebar/
├── 05-diagram-components/
└── 06-features/

backend/
├── 01-backend-foundation.md
├── 02-authentication.md
├── 03-project-service.md
├── 04-diagram-service.md
├── 05-schema-service.md
├── 06-versioning-service.md
├── 07-collaboration-service.md
├── 08-websocket-gateway.md
├── 09-parser-service.md
├── 10-storage-design.md
├── 11-api-contracts.md
└── 12-deployment.md
```

---

# Recommended Next Documentation

After completing the frontend and backend architecture, the next documents that will add the most value are:

```
docs/

database/
├── 01-prisma-schema.md
├── 02-er-diagram.md
├── 03-indexing-strategy.md

api/
├── openapi.yaml

architecture/
├── sequence-diagrams.md
├── event-flow.md
├── websocket-protocol.md

engineering/
├── coding-standards.md
├── testing-strategy.md
├── branching-strategy.md
├── release-process.md

product/
├── PRD.md
├── roadmap.md
├── milestones.md
```

These documents would make the project comparable to the engineering documentation of a production-grade SaaS application and provide everything needed for implementation by Claude Code or a development team.