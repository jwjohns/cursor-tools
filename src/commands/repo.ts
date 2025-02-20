import type { Command, CommandGenerator, CommandOptions } from '../types';
import type { Config } from '../types';
import { defaultMaxTokens, loadConfig, loadEnv } from '../config';
import { pack } from 'repomix';
import { readFileSync } from 'node:fs';
import { FileError, ProviderError } from '../errors';
import type { ModelOptions, BaseModelProvider } from '../providers/base';
import { createProvider } from '../providers/base';
import { ignorePatterns, includePatterns, outputOptions } from '../repomix/repomixConfig';

export class RepoCommand implements Command {
  private config: Config;

  constructor() {
    loadEnv();
    this.config = loadConfig();
  }

  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    try {
      yield 'Packing repository using Repomix...\n';

      try {
        const packResult = await pack(process.cwd(), {
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
        console.log(
          `Packed repository. ${packResult.totalFiles} files. Approximate size ${packResult.totalTokens} tokens.`
        );
      } catch (error) {
        throw new FileError('Failed to pack repository', error);
      }

      let repoContext: string;
      try {
        repoContext = readFileSync('.repomix-output.txt', 'utf-8');
      } catch (error) {
        throw new FileError('Failed to read repository context', error);
      }

      let cursorRules = '';
      try {
        cursorRules = readFileSync('.cursorrules', 'utf-8');
      } catch {
        // Ignore if .cursorrules doesn't exist
      }

      const provider = createProvider(options?.provider || this.config.repo?.provider || 'gemini');
      const providerName = options?.provider || this.config.repo?.provider || 'gemini';

      // Configuration hierarchy
      const model =
        options?.model ||
        this.config.repo?.model ||
        (this.config as Record<string, any>)[providerName]?.model;
      const maxTokens =
        options?.maxTokens ||
        this.config.repo?.maxTokens ||
        (this.config as Record<string, any>)[providerName]?.maxTokens ||
        defaultMaxTokens;

      if (!model) {
        throw new ProviderError(`No model specified for ${providerName}`);
      }

      yield `Analyzing repository using ${model}...\n`;
      try {
        const response = await analyzeRepository(provider, query, repoContext, cursorRules, {
          model,
          maxTokens,
          systemPrompt:
            "You are an expert software developer analyzing a repository. Follow user instructions exactly and satisfy the user's request.",
        });
        yield response;
      } catch (error) {
        throw new ProviderError(
          error instanceof Error ? error.message : 'Unknown error during analysis',
          error
        );
      }
    } catch (error) {
      if (error instanceof FileError || error instanceof ProviderError) {
        yield error.formatUserMessage(options?.debug);
      } else if (error instanceof Error) {
        yield `Error: ${error.message}\n`;
      } else {
        yield 'An unknown error occurred\n';
      }
    }
  }
}

async function analyzeRepository(
  provider: BaseModelProvider,
  query: string,
  repoContext: string,
  cursorRules: string,
  options?: ModelOptions
): Promise<string> {
  return provider.executePrompt(`${cursorRules}\n\n${repoContext}\n\n${query}`, options);
}
