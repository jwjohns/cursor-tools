import type { Config } from './types';

export const defaultConfig: Config = {
  perplexity: {
    model: 'sonar-pro',
    maxTokens: 4000,
  },
  plan: {
    fileProvider: 'gemini',
    thinkingProvider: 'openrouter',
    fileModel: 'gemini-2.0-pro-exp',
    thinkingModel: 'deepseek/deepseek-r1',
    fileMaxTokens: 8192,
    thinkingMaxTokens: 8192,
  },
  repo: {
    provider: 'gemini',
    model: 'gemini-2.0-flash-thinking-exp',
    maxTokens: 10000,
  },
  doc: {
    maxRepoSizeMB: 100,
    provider: 'gemini',
    model: 'gemini-2.0-pro-exp',
    maxTokens: 10000,
  },
  tokenCount: {
    encoding: 'o200k_base',
  },
  browser: {
    headless: true,
    defaultViewport: '1280x720',
    timeout: 120000,
  },
  stagehand: {
    provider: 'openai',
    verbose: false,
    debugDom: false,
    enableCaching: true,
  },
};

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import dotenv from 'dotenv';

export function loadConfig(): Config {
  // Try loading from current directory first
  try {
    const localConfigPath = join(process.cwd(), 'cursor-tools.config.json');
    const localConfig = JSON.parse(readFileSync(localConfigPath, 'utf-8'));
    return { ...defaultConfig, ...localConfig };
  } catch {
    // If local config doesn't exist, try home directory
    try {
      const homeConfigPath = join(homedir(), '.cursor-tools', 'config.json');
      const homeConfig = JSON.parse(readFileSync(homeConfigPath, 'utf-8'));
      return { ...defaultConfig, ...homeConfig };
    } catch {
      // If neither config exists, return default config
      return defaultConfig;
    }
  }
}

export function loadEnv(): void {
  // Try loading from current directory first
  const localEnvPath = join(process.cwd(), '.cursor-tools.env');
  if (existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
    return;
  }

  // If local env doesn't exist, try home directory
  const homeEnvPath = join(homedir(), '.cursor-tools', '.env');
  if (existsSync(homeEnvPath)) {
    dotenv.config({ path: homeEnvPath });
    return;
  }

  // If neither env file exists, continue without loading
  return;
}
