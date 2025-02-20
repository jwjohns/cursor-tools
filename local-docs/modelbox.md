
--- Repository Documentation ---

```markdown
# cursor-tools Documentation

## 1. Repository Purpose and "What is it" Summary

`cursor-tools` is a versatile command-line interface (CLI) tool designed to empower AI agents, particularly Cursor Composer Agent, with enhanced capabilities for code generation, web interaction, and repository analysis. It provides a suite of commands that enable AI agents to:

- **Perform Web Searches:** Retrieve up-to-date information from the web using Perplexity AI and OpenRouter.
- **Analyze Repository Context:** Gain deep insights into codebases using Google Gemini, facilitating context-aware code understanding and planning.
- **Generate Documentation:** Automatically create comprehensive documentation for both local and remote GitHub repositories.
- **Integrate with GitHub:** Seamlessly access and manage GitHub issues and pull requests.
- **Automate Browser Interactions:** Control and automate web browsers using natural language instructions via Stagehand AI, ideal for testing and web app debugging.

`cursor-tools` functions as an "AI team," equipping agents with specialized skills and access to advanced AI models to streamline development workflows.

## 2. Quick Start: Installation and Basic Usage

### Installation

To install `cursor-tools`, execute the following command in your terminal:

```bash
npx cursor-tools@latest install .
```

This command performs the following setup steps:

1.  Installs `cursor-tools` as a dev dependency in your `package.json`.
2.  Guides you through an interactive API key configuration process.
3.  Configures Cursor project rules for seamless integration with Cursor Composer Agent.

### Basic Usage Examples

Once installed, `cursor-tools` commands can be used directly in the terminal or by AI coding agents. Here are a few fundamental examples:

**Web Search:**

```bash
cursor-tools web "What are the latest features in React Hooks?"
```

**Repository Context Analysis:**

```bash
cursor-tools repo "Explain the component structure in this React application."
```

**Documentation Generation:**

```bash
cursor-tools doc --save-to=repository_docs.md
```

## 3. Configuration Options

`cursor-tools` can be configured via:

- `cursor-tools.config.json`: For project-specific or global default settings.
- `.cursor-tools.env`: To securely store API keys.

### `cursor-tools.config.json` Configuration

This file, located in your project root or `~/.cursor-tools/`, allows customization of `cursor-tools` behavior.

```json
{
  "perplexity": {
    "model": "sonar-pro",
    "maxTokens": 8000
  },
  "gemini": {
    "model": "gemini-2.0-pro-exp-02-05",
    "maxTokens": 10000
  },
  "tokenCount": {
    "encoding": "o200k_base"
  },
  "browser": {
    "defaultViewport": "1280x720",
    "timeout": 30000,
    "stagehand": {
      "provider": "anthropic",
      "headless": true,
      "verbose": false,
      "debugDom": false,
      "enableCaching": true,
      "model": "claude-3-5-sonnet-latest",
      "timeout": 30000
    }
  },
  "modelbox": {
    "model": "gpt-4",
    "maxTokens": 8192
  }
}
```

**Configuration parameters:**

- `perplexity`: Settings for Perplexity AI provider.
  - `model`: Default Perplexity model (string).
  - `maxTokens`: Maximum tokens for Perplexity responses (number).
- `gemini`: Settings for Google Gemini provider.
  - `model`: Default Gemini model (string).
  - `maxTokens`: Maximum tokens for Gemini responses (number).
- `tokenCount`: Token counting configuration.
  - `encoding`: Tokenizer encoding (string).
- `browser`: Browser command defaults.
  - `headless`: Default headless mode (boolean).
  - `defaultViewport`: Default viewport size (string, e.g., "1280x720").
  - `timeout`: Default timeout for browser commands (number, milliseconds).
  - `stagehand`: Stagehand-specific settings.
    - `provider`: Default AI provider for Stagehand ("openai" or "anthropic").
    - `headless`: Headless mode for Stagehand browser instances (boolean).
    - `verbose`: Verbosity level for Stagehand logging (boolean or 0|1|2).
    - `debugDom`: Enable debug output for DOM processing (boolean).
    - `enableCaching`: Enable caching for Stagehand responses (boolean).
    - `timeout`: Timeout for Stagehand operations (number, milliseconds).
    - `model`: Default model for Stagehand (string).
- `modelbox`: Settings for ModelBox provider.
  - `model`: Default ModelBox model (string).
  - `maxTokens`: Maximum tokens for ModelBox responses (number).

### `.cursor-tools.env` Configuration

API keys are securely stored in `.cursor-tools.env` at the project root or `~/.cursor-tools/`.

```env
PERPLEXITY_API_KEY="your_perplexity_api_key"
GEMINI_API_KEY="your_gemini_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"
OPENAI_API_KEY="your-openai-api-key"
OPENROUTER_API_KEY="your-openrouter-api-key"
MODELBOX_API_KEY="your-modelbox-api-key"
GITHUB_TOKEN="your_github_token" # Optional for GitHub API access
```

**Environment Variables:**

- `PERPLEXITY_API_KEY`: API key for Perplexity AI.
- `GEMINI_API_KEY`: API key for Google Gemini.
- `OPENAI_API_KEY`: API key for OpenAI (Stagehand, OpenAI provider).
- `ANTHROPIC_API_KEY`: API key for Anthropic (Stagehand, Anthropic provider).
- `OPENROUTER_API_KEY`: API key for OpenRouter.
- `MODELBOX_API_KEY`: API key for ModelBox.
- `GITHUB_TOKEN`: GitHub Personal Access Token (optional, for GitHub API).
- `USE_LEGACY_CURSORRULES`: Force legacy `.cursorrules` (set to `true`) or new `.cursor/rules/cursor-tools.mdc` (set to `false`).

## 4. Public Packages

`cursor-tools` is distributed as a single public npm package: `cursor-tools`.

### 4.1. Package: `cursor-tools`

**Summary:**

The `cursor-tools` package provides a CLI tool with AI-powered commands for web search, repository analysis, documentation, GitHub integration, and browser automation.

**Installation:**

```bash
npm install -g cursor-tools
```

**Import:**

As a CLI tool, `cursor-tools` is primarily used from the command line and does not offer direct JavaScript imports for use in other projects.

## 5. Detailed API Documentation

### 5.1. `web` Command API

**Package:** `cursor-tools`

**Installation:** Part of the main `cursor-tools` package.

**API Interface:**

```typescript
interface WebCommand {
  execute(query: string, options?: WebCommandOptions): CommandGenerator;
}

interface WebCommandOptions extends CommandOptions {
  provider?: 'perplexity' | 'openrouter' | 'modelbox' | 'gemini';
  model?: string;
  maxTokens?: number;
}
```

**Description:**

The `web` command enables web searches using various AI providers.

**Methods:**

- `execute(query: string, options?: WebCommandOptions): CommandGenerator`
  - Executes a web search based on the provided query and options.
  - Returns an `AsyncGenerator<string, void, unknown>` that yields the search results.

**Options:**

- `query`: The search query (string).
- `options`: Optional parameters to configure the web search. Extends `CommandOptions` and includes:
  - `provider`: AI provider to use for web search (`'perplexity' | 'openrouter' | 'modelbox' | 'gemini'`, default: 'perplexity').
  - `model`: Model to be used for the web search (string, provider-specific default models are used if not specified).
  - `maxTokens`: Maximum tokens for the response (number).
  - `saveTo`: File path to save the output (string).
  - `quiet`: Suppress output to stdout (boolean).
  - `debug`: Enable debug logging (boolean).

### 5.2. `repo` Command API

**Package:** `cursor-tools`

**Installation:** Part of the main `cursor-tools` package.

**API Interface:**

```typescript
interface RepoCommand {
  execute(query: string, options?: RepoCommandOptions): CommandGenerator;
}

interface RepoCommandOptions extends CommandOptions {
  provider?: 'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox';
  model?: string;
  maxTokens?: number;
}
```

**Description:**

The `repo` command analyzes the local repository to provide context-aware answers.

**Methods:**

- `execute(query: string, options?: RepoCommandOptions): CommandGenerator`
  - Analyzes the repository and generates responses based on the query and options.
  - Returns an `AsyncGenerator<string, void, unknown>` yielding analysis results.

**Options:**

- `query`: The analysis query related to the repository (string).
- `options`: Optional parameters for repository analysis. Extends `CommandOptions` and includes:
  - `provider`: AI provider for repository analysis (`'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox'`, default: 'gemini').
  - `model`: Model to use for repository analysis (string, provider-specific default models are used if not specified).
  - `maxTokens`: Maximum tokens for the response (number).
  - `saveTo`: File path to save the output (string).
  - `quiet`: Suppress output to stdout (boolean).
  - `debug`: Enable debug logging (boolean).

### 5.3. `doc` Command API

**Package:** `cursor-tools`

**Installation:** Part of the main `cursor-tools` package.

**API Interface:**

```typescript
interface DocCommand {
  execute(query: string, options?: DocCommandOptions): CommandGenerator;
}

interface DocCommandOptions extends CommandOptions {
  fromGithub?: string;
  hint?: string;
  provider?: 'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox';
  model?: string;
  maxTokens?: number;
}
```

**Description:**

The `doc` command generates documentation for repositories, local or remote.

**Methods:**

- `execute(query: string, options?: DocCommandOptions): CommandGenerator`
  - Generates repository documentation based on the provided options.
  - Returns an `AsyncGenerator<string, void, unknown>` that yields documentation content.

**Options:**

- `query`: Not used directly (string, can be empty).
- `options`: Optional parameters for documentation generation. Extends `CommandOptions` and includes:
  - `fromGithub`: GitHub repository path to document (string, e.g., "user/repo" or "user/repo@branch").
  - `hint`: Hint or focus for documentation generation (string).
  - `provider`: AI provider for documentation generation (`'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox'`, default: 'gemini').
  - `model`: Model for documentation generation (string, provider-specific default models are used if not specified).
  - `maxTokens`: Maximum tokens for the response (number).
  - `saveTo`: File path to save the documentation output (string).
  - `quiet`: Suppress output to stdout (boolean).
  - `debug`: Enable debug logging (boolean).

### 5.4. `github` Command API

**Package:** `cursor-tools`

**Installation:** Part of the main `cursor-tools` package.

**API Interface:**

```typescript
interface GithubCommand {
  execute(query: string, options?: GithubCommandOptions): CommandGenerator;
}

interface GithubCommandOptions extends CommandOptions {
  fromGithub?: string;
  repo?: string;
}
```

**Description:**

The `github` command fetches and displays information about GitHub repositories, issues, and pull requests.

**Methods:**

- `execute(query: string, options?: GithubCommandOptions): CommandGenerator`
  - Fetches and yields GitHub information based on the query and options.
  - Returns an `AsyncGenerator<string, void, unknown>` that yields GitHub data.

**Options:**

- `query`: Issue or pull request number, or empty for listing (string).
- `options`: Optional parameters for GitHub commands. Extends `CommandOptions` and includes:
  - `fromGithub`: GitHub repository path (string, e.g., "user/repo" or "user/repo@branch").
  - `repo`: Alternative to `fromGithub` for repository path (string).
  - `saveTo`: File path to save the output (string).
  - `quiet`: Suppress output to stdout (boolean).
  - `debug`: Enable debug logging (boolean).

### 5.5. `browser` Command API

**Package:** `cursor-tools`

**Installation:** Part of the main `cursor-tools` package. Requires separate Playwright installation.

**API Interface:**

```typescript
interface BrowserCommand {
  execute(query: string, options?: BrowserCommandOptions): CommandGenerator;
}

interface BrowserCommandOptions extends SharedBrowserCommandOptions {
  url?: string;
  screenshot?: string;
  viewport?: string;
  timeout?: number;
  headless?: boolean;
  connectTo?: number;
  wait?: string;
  video?: string;
}
```

**Description:**

The `browser` command automates web browser interactions using Stagehand AI.

**Methods:**

- `execute(query: string, options?: BrowserCommandOptions): CommandGenerator`
  - Executes browser automation tasks based on subcommands and options.
  - Returns an `AsyncGenerator<string, void, unknown>` that yields browser interaction output.

**Options:**

- `query`: Subcommand and instruction for browser automation (string).
- `options`: Optional parameters for browser automation. Extends `SharedBrowserCommandOptions` and includes:
  - `url`: URL to navigate to (string).
  - `screenshot`: File path to save a screenshot (string).
  - `viewport`: Viewport size (string, e.g., "1280x720").
  - `timeout`: Timeout for browser operations (number, milliseconds).
  - `headless`: Run browser in headless mode (boolean).
  - `connectTo`: Port to connect to existing Chrome instance (number).
  - `wait`: Wait condition after page load (string, duration or selector).
  - `video`: Directory to save video recording (string).
  - `console`: Capture browser console logs (boolean).
  - `network`: Capture network activity (boolean).
  - `html`: Capture page HTML content (boolean).

## 6. Dependencies and Requirements

- Node.js (>= 18.0.0)
- npm, yarn, or pnpm
- API Keys:
  - Perplexity API Key
  - Google Gemini API Key
  - OpenAI API Key (for Stagehand)
  - Anthropic API Key (for Stagehand)
  - OpenRouter API Key (optional)
  - ModelBox API Key (optional)
  - GitHub Token (optional)
- Playwright (peer dependency for browser commands)

## 7. Advanced Usage Examples

### Custom Repomix Configuration

Customize repository packing with a `.repomixignore` file in the project root, using `.gitignore` syntax to exclude files and directories.

### GitHub Authentication Methods

`cursor-tools` supports multiple GitHub authentication methods, prioritized as follows:

1. `GITHUB_TOKEN` environment variable.
2. GitHub CLI (`gh`) - if installed and logged in.
3. Git credentials - `git credential fill` helper.

### Browser Command Chaining

Chain multiple browser actions in the `act` command using the pipe (`|`) separator in instructions for complex workflows.

### Model Selection

Override default models by specifying models directly in command options (e.g., `--model=gpt-4o`) or in `cursor-tools.config.json`.

### Environment Variable Overrides

Use `OVERRIDE_SAFETY_CHECKS=true` to bypass web search compatibility checks for testing or development purposes (not recommended for production).

---

This documentation provides a comprehensive overview of `cursor-tools` for AI agents. For further details, refer to the README.md file in the repository and use the `--help` option with CLI commands for specific usage instructions.
```

--- End of Documentation ---
