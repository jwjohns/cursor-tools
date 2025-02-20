import type { Command, CommandGenerator, CommandOptions } from '../types';
import type { Config } from '../types';
import { loadConfig, loadEnv } from '../config';
import { pack } from 'repomix';
import { readFileSync } from 'node:fs';
import { FileError, ProviderError } from '../errors';
import type { ModelOptions, BaseModelProvider } from '../providers/base';
import {
  GeminiProvider,
  OpenAIProvider,
  OpenRouterProvider,
  PerplexityProvider,
  ModelBoxProvider,
} from '../providers/base';
import { ModelNotFoundError } from '../errors';
import { ignorePatterns, includePatterns, outputOptions } from '../repomix/repomixConfig';

export class RepoCommand implements Command {
  private config: Config;

  constructor() {
    loadEnv();
    this.config = loadConfig();
  }

  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    try {
      yield 'Packing repository using repomix...\n';

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

      const provider = createRepoProvider(
        options?.provider || this.config.repo?.provider || 'gemini'
      );
      const providerName = options?.provider || this.config.repo?.provider || 'gemini';

      // Configuration hierarchy
      const model =
        options?.model ||
        this.config.repo?.model ||
        (this.config as Record<string, any>)[providerName]?.model;
      const maxTokens =
        options?.maxTokens ||
        this.config.repo?.maxTokens ||
        (this.config as Record<string, any>)[providerName]?.maxTokens;

      if (!model) {
        throw new ProviderError(`No model specified for ${providerName}`);
      }

      yield `Analyzing repository using ${model}...\n`;
      try {
        const response = await provider.analyzeRepository(query, repoContext, cursorRules, {
          model,
          maxTokens,
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

// Repository-specific provider interface
export interface RepoModelProvider extends BaseModelProvider {
  analyzeRepository(
    query: string,
    repoContext: string,
    cursorRules: string,
    options?: ModelOptions
  ): Promise<string>;
}

// Shared mixin for repo providers
const RepoProviderMixin = {
  async analyzeRepository(
    this: BaseModelProvider,
    query: string,
    repoContext: string,
    cursorRules: string,
    options?: ModelOptions
  ): Promise<string> {
    return this.executePrompt(`${cursorRules}\n\n${repoContext}\n\n${query}`, {
      ...options,
      systemPrompt:
        'You are an expert software developer analyzing a repository. Follow user instructions exactly.',
    });
  },
};

// Repository provider implementations
export class RepoGeminiProvider extends GeminiProvider implements RepoModelProvider {
  analyzeRepository = RepoProviderMixin.analyzeRepository;
}

export class RepoOpenAIProvider extends OpenAIProvider implements RepoModelProvider {
  analyzeRepository = RepoProviderMixin.analyzeRepository;
}

export class RepoOpenRouterProvider extends OpenRouterProvider implements RepoModelProvider {
  analyzeRepository = RepoProviderMixin.analyzeRepository;
}

export class RepoPerplexityProvider extends PerplexityProvider implements RepoModelProvider {
  analyzeRepository = RepoProviderMixin.analyzeRepository;
}

export class RepoModelBoxProvider extends ModelBoxProvider implements RepoModelProvider {
  analyzeRepository = RepoProviderMixin.analyzeRepository;
}

// Factory function to create providers
export function createRepoProvider(
  provider: 'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox'
): RepoModelProvider {
  switch (provider) {
    case 'gemini':
      return new RepoGeminiProvider();
    case 'openai':
      return new RepoOpenAIProvider();
    case 'openrouter':
      return new RepoOpenRouterProvider();
    case 'perplexity':
      return new RepoPerplexityProvider();
    case 'modelbox':
      return new RepoModelBoxProvider();
    default:
      throw new ModelNotFoundError(provider);
  }
}
