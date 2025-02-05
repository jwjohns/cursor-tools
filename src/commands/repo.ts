import type { Command, CommandGenerator, CommandOptions } from '../types.ts';
import type { Config } from '../config.ts';
import { loadConfig, loadEnv } from '../config.ts';
import { readFileSync } from 'node:fs';
import { pack } from 'repomix';
import { ignorePatterns, includePatterns, outputOptions } from '../repomix/repomixConfig.ts';
export class RepoCommand implements Command {
  private config: Config;

  constructor() {
    loadEnv();
    this.config = loadConfig();
  }

  private async fetchGeminiResponse(
    query: string,
    repoContext: string,
    options?: CommandOptions
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    let cursorRules = '';
    try {
      cursorRules = readFileSync('.cursorrules', 'utf-8');
    } catch {
      // Ignore if .cursorrules doesn't exist
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${options?.model || this.config.gemini.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: cursorRules }, { text: repoContext }, { text: query }],
            },
          ],
          generationConfig: {
            maxOutputTokens: options?.maxTokens || this.config.gemini.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Gemini API error: ${JSON.stringify(data.error, null, 2)}`);
    }

    return data.candidates[0].content.parts[0].text;
  }

  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    try {
      yield 'Packing repository using repomix...\n';

      await pack(process.cwd(), {
        output: {
          ...outputOptions,
          filePath: '.repomix-output.txt',
        },
        include: includePatterns,
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: ignorePatterns,
        },
        security: {
          enableSecurityCheck: true,
        },
        tokenCount: {
          encoding: this.config.tokenCount?.encoding || 'o200k_base',
        },
        cwd: process.cwd(),
      });

      const repoContext = readFileSync('.repomix-output.txt', 'utf-8');

      const model = options?.model || this.config.gemini.model;
      yield `Querying Gemini AI using ${model}...\n`;
      const response = await this.fetchGeminiResponse(query, repoContext, options);
      yield response;
    } catch (error) {
      if (error instanceof Error) {
        yield `Error: ${error.message}`;
      } else {
        yield 'An unknown error occurred';
      }
    }
  }
}
