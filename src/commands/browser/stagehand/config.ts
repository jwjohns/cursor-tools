import type { AvailableModel } from '@browserbasehq/stagehand';

export interface StagehandConfig {
  provider: 'anthropic' | 'openai';
  headless: boolean;
  verbose: boolean;
  debugDom: boolean;
  enableCaching: boolean;
  timeout?: number;
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

export function getStagehandModel(config: StagehandConfig): AvailableModel {
  return config.provider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'o3-mini';
}
