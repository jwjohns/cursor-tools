
--- Repository Documentation ---

Below is a comprehensive, structured documentation summary for the repository. This document explains the repository’s purpose, quick start instructions, configuration options, public interfaces (commands and providers), dependencies, and advanced usage examples.

────────────────────────────
1. Repository Purpose & Summary

This repository implements the “cursor-tools” CLI—a collection of commands built to empower AI agents with advanced coding, documentation, repository analysis, browser automation, and GitHub integration skills. In short, it lets an AI agent interact with your codebase and web pages in natural language. Key features include:

• Web search using Perplexity models for up-to-date research.
• Deep repository analysis and context-aware responses using Google Gemini.
• Comprehensive documentation generation (local or remote via GitHub) using AI.
• GitHub integration to list and detail issues and pull requests.
• Browser automation powered by Stagehand for actions, extraction, and observation.
• A flexible dual-provider “plan” command that identifies relevant files and then generates detailed implementation plans.
  
This packed codebase is organized using multiple public command modules (such as web, repo, install, doc, github, browser, and plan) along with provider implementations and repomix integration for repository context analysis.

────────────────────────────
2. Quick Start – Installation and Core Use

A. Installation

You can install cursor-tools either globally or on a per-project basis. For example:

• Global installation:  
  > npm install -g cursor-tools

• Without installation (using npx):  
  > npx cursor-tools@latest <command>

After installation, run the interactive “install” command to configure API keys and update your Cursor project rules:

  > cursor-tools install .

This command will:
  – Add cursor-tools to your package.json (if one exists)
  – Prompt for your Perplexity, Gemini (or OpenAI/Anthropic for browser automation), and other API keys
  – Update your Cursor integration file (~/.cursor-tools/.env and either a new .cursor/rules/cursor-tools.mdc file or, if needed, the legacy .cursorrules file)

B. Core Features

Once installed, your AI agent (or you manually) can invoke the following core commands:
  • Web search:  
    > cursor-tools web "What is TypeScript?"  
  • Repository analysis:  
    > cursor-tools repo "Explain the authentication flow"  
  • Documentation generation:  
    > cursor-tools doc --save-to=docs.md  
  • GitHub integration (issues/PRs):  
    > cursor-tools github pr 123  
    > cursor-tools github issue 456  
  • Browser automation with Stagehand support for natural‑language actions (act, extract, observe, open):  
    > cursor-tools browser act "Click Login" --url "https://example.com"  

────────────────────────────
3. Configuration Options

Configuration occurs via two main mechanisms:

A. Environment and API Key Files

• Create a file (.cursor-tools.env in your project root or ~/.cursor-tools/.env in your home directory) with your API keys. For example:
  
  PERPLEXITY_API_KEY="your-perplexity-api-key"  
  GEMINI_API_KEY="your-gemini-api-key"  
  (For GitHub, set GITHUB_TOKEN if available.)

B. JSON Configuration File

• Create or update a configuration file named cursor-tools.config.json. This file customizes providers, models, token limits, browser settings, Stagehand options, and more. Example settings include:

{
  "perplexity": { "model": "sonar-pro", "maxTokens": 8000 },
  "gemini": { "model": "gemini-2.0-flash-thinking-exp", "maxTokens": 10000 },
  "plan": {
    "fileProvider": "gemini",
    "thinkingProvider": "openai",
    "fileMaxTokens": 8192,
    "thinkingMaxTokens": 8192
  },
  "repo": { "provider": "gemini", "maxTokens": 10000 },
  "doc": { "maxRepoSizeMB": 100, "provider": "gemini", "maxTokens": 10000 },
  "browser": { "headless": true, "defaultViewport": "1280x720", "timeout": 120000 },
  "stagehand": { "provider": "openai", "verbose": true, "debugDom": false, "enableCaching": true },
  "tokenCount": { "encoding": "o200k_base" }
}

Further customizations (for repomix behavior, GitHub integration, etc.) may be added via (or overridden by) additional settings.  
Note on cursor rules:  
During installation the tool injects a “cursor-tools integration” section into a project rules file.  
• New projects use .cursor/rules/cursor-tools.mdc by default.  
• For backward compatibility, legacy projects may use .cursorrules.  
You can control which one is used via the USE_LEGACY_CURSORRULES environment variable.

────────────────────────────
4. Public Packages / Modules and Their Public APIs

The repository exposes multiple public command modules. These commands serve as the public interface for AI agents (or human users) and are registered in the central command registry.

A. Core Commands (public CLI interface)

• WebCommand  
  – Purpose: Perform web search and research using Perplexity (or OpenRouter) for prompt-based queries.  
  – Usage:  
      cursor-tools web "<your query>"  
  – Public API details:  
      • Accepts options such as --model, --max-tokens, and --provider  
      • Captures web search results with built-in error handling and web search safety checks

• RepoCommand  
  – Purpose: Analyze the repository context by packing the file listing (using Repomix) and then sending it to an AI provider (typically Gemini) to answer context-specific questions.  
  – Usage:  
      cursor-tools repo "Explain the authentication flow"  
  – Public API details:  
      • Aggregates repository file information  
      • Supports user queries that ask for code explanations and documentation  
      • Has configuration for provider and token limits

• InstallCommand  
  – Purpose: Interactively set up the project, add cursor-tools as a dependency (if applicable), configure API keys, update project rules (cursor integration), and set up cursor rules files.  
  – Usage:  
      cursor-tools install .  
  – Public API details:  
      • Provides prompts for API key entry  
      • Updates package.json and writes to .cursor-tools/.env or .cursorrules as needed

• DocCommand  
  – Purpose: Generate comprehensive documentation that covers repository overview, usage instructions, API details, and advanced examples using AI (by combining repomix output and prompt engineering).  
  – Usage:  
      cursor-tools doc  
      (Optionally include --from-github to generate docs for a remote repository)  
  – Public API details:  
      • Uses a dual-step process: first generate repository context (via repomix) then generate documentation  
      • Accepts options: --from-github, --save-to, --hint, --provider, --model, --max-tokens

• GithubCommand  
  – Purpose: Provide GitHub integration for listing and detailing pull requests (pr) and issues.  
  – Subcommands:  
      – pr: Lists recent PRs or shows a detailed view of a specific PR  
      – issue: Lists recent issues or shows details for a specific issue  
  – Usage:  
      cursor-tools github pr 123  
      cursor-tools github issue "recent"  
  – Public API details:  
      • Automatically determines repository context (via git remote or provided flags)  
      • Supports multiple authentication methods (environment, GitHub CLI, or Git credentials)

• BrowserCommand  
  – Purpose: Offer browser automation and testing capabilities through Stagehand integration.  
  – Subcommands:  
      – open: Opens a URL and captures HTML content, console logs, network activity, and screenshots  
      – act: Issues natural‑language commands to perform actions on a web page  
      – observe: Scans the page for interactive elements and returns a summarized report  
      – extract: Extracts data from a page based on natural language instructions  
  – Usage examples:  
      cursor-tools browser open "https://example.com" --html  
      cursor-tools browser act "Click Login" --url "https://example.com"  
  – Public API details:  
      • Accepts numerous options such as --url, --screenshot, --viewport, --wait, --headless/--no-headless, and --connect-to  
      • Video recording can be enabled with --video  
      • Has default logging for console and network events (can be disabled with --no-console/--no-network)

• PlanCommand  
  – Purpose: Generate an implementation plan for a given change request by first identifying relevant files (fileProvider) and then using a “thinkingProvider” to produce a step‑by‑step plan.  
  – Usage:  
      cursor-tools plan "Add user authentication to the login page"  
  – Public API details:  
      • Supports dual-provider configuration via options: --fileProvider, --thinkingProvider, --fileModel, –-thinkingModel  
      • Uses repomix to gather repository context and then issues an AI prompt  
      • Returns a text plan that includes file changes, code snippets, and shell commands as needed

B. Provider Implementations (public models used by the commands)

The repository also provides a provider framework to interface with various AI services. Key providers include:
  
• GeminiProvider  
  – Uses Google’s Gemini 2.0 – supports huge context window (up to 2M tokens when necessary)  
  – Handles token count limits and automatically switches to a “Pro” model if needed

• OpenAIProvider  
  – Wraps OpenAI’s ChatGPT models  
  – Uses a base implementation to call OpenAI’s API with proper error handling
     
• OpenRouterProvider  
  – Provides an OpenAI-compatible interface to a third-party service with adjusted headers and settings  
  – Supports timeout and debugging options
      
• PerplexityProvider  
  – Accesses Perplexity AI for web search and reasoning  
  – Uses exponential backoff retry and supplies web search support when prompted

• ModelBoxProvider  
  – Offers an OpenAI-compatible interface to ModelBox’s proxy API

A helper factory function (“createProvider”) instantiates a provider given a provider key.

────────────────────────────
5. Dependencies and Requirements

• Node.js 18 or later  
• Development dependencies include TypeScript, ESLint, Prettier, esbuild, and Vitest  
• Peer dependency: Playwright (required for browser commands; install separately: npm install --global playwright)  
• API dependencies:  
  – Perplexity, Gemini (or alternative: OpenAI, Anthropic based on Stagehand configuration)  
  – GitHub CLI is optional but improves authentication for GitHub commands  
• External tools:  
  – Repomix is used to generate file listings and repository context  
  – Environment variables are managed via dotenv

────────────────────────────
6. Advanced Usage Examples

Below are some advanced examples demonstrating typical scenarios:

• Web Search and Research  
  Example:  
      cursor-tools web "What are the new features in Bun.js?"  
  The command uses Perplexity (or OpenRouter) to fetch current information and displays search results with citations if available.

• Repository Analysis and Debugging  
  Example:  
      cursor-tools repo "How does the authentication flow work?"  
  The tool packs your repository (using repomix), sends the file listing to Gemini, and returns a detailed explanation of how authentication is implemented.

• Implementation Planning  
  Example:  
      cursor-tools plan "Refactor the User class for multi-email support" --fileProvider=gemini --thinkingProvider=openai  
  The plan command identifies which files need modification and generates a step‑by‑step plan including code snippets, shell commands, and file paths.

• Documentation Generation  
  Example:  
      cursor-tools doc --save-to=docs/API.md --from-github=eastlondoner/cursor-tools --hint="Only include public API descriptions"  
  This command fetches repository context (using Repomix), sends the information with additional hints, and generates a comprehensive documentation file.

• GitHub Integration  
  Examples:  
      cursor-tools github pr 321  
      cursor-tools github issue 456 --from-github=microsoft/typescript  
  These commands list recent pull requests/issues and provide detailed views (including code review comments and discussion threads).

• Browser Automation and Debugging  
  To test a web app’s interactions:
  • Open a page with full logs:  
      cursor-tools browser open "https://example.com" --html  
  • Execute a sequence of actions using natural language:  
      cursor-tools browser act "Click Login | Type 'user@example.com' into email | Click Submit" --url "https://example.com/login"  
  • Record a video of the interaction:  
      cursor-tools browser act "Fill out registration form" --url "https://example.com/signup" --video="./recordings"  
  • Use the “observe” command to list interactive elements and suggest possible actions:  
      cursor-tools browser observe "Find interactive elements" --url "https://example.com"

────────────────────────────
Summary

This repository packages a full suite of CLI tools (“cursor-tools”) that enable AI agents (and their human counterparts) to interact naturally with codebases, web pages, and GitHub repositories. With commands for web research, repository context analysis, comprehensive documentation generation, GitHub integration, and browser automation via Stagehand, the tool is highly configurable through JSON and environment files and supports multiple AI provider backends. Its modular design (with separate public packages for commands and providers) ensures flexibility and extensibility. Advanced use cases—such as multi-step plan generation or seamless browser debugging—are supported through detailed command options and provider-specific logic.

For any user or AI agent that needs to review code, generate documentation, plan implementations, or troubleshoot web apps, this repository provides a robust, integrated, and configurable solution.

────────────────────────────
End of Documentation

--- End of Documentation ---
