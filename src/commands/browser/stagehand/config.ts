import { z } from 'zod';

// Define available models
const anthropicModels = z.enum(['claude-3-5-sonnet-latest']);
const openaiModels = z.enum(['o3-mini', 'gpt-4o']);
// Allow any string for Groq models since they change frequently
export const availableModels = z.union([anthropicModels, openaiModels, z.string()]);

export type AvailableModel = z.infer<typeof availableModels>;

export interface StagehandConfig {
  provider: 'anthropic' | 'openai' | 'groq';
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
    provider?: string;
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
  let provider: 'anthropic' | 'openai' | 'groq' | undefined = stagehandConfig.provider?.toLowerCase() as any;

  if (!provider) {
    // Set provider based on available API keys
    if (process.env.ANTHROPIC_API_KEY) {
      provider = 'anthropic';
      if (process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY) {
        console.log('Defaulting to anthropic as AI provider for Stagehand');
      }
    } else if (process.env.OPENAI_API_KEY) {
      provider = 'openai';
      if (process.env.GROQ_API_KEY) {
        console.log('Defaulting to openai as AI provider for Stagehand');
      }
    } else if (process.env.GROQ_API_KEY) {
      provider = 'groq';
    } else {
      throw new Error(
        'Either ANTHROPIC_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY is required for Stagehand. Please set one in your environment or add it to ~/.cursor-tools/.env file.'
      );
    }
  } else {
    switch (provider) {
      case 'anthropic': {
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error(
            'ANTHROPIC_API_KEY is required when Stagehand is configured to use Anthropic. Please set one in your environment or add it to ~/.cursor-tools/.env file.'
          );
        }
        break;
      }
      case 'openai': {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error(
            'OPENAI_API_KEY is required when Stagehand is configured to use OpenAI. Please set one in your environment or add it to ~/.cursor-tools/.env file.'
          );
        }
        break;
      }
      case 'groq': {
        if (!process.env.GROQ_API_KEY) {
          throw new Error(
            'GROQ_API_KEY is required when Stagehand is configured to use Groq. Please set one in your environment or add it to ~/.cursor-tools/.env file.'
          );
        }
        break;
      }
      default:
        throw new Error('Unrecognized AI provider for stagehand ' + provider);
    }
  }

  return {
    provider,
    headless,
    verbose,
    debugDom,
    enableCaching,
    timeout,
    model: stagehandConfig.model,
  };
}

export function validateStagehandConfig(config: StagehandConfig): void {
  if (!config) {
    throw new Error('Stagehand configuration is missing');
  }

  if (!config.provider || !['anthropic', 'openai', 'groq'].includes(config.provider)) {
    throw new Error('Invalid Stagehand provider. Must be either "anthropic", "openai", or "groq".');
  }

  // Check for required API key based on provider
  let requiredKey: string;
  switch (config.provider) {
    case 'anthropic':
      requiredKey = 'ANTHROPIC_API_KEY';
      break;
    case 'openai':
      requiredKey = 'OPENAI_API_KEY';
      break;
    case 'groq':
      requiredKey = 'GROQ_API_KEY';
      break;
  }

  if (!process.env[requiredKey]) {
    throw new Error(
      `${requiredKey} is required for Stagehand ${config.provider} provider. ` +
        `Please set it in your .cursor-tools.env file.`
    );
  }
}

export function getStagehandApiKey(config: StagehandConfig): string {
  let apiKey: string | undefined;
  switch (config.provider) {
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY;
      break;
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY;
      break;
    case 'groq':
      apiKey = process.env.GROQ_API_KEY;
      break;
  }

  if (!apiKey) {
    const keyName = `${config.provider.toUpperCase()}_API_KEY`;
    throw new Error(
      `API key not found for ${config.provider} provider. ` +
        `Please set ${keyName} in your .cursor-tools.env file.`
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
 * For Groq, there is no default model - it must be specified via command line or config.
 * For other providers, if both command line and config models are invalid, falls back to the default model.
 *
 * @param config The Stagehand configuration
 * @param options Optional command line options
 * @returns The model to use, or undefined for Groq if no model specified
 */
export function getStagehandModel(
  config: StagehandConfig,
  options?: { model?: string }
): AvailableModel | undefined {
  // If a model is specified (via command line or config), validate and use it
  const modelToUse = options?.model ?? config.model;

  // For Groq, just return the model name without validation
  if (config.provider === 'groq') {
    return modelToUse as AvailableModel;
  }

  if (modelToUse) {
    const parseAttempt = availableModels.safeParse(modelToUse);
    if (parseAttempt.success) {
      return parseAttempt.data;
    }
    console.warn(
      `Warning: Using unfamiliar model "${modelToUse}" this may be a mistake. ` +
        `Typical models are "claude-3-5-sonnet-latest" for Anthropic and "o3-mini" or "gpt-4o" for OpenAI.`
    );
    return modelToUse as AvailableModel;
  }

  // Otherwise use defaults based on provider
  switch (config.provider as 'anthropic' | 'openai' | 'groq') {
    case 'anthropic': {
      return 'claude-3-5-sonnet-latest';
    }
    case 'openai': {
      return 'o3-mini';
    }
    case 'groq': {
      return undefined; // No default model for Groq
    }
  }
}
