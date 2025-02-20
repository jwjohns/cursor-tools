import type { Config } from '../types';
import { loadConfig, loadEnv } from '../config';
import OpenAI from 'openai';
import { ApiKeyMissingError, ModelNotFoundError, NetworkError, ProviderError } from '../errors';

// Common options for all providers
export interface ModelOptions {
  model?: string;
  maxTokens?: number;
  systemPrompt?: string;
  tokenCount?: number; // For handling large token counts
  webSearch?: boolean; // Whether to enable web search capabilities
}

// Provider configuration in Config
export interface ProviderConfig {
  model?: string;
  maxTokens?: number;
  apiKey?: string;
  // OpenRouter-specific fields
  referer?: string;
  appName?: string;
}

// Base provider interface that all specific provider interfaces will extend
export interface BaseModelProvider {
  executePrompt(prompt: string, options?: ModelOptions): Promise<string>;
  supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string };
}

// Base provider class with common functionality
export abstract class BaseProvider implements BaseModelProvider {
  protected config: Config;

  constructor() {
    loadEnv();
    this.config = loadConfig();
  }

  protected getModel(options: ModelOptions | undefined): string {
    if (!options?.model) {
      throw new ModelNotFoundError(this.constructor.name.replace('Provider', ''));
    }
    return options.model;
  }

  protected getMaxTokens(options: ModelOptions | undefined): number {
    return options?.maxTokens || 4000; // Default to 4000 if not specified
  }

  protected abstract getSystemPrompt(options?: ModelOptions): string | undefined;

  protected handleLargeTokenCount(tokenCount: number): { model?: string; error?: string } {
    return {}; // Default implementation - no token count handling
  }

  abstract supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string };
  abstract executePrompt(prompt: string, options?: ModelOptions): Promise<string>;
}

// Helper function for exponential backoff retry
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 5,
  baseDelay: number = 1000, // 1 second
  shouldRetry: (error: any) => boolean = () => true
): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }
}

// Gemini provider implementation
export class GeminiProvider extends BaseProvider {
  protected getSystemPrompt(): string | undefined {
    return undefined; // Gemini doesn't use system prompts
  }

  protected handleLargeTokenCount(tokenCount: number): { model?: string; error?: string } {
    if (tokenCount > 800_000 && tokenCount < 2_000_000) {
      console.error(
        `Repository content is large (${Math.round(tokenCount / 1000)}K tokens), switching to gemini-2.0-pro-exp model...`
      );
      return { model: 'gemini-2.0-pro-exp' };
    }

    if (tokenCount >= 2_000_000) {
      return {
        error:
          'Repository content is too large for Gemini API.\n' +
          'Please try:\n' +
          '1. Using a more specific query to document a particular feature or module\n' +
          '2. Running the documentation command on a specific directory or file\n' +
          '3. Cloning the repository locally and using .gitignore to exclude non-essential files',
      };
    }

    return {};
  }

  supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string } {
    const unsupportedModels = new Set([
      'gemini-2.0-flash-thinking-exp-01-21',
      'gemini-2.0-flash-thinking-exp',
    ]);
    if (unsupportedModels.has(model)) {
      return {
        supported: false,
        model: 'gemini-2.0-pro-exp',
        error: `Model ${model} does not support web search.`,
      };
    }

    return {
      supported: true,
    };
  }

  async executePrompt(prompt: string, options?: ModelOptions): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiKeyMissingError('Gemini');
    }

    return retryWithBackoff(
      async () => {
        // Handle token count if provided
        let finalOptions = { ...options };
        if (options?.tokenCount) {
          const { model: tokenModel, error } = this.handleLargeTokenCount(options.tokenCount);
          if (error) {
            throw new ProviderError(error);
          }
          if (tokenModel) {
            finalOptions = { ...finalOptions, model: tokenModel };
          }
        }

        const model = this.getModel(finalOptions);
        const maxTokens = this.getMaxTokens(finalOptions);

        try {
          const requestBody: any = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: maxTokens },
          };

          // Add web search tool only when explicitly requested
          if (options?.webSearch) {
            requestBody.tools = [
              {
                google_search: {},
              },
            ];
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            throw new NetworkError(`Gemini API error: ${await response.text()}`);
          }

          const data = await response.json();
          if (data.error) {
            throw new ProviderError(`Gemini API error: ${JSON.stringify(data.error)}`);
          }

          const content = data.candidates[0]?.content?.parts[0]?.text;
          if (!content) {
            throw new ProviderError('Gemini returned an empty response');
          }

          return content;
        } catch (error) {
          if (error instanceof ProviderError) {
            throw error;
          }
          throw new NetworkError('Failed to communicate with Gemini API', error);
        }
      },
      5,
      1000,
      (error) => {
        if (error instanceof NetworkError) {
          const errorText = error.message.toLowerCase();
          return errorText.includes('429') || errorText.includes('resource exhausted');
        }
        return false;
      }
    );
  }
}

// Base class for OpenAI-compatible providers (OpenAI and OpenRouter)
abstract class OpenAIBase extends BaseProvider {
  protected client: OpenAI;

  constructor(
    apiKey: string,
    baseURL?: string,
    options?: { defaultHeaders?: Record<string, string> }
  ) {
    super();
    this.client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
      defaultHeaders: options?.defaultHeaders,
    });
  }

  protected getSystemPrompt(options?: ModelOptions): string | undefined {
    return (
      options?.systemPrompt || 'You are a helpful assistant. Provide clear and concise responses.'
    );
  }

  supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string } {
    return {
      supported: false,
      error: 'OpenAI does not support web search capabilities',
    };
  }

  async executePrompt(prompt: string, options?: ModelOptions): Promise<string> {
    const model = this.getModel(options);
    const maxTokens = this.getMaxTokens(options);
    const systemPrompt = this.getSystemPrompt(options);

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        max_tokens: maxTokens,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new ProviderError(`${this.constructor.name} returned an empty response`);
      }

      return content;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw new NetworkError(`Failed to communicate with ${this.constructor.name} API`, error);
    }
  }
}

// OpenAI provider implementation
export class OpenAIProvider extends OpenAIBase {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ApiKeyMissingError('OpenAI');
    }
    super(apiKey);
  }

  supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string } {
    return {
      supported: false,
      error: 'OpenAI does not support web search capabilities',
    };
  }
}

// OpenRouter provider implementation
export class OpenRouterProvider extends OpenAIBase {
  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new ApiKeyMissingError('OpenRouter');
    }
    super(apiKey, 'https://openrouter.ai/api/v1', {
      defaultHeaders: {
        'HTTP-Referer': 'https://cursor-tools.com',
        'X-Title': 'cursor-tools',
      },
    });
  }

  supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string } {
    if (model.startsWith('perplexity/') && (model.includes('sonar') || model.includes('online'))) {
      return { supported: true };
    }
    return {
      supported: false,
      model: 'perplexity/sonar',
      error: `Model ${model} does not support web search. Use a Perplexity model instead.`,
    };
  }
}

// Perplexity provider implementation
export class PerplexityProvider extends BaseProvider {
  protected getSystemPrompt(options?: ModelOptions): string | undefined {
    return (
      options?.systemPrompt || 'You are a helpful assistant. Provide clear and concise responses.'
    );
  }

  supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string } {
    if (model.startsWith('sonar')) {
      return { supported: true };
    }
    return {
      supported: false,
      model: 'sonar-pro',
      error: `Model ${model} does not support web search. Use a model with -online suffix instead.`,
    };
  }

  async executePrompt(prompt: string, options?: ModelOptions): Promise<string> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new ApiKeyMissingError('Perplexity');
    }

    return retryWithBackoff(
      async () => {
        const model = this.getModel(options);
        const maxTokens = this.getMaxTokens(options);
        const systemPrompt = this.getSystemPrompt(options);

        try {
          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: prompt },
              ],
              max_tokens: maxTokens,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new NetworkError(`Perplexity API error: ${errorText}`);
          }

          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          if (!content) {
            throw new ProviderError('Perplexity returned an empty response');
          }

          return content;
        } catch (error) {
          if (error instanceof ProviderError || error instanceof NetworkError) {
            throw error;
          }
          throw new NetworkError('Failed to communicate with Perplexity API', error);
        }
      },
      5,
      1000,
      (error) => {
        if (error instanceof NetworkError) {
          const errorText = error.message.toLowerCase();
          return errorText.includes('429') || errorText.includes('rate limit');
        }
        return false;
      }
    );
  }
}

// ModelBox provider implementation
export class ModelBoxProvider extends OpenAIBase {
  constructor() {
    const apiKey = process.env.MODELBOX_API_KEY;
    if (!apiKey) {
      throw new ApiKeyMissingError('ModelBox');
    }
    super(apiKey, 'https://api.model.box/v1');
  }

  supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string } {
    if (model.startsWith('perplexity/') && (model.includes('sonar') || model.includes('online'))) {
      return { supported: true };
    }
    return {
      supported: false,
      model: 'perplexity/sonar',
      error: `Model ${model} does not support web search. Use a Perplexity model instead.`,
    };
  }
}

// Factory function to create providers
export function createProvider(
  provider: 'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox'
): BaseModelProvider {
  switch (provider) {
    case 'gemini':
      return new GeminiProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'openrouter':
      return new OpenRouterProvider();
    case 'perplexity':
      return new PerplexityProvider();
    case 'modelbox':
      return new ModelBoxProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
