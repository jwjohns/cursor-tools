import type { Command, CommandGenerator, CommandOptions } from '../types';
import type { Config } from '../types';
import { loadConfig, loadEnv } from '../config';
import { pack } from 'repomix';
import { readFileSync } from 'node:fs';
import type { ModelOptions, BaseModelProvider } from '../providers/base';
import { GeminiProvider, OpenAIProvider, OpenRouterProvider } from '../providers/base';
import { FileError, ProviderError } from '../errors';
import { ignorePatterns, includePatterns, outputOptions } from '../repomix/repomixConfig';

// Plan-specific provider interface
export interface PlanModelProvider extends BaseModelProvider {
  getRelevantFiles(query: string, fileListing: string, options?: ModelOptions): Promise<string[]>;
  generatePlan(query: string, repoContext: string, options?: ModelOptions): Promise<string>;
}

// Factory function to create plan providers
function createPlanProvider(provider: 'gemini' | 'openai' | 'openrouter'): PlanModelProvider {
  switch (provider) {
    case 'gemini':
      return new PlanGeminiProvider();
    case 'openai':
      return new PlanOpenAIProvider();
    case 'openrouter':
      return new PlanOpenRouterProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export class PlanCommand implements Command {
  private config: Config;

  constructor() {
    loadEnv();
    this.config = loadConfig();
  }

  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    try {
      const fileProviderName = options?.fileProvider || this.config.plan?.fileProvider || 'gemini';
      const fileProvider = createPlanProvider(fileProviderName);
      const thinkingProviderName =
        options?.thinkingProvider || this.config.plan?.thinkingProvider || 'openai';
      const thinkingProvider = createPlanProvider(thinkingProviderName);

      const fileModel =
        options?.fileModel ||
        this.config.plan?.fileModel ||
        (this.config as Record<string, any>)[fileProviderName]?.model;
      const thinkingModel =
        options?.thinkingModel ||
        this.config.plan?.thinkingModel ||
        (this.config as Record<string, any>)[thinkingProviderName]?.model;

      yield `Using file provider: ${fileProviderName}\n`;
      yield `Using thinking provider: ${thinkingProviderName}\n`;
      yield `Using file model: ${fileModel}\n`;
      yield `Using thinking model: ${thinkingModel}\n`;

      yield 'Finding relevant files...\n';

      // Get file listing
      let packedRepo: string;
      try {
        yield 'Running repomix to get file listing...\n';

        const tempFile = '.repomix-plan-files.txt';
        const repomixResult = await pack(process.cwd(), {
          output: {
            ...outputOptions,
            filePath: tempFile,
            includeEmptyDirectories: false,
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

        if (options?.debug) {
          yield 'Repomix completed successfully.\n';
        }

        // TODO: this seems like an expensive way to get a list of files
        packedRepo = readFileSync(tempFile, 'utf-8');

        yield `Found ${repomixResult.totalFiles} files, approx ${repomixResult.totalTokens} tokens.\n`;
        if (options?.debug) {
          yield 'First few files:\n';
          yield `${packedRepo.split('\n').slice(0, 5).join('\n')}\n\n`;
          yield 'File listing format check:\n';
          yield `First 200 characters: ${JSON.stringify(packedRepo.slice(0, 200))}\n`;
          yield `Last 200 characters: ${JSON.stringify(packedRepo.slice(-200))}\n\n`;
        }
      } catch (error) {
        throw new FileError('Failed to get file listing', error);
      }

      // Get relevant files
      let filePaths: string[];
      try {
        yield `Asking ${fileProviderName} to identify relevant files...\n`;

        if (options?.debug) {
          yield 'Provider configuration:\n';
          yield `Provider: ${fileProviderName}\n`;
          yield `Model: ${fileModel}\n`;
          yield `Max tokens: ${options?.maxTokens || this.config.plan?.fileMaxTokens}\n\n`;
        }

        filePaths = await (fileProvider as PlanModelProvider).getRelevantFiles(query, packedRepo, {
          model: options?.fileModel || this.config.plan?.fileModel,
          maxTokens: options?.maxTokens || this.config.plan?.fileMaxTokens,
        });

        if (options?.debug) {
          yield 'AI response received.\n';
          yield `Number of files identified: ${filePaths?.length || 0}\n`;
          if (filePaths?.length > 0) {
            yield 'First few identified files:\n';
            yield `${filePaths.slice(0, 5).join('\n')}\n\n`;
          } else {
            yield 'No files were identified.\n\n';
          }
        }
      } catch (error) {
        if (options?.debug) {
          yield `Error details: ${error instanceof Error ? error.stack : String(error)}\n`;
        }
        throw new ProviderError('Failed to identify relevant files', error);
      }

      if (filePaths.length === 0) {
        yield 'No relevant files found. Please refine your query.\n';
        return;
      }

      yield `Found ${filePaths.length} relevant files:\n${filePaths.join('\n')}\n\n`;

      yield 'Extracting content from relevant files...\n';
      let filteredContent: string;
      try {
        const tempFile = '.repomix-plan-filtered.txt';
        await pack(process.cwd(), {
          output: {
            ...outputOptions,
            filePath: tempFile,
            includeEmptyDirectories: false,
          },
          include: filePaths,
          ignore: {
            useGitignore: true,
            useDefaultPatterns: true,
            customPatterns: [],
          },
          security: {
            enableSecurityCheck: true,
          },
          tokenCount: {
            encoding: 'cl100k_base',
          },
          cwd: process.cwd(),
        });

        if (options?.debug) {
          yield 'Content extraction completed.\n';
        }

        filteredContent = readFileSync(tempFile, 'utf-8');
      } catch (error) {
        throw new FileError('Failed to extract content', error);
      }

      yield 'Generating implementation plan using ${thinkingProviderName}...\n';
      let plan: string;
      try {
        plan = await thinkingProvider.generatePlan(query, filteredContent, {
          model: options?.thinkingModel || this.config.plan?.thinkingModel,
          maxTokens: options?.maxTokens || this.config.plan?.thinkingMaxTokens,
        });
      } catch (error) {
        throw new ProviderError('Failed to generate implementation plan', error);
      }

      yield plan;
    } catch (error) {
      if (error instanceof FileError || error instanceof ProviderError) {
        yield `${error.name}: ${error.message}\n`;
        if (error.details && options?.debug) {
          yield `Debug details: ${JSON.stringify(error.details, null, 2)}\n`;
        }
      } else if (error instanceof Error) {
        yield `Error: ${error.message}\n`;
      } else {
        yield 'An unknown error occurred\n';
      }
    }
  }
}

// Shared functionality for plan providers
function parseFileList(fileListText: string): string[] {
  // First try to parse as a comma-separated list
  const files = fileListText
    .split(/[,\n]/) // Split on commas or newlines
    .map((f) => f.trim())
    .map((f) => f.replace(/[`'"]/g, '')) // Remove quotes and backticks
    .filter((f) => f.length > 0 && !f.includes('*')); // Filter empty lines and wildcards

  if (files.length > 0) {
    return files;
  }

  // If no files found, try to extract paths using a regex
  const pathRegex = /(?:^|\s|["'`])([a-zA-Z0-9_\-/.]+\.[a-zA-Z0-9]+)(?:["'`]|\s|$)/g;
  const matches = Array.from(fileListText.matchAll(pathRegex), (m) => m[1]);
  return matches.filter((f) => f.length > 0);
}

// Shared mixin for plan providers
const PlanProviderMixin = {
  async getRelevantFiles(
    this: BaseModelProvider,
    query: string,
    fileListing: string,
    options?: ModelOptions
  ): Promise<string[]> {
    const response = await this.executePrompt(
      `Identify files that are relevant to the following query:

Query: ${query}

Below are the details of all files in the repository. Return ONLY a comma-separated list of file paths that are relevant to the query.
Do not include any other text, explanations, or markdown formatting. Just the file paths separated by commas.

Files:
${fileListing}`,
      {
        ...options,
        systemPrompt:
          'You are an expert software developer. You must return ONLY a comma-separated list of file paths. No other text or formatting.',
      }
    );
    return parseFileList(response);
  },

  async generatePlan(
    this: BaseModelProvider,
    query: string,
    repoContext: string,
    options?: ModelOptions
  ): Promise<string> {
    return this.executePrompt(`Query: ${query}\n\nRepository Context:\n${repoContext}`, {
      ...options,
      systemPrompt:
        'You are a helpful assistant that generates step-by-step implementation plans for software development tasks. Given a query and a repository context, generate a detailed plan. Include specific file paths, code snippets, and any necessary commands.',
    });
  },
};

// Plan provider implementations
export class PlanGeminiProvider extends GeminiProvider implements PlanModelProvider {
  getRelevantFiles = PlanProviderMixin.getRelevantFiles;
  generatePlan = PlanProviderMixin.generatePlan;
}

export class PlanOpenAIProvider extends OpenAIProvider implements PlanModelProvider {
  getRelevantFiles = PlanProviderMixin.getRelevantFiles;
  generatePlan = PlanProviderMixin.generatePlan;
}

export class PlanOpenRouterProvider extends OpenRouterProvider implements PlanModelProvider {
  getRelevantFiles = PlanProviderMixin.getRelevantFiles;
  generatePlan = PlanProviderMixin.generatePlan;
}
