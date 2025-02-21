import type { Command, CommandGenerator, CommandOptions } from '../../types';
import { MarketplaceManager, type MCPServer } from './marketplace.js';
import { MCPClient } from './client/MCPClient.js';
import { MCPConfigError } from './client/errors.js';
import { createProvider } from '../../providers/base';
import { once } from '../../utils/once.js';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

function populateEnv(requiredEnv: Record<string, string>): Record<string, string> {
  const populatedEnv: Record<string, string> = {};
  
  for (const [key, _] of Object.entries(requiredEnv)) {
    
    // Otherwise check process.env
    const envValue = process.env[key];
    if (!envValue) {
      throw new MCPConfigError(`Required environment variable "${key}" is not set`);
    }
    
    populatedEnv[key] = envValue;
  }
  
  populatedEnv['PATH'] = process.env.PATH || '';
  return populatedEnv;
}

const pathToUvx = once(async (): Promise<string> => {
  try {
    const { stdout } = await execFile('which', ['uvx']);
    const uvxPath = stdout.trim();
    if (uvxPath) {
      console.log('uvxPath', uvxPath);
      return uvxPath;
    }
  } catch (error) {
    console.error('Error finding uvx:', error);
  }
  return 'uvx';
});

const pathToNpx = once(async (): Promise<string> => {
  try {
    const { stdout } = await execFile('which', ['npx']);
    const npxPath = stdout.trim();
    if (npxPath) {
      console.log('npxPath', npxPath);
      return npxPath;
    }
  } catch (error) {
    console.error('Error finding npx:', error);
  }
  return 'npx';
});

export class RunCommand implements Command {
  constructor(private marketplaceManager: MarketplaceManager) {}

  private async selectServer(query: string, specifiedServer?: string): Promise<MCPServer[]> {
    const marketplaceData = await this.marketplaceManager.getMarketplaceData();

    // If server is specified, try to find it
    if (specifiedServer) {
      const servers = marketplaceData.servers.filter((s) => s.name === specifiedServer);
      if (servers.length === 0) {
        throw new MCPConfigError(`Server "${specifiedServer}" not found in marketplace`);
      }
      return servers;
    }

    // Otherwise, find servers based on intent
    const servers = await this.marketplaceManager.findServersForIntent(query);
    if (servers.length === 0) {
      throw new MCPConfigError('No suitable servers found for the given query');
    }

    return servers;
  }

  private async generateMCPConfig(query: string, server: MCPServer): Promise<{
    command: 'uvx' | 'npx';
    args: string[];
    env: Record<string, string>;
  }> {
    // Use Gemini to generate appropriate arguments
    const provider = createProvider('gemini');

    const {readme, ...serverDetails} = server;
    const prompt = `You are an expert engineer. Your job is to create json configurations for running MCP servers based on the README of the given mcp server, and the user query.

IMPORTANT: You must return a JSON object in EXACTLY this format:
{
  "mcpServers": {
    "<mcpServerId>": {
      "command": "<uvx | npx>",
      "args": [<"-y" in the case of npx>, "<server command>", "<server argument 1>", "<server argument 2>", ...],
      "env": {
        "<env var name>": "YOUR_ENV_VAR_VALUE"
      }
    }
  }
}

Do not return an array or any other format. The response must be a JSON object with a "mcpServers" key containing a "git" key with "command" and "args" properties.

The <server command> argument MUST exactly match the command in the README.md file for the given mcp server.
Given a user query and the mcp server details, generate the appropriate mcp server configuration as a json object. Make sure to identify placeholders in README commands such as /path/to/file and replace them with user provided values. Do not return placeholders in the response.

Note the current directory is '${process.cwd()}' you can use this as a path for inputs and outputs.
The command should always be "uvx" or "npx" for running MCP servers. If the server provides instructions mentioning node then use npx. If the server provides instructions mentioning python then use uvx.

IMPORTANT: If this is a retry attempt with an error message, analyze the error and adjust the configuration accordingly. Focus on fixing the specific issue mentioned in the error.

User Query: "${query}"

<README>
${readme}
</README>

Check the required environment variables against the available environment variables below. If any required environment variables mentioned in the README are not available, particularly API keys, respond with a json object with the key "needsMoreInfo" and the value being a string of the information you need.

<Available Environment Variables>
${Object.keys(process.env).map(key => `${key}`).join('\n')}
</Available Environment Variables>

Return ONLY a JSON object in the exact format shown above.
DO NOT include markdown formatting, backticks, or any other text. Just the raw JSON object.

HOWEVER if the server details show that you need more information from the user that is not included in the user query, respond with a json object with the key "needsMoreInfo" and the value being a string of the information you need.`;

    try {
      const response = await provider.executePrompt(prompt, {
        model: 'gemini-2.0-flash',
        maxTokens: 1000,
        systemPrompt: 'You are an expert at generating MCP server arguments. You only return a raw JSON object, no markdown, no backticks, no other text.',
      });

      // Clean the response of any markdown formatting
      const cleanedResponse = response.replace(/```(?:json)?\n([\s\S]*?)\n```/g, '$1').trim();
      
      // Parse the response and ensure it's an array of strings
      let args = JSON.parse(cleanedResponse);
      console.log('server config', JSON.stringify(args, null, 2));
      if(Array.isArray(args) && (args[0] === 'uvx' || args[0] === 'npx')) {
        args = {
          mcpServers: {
            git: {
              command: args[0],
              args: args.slice(1)
            }
          }
        }
      }

      if(args.needsMoreInfo) {
        throw new Error(`We need more information from you to generate the MCP server configuration. Please re run the command provide the following information: ${args.needsMoreInfo}`);
      }

      const keys = Object.keys(args.mcpServers);
      if(!keys || keys.length !== 1) {
        throw new Error('Invalid argument format returned by AI, unexpected number of keys');
      }
      
      const serverName = keys[0];
      const serverConfig = args.mcpServers[serverName];

      if(serverConfig.command !== 'uvx' && serverConfig.command !== 'npx') {
        throw new Error('Invalid command returned by AI');
      }
      if(!Array.isArray(serverConfig.args)) {
        throw new Error('Invalid args returned by AI');
      }

      if(serverConfig.command !== 'uvx' && serverConfig.command !== 'npx') {
        throw new Error('Invalid command returned by AI');
      }

      const env = 'env' in serverConfig ? serverConfig.env : {};

      switch(serverConfig.command) {
        case 'uvx':
          serverConfig.command = await pathToUvx();
          break;
        case 'npx':
          serverConfig.command = await pathToNpx();
          break;
        default:
          throw new Error('Invalid command returned by AI: ' + serverConfig.command);
      }
      return {
        command: serverConfig.command,
        args: serverConfig.args,
        env: populateEnv(env)
      };
    } catch (error) {
      console.error('Error generating MCP config:', error);
      // If we fail to generate arguments, return default args or empty array if no defaults
      throw error;
    }
  }

  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    if (!query?.trim()) {
      throw new Error('Query cannot be empty');
    }

    // Select appropriate servers
    let servers = await this.selectServer(query, options?.server);
    if (!Array.isArray(servers)) {
      // If single server returned, convert to array for consistent handling
      servers = [servers];
    }
    
    if (servers.length === 0) {
      throw new Error('No suitable MCP servers found for the query');
    }
    servers = servers.filter(s => !!s.readme?.trim());
    if (servers.length === 0) {
      throw new Error('No servers found with a README.md file');
    }

    yield `Found ${servers.length} matching MCP server(s):\n${servers.map(s => `- ${s.name}`).join('\n')}\n`;

    // Track successful clients for final processing
    const successfulClients: { client: MCPClient; server: MCPServer }[] = [];
    const failedServers: { server: MCPServer; error: string }[] = [];
    const maxAttempts = 1;
    // Try to initialize each server with retries
    for (const server of servers) {
      yield `\nAttempting to initialize ${server.name}...\n`;
      
      // Generate initial arguments using AI
      const serverConfig = await this.generateMCPConfig(query, server);
      yield `Generated arguments for ${server.name}: ${JSON.stringify(serverConfig)}\n`;

      // Initialize client with selected server and generated args
      const client = new MCPClient({
        command: serverConfig.command,
        args: serverConfig.args,
        env: serverConfig.env
      });

      let attempts = 0;
      let lastError = '';
      let success = false;

      while (attempts < maxAttempts && !success) {
        try {
          await client.start();
          success = true;
          successfulClients.push({ client, server });
          yield `Successfully initialized ${server.name}\n`;
        } catch (error) {
          attempts++;
          lastError = error instanceof Error ? error.message : String(error);
          
          if (attempts < maxAttempts) {
            yield `Attempt ${attempts} for ${server.name} failed. Retrying with error feedback...\n`;
            // Regenerate config with error feedback
            const newConfig = await this.generateMCPConfig(
              `${query}\n\nPrevious attempt failed with command: ${serverConfig.command} ${serverConfig.args.join(' ')}\nError: ${lastError}`,
              server
            );
            
            // Update client with new configuration
            client.updateConfig({
              command: newConfig.command,
              args: newConfig.args,
            });
          } else {
            yield `⚠️ Failed to initialize ${server.name} after ${maxAttempts} attempts. Last error: ${lastError}\n`;
            failedServers.push({ server, error: lastError });
          }
        }
      }
    }

    // If no servers succeeded, throw error
    if (successfulClients.length === 0) {
      throw new Error(`Failed to initialize any MCP servers after ${maxAttempts} attempts each. Failed servers:\n${
        failedServers.map(f => `- ${f.server.name}: ${f.error}`).join('\n')
      }`);
    }

    // If some servers failed but others succeeded, log warning
    if (failedServers.length > 0) {
      yield `\n⚠️ Warning: ${failedServers.length} server(s) failed to initialize:\n${
        failedServers.map(f => `- ${f.server.name}: ${f.error}`).join('\n')
      }\nContinuing with ${successfulClients.length} successful server(s)\n\n`;
    }

    try {
      // Process query with all successful clients
      const allMessages = await Promise.all(
        successfulClients.map(async ({ client, server }) => {
          try {
            const messages = await client.processQuery(query);
            return { server, messages, error: null };
          } catch (error) {
            return { 
              server, 
              messages: null, 
              error: error instanceof Error ? error.message : String(error) 
            };
          }
        })
      );

      // Handle save-to option if specified
      if (options?.saveTo) {
        const fs = await import('node:fs/promises');
        await fs.writeFile(
          options.saveTo, 
          JSON.stringify(allMessages.filter(m => m.messages !== null), null, 2)
        );
        yield `Output saved to ${options.saveTo}\n`;
      }

      // Yield messages from each successful client
      for (const result of allMessages) {
        if (result.error) {
          yield `\n⚠️ Error processing query with ${result.server.name}: ${result.error}\n`;
        } else if (result.messages) {
          yield `\n=== Results from ${result.server.name} ===\n`;
          for (const message of result.messages) {
            yield message.content + '\n';
          }
        }
      }
    } finally {
      // Clean up all clients
      await Promise.all(successfulClients.map(({ client }) => client.stop()));
    }
  }
}


