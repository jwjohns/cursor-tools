
--- Repository Documentation ---

```markdown
# Cursor Tools Documentation for AI Agents

## 1. Repository Purpose and Summary

**Cursor Tools** is a command-line interface (CLI) application designed to enhance the capabilities of AI coding agents, particularly Cursor Composer. It provides a suite of tools that enable AI agents to:

*   **Perform Web Searches**: Utilize Perplexity AI and OpenRouter for up-to-date information retrieval.
*   **Analyze Codebases**: Leverage Google Gemini for deep understanding of repositories, generating implementation plans and documentation.
*   **Automate Browser Interactions**: Employ Stagehand AI to control and interact with web browsers for testing, data extraction, and web automation tasks.
*   **Interact with GitHub**: Access and manage GitHub Issues and Pull Requests directly from the command line.

Cursor Tools effectively acts as an **AI team**, providing specialized skills and integrations to augment the abilities of a primary coding agent.

## 2. Quick Start

### Installation

To install Cursor Tools, use npm:

```bash
npm install -g cursor-tools
```

Alternatively, you can run it without global installation using `npx`:

```bash
npx cursor-tools@latest <command> <query> [options]
```

After installation, it's recommended to run the setup command to configure API keys and integrate Cursor Tools with your Cursor project:

```bash
cursor-tools install .
```

This command will guide you through setting up necessary API keys and update your Cursor project rules to enable seamless integration.

### Basic Usage Example: Web Search

To perform a web search using Perplexity AI, use the `web` command:

```bash
cursor-tools web "What is the latest version of React?"
```

This will query Perplexity AI and output the search results directly to your console.

## 3. Configuration Options

Cursor Tools can be configured using a `cursor-tools.config.json` file and environment variables.

### Configuration File (`cursor-tools.config.json`)

You can create a `cursor-tools.config.json` file in your project root or in `~/.cursor-tools/` directory to customize default settings.

```json
{
  "perplexity": {
    "model": "sonar-pro"
  },
  "gemini": {
    "model": "gemini-2.0-flash-thinking-exp",
    "maxTokens": 10000
  },
  "openai": {
    "model": "o3-mini",
    "maxTokens": 10000
  },
  "plan": {
    "fileProvider": "gemini",
    "thinkingProvider": "openai",
    "fileMaxTokens": 8192,
    "thinkingMaxTokens": 8192
  },
  "repo": {
    "provider": "gemini",
    "maxTokens": 10000
  },
  "doc": {
    "maxRepoSizeMB": 100,
    "provider": "gemini",
    "maxTokens": 10000
  },
  "tokenCount": {
    "encoding": "o200k_base"
  },
  "browser": {
    "headless": true,
    "defaultViewport": "1280x720",
    "timeout": 120000
  },
  "stagehand": {
    "provider": "openai",
    "verbose": true,
    "debugDom": false,
    "enableCaching": true
  }
}
```

**Configuration Options:**

*   **`perplexity.model`**: Default Perplexity AI model (e.g., `sonar-pro`).
*   **`perplexity.maxTokens`**: Maximum tokens for Perplexity responses.
*   **`gemini.model`**: Default Google Gemini model (e.g., `gemini-2.0-flash-thinking-exp`).
*   **`gemini.maxTokens`**: Maximum tokens for Gemini responses.
*   **`openai.model`**: Default OpenAI model (e.g., `o3-mini`).
*   **`openai.maxTokens`**: Maximum tokens for OpenAI responses.
*   **`plan.fileProvider`**: Default provider for file identification in `plan` command (`gemini`, `openai`, `openrouter`).
*   **`plan.thinkingProvider`**: Default provider for plan generation in `plan` command (`gemini`, `openai`, `openrouter`).
*   **`plan.fileMaxTokens`**: Maximum tokens for file identification in `plan` command.
*   **`plan.thinkingMaxTokens`**: Maximum tokens for plan generation in `plan` command.
*   **`repo.provider`**: Default provider for `repo` command (`gemini`, `openai`, `openrouter`, `perplexity`, `modelbox`).
*   **`repo.maxTokens`**: Maximum tokens for `repo` command responses.
*   **`doc.maxRepoSizeMB`**: Maximum repository size (MB) for remote documentation generation.
*   **`doc.provider`**: Default provider for `doc` command (`gemini`, `openai`, `openrouter`, `perplexity`, `modelbox`).
*   **`doc.maxTokens`**: Maximum tokens for `doc` command responses.
*   **`tokenCount.encoding`**: Tokenizer encoding (`o200k_base`, `gpt2`, etc.).
*   **`browser.headless`**: Default headless mode for browser commands (`true` or `false`).
*   **`browser.defaultViewport`**: Default viewport size for browser commands (e.g., `"1280x720"`).
*   **`browser.timeout`**: Default timeout (milliseconds) for browser commands.
*   **`stagehand.provider`**: Default provider for Stagehand browser automation (`openai` or `anthropic`).
*   **`stagehand.verbose`**: Verbosity level for Stagehand logging (`true` or `false`).
*   **`stagehand.debugDom`**: Enable debug output for Stagehand DOM processing (`true` or `false`).
*   **`stagehand.enableCaching`**: Enable caching for Stagehand API calls (`true` or `false`).

### Environment Variables

API keys are primarily configured through environment variables. Create a `.cursor-tools.env` file in your project root or `~/.cursor-tools/.env` in your home directory to set these keys:

```env
PERPLEXITY_API_KEY="your_perplexity_api_key"
GEMINI_API_KEY="your_gemini_api_key"
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"
MODELBOX_API_KEY="your_modelbox_api_key"
```

*   **`PERPLEXITY_API_KEY`**: API key for Perplexity AI.
*   **`GEMINI_API_KEY`**: API key for Google Gemini.
*   **`OPENAI_API_KEY`**: API key for OpenAI (required for Stagehand if not using Anthropic).
*   **`ANTHROPIC_API_KEY`**: API key for Anthropic (required for Stagehand if not using OpenAI).
*   **`OPENROUTER_API_KEY`**: API key for OpenRouter.
*   **`MODELBOX_API_KEY`**: API key for ModelBox.
*   **`GITHUB_TOKEN`**: GitHub Personal Access Token (for GitHub commands).
*   **`USE_LEGACY_CURSORRULES`**: Set to `true` to use legacy `.cursorrules` file, `false` for new `.cursor/rules/cursor-tools.mdc`.

## 4. Package Documentation

Cursor Tools is structured into several packages, each providing specific functionalities.

### 4.1. `src/commands` Package

#### 4.1.1. Package Summary

The `commands` package is the core of `cursor-tools`, containing implementations for all CLI commands and subcommands. It handles command parsing, option processing, and execution logic, orchestrating interactions with other packages and AI providers.

#### 4.1.2. Installation/Import

This package is internal to `cursor-tools` and is not intended for direct external import.

#### 4.1.3. Public Features / API / Interfaces

*   **`commands` (Exported Map)**: A map in `src/commands/index.ts` that registers all available commands. Each key is the command name (e.g., `web`, `repo`, `doc`), and the value is an instance of the corresponding command class.

    ```typescript
    import { commands } from './commands/index.ts';

    console.log(Object.keys(commands)); // Output: ['web', 'repo', 'install', 'doc', 'github', 'browser', 'plan']
    ```

*   **`WebCommand`**: Implements the `web` command for web search using AI providers.
    *   `execute(query: string, options?: CommandOptions): CommandGenerator` - Executes the web search based on the provided query and options.

*   **`RepoCommand`**: Implements the `repo` command for repository analysis using AI providers.
    *   `execute(query: string, options?: CommandOptions): CommandGenerator` - Executes repository analysis based on the provided query and options.

*   **`InstallCommand`**: Implements the `install` command for setting up Cursor Tools and API keys.
    *   `execute(targetPath: string, options?: InstallOptions): CommandGenerator` - Executes the installation and setup process.

*   **`DocCommand`**: Implements the `doc` command for generating repository documentation.
    *   `execute(query: string, options?: DocCommandOptions): CommandGenerator` - Executes documentation generation based on the provided query and options.

*   **`GithubCommand`**: Implements the `github` command and subcommands (`pr`, `issue`) for GitHub interaction.
    *   `execute(query: string, options?: CommandOptions): CommandGenerator` - Executes the github command, parsing subcommands and queries.

*   **`BrowserCommand`**: Implements the `browser` command and subcommands (`open`, `element`, `act`, `extract`, `observe`) for browser automation.
    *   `execute(query: string, options?: CommandOptions): CommandGenerator` - Executes the browser command, parsing subcommands and queries.

*   **`PlanCommand`**: Implements the `plan` command for generating implementation plans for software development tasks.
    *   `execute(query: string, options?: PlanCommandOptions): CommandGenerator` - Executes plan generation based on the provided query and options.

#### 4.1.4. Dependencies and Requirements

*   `src/types.ts`: For command interfaces (`Command`, `CommandGenerator`, `CommandOptions`) and type definitions.
*   `src/config.ts`: For loading configuration settings.
*   `src/providers`: For AI provider integrations.
*   `repomix`: For repository packing functionality.
*   `node:fs`, `node:path`, `node:os`: Node.js built-in modules for file system and path operations.

#### 4.1.5. Advanced Usage Examples

To extend `cursor-tools` with a new command, you would:

1.  Create a new file in `src/commands` (or a subdirectory for grouped commands) implementing a class that conforms to the `Command` interface from `src/types.ts`.
2.  Implement the `execute` method as an asynchronous generator function (`async * execute(...)`) to yield output strings.
3.  Register the new command in the `commands` map in `src/commands/index.ts`.

### 4.2. `src/providers` Package

#### 4.2.1. Package Summary

The `providers` package encapsulates integrations with different AI provider APIs, such as Gemini, OpenAI, Perplexity, and OpenRouter. It provides a consistent interface (`BaseModelProvider`) for executing prompts and handling responses from these providers.

#### 4.2.2. Installation/Import

This package is internal to `cursor-tools` and is not intended for direct external import. To use providers within `cursor-tools`, import the factory function `createProvider` from `src/providers/base.ts`.

```typescript
import { createProvider } from './providers/base';

const geminiProvider = createProvider('gemini');
// Use geminiProvider to execute prompts
```

#### 4.2.3. Public Features / API / Interfaces

*   **`createProvider(provider: Provider)` (Factory Function)**:  A factory function in `src/providers/base.ts` that returns an instance of the appropriate provider class based on the `provider` string argument (e.g., `'gemini'`, `'openai'`).

*   **`BaseModelProvider` (Interface)**: Defines the common interface for all provider classes.
    *   `executePrompt(prompt: string, options?: ModelOptions): Promise<string>`: Executes a prompt using the provider's API and returns the text response.
    *   `supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string }`: Checks if a given model supports web search functionality.

*   **Provider Classes (`GeminiProvider`, `OpenAIProvider`, `OpenRouterProvider`, `PerplexityProvider`, `ModelBoxProvider`)**: Concrete implementations of `BaseModelProvider` for each supported AI provider. Each class handles provider-specific API calls, authentication, and response parsing.

    *   Each provider class extends `BaseProvider` and implements `executePrompt` and `supportsWebSearch` methods.
    *   Constructors handle API key retrieval from environment variables and client initialization.

*   **`ModelOptions` (Interface)**: Defines the options that can be passed to `executePrompt` method.
    *   `model?: string`: The AI model to use (provider-specific model name).
    *   `maxTokens?: number`: Maximum tokens for the response.
    *   `systemPrompt?: string`: System prompt to guide the AI's behavior.
    *   `tokenCount?: number`: Token count of the input, used for handling large inputs.
    *   `webSearch?: boolean`: Enable or disable web search functionality (if supported by the provider/model).
    *   `timeout?: number`: Timeout for API calls in milliseconds.
    *   `debug?: boolean`: Enable debug logging.

#### 4.2.4. Dependencies and Requirements

*   `src/types.ts`: For `Config` and `Provider` type definitions.
*   `src/config.ts`: For loading configuration settings.
*   `src/errors.ts`: For custom error classes (`ApiKeyMissingError`, `ModelNotFoundError`, `NetworkError`, `ProviderError`).
*   `src/utils/exhaustiveMatchGuard.ts`: For exhaustive match checking in switch statements.
*   `src/utils/messageChunker.ts`: For chunking large messages for providers with input limits.
*   `openai`: OpenAI Node.js SDK.
*   `dotenv`: For loading environment variables.
*   `node-fetch`: For making HTTP requests.

#### 4.2.5. Advanced Usage Examples

To add support for a new AI provider:

1.  Create a new file in `src/providers` (e.g., `newProvider.ts`) and implement a new class (e.g., `NewProvider`) that extends `BaseProvider` and implements `BaseModelProvider` interface.
2.  Implement the `executePrompt` method to handle API calls to the new provider, authentication, request formatting, and response parsing.
3.  Implement the `supportsWebSearch` method to indicate if the provider supports web search and handle model compatibility if needed.
4.  Update the `createProvider` factory function in `src/providers/base.ts` to include a case for the new provider, returning an instance of the `NewProvider` class.
5.  Add the new provider's name to the `Provider` type in `src/types.ts`.

### 4.3. `src/repomix` Package

#### 4.3.1. Package Summary

The `repomix` package contains configuration related to Repomix, a tool used by Cursor Tools to pack repository contents into a single text representation for AI analysis. It defines default ignore patterns, include patterns, and output options for Repomix.

#### 4.3.2. Installation/Import

This package is internal to `cursor-tools` and is not intended for direct external import.

#### 4.3.3. Public Features / API / Interfaces

*   **`ignorePatterns` (Exported Array)**: An array of glob patterns defining files and directories to be excluded by Repomix during repository packing.
*   **`includePatterns` (Exported Array)**: An array of glob patterns defining files and directories to be included by Repomix during repository packing.
*   **`outputOptions` (Exported Object)**: An object defining the output format and options for Repomix, such as style (`xml`), file summary, directory structure, etc.

#### 4.3.4. Dependencies and Requirements

*   None directly within this package. However, it is used by other parts of `cursor-tools` that depend on `repomix` package.

#### 4.3.5. Advanced Usage Examples

To customize Repomix behavior, you can modify `ignorePatterns` and `includePatterns` in `src/repomix/repomixConfig.ts`. For more advanced customization, you might need to adjust the Repomix call within the `RepoCommand`, `DocCommand`, and `PlanCommand` in `src/commands` package.

### 4.4. `src/types` Package

#### 4.4.1. Package Summary

The `types` package defines TypeScript interfaces and type aliases used throughout Cursor Tools. It provides type safety and structure for commands, command options, configuration, and browser automation functionalities.

#### 4.4.2. Installation/Import

This package is internal to `cursor-tools`. Types are imported as needed throughout the codebase.

#### 4.4.3. Public Features / API / Interfaces

*   **`CommandGenerator` (Type Alias)**: Defines the type for command execution functions as asynchronous generators that yield strings.
*   **`Provider` (Type Alias)**: Defines a union type for all supported AI provider names (`'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox'`).
*   **`CommandOptions` (Interface)**: Defines the base options shared by all CLI commands, including `model`, `maxTokens`, `provider`, `debug`, `saveTo`, `quiet`, and `hint`.
*   **`Config` (Interface)**: Defines the structure of the `cursor-tools.config.json` configuration file, including nested configurations for different commands and providers.
*   **`Command` (Interface)**: Defines the interface for all command classes, requiring an `execute` method.
*   **`CommandMap` (Interface)**: Defines a map structure for registering commands, where keys are command names and values are `Command` instances.
*   **`BrowserCommandOptions`, `OpenCommandOptions`, `SharedBrowserCommandOptions` (Interfaces)**: Define options specific to browser commands and the `open` subcommand, extending `CommandOptions`.
*   **`StagehandConfig`, `LLMProvider`, `ActOptions`, `ExtractOptions`, `ObserveOptions`, `ObservationResult`, `BrowserCommandOptions`, `ExtractCommandOptions`, `ActCommandOptions`, `ObserveCommandOptions` (Interfaces)**: Define types and interfaces specific to the browser and Stagehand functionalities, located in `src/types/browser/browser.ts`.

#### 4.4.4. Dependencies and Requirements

*   `zod`: For schema validation in browser command types (`src/types/browser/browser.ts`).

#### 4.4.5. Advanced Usage Examples

To add new options to commands or define new configuration settings, you would typically modify interfaces within the `types` package, ensuring type consistency across the codebase.

### 4.5. `src/utils` Package

#### 4.5.1. Package Summary

The `utils` package contains utility functions and helper modules used across Cursor Tools. These include functions for exhaustive match checking in switch statements, message chunking for AI providers, and memoization.

#### 4.5.2. Installation/Import

This package is internal to `cursor-tools`. Utilities are imported as needed throughout the codebase.

#### 4.5.3. Public Features / API / Interfaces

*   **`exhaustiveMatchGuard(value: never, customError?: string)` (Function)**: A utility function in `src/utils/exhaustiveMatchGuard.ts` that ensures exhaustive matching in switch statements, throwing an error if a case is not handled.
*   **`chunkMessage(message: string, limit: number)` (Function)**: A function in `src/utils/messageChunker.ts` that chunks a long message into smaller parts to fit within a character limit, useful for handling provider token limits.
*   **`once<T>(fn: () => T)` (Function)**: A higher-order function in `src/utils/once.ts` that ensures a function is executed only once and returns the cached result for subsequent calls.

#### 4.5.4. Dependencies and Requirements

*   None.

#### 4.5.5. Advanced Usage Examples

The utilities in this package are designed to be reusable across different parts of Cursor Tools. To add a new utility function, create a new file in `src/utils` and export the function, then import it where needed.

## 5. Dependencies and Requirements

Cursor Tools has the following main dependencies:

*   **`@browserbasehq/stagehand`**: For browser automation functionalities.
*   **`dotenv`**: For loading environment variables from `.env` files.
*   **`eventsource-client`**: For handling server-sent events (SSE) in some providers (potentially for future streaming support).
*   **`openai`**: OpenAI Node.js SDK for interacting with OpenAI models.
*   **`punycode`**: For punycode encoding/decoding (dependency of other packages).
*   **`repomix`**: For repository packing and analysis.
*   **`zod`**: For schema validation and type definitions.
*   **`playwright`**: (Peer Dependency) For browser automation; needs to be installed separately.

**Requirements:**

*   Node.js version 18 or later.
*   API keys for Perplexity, Gemini, OpenAI/Anthropic (for Stagehand), and OpenRouter/ModelBox if you intend to use those providers.
*   Playwright needs to be installed separately (`npm install playwright`) to use browser commands.

## 6. Advanced Usage Examples

### 6.1. Customizing Repomix Ignore Patterns

To exclude specific files or directories from repository analysis, create a `.repomixignore` file in your project root and list the patterns to ignore, one per line, similar to `.gitignore`.

### 6.2. Running Commands with Specific Models or Providers

Override default model and provider settings using command-line options:

```bash
# Run repo command with OpenAI provider and GPT-4 model
cursor-tools repo "Analyze code quality" --provider=openai --model=gpt-4

# Run web command with OpenRouter provider and specific model
cursor-tools web "Latest news on AI" --provider=openrouter --model=google/gemini-2.0-pro-exp-02-05:free

# Run doc command with Perplexity provider
cursor-tools doc --provider=perplexity --save-to=docs.md
```

### 6.3. Scripting with Cursor Tools

Use Cursor Tools in scripts by leveraging the `--save-to` and `--quiet` options. For example, to automatically generate documentation and save it to a file:

```bash
cursor-tools doc --save-to=docs.md --quiet
```

This command will generate documentation without printing to stdout and save the output directly to `docs.md`. You can then integrate this command into your build or deployment scripts.

### 6.4. Browser Automation Workflows

Combine browser commands for complex web automation tasks. For example, to test a login workflow and record a video:

```bash
cursor-tools browser act "Go to login page | Type 'testuser' in username field | Type 'password123' in password field | Click 'Login' button" --url="http://example.com/login" --video="./test-videos"
```

This will execute a multi-step action, record a video of the browser interaction, and save it to the `test-videos` directory.

This documentation provides a comprehensive overview of Cursor Tools, its architecture, features, configuration, and usage. It should enable AI agents to effectively utilize Cursor Tools to enhance their coding and problem-solving capabilities.
```

--- End of Documentation ---
