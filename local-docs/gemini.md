
--- Repository Documentation ---

```markdown
# Cursor-Tools Documentation

## 1. Repository Purpose and "What is it" Summary

`cursor-tools` is a versatile command-line interface (CLI) tool designed to empower AI agents, particularly those integrated with Cursor Composer. It equips these agents with enhanced capabilities for web interaction, code analysis, documentation, and repository management.

At its core, `cursor-tools` provides a suite of commands that enable AI agents to:

- **Perform Web Searches**: Access real-time information via Perplexity AI and OpenRouter.
- **Analyze Repository Context**: Understand and reason about codebases using Google Gemini.
- **Generate Documentation**: Create comprehensive documentation for both local and remote repositories.
- **Interact with GitHub**: Fetch and analyze GitHub issues and pull requests.
- **Automate Browser Tasks**: Control and interact with web browsers using natural language instructions through Stagehand AI.

This toolkit is designed to augment AI agents, enabling them to perform complex development-related tasks more effectively within the Cursor IDE environment and beyond.

## 2. Quick Start: How to Install and Use the Basic Core Features

### Installation

To quickly get started with `cursor-tools`, install it globally using npm:

```bash
npm install -g cursor-tools
```

This command installs `cursor-tools` globally, making it accessible from your terminal.

### Basic Usage

Here are a few basic examples to demonstrate the core features:

**1. Web Search:**

```bash
cursor-tools web "What is the latest version of React?"
```

This command queries Perplexity AI to fetch the latest information about React.

**2. Repository Context:**

```bash
cursor-tools repo "Explain the component structure in this React application."
```

This command utilizes Google Gemini to analyze your current repository and provide insights into its component structure.

**3. Documentation Generation:**

```bash
cursor-tools doc --save-to=repository_docs.md
```

This command generates documentation for your local repository and saves it to `repository_docs.md`.

These examples showcase the fundamental capabilities of `cursor-tools` for web search, repository understanding, and documentation generation.

## 3. Configuration Options

`cursor-tools` can be configured via a `cursor-tools.config.json` file and environment variables for API keys.

### Configuration File (`cursor-tools.config.json`)

This file, located in your project root or `~/.cursor-tools/config.json`, allows customization of default settings:

```json
{
  "perplexity": {
    "model": "sonar-pro"
  },
  "gemini": {
    "model": "gemini-2.0-pro-exp"
  },
  "tokenCount": {
    "encoding": "o200k_base"
  },
  "browser": {
    "headless": true,
    "defaultViewport": "1280x720"
  }
}
```

**Configuration Options:**

- **`perplexity.model`**: Default Perplexity AI model (string).
- **`gemini.model`**: Default Google Gemini model (string).
- **`tokenCount.encoding`**: Tokenizer encoding (string).
- **`browser.headless`**: Default headless mode for browser commands (boolean).
- **`browser.defaultViewport`**: Default viewport size (string, e.g., "1280x720").

### Environment Variables (`.cursor-tools.env`)

API keys are securely configured using a `.cursor-tools.env` file in your project root or `~/.cursor-tools/.env` in your home directory:

```env
PERPLEXITY_API_KEY="your_perplexity_api_key"
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"
OPENROUTER_API_KEY="your-openrouter-api-key"
MODELBOX_API_KEY="your-modelbox-api-key"
GITHUB_TOKEN="your-github-token"
```

**Environment Variables:**

- **`PERPLEXITY_API_KEY`**: Perplexity API key (string).
- **`GEMINI_API_KEY`**: Google Gemini API key (string).
- **`OPENAI_API_KEY`**: OpenAI API key (string, for Stagehand).
- **`ANTHROPIC_API_KEY`**: Anthropic API key (string, for Stagehand).
- **`OPENROUTER_API_KEY`**: OpenRouter API key (string).
- **`MODELBOX_API_KEY`**: ModelBox API key (string).
- **`GITHUB_TOKEN`**: GitHub Personal Access Token (string, optional).

## 4. Public Packages Documentation

### 4.1. `commands` Package

#### 5. Package Summary

The `commands` package is the core of `cursor-tools`, containing implementations for all CLI commands such as `web`, `repo`, `doc`, `github`, and `browser`. Each command is implemented as a separate class, adhering to a consistent `Command` interface.

#### 6. Installation / Import

This package is internal and not intended for direct import. Commands are accessed via the CLI interface.

#### 7. Public Features / API / Interfaces

- **`WebCommand`**: Handles web search queries using Perplexity AI or OpenRouter.
  - `async *execute(query: string, options?: CommandOptions): CommandGenerator`: Executes the web search and yields results.
- **`RepoCommand`**: Provides context-aware repository analysis using Google Gemini.
  - `async *execute(query: string, options?: CommandOptions): CommandGenerator`: Analyzes the repository and yields context-aware responses.
- **`DocCommand`**: Generates repository documentation using AI.
  - `async *execute(query: string, options?: DocCommandOptions): CommandGenerator`: Generates documentation and yields output.
- **`GithubCommand`**: Provides access to GitHub issues and pull requests.
  - `async *execute(query: string, options?: CommandOptions): CommandGenerator`: Fetches and yields GitHub information.
- **`BrowserCommand`**: Orchestrates browser automation tasks using Stagehand AI.
  - `async *execute(query: string, options?: CommandOptions): CommandGenerator`: Executes browser automation commands.
- **`InstallCommand`**: Handles the installation and configuration process for `cursor-tools`.
  - `async *execute(targetPath: string, options?: InstallOptions): CommandGenerator`: Executes the installation steps.

#### 8. Dependencies and Requirements

- `repomix`
- `openai`
- `eventsource-client`
- `./types.ts`
- `./config.ts`
- `./providers/base.ts`
- `./errors.ts`

### 4.2. `providers` Package

#### 5. Package Summary

The `providers` package abstracts the interaction with different AI model providers like Gemini, OpenAI, OpenRouter, Perplexity, and ModelBox. It defines base classes and interfaces for provider implementations, ensuring consistency and extensibility.

#### 6. Installation / Import

This package is internal and not intended for direct import. Providers are instantiated and used within the `commands` package.

#### 7. Public Features / API / Interfaces

- **`BaseModelProvider` (interface)**: Defines the base interface for all model providers.
  - `executePrompt(prompt: string, options?: ModelOptions): Promise<string | AsyncGenerator<string, void, unknown>>`: Executes a prompt and returns the AI model's response, supporting both single-response and streaming outputs.
  - `supportsWebSearch(model: string): { supported: boolean; model?: string; error?: string }`: Checks if a provider supports web search for a given model and returns support status, a suggested model, and an error message if not supported.
- **`BaseProvider` (abstract class)**: Provides a base class with shared functionalities for provider implementations, extending `BaseModelProvider`.
  - `getModel(options?: ModelOptions): string`: Retrieves the model name from options or configuration.
  - `getMaxTokens(options?: ModelOptions): number`: Retrieves the maximum tokens from options or configuration.
  - `getSystemPrompt(options?: ModelOptions): string | undefined`: Retrieves the system prompt from options or configuration.
  - `handleLargeTokenCount(tokenCount: number): { model?: string; error?: string }`: Handles cases with large token counts, potentially suggesting alternative models or returning errors.
- **Provider Implementations**: Concrete classes extending `BaseProvider` for each AI provider.
  - `GeminiProvider`
  - `OpenAIProvider`
  - `OpenRouterProvider`
  - `PerplexityProvider`
  - `ModelBoxProvider`

#### 8. Dependencies and Requirements

- `openai`
- `eventsource-client`
- `./types.ts`
- `./config.ts`
- `./errors.ts`
- `./utils/exhaustiveMatchGuard.ts`

### 4.3. `repomix` Package

#### 5. Package Summary

The `repomix` package, though referenced, is used as an external dependency and not directly part of the public API of `cursor-tools`. It is used internally for repository context handling in commands like `repo` and `doc`.

#### 6. Installation / Import

`repomix` is installed as a dependency of `cursor-tools` and is not intended for separate installation or import by users.

#### 7. Public Features / API / Interfaces

As an external dependency, refer to the Repomix documentation for its public API and features if needed.  Within `cursor-tools`, the primary interaction is through the `pack` function.

#### 8. Dependencies and Requirements

- (External dependency, managed by `cursor-tools`)

### 4.4. `types` Package

#### 5. Package Summary

The `types` package defines all the TypeScript interfaces and type aliases used throughout the `cursor-tools` codebase. It ensures type safety and consistency across different modules.

#### 6. Installation / Import

This package is internal and not intended for direct import. Types are imported directly from `src/types.ts` within the codebase.

#### 7. Public Features / API / Interfaces

- **`CommandGenerator`**: Type alias for asynchronous generator functions used by commands.
- **`Provider`**: Type alias for supported AI providers ('gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox').
- **`CommandOptions`**: Interface defining base options shared by all commands (model, maxTokens, provider, debug, etc.).
- **`Command` (interface)**: Defines the structure for command classes, requiring an `execute` method.
- **`CommandMap`**: Interface for command maps, mapping command names to their implementations.
- **`Config` (interface)**: Defines the structure for the `cursor-tools.config.json` configuration file, including sections for each provider and command-specific settings.
- **`ModelOptions` (interface)**: Defines options for AI model interactions (model, maxTokens, systemPrompt, webSearch, etc.).

#### 8. Dependencies and Requirements

- `zod`

### 4.5. `utils` Package

#### 5. Package Summary

The `utils` package provides utility functions used across `cursor-tools`, such as exhaustive match guards and once-only execution functions.

#### 6. Installation / Import

This package is internal and not intended for direct import. Utility functions are imported directly from `src/utils` within the codebase.

#### 7. Public Features / API / Interfaces

- **`exhaustiveMatchGuard(value: never, customError?: string)`**: Function to ensure exhaustive matching in switch statements, throwing an error for unhandled cases.
- **`once<T>(fn: () => T): () => T`**: Higher-order function to ensure a function is executed only once, memoizing its result.

#### 8. Dependencies and Requirements

- None

## 8. Advanced Usage Examples

### 8.1. Custom Repomix Configuration

To tailor the repository context generated by Repomix, you can create a `.repomixignore` file in your project's root directory. This file uses `.gitignore` syntax to exclude files and directories from the context.

### 8.2. GitHub Authentication Methods

For enhanced access to GitHub APIs, `cursor-tools` supports multiple authentication methods, automatically falling back through these options:

1. **`GITHUB_TOKEN` Environment Variable**: Set this variable in your environment for direct token-based authentication.
2. **GitHub CLI (`gh`)**: If installed and authenticated, `cursor-tools` can leverage the `gh` CLI for token retrieval.
3. **Git Credentials**: Uses git's credential helpers to access stored GitHub tokens or Basic Auth.

### 8.3. Browser Command Chaining

In browser `act` commands, you can chain multiple actions using the pipe (`|`) separator within the instruction string, enabling complex, multi-step browser interactions within a single command.

Example:

```bash
cursor-tools browser act "Click 'Sign in' | Type 'testuser' into username | Type 'password123' into password | Click 'Submit'" --url "https://example.com/login"
```

This documentation provides a comprehensive guide for AI agents and developers on how to use and understand the `cursor-tools` codebase. For further details, refer to the individual command and package documentation within the codebase and README files.


--- End of Documentation ---
