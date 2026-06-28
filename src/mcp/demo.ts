import 'dotenv/config';
import { GITHUB_MCP_URL, GitHubMcpClient } from './client.js';

/**
 * Connects to GitHub's hosted MCP server, lists its tools, and calls one
 * read-only tool to confirm the connection works end to end.
 *
 * Run with: pnpm mcp:demo
 * Requires a GitHub PAT in the GITHUB_PAT environment variable.
 */
async function main(): Promise<void> {
  const mcp = new GitHubMcpClient();

  await mcp.connect();
  console.log(`Connected to GitHub MCP server at ${GITHUB_MCP_URL}`);

  const tools = await mcp.listTools();
  console.log(`\nDiscovered ${tools.length} tools:`);
  for (const tool of tools) {
    console.log(`  - ${tool.name}: ${tool.description ?? '(no description)'}`);
  }

  // `get_me` returns the authenticated user — a safe, read-only probe.
  const probe = tools.find((tool) => tool.name === 'get_me');
  if (probe) {
    console.log('\nCalling get_me ...');
    const result = await mcp.callTool('get_me');
    for (const block of result.content) {
      if (block.type === 'text') console.log(block.text);
    }
  } else {
    console.log('\nTool "get_me" not available; skipping sample call.');
  }

  await mcp.close();
  console.log('\nConnection closed.');
}

main().catch((error) => {
  console.error('MCP demo failed:', error);
  process.exitCode = 1;
});
