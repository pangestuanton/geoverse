# GeoVerse

GeoVerse is a web-based environmental education platform built with Next.js, Supabase, and Firebase. It focuses on geothermal literacy, green habits, community action logging, gamified progress, and an AI assistant for environmental learning.

## Overview

GeoVerse is designed for young users in Ulubelu and similar communities to:

- learn about geothermal energy and environmental topics
- log daily green actions
- join community challenges
- earn points and badges
- get guidance from an AI assistant
- access a separate admin dashboard for moderation and content management

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase Auth and Database
- Firebase Auth and Firestore
- OpenRouter API
- Google Gemini 2.5 Flash
- Recharts
- Framer Motion
- React Hook Form
- Zod
- Lucide React

## Main Features

### Learning

- interactive learning modules
- quizzes and learning content
- modular content pages

### Green Log

- daily environmental action logging
- log history and review flow
- point rewards for approved actions

### Challenges

- community challenge pages
- challenge progress tracking
- reward and badge support

### Badges and Points

- automatic point accumulation
- badge collection
- admin-controlled badge activation and awarding

### Dashboard

- user statistics
- progress charts
- recommended learning modules
- recent green log activity

### AI Assistant

- environmental Q&A
- geothermal explanations
- learning support
- action recommendations

### Admin Area

- user management
- module management
- green log moderation
- challenge management
- badge management
- dashboard configuration

## Project Structure

```txt
app/
components/
data/
hooks/
lib/
public/
supabase/
types/
utils/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` and set the values used by the app:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-2.5-flash
```

### 3. Run the app

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Available Scripts

- `npm run dev` - start the dev server
- `npm run build` - build for production
- `npm start` - run the production build
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm test` - placeholder script

## Routes

Public and authenticated routes in the app include:

- `/`
- `/login`
- `/auth/callback`
- `/setup-profile`
- `/dashboard`
- `/learn`
- `/learn/[slug]`
- `/green-log`
- `/challenges`
- `/badges`
- `/profile`
- `/admin`
- `/admin/users`
- `/admin/green-logs`
- `/admin/modules`
- `/admin/modules/[id]`
- `/admin/challenges`
- `/admin/badges`
- `/admin/dashboard-config`

## Database

The project uses Supabase migrations stored in:

```txt
supabase/migrations/
```

The current schema includes support for:

- users
- modules
- quiz questions
- green logs
- challenges
- badges
- user badges
- dashboard configuration

## Notes

- Admin access is controlled by the configured admin email list and backend role checks.
- The app includes both Supabase and Firebase integration, so both sets of credentials may be required depending on which features you use.
- The repository is a private prototype and is not intended for public distribution.

## License

Private prototype. Not for public distribution.
