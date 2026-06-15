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

## Environment variables

| Variable           | Default | Description              |
|--------------------|---------|--------------------------|
| `ANTHROPIC_API_KEY` | —       | Your Anthropic API key (required) |
| `PORT`             | `3000`  | Port the server listens on |
