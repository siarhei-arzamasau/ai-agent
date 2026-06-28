import 'dotenv/config';
import { GitHubMcpClient } from './client.js';

const USAGE = `GitHub MCP client

Usage:
  pnpm mcp list                       List all available tools
  pnpm mcp describe <tool>            Show a tool's description and input schema
  pnpm mcp call <tool> [args...]      Call a tool

Arguments (for "call"):
  key=value      A single argument. Values are parsed as JSON when possible
                 (numbers, booleans, JSON), otherwise treated as a string.
  --json '<...>' Pass the full argument object as a JSON string.

Examples:
  pnpm mcp list
  pnpm mcp describe list_issues
  pnpm mcp call get_me
  pnpm mcp call search_repositories query="user:siarhei-arzamasau"
  pnpm mcp call list_issues owner=siarhei-arzamasau repo=md-ai state=open
  pnpm mcp call get_file_contents --json '{"owner":"o","repo":"r","path":"README.md"}'
`;

/** Parse `key=value` pairs and an optional `--json '<...>'` into an arguments object. */
function parseToolArgs(tokens: string[]): Record<string, unknown> {
  const args: Record<string, unknown> = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '--json') {
      const raw = tokens[++i];
      if (!raw) throw new Error('--json requires a JSON string argument.');
      const parsed = JSON.parse(raw);
      Object.assign(args, parsed);
      continue;
    }

    const eq = token.indexOf('=');
    if (eq === -1) {
      throw new Error(`Invalid argument "${token}". Expected key=value or --json.`);
    }
    const key = token.slice(0, eq);
    const rawValue = token.slice(eq + 1);
    // Coerce numbers/booleans/JSON; fall back to the raw string.
    try {
      args[key] = JSON.parse(rawValue);
    } catch {
      args[key] = rawValue;
    }
  }

  return args;
}

/** Print a CallToolResult: text blocks as-is, anything else as JSON. */
function printResult(content: { type: string; text?: string }[]): void {
  for (const block of content) {
    if (block.type === 'text' && block.text !== undefined) {
      console.log(block.text);
    } else {
      console.log(JSON.stringify(block, null, 2));
    }
  }
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(USAGE);
    return;
  }

  const mcp = new GitHubMcpClient();
  await mcp.connect();

  try {
    switch (command) {
      case 'list': {
        const tools = await mcp.listTools();
        console.log(`${tools.length} tools available:\n`);
        for (const tool of tools) {
          console.log(`  ${tool.name}\n    ${tool.description ?? '(no description)'}\n`);
        }
        break;
      }

      case 'describe': {
        const name = rest[0];
        if (!name) throw new Error('Usage: pnpm mcp describe <tool>');
        const tools = await mcp.listTools();
        const tool = tools.find((t) => t.name === name);
        if (!tool) throw new Error(`Tool "${name}" not found. Run "pnpm mcp list" to see options.`);
        console.log(`${tool.name}\n`);
        console.log(`${tool.description ?? '(no description)'}\n`);
        console.log('Input schema:');
        console.log(JSON.stringify(tool.inputSchema, null, 2));
        break;
      }

      case 'call': {
        const name = rest[0];
        if (!name) throw new Error('Usage: pnpm mcp call <tool> [args...]');
        const args = parseToolArgs(rest.slice(1));
        const result = await mcp.callTool(name, args);
        printResult(result.content);
        if (result.isError) {
          process.exitCode = 1;
        }
        break;
      }

      default:
        throw new Error(`Unknown command "${command}".\n\n${USAGE}`);
    }
  } finally {
    await mcp.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
