import { z } from 'zod';

// Define available models
export const availableModels = z.enum([
  'claude-3-5-sonnet-latest',
  'o3-mini',
  'gpt-4o',
]);

export type AvailableModel = z.infer<typeof availableModels>;

export interface StagehandConfig {
  provider: 'anthropic' | 'openai';
  headless: boolean;
  verbose: boolean;
  debugDom: boolean;
  enableCaching: boolean;
  timeout?: number;
  model?: string;
}

interface BrowserConfig {
  headless?: boolean;
  defaultViewport?: string;
  timeout?: number;
  stagehand?: {
    headless?: boolean;
    verbose?: boolean;
    debugDom?: boolean;
    enableCaching?: boolean;
    timeout?: number;
    model?: string;
  };
}

interface Config {
  browser?: BrowserConfig;
}

export function loadStagehandConfig(config: Config): StagehandConfig {
  const browserConfig = config.browser || {};
  const stagehandConfig = browserConfig.stagehand || {};

  // Set default values
  const headless = stagehandConfig.headless ?? true;
  const verbose = stagehandConfig.verbose ?? false;
  const debugDom = stagehandConfig.debugDom ?? false;
  const enableCaching = stagehandConfig.enableCaching ?? false;
  const timeout = stagehandConfig.timeout ?? 120000;
  const model = stagehandConfig.model;
  let provider: 'anthropic' | 'openai';

  // Set provider based on available API keys
  if (process.env.ANTHROPIC_API_KEY) {
    provider = 'anthropic';
  } else if (process.env.OPENAI_API_KEY) {
    provider = 'openai';
  } else {
    throw new Error(
      'Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required for Stagehand. Please set one in your environment or add it to ~/.cursor-tools/.env file.'
    );
  }

  return {
    provider,
    headless,
    verbose,
    debugDom,
    enableCaching,
    timeout,
    model,
  };
}

export function validateStagehandConfig(config: StagehandConfig): void {
  if (!config) {
    throw new Error('Stagehand configuration is missing');
  }

  if (!config.provider || !['anthropic', 'openai'].includes(config.provider)) {
    throw new Error('Invalid Stagehand provider. Must be either "anthropic" or "openai".');
  }

  // Check for required API key based on provider
  const requiredKey = config.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
  if (!process.env[requiredKey]) {
    throw new Error(
      `${requiredKey} is required for Stagehand ${config.provider} provider. ` +
        `Please set it in your .cursor-tools.env file.`
    );
  }
}

export function getStagehandApiKey(config: StagehandConfig): string {
  const apiKey =
    config.provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      `API key not found for ${config.provider} provider. ` +
        `Please set ${config.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'} ` +
        `in your .cursor-tools.env file.`
    );
  }

  return apiKey;
}

/**
 * Get the Stagehand model to use based on the following precedence:
 * 1. Command line option (--model)
 * 2. Configuration file (cursor-tools.config.json)
 * 3. Default model based on provider (claude-3-5-sonnet-latest for Anthropic, o3-mini for OpenAI)
 * 
 * If both command line and config models are invalid, falls back to the default model for the provider.
 * 
 * @param config The Stagehand configuration
 * @param options Optional command line options
 * @returns The model to use
 * @throws Error if an invalid model is provided and no valid default is available
 */
export function getStagehandModel(config: StagehandConfig, options?: { model?: string }): AvailableModel {
  // Command line option takes precedence
  if (options?.model) {
    const parseResult = availableModels.safeParse(options.model);
    if (!parseResult.success) {
      throw new Error(
        `Invalid model: ${options.model}. Available models: ${Object.values(availableModels.enum).join(', ')}`
      );
    }
    return parseResult.data;
  }

  // Config model is next in precedence
  if (config.model) {
    const parseResult = availableModels.safeParse(config.model);
    if (!parseResult.success) {
      throw new Error(
        `Invalid model in config: ${config.model}. Available models: ${Object.values(availableModels.enum).join(', ')}`
      );
    }
    return parseResult.data;
  }

  // Default models as fallback
  const defaultModel = config.provider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'o3-mini';
  const parseResult = availableModels.safeParse(defaultModel);
  if (!parseResult.success) {
    throw new Error(`Default model is not valid: ${defaultModel}`);
  }

  return defaultModel;
}
