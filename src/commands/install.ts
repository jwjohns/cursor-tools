import type { Command, CommandGenerator, CommandOptions } from '../types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { loadEnv } from '../config';
import { CURSOR_RULES_TEMPLATE, CURSOR_RULES_VERSION, checkCursorRules } from '../cursorrules';

interface InstallOptions extends CommandOptions {
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  global?: boolean;
}

// Helper function to get user input and properly close stdin
async function getUserInput(prompt: string): Promise<string> {
  return new Promise<string>((resolve) => {
    process.stdout.write(prompt);
    const onData = (data: Buffer) => {
      const input = data.toString().trim();
      process.stdin.removeListener('data', onData);
      process.stdin.pause();
      resolve(input);
    };
    process.stdin.resume();
    process.stdin.once('data', onData);
  });
}

async function askForCursorRulesDirectory(): Promise<boolean> {
  // If USE_LEGACY_CURSORRULES is explicitly set, respect that setting
  if (process.env.USE_LEGACY_CURSORRULES === 'true') {
    return false;
  }
  if (process.env.USE_LEGACY_CURSORRULES === 'false') {
    return true;
  }

  // Otherwise, ask the user
  const answer = await getUserInput(
    'Would you like to use the new .cursor/rules directory for cursor rules? (y/N): '
  );
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

export class InstallCommand implements Command {
  private async *setupApiKeys(): CommandGenerator {
    loadEnv(); // Load existing env files if any

    const homeEnvPath = join(homedir(), '.cursor-tools', '.env');
    const localEnvPath = join(process.cwd(), '.cursor-tools.env');

    // Check if keys are already set
    const hasPerplexity = !!process.env.PERPLEXITY_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const hasModelBox = !!process.env.MODELBOX_API_KEY;

    // For Stagehand, we need either OpenAI or Anthropic
    const hasStagehandProvider = hasOpenAI || hasAnthropic;

    if (
      hasPerplexity &&
      hasGemini &&
      hasOpenRouter &&
      hasModelBox &&
      (hasStagehandProvider || process.env.SKIP_STAGEHAND)
    ) {
      return;
    }

    // Function to write keys to a file
    const writeKeysToFile = (filePath: string, keys: Record<string, string>) => {
      const envContent = `${Object.entries(keys)
        .filter(([_, value]) => value) // Only include keys with values
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')}\n`;

      const dir = join(filePath, '..');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(filePath, envContent, 'utf-8');
    };

    // Try to write to home directory first, fall back to local if it fails
    try {
      const keys: Record<string, string> = {
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
        MODELBOX_API_KEY: process.env.MODELBOX_API_KEY || '',
        SKIP_STAGEHAND: process.env.SKIP_STAGEHAND || '',
      };

      if (!hasPerplexity) {
        const key = await getUserInput('Enter your Perplexity API key (or press Enter to skip): ');
        keys.PERPLEXITY_API_KEY = key;
      }

      if (!hasGemini) {
        const key = await getUserInput('Enter your Gemini API key (or press Enter to skip): ');
        keys.GEMINI_API_KEY = key;
      }

      if (!hasOpenRouter) {
        yield '\nOpenRouter provides access to various AI models including Perplexity models.\n';
        yield 'It can be used as an alternative to direct Perplexity access for web search.\n';
        const key = await getUserInput('Enter your OpenRouter API key (or press Enter to skip): ');
        keys.OPENROUTER_API_KEY = key;
      }

      if (!hasModelBox) {
        yield '\nModelBox provides unified access to various AI models through an OpenAI-compatible API.\n';
        const key = await getUserInput('Enter your ModelBox API key (or press Enter to skip): ');
        keys.MODELBOX_API_KEY = key;
      }

      // Handle Stagehand setup
      if (!hasStagehandProvider && !process.env.SKIP_STAGEHAND) {
        yield '\nStagehand requires either an OpenAI or Anthropic API key to function: ';
        const skipStagehand = await getUserInput('Would you like to skip Stagehand setup? (y/N): ');
        if (skipStagehand.toLowerCase() === 'y' || skipStagehand.toLowerCase() === 'yes') {
          keys.SKIP_STAGEHAND = 'true';
          yield 'Skipping Stagehand setup.\n';
        } else {
          yield '\n';
          if (!hasOpenAI) {
            const key = await getUserInput(
              'Enter your OpenAI API key (required for Stagehand if not using Anthropic): '
            );
            keys.OPENAI_API_KEY = key;
          }

          if (!hasAnthropic && !keys.OPENAI_API_KEY) {
            const key = await getUserInput(
              'Enter your Anthropic API key (required for Stagehand if not using OpenAI): '
            );
            keys.ANTHROPIC_API_KEY = key;
          }

          // Validate that at least one Stagehand provider key is set if not skipped
          if (!keys.OPENAI_API_KEY && !keys.ANTHROPIC_API_KEY) {
            yield '\nWarning: No API key provided for Stagehand. You will need to set either OPENAI_API_KEY or ANTHROPIC_API_KEY to use Stagehand features.\n';
          }
        }
      }

      try {
        writeKeysToFile(homeEnvPath, keys);
        yield 'API keys written to ~/.cursor-tools/.env\n';
      } catch (error) {
        console.error('Error writing API keys to home directory:', error);
        // Fall back to local file if home directory write fails
        writeKeysToFile(localEnvPath, keys);
        yield 'API keys written to .cursor-tools.env in the current directory\n';
      }
    } catch (error) {
      console.error('Error setting up API keys:', error);
      yield 'Error setting up API keys. You can add them later manually.\n';
    }
  }

  async *execute(targetPath: string, options?: InstallOptions): CommandGenerator {
    const packageManager = options?.packageManager || 'npm/yarn/pnpm';
    const absolutePath = join(process.cwd(), targetPath);

    // 1. Add cursor-tools to package.json as a dev dependency if it exists
    const packageJsonPath = join(absolutePath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const currentVersion =
          packageJson.devDependencies?.['cursor-tools'] ||
          packageJson.dependencies?.['cursor-tools'];

        if (currentVersion === 'latest') {
          yield 'cursor-tools is already installed at latest version.\n';
        } else if (currentVersion) {
          yield `Found cursor-tools version ${currentVersion}. Would you like to update to latest? (y/N): `;
          const answer = await getUserInput('');

          if (answer === 'y' || answer === 'yes') {
            if (!packageJson.devDependencies) {
              packageJson.devDependencies = {};
            }
            packageJson.devDependencies['cursor-tools'] = 'latest';
            // Remove from dependencies if it exists there
            if (packageJson.dependencies?.['cursor-tools']) {
              delete packageJson.dependencies['cursor-tools'];
            }
            writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            yield `Updated cursor-tools to latest version. Please run \`${packageManager} install\` to complete the update.\n`;
          } else {
            yield 'Keeping current version.\n';
          }
        } else {
          const answer = await getUserInput(
            'Would you like to add cursor-tools as a dev dependency to package.json? (y/N): '
          );

          if (answer === 'y' || answer === 'yes') {
            yield 'Adding cursor-tools as a dev dependency to package.json...\n';
            if (!packageJson.devDependencies) {
              packageJson.devDependencies = {};
            }
            packageJson.devDependencies['cursor-tools'] = 'latest';
            writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            yield `Please run \`${packageManager} install\` to complete the installation.\n`;
          } else {
            yield 'Skipping dev dependency installation.\n';
          }
        }
      } catch (error) {
        yield `Error updating package.json: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
        return;
      }
    } else {
      yield 'No package.json found - skipping dependency installation\n';
    }

    // 3. Setup API keys
    yield 'Checking API keys setup...\n';
    for await (const message of this.setupApiKeys()) {
      yield message;
    }

    // 4. Update/create cursor rules
    try {
      yield 'Checking cursor rules...\n';

      // Ask user for directory preference first
      const useNewDirectory = await askForCursorRulesDirectory();
      process.env.USE_LEGACY_CURSORRULES = (!useNewDirectory).toString();

      // Create necessary directories only if using new structure
      if (useNewDirectory) {
        const rulesDir = join(absolutePath, '.cursor', 'rules');
        if (!existsSync(rulesDir)) {
          try {
            mkdirSync(rulesDir, { recursive: true });
          } catch (error) {
            yield `Error creating rules directory: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
            return;
          }
        }
      }

      const result = checkCursorRules(absolutePath);

      if (result.kind === 'error') {
        yield `Error: ${result.message}\n`;
        return;
      }

      let existingContent = '';
      let needsUpdate = result.needsUpdate;

      if (result.hasLegacyCursorRulesFile) {
        yield '\n🚧 Warning: Using legacy .cursorrules file. This file will be deprecated in a future release.\n' +
          'To migrate to the new format:\n' +
          '  1) Set USE_LEGACY_CURSORRULES=false in your environment\n' +
          '  2) Run cursor-tools install . again\n' +
          '  3) Remove the <cursor-tools Integration> section from .cursorrules\n\n';
      }

      if (existsSync(result.targetPath)) {
        existingContent = readFileSync(result.targetPath, 'utf-8');
        const versionMatch = existingContent.match(/<!-- cursor-tools-version: ([\w.-]+) -->/);
        const currentVersion = versionMatch ? versionMatch[1] : '0';

        if (needsUpdate) {
          // Ask for confirmation before overwriting
          yield `\nAbout to update cursor rules file at ${result.targetPath} from version ${currentVersion} to ${CURSOR_RULES_VERSION}.\n`;
          const answer = await getUserInput('Do you want to continue? (y/N): ');
          if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            yield 'Skipping cursor rules update.\n';
            yield 'Warning: Your cursor rules are outdated. You may be missing new features and instructions.\n';
            return;
          }
          yield `Updating cursor rules...\n`;
        }
      } else {
        yield `Creating new cursor rules file at ${result.targetPath}...\n`;
      }

      if (needsUpdate) {
        // Replace existing cursor-tools section or append if not found
        const startTag = '<cursor-tools Integration>';
        const endTag = '</cursor-tools Integration>';
        const startIndex = existingContent.indexOf(startTag);
        const endIndex = existingContent.indexOf(endTag);

        if (startIndex !== -1 && endIndex !== -1) {
          // Replace existing section
          const newContent =
            existingContent.slice(0, startIndex) +
            CURSOR_RULES_TEMPLATE.trim() +
            existingContent.slice(endIndex + endTag.length);
          writeFileSync(result.targetPath, newContent);
        } else {
          // Append new section
          writeFileSync(result.targetPath, existingContent + CURSOR_RULES_TEMPLATE);
        }
      }

      yield 'Installation completed successfully!\n';
    } catch (error) {
      yield `Error updating cursor rules: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
    }
  }
}
