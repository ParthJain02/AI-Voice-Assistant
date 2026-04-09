# VoicePilot AI

VoicePilot AI is a full-stack, voice-activated personal assistant web app with streaming AI chat, persistent conversation memory, task and reminder automation, and production-ready architecture.

## Screenshots

- Placeholder: public/screenshots/landing.png
- Placeholder: public/screenshots/chat.png
- Placeholder: public/screenshots/tasks-reminders.png

## Why This Project Stands Out

- Demonstrates modern full-stack delivery in one codebase: Next.js App Router, Auth.js, Prisma/Postgres, Redis, and OpenAI provider abstraction.
- Ships real-time streaming UX plus voice input and text-to-speech playback.
- Includes architecture patterns that are easy to explain in interviews: orchestration layer, tool routing, service boundaries, and secure API design.

## Features

- Authentication: sign up, sign in, sign out, protected dashboard, user-scoped data.
- Voice conversation: browser speech recognition, live transcript, streamed response text, optional spoken playback.
- Chat experience: message persistence, conversation history, rename conversation, archive conversation, new conversation flow.
- Assistant actions: create task, complete task, create reminder, list reminders, search memory.
- Natural language reminders: parses phrases like "remind me tomorrow at 7 PM to call mom" into structured reminder data.
- Reminder delivery channels: choose in-app or email delivery with provider abstraction.
- Email retry policy: failed email reminders are retried with exponential backoff and move to FAILED after max attempts.
- Manual recovery: failed reminders can be retried from the dashboard.
- Debug telemetry: reminder delivery summary and recent reminder delivery events via api/reminders/telemetry.
- Reminder engine: timezone-aware persistence and scheduled due processing endpoint for cron.
- Settings: display name, voice output toggle, preferred voice, theme preference, delete-account placeholder.
- Security: server-side authorization checks, Zod validation, AI route rate limiting, secret-safe env handling.
- Quality: TypeScript strict mode, linting, unit tests, integration tests, E2E specs, production build verification.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS.
- UI: custom reusable component layer inspired by clean shadcn-style patterns.
- Auth: Auth.js with Prisma adapter and credentials provider.
- Database: PostgreSQL with Prisma ORM.
- Cache and limiter: Upstash Redis with sliding-window rate limiting.
- AI: OpenAI provider abstraction with fallback behavior and centralized orchestration.
- Validation: Zod.
- NLP parsing: chrono-node for date/time extraction from reminder phrases.
- Testing: Vitest and Playwright.
- Deployment: Vercel + managed Postgres + Upstash Redis.

## Architecture Summary

### Application layers

- Presentation layer: routes and components under app and components.
- Application layer: orchestration and services under lib/ai and lib/services.
- Domain layer: intent schemas and validation contracts.
- Infrastructure layer: Prisma, Auth.js, Redis, environment parsing, logging.

### Voice to response flow

1. Browser microphone starts speech recognition.
2. Interim and final transcript appears in the chat input.
3. Final text is sent to the streaming API endpoint.
4. API persists the user message.
5. Orchestrator classifies intent and optionally executes a tool action.
6. LLM response streams to client progressively.
7. Assistant message is persisted.
8. Browser optionally reads the final text aloud with speech synthesis.

### Tool routing flow

- Intent types: CHAT, CREATE_TASK, COMPLETE_TASK, CREATE_REMINDER, LIST_REMINDERS, SEARCH_MEMORY.
- Classifier returns structured payload.
- Zod validates payload.
- Executor calls domain services.
- Orchestrator includes tool output in final assistant generation context.

### Reminder scheduling flow

- Reminders are stored with UTC timestamp plus original timezone.
- Vercel cron calls api/reminders/due each minute.
- Endpoint uses Redis lock to avoid overlapping runs.
- Due reminders are marked sent and in-app notifications are created.

## Folder Highlights

- app: pages and route handlers.
- components: UI primitives and feature-level client components.
- lib/auth: Auth.js options and session guard.
- lib/ai: prompt, provider abstraction, intent classifier, tool executor, orchestration.
- lib/services: tasks, reminders, conversations, search business logic.
- lib/redis: Redis client and rate limiting.
- prisma: schema and seed.
- tests: unit, integration, E2E.

## Environment Variables

Copy .env.example to .env.local and fill values:

- DATABASE_URL: PostgreSQL connection string.
- NEXTAUTH_SECRET: random secure secret.
- NEXTAUTH_URL: app URL.
- OPENAI_API_KEY: OpenAI key.
- REDIS_URL: Upstash Redis URL.
- REDIS_TOKEN: Upstash Redis token.
- APP_NAME: display name.
- CRON_SECRET: shared secret for reminder cron route.
- EMAIL_PROVIDER: noop or resend.
- EMAIL_FROM: sender identity for outbound reminder emails.
- RESEND_API_KEY: API key used when EMAIL_PROVIDER is resend.

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Set up environment.

```bash
cp .env.example .env.local
```

3. Generate Prisma client and run migrations.

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Seed demo data.

```bash
npm run prisma:seed
```

5. Start dev server.

```bash
npm run dev
```

## Scripts

- npm run dev: start local development server.
- npm run build: production build.
- npm run start: run production server.
- npm run lint: run ESLint.
- npm run typecheck: run TypeScript compile checks.
- npm run test: run Vitest unit and integration tests.
- npm run test:e2e: run Playwright E2E tests.
- npm run prisma:generate: generate Prisma client.
- npm run prisma:migrate: run Prisma migration in development.
- npm run prisma:deploy: apply migrations in deployment.
- npm run prisma:seed: seed demo account and sample tasks.

## Testing Coverage

- Unit: timezone conversion and intent classification fallback.
- Integration: reminder due processor behavior.
- E2E:
	- sign in and create a task
	- natural-language reminder request in chat
	- streamed chat response render

## Deployment

### Vercel

1. Create project from repository.
2. Configure all environment variables.
3. Set build command to npm run build.
4. Set install command to npm install.
5. Add managed Postgres and Upstash Redis credentials.

### Database

Run migrations in production:

```bash
npm run prisma:deploy
```

### Cron

vercel.json schedules api/reminders/due every minute.

## Demo Account

- Email: demo@voicepilot.dev
- Password: DemoPass123!

Use prisma seed first to create this account.

## Key Engineering Decisions

- Chose Auth.js over hosted auth to show full ownership of auth flow and DB adapter wiring.
- Kept an explicit AI orchestration layer to cleanly separate classification, tool execution, and final response generation.
- Used Redis for AI rate limiting and cron locking for practical abuse prevention and idempotent background execution.
- Used provider abstraction so OpenAI can be swapped with another LLM backend without touching route handlers.

## Security Notes

- Protected routes and APIs require authenticated sessions.
- User ownership checks are enforced on all data mutations.
- Input validation is enforced with Zod on write endpoints.
- Secrets remain server-side through environment variables.
- AI endpoint is rate-limited.

## Interview Talking Points

- How to architect voice-first UX with browser-native APIs and AI streaming.
- Designing extensible tool-routing in an assistant without overengineering.
- Production-minded reliability: auth boundaries, rate limiting, idempotent reminder processing, and deploy strategy.

## Future Roadmap

- Email and push notification channels.
- Rich natural-language date parsing improvements.
- Semantic vector search for conversation memory.
- Team/shared workspace support.
- Multi-provider LLM routing with automated fallback.
