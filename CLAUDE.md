# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack on localhost:3000
npm run dev:daemon   # Start in background, logs to logs.txt

# Build & lint
npm run build
npm run lint

# Tests
npm test             # Run all tests with Vitest
npx vitest run src/path/to/__tests__/file.test.tsx  # Run single test file

# Database
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Reset database (destructive)
npx prisma studio    # Open Prisma Studio GUI
```

## Environment

- Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`
- Without the key, the app falls back to a mock provider that returns static code

## Architecture

**UIGen** is an AI-powered React component generator. Users describe components in natural language; Claude generates/edits them in real-time with a live preview.

### Request Flow

1. User types in `ChatInterface` → `ChatContext` submits via `useChat` (Vercel AI SDK)
2. `POST /api/chat` streams a response from Claude (haiku model) with tool calls
3. Claude uses two tools: `str_replace_editor` (edit files) and `file_manager` (create/delete/rename)
4. `FileSystemContext` intercepts tool call results and updates the in-memory virtual FS
5. `PreviewFrame` re-renders the component using `@babel/standalone` to transform JSX on the fly

### State Management

Two React contexts, no external state library:
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — messages, input, chat status, anonymous work tracking
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — virtual file system, selected file, tool call routing

### Key Modules

| Path | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Streaming chat endpoint; registers AI tools |
| `src/lib/provider.ts` | Returns Claude or Mock language model based on env |
| `src/lib/prompts/generation.tsx` | System prompt that instructs Claude how to generate components |
| `src/lib/tools/str-replace.ts` | `str_replace_editor` tool implementation |
| `src/lib/tools/file-manager.ts` | `file_manager` tool implementation |
| `src/lib/file-system.ts` | In-memory virtual FS (serializable to JSON for DB persistence) |
| `src/lib/auth.ts` | JWT creation/verification, cookie helpers |
| `src/actions/` | Server actions for auth and project CRUD |
| `src/components/preview/PreviewFrame.tsx` | Transforms and renders generated code live |

### Data Model

SQLite via Prisma with two tables:
- **User** — `id`, `email`, `password` (bcrypt), `createdAt`, `projects[]`
- **Project** — `id`, `userId`, `messages` (JSON string), `fileSystem` (JSON string), `createdAt`, `updatedAt`

### Auth

- Email/password with bcrypt; JWT stored in httpOnly cookie
- Anonymous users can generate components; work is tracked in `AnonWorkTracker` (localStorage) and merged on sign-in
- Server actions in `src/actions/index.ts`; middleware at `src/middleware.ts`

### Testing

Tests live in `__tests__/` subdirectories next to the code they test. Vitest with jsdom, `@testing-library/react`. Config at `vitest.config.mts`.

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json` and `vitest.config.mts`).
