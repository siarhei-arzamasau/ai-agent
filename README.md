# Claude Chat

A streaming chat application powered by Claude via the Anthropic API. Built with Node.js/Express backend and a vanilla TypeScript frontend.

## Prerequisites

- Node.js 18+
- pnpm 11+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy the example environment file and add your API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `ANTHROPIC_API_KEY` to your key.

## Running

### Development (with hot reload)

```bash
pnpm dev
```

Starts the Express server with `tsx watch` and the esbuild client bundler in parallel. Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
pnpm build
pnpm start
```

`pnpm build` compiles the TypeScript server and bundles the client. `pnpm start` runs the compiled output.

## Commands

Type these slash commands in the message input. They are handled locally in the browser and are **not** sent to Claude. Run `/help` in the app to see the same list.

### Memory layers

| Command | Description |
|---------|-------------|
| `/short-memory <text>` | Add to short-term memory (current dialog only, never persisted) |
| `/work-memory <text>` | Add to working memory (persists with the current session/task) |
| `/long-memory <text>` | Add to long-term memory (global, applied to every dialog) |

### Profiles

| Command | Description |
|---------|-------------|
| `/create-profile <name> <definition>` | Create and activate a response profile (style / format / limits) |
| `/profile` | Show the active profile |
| `/switch-profile <name>` | Switch the active profile |

### Invariants

| Command | Description |
|---------|-------------|
| `/add-invariant <text>` | Add a global hard constraint the assistant must never break |
| `/invariants` | List all invariants |

### Tasks

| Command | Description |
|---------|-------------|
| `/task <description>` | Run a staged task: planning → execution → validation → done. After each stage it pauses for review — reply to approve and continue, describe changes to revise, or type `стоп` to stop the task. |

### Other

| Command | Description |
|---------|-------------|
| `/help` | Show the list of all commands |

> While Claude is responding, the send button turns into a **stop** button — click it to interrupt the response (any partial output is kept).

## Environment variables

| Variable           | Default | Description              |
|--------------------|---------|--------------------------|
| `ANTHROPIC_API_KEY` | —       | Your Anthropic API key (required) |
| `PORT`             | `3000`  | Port the server listens on |
