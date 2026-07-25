# File

Projects/schemaFlow/docs/backend/02-authentication.md

---

# Authentication & Authorization Engineering Specification

**Document:** 02-authentication.md

**Project:** SchemaFlow

---

# Purpose

Authentication is responsible for verifying a user's identity.

Authorization is responsible for determining what the authenticated user is allowed to access.

Authentication and Authorization are completely independent systems.

Authentication answers

```
Who are you?
```

Authorization answers

```
Can you perform this action?
```

---

# Phase 1 Scope

Supported

- Google OAuth 2.0
- JWT Access Token
- Refresh Token
- Secure Cookies
- User Profile
- Logout
- Protected Routes

Future

```
GitHub Login

Microsoft Login

Email Login

SSO

Organization Accounts
```

---

# Authentication Flow

```
Browser

↓

Google Login

↓

Google OAuth

↓

Callback

↓

User Service

↓

JWT

↓

Refresh Token

↓

Browser
```

---

# High Level Architecture

```
Browser

↓

Google OAuth

↓

Fastify Auth Controller

↓

Google OAuth Service

↓

User Service

↓

JWT Service

↓

Response
```

---

# Folder Structure

```
modules/

auth/

├── controller/
│   └── auth.controller.ts
│
├── service/
│   ├── auth.service.ts
│   ├── jwt.service.ts
│   ├── google.service.ts
│   └── refreshToken.service.ts
│
├── repository/
│
├── dto/
│
├── validator/
│
├── middleware/
│
├── routes/
│
├── mapper/
│
├── errors/
│
├── tests/
│
└── index.ts
```

---

# Authentication Components

```
Google Service

↓

Auth Service

↓

JWT Service

↓

Refresh Token Service

↓

Auth Middleware
```

Each service owns exactly one responsibility.

---

# User Lifecycle

```
Google Login

↓

User Exists?

↓

No

↓

Create User

↓

Generate Tokens

↓

Login

↓

Authenticated
```

Existing users

Skip creation.

---

# User Model

```ts
interface User {

    id: string;

    email: string;

    name: string;

    pictureUrl: string;

    createdAt: Date;

    updatedAt: Date;

}
```

Future

```
Organization

Role

Preferences

Locale

Theme
```

---

# User Database Table

```
users

-------------

id

email

name

picture_url

created_at

updated_at
```

Email

Unique.

---

# Google OAuth Flow

```
User

↓

Click Login

↓

Google Consent

↓

Authorization Code

↓

Backend

↓

Access Token

↓

Profile

↓

JWT
```

Frontend

Never receives

Google tokens.

---

# OAuth Callback

```
GET

/api/v1/auth/google/callback
```

Receives

```
Authorization Code
```

Backend exchanges code

For

Google profile.

---

# Google Service

Responsibilities

- Exchange Authorization Code
- Fetch Profile
- Validate Google Response

Never

Generate JWT.

---

# Auth Service

Responsibilities

- Find User
- Create User
- Login User
- Generate Tokens

Never

Call Google APIs directly.

---

# JWT Service

Responsible only for

```
Sign

Verify

Decode

Expire
```

No business logic.

---

# JWT Payload

```ts
interface JwtPayload {

    userId: string;

    email: string;

}
```

Never include

```
Permissions

Projects

Roles

Large Objects
```

JWT should remain small.

---

# Token Lifetime

Access Token

```
15 Minutes
```

Refresh Token

```
30 Days
```

Configurable.

---

# Refresh Token

Stored

```
HttpOnly Cookie
```

Never

JavaScript accessible.

---

# Cookie Configuration

```
HttpOnly

Secure

SameSite=Lax

Path=/

```

Production

Always

Secure.

---

# Login Endpoint

```
GET

/api/v1/auth/google
```

Redirects user

To Google.

---

# Callback Endpoint

```
GET

/api/v1/auth/google/callback
```

Returns

```
Access Token

Refresh Cookie

User Profile
```

---

# Refresh Endpoint

```
POST

/api/v1/auth/refresh
```

Flow

```
Cookie

↓

Verify

↓

Generate Access Token

↓

Response
```

---

# Logout Endpoint

```
POST

/api/v1/auth/logout
```

Actions

```
Clear Cookie

Invalidate Refresh Token

Return Success
```

---

# Me Endpoint

```
GET

/api/v1/auth/me
```

Returns

Current user.

Used

During app startup.

---

# Frontend Startup Flow

```
Browser Opens

↓

GET /auth/me

↓

Valid Session?

↓

Yes

↓

Dashboard

↓

No

↓

Login Page
```

---

# Authentication Middleware

Responsibilities

```
Read JWT

↓

Verify

↓

Attach User

↓

Continue
```

Never

Load projects.

---

# Request Context

After authentication

Every request receives

```ts
request.user
```

Contains

```
userId

email
```

---

# Authorization

Authorization

Always happens

Inside services.

Never

Controllers.

---

# Ownership Rules

A user can access

Only

```
Own Projects

Own Diagrams

Own Drafts
```

Future

Shared workspaces.

---

# Authorization Flow

```
Authenticated User

↓

Load Project

↓

Owner?

↓

Yes

↓

Continue

↓

No

↓

403
```

---

# HTTP Status Codes

```
401

Unauthenticated

403

Unauthorized
```

Never

Mix them.

---

# Refresh Flow

```
Access Expired

↓

Refresh Endpoint

↓

New Access Token

↓

Continue
```

Invisible

To user.

---

# Token Rotation

Every refresh

Generates

New refresh token.

Old one

Invalidated.

Improves security.

---

# Invalid Session

If refresh token

Invalid

```
Clear Cookies

↓

Return 401

↓

Frontend Redirect Login
```

---

# Rate Limiting

Protect

```
OAuth Callback

Refresh

Logout
```

Prevent abuse.

---

# CSRF

Since refresh uses cookies

Protect

```
Refresh

Logout
```

Future

CSRF token.

---

# Session Revocation

User logout

Immediately invalidates

Refresh token.

Access token

Expires naturally.

---

# Future Multi Device Support

Future

Store

```
Session ID

Device

Browser

IP

Last Used
```

Users

Can revoke

Specific sessions.

---

# Error Handling

Possible Errors

```
Google Unavailable

Invalid OAuth Code

Expired Refresh Token

Malformed JWT

Unknown User
```

Return

Standard API errors.

---

# Logging

Log

```
Login

Logout

Refresh

Authentication Failure
```

Never log

```
JWT

Refresh Token

OAuth Code
```

---

# Performance Targets

```
Login

<300ms

Refresh

<50ms

JWT Verify

<5ms
```

---

# Testing

Unit Tests

- JWT
- Refresh
- Google Service
- Auth Service

Integration Tests

- Login
- Logout
- Refresh
- Protected Routes

Security Tests

- Expired Token
- Invalid JWT
- Missing Cookie
- Unauthorized Access

---

# Acceptance Criteria

- Google OAuth implemented
- JWT authentication implemented
- Refresh token rotation implemented
- Secure cookies configured
- Auth middleware complete
- Authorization checks enforced
- /me endpoint implemented
- Logout invalidates refresh token
- Standard error responses
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

03-project-service.md
```