import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

/** GitHub's hosted (remote) MCP server endpoint. */
export const GITHUB_MCP_URL = 'https://api.githubcopilot.com/mcp/';

export interface GitHubMcpClientOptions {
  /**
   * GitHub Personal Access Token used as a Bearer credential.
   * Defaults to the GITHUB_PAT environment variable.
   */
  token?: string;
  /** Override the MCP server URL (e.g. for a self-hosted proxy). */
  url?: string;
  /** Client name reported to the server during initialization. */
  name?: string;
  /** Client version reported to the server during initialization. */
  version?: string;
}

/**
 * A thin wrapper around the official MCP SDK `Client` that connects to
 * GitHub's hosted MCP server over Streamable HTTP and authenticates with a PAT.
 */
export class GitHubMcpClient {
  private readonly client: Client;
  private readonly transport: StreamableHTTPClientTransport;
  private connected = false;

  constructor(options: GitHubMcpClientOptions = {}) {
    const token = options.token ?? process.env.GITHUB_PAT;
    if (!token) {
      throw new Error(
        'Missing GitHub token. Set GITHUB_PAT in the environment or pass { token } to GitHubMcpClient.',
      );
    }

    this.transport = new StreamableHTTPClientTransport(
      new URL(options.url ?? GITHUB_MCP_URL),
      { requestInit: { headers: { Authorization: `Bearer ${token}` } } },
    );

    this.client = new Client(
      {
        name: options.name ?? 'github-mcp-client',
        version: options.version ?? '1.0.0',
      },
      { capabilities: {} },
    );
  }

  /** Open the connection and perform the MCP initialization handshake. */
  async connect(): Promise<void> {
    if (this.connected) return;
    await this.client.connect(this.transport);
    this.connected = true;
  }

  /** List every tool the GitHub MCP server exposes. */
  async listTools(): Promise<Tool[]> {
    this.assertConnected();
    const { tools } = await this.client.listTools();
    return tools;
  }

  /** Invoke a tool by name with the given arguments. */
  async callTool(
    name: string,
    args: Record<string, unknown> = {},
  ): Promise<CallToolResult> {
    this.assertConnected();
    return (await this.client.callTool({
      name,
      arguments: args,
    })) as CallToolResult;
  }

  /** Close the underlying transport. */
  async close(): Promise<void> {
    if (!this.connected) return;
    await this.client.close();
    this.connected = false;
  }

  private assertConnected(): void {
    if (!this.connected) {
      throw new Error('GitHubMcpClient is not connected. Call connect() first.');
    }
  }
}
