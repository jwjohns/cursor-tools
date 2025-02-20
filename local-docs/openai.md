
--- Repository Documentation ---

Below is a comprehensive documentation overview for the entire “cursor‐tools” repository. This document is intended for AI systems (and human developers) to quickly understand the repository’s purpose, install and use its core features, configure it for your environment, and review every public interface. In this repository the public interfaces are the various CLI command modules (e.g. web, repo, doc, github, browser, install, plan) as well as the shared provider APIs that power AI interactions. This documentation focuses on the public, outward-facing APIs while summarizing their design and usage.

────────────────────────────
1. Repository Purpose and “What is it?”

The “cursor‐tools” repository provides a CLI tool designed to empower AI coding and agent systems with advanced capabilities. It serves as a command center that exposes a rich set of commands for:
• Web search and research (using Perplexity or OpenRouter)
• Codebase understanding and repository context retrieval (using Google Gemini, OpenAI and similar providers)
• Implementation planning and documentation generation (a “plan” command that identifies relevant files and generates detailed plans)
• GitHub integration (accessing pull requests and issues with rich, Markdown-formatted output)
• Browser automation and web testing (via Stagehand integration through Playwright)
• Installation and configuration management (interactive setup for API keys, dependency installation, and updating project rules)

The repository is packed into one merged representation for ease of automated processing. It is intended to be read-only; any changes must be made in the original files. Internal details (such as build scripts, type utilities, and provider internals) are abstracted away from public agents by the well‑documented public command interfaces.

────────────────────────────
2. Quick Start: How to Install and Use the Core Features

• Installation:
  – You can install the package globally, as a dev dependency, or run it without installation using npx. For example:
    • Global installation:
        npm install -g cursor-tools
        cursor-tools --help
    • Local or project-level installation:
        npm install --save-dev cursor-tools
        npx cursor-tools --help
    • Without installation:
        npx cursor-tools@latest <command> "<query>"

• Interactive Setup:
  – Run the interactive install command to configure API keys and update Cursor project rules:
      npx cursor-tools@latest install .
  – During installation you’ll be prompted to provide API keys (e.g. for Perplexity, Gemini/Google, OpenRouter, ModelBox, and for Stagehand via OpenAI or Anthropic) and choose whether to use the new or legacy Cursor rules file.

• Running a Command:
  – To perform a web search, simply run:
      npx cursor-tools web "What is TypeScript?"
  – To get repository context or generate an implementation plan:
      npx cursor-tools repo "Explain our authentication flow"
      npx cursor-tools plan "Add user registration"
  – To generate documentation either for your local repository or for a remote GitHub repo:
      npx cursor-tools doc --save-to=docs.md
      npx cursor-tools doc --from-github=username/repo@branch --save-to=docs/REPO.md
  – To use browser automation features (requires Playwright installed separately):
      npx cursor-tools browser open "https://example.com" --html
      npx cursor-tools browser act "Click Login" --url "https://example.com/login"

────────────────────────────
3. Configuration Options and How to Configure the Project

The repository behavior and defaults can be customized by using configuration files and environment variables:

A. Configuration File (cursor‑tools.config.json)
  – Place a JSON file either in your project root (cursor‑tools.config.json) or in your home directory under ~/.cursor‑tools/config.json.
  – Example configuration:
  
{
  "perplexity": {
    "model": "sonar-pro",
    "maxTokens": 8000
  },
  "gemini": {
    "model": "gemini-2.0-flash-thinking-exp",
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
    "provider": "openai",         // or "anthropic"
    "verbose": true,
    "debugDom": false,
    "enableCaching": true
  }
}

  – The configuration supports provider-specific options (such as default models and maximum tokens) for commands like repo, plan, doc, web, and browser.
  
B. Environment Variables
  – Use a .cursor‑tools.env file (in your project root) or a ~/.cursor‑tools/.env file to set API keys. For example:
  
    PERPLEXITY_API_KEY="your-perplexity-api-key"
    GEMINI_API_KEY="your-gemini-api-key"
    OPENAI_API_KEY="your-openai-api-key"      # For browser commands (Stagehand, act, extract)
    ANTHROPIC_API_KEY="your-anthropic-api-key"  # Alternative Stagehand provider key
    GITHUB_TOKEN="your-github-token"

  – The install command (cursor-tools install) helps set these keys interactively.
  
C. Cursor Rules for Integration
  – During install, the tool updates your Cursor project rules. You can use either the new path (.cursor/rules/cursor‑tools.mdc) or retain the legacy .cursorrules.
  – Control this via the environment variable:
      USE_LEGACY_CURSORRULES=true    → Use the legacy file
      USE_LEGACY_CURSORRULES=false   → Use the new file
  – The rules file contains prompts and command instructions for Cursor Agent integration.

────────────────────────────
4. Packages and Public Interfaces

This repository exposes several public “packages” (commands), each one providing specific AI-powered functionality. The public interfaces include both the CLI command modules and the provider APIs. For each public package below, we describe what it does, how to install or import it (if used as a library within a project), and its public features.

────────────────────────────
A. CLI Commands

All CLI commands are accessible via the single entry point (src/index.ts) and registered through the central commands map. The primary commands include:

1. web
   • Purpose: Query the web using an AI provider (default Perplexity or OpenRouter) to return up-to-date information.
   • Public API: Implements the Command interface with an async generator that outputs the AI’s response.
   • Advanced Options: You may pass --provider, --model, and --max-tokens. Web search-specific options (like enabling/disabling console logs and network activity) are supported.
   • Example:
         npx cursor-tools web "What is TypeScript?"

2. repo
   • Purpose: Analyze the local repository’s files and generate repository context or answers based on full codebase context (using Google Gemini by default).
   • Public API: Implements the Command interface; internally uses repomix to pack file listings and delegates to a provider.
   • Example:
         npx cursor-tools repo "Explain the authentication flow"

3. plan
   • Purpose: Generate detailed implementation plans by first selecting relevant files from the repository and then producing a step‐by‐step plan.
   • Public API: Accepts options for two separate providers:
         – fileProvider (for file identification)
         – thinkingProvider (for plan generation)
       And corresponding options for models and max tokens.
   • Advanced Options: --fileProvider, --thinkingProvider, --fileModel, --thinkingModel, --max-tokens, and --debug.
   • Example:
         npx cursor-tools plan "Add user registration" --thinkingProvider=openai --thinkingModel=o3-mini
         
4. doc
   • Purpose: Generate comprehensive documentation for the repository or for a remote GitHub repository.
   • Public API: Implements the Command interface and uses Repomix to pack the repository context, then queries a provider to produce Markdown-formatted documentation.
   • Advanced Options: Use --from-github to specify a remote repo (supports owner/repo[@branch]) and use --save-to to direct output to a file.
   • Example:
         npx cursor-tools doc --save-to=docs.md
         npx cursor-tools doc --from-github=someuser/somerepo@main --save-to=docs/REMOTEDOC.md
         
5. github
   • Purpose: Integrate with GitHub for managing pull requests and issues. This command groups two subcommands:
         – pr: For pull requests
         – issue: For issues
   • Public API: Implements the overall Command interface with internal routing to the relevant subcommand.
   • Authentication: Uses GitHub API through either environment variables, GitHub CLI, or git credentials.
   • Example:
         npx cursor-tools github pr 123
         npx cursor-tools github issue 456
         
6. browser
   • Purpose: Provide browser automation and web testing functions. The browser command includes several subcommands:
         – open: Open a URL and capture HTML, console logs, network activity, and screenshots.
         – act: Execute natural language instructions (chained via pipe “|”) to interact with a webpage.
         – extract: Extract data from a webpage using a natural language instruction.
         – observe: Survey interactive elements on a page to suggest possible actions.
   • Public API: Implements the Command interface; for each subcommand, the execute method is an async generator yielding step‐by‐step output.
   • Advanced Options: Support for --url, --screenshot, --viewport, --headless/--no-headless, --connect-to, --wait, --video, as well as logging toggles (--console, --network).
   • Requirements: Playwright must be installed (it is a peer dependency). For example:
         npx cursor-tools browser open "https://example.com" --html
         npx cursor-tools browser act "Click Login | Type 'user@example.com'" --url "https://example.com/login"
         
7. install
   • Purpose: Interactively set up the environment including dependency installation, API key configuration, and Cursor project rule updates.
   • Public API: Command that guides users through configuration. It automatically updates package.json (if present) and writes environment files.
   • Example:
         npx cursor-tools install .
         
────────────────────────────
B. Providers (Underlying API Interfaces)

The repository also defines a set of provider classes that encapsulate communication with various AI models. They implement a common BaseModelProvider interface (with method executePrompt and supportsWebSearch) so that the higher-level commands can switch providers seamlessly.

1. BaseProvider and BaseModelProvider
   • Public API: These are abstract classes/interfaces that define executePrompt(prompt, options) returning a Promise that resolves with the response.
   • Providers include: GeminiProvider, OpenAIProvider, OpenRouterProvider, PerplexityProvider, and ModelBoxProvider.
   • Usage:
         In code, one may import and use:
         import { createProvider } from 'cursor-tools/providers/base';
         const provider = createProvider('gemini');
         const response = await provider.executePrompt("Your prompt", { maxTokens: 4000 });
   • Providers use configuration from environment variables (e.g. GEMINI_API_KEY, OPENAI_API_KEY) and from the config file.
   
────────────────────────────
5. Dependencies and Requirements

Core runtime and build dependencies:
• Node.js version 18 or later (ideally Node 20+ for ESM support)
• Required environment variables (API keys):
    – PERPLEXITY_API_KEY
    – GEMINI_API_KEY
    – OPENAI_API_KEY or ANTHROPIC_API_KEY (for browser commands / Stagehand)
    – Optional: GITHUB_TOKEN for GitHub integration
• Peer dependency: Playwright (for the browser command package)
    – Install globally or as part of your project:
         npm install playwright
• Other dependencies (installed automatically):
    – dotenv, repomix, punycode, openai, @browserbasehq/stagehand, zod, and various TypeScript and ESLint tooling.

For building the package:
• The build script (build.js) uses esbuild to create an ESM bundle in the “dist” directory.
• The repository provides TypeScript configuration via tsconfig.json.

────────────────────────────
6. Advanced Usage Examples

Below are several advanced examples that demonstrate how to use cursor‑tools to its full potential:

Example A – Web Search with Detailed Options:
  npx cursor-tools web "What are the new features in Bun.js?" --provider=perplexity --model=sonar-pro --max-tokens=500

Example B – Repository Context Analysis:
  npx cursor-tools repo "Explain how error handling works in our codebase" 
  (This command uses repomix internally to extract relevant files and passes them to the provider.)

Example C – Implementation Planning (Dual-Provider Workflow):
  npx cursor-tools plan "Implement multi-factor authentication" --fileProvider=gemini --thinkingProvider=openai --fileMaxTokens=8192 --thinkingMaxTokens=10000 
  (This first identifies files relevant to multi-factor authentication then generates a detailed plan.)

Example D – Documentation Generation:
  npx cursor-tools doc --save-to=docs/REPO-DOC.md
  npx cursor-tools doc --from-github=someuser/somerepo@develop --save-to=docs/REPO-REMOTE.md --hint="Focus on API endpoints and data models"
  
Example E – GitHub Integration:
  npx cursor-tools github pr 123 --from-github=microsoft/typescript
  npx cursor-tools github issue 456 --from-github=golang/go
  (These commands produce detailed Markdown output of PR/Issue discussions with code review comments.)

Example F – Browser Automation using Stagehand:
  • Open Command (capture HTML and take screenshot):
      npx cursor-tools browser open "https://example.com" --html --screenshot=example.png
  • Act Command (chain multiple steps):
      npx cursor-tools browser act "Click 'Login' | Type 'user@example.com' into email field | Click 'Submit'" --url "https://example.com/login"
  • Observe Command (list interactive elements):
      npx cursor-tools browser observe "List interactive elements" --url "https://example.com"
  • Extract Command (extract structured content):
      npx cursor-tools browser extract "Extract product prices" --url "https://example.com/products" --network
      
• Advanced Browser Options:
  – Use --no-headless to run in full browser UI mode:
      npx cursor-tools browser open "https://example.com" --no-headless
  – Connect to an existing browser session:
      npx cursor-tools browser open "https://example.com" --connect-to=9222

────────────────────────────
7. Summary

The “cursor‑tools” repository offers a unified CLI for AI agents to:
• Leverage multiple AI models for web search, repository planning, documentation, GitHub integration, and browser automation.
• Configure provider-specific settings with a central JSON config file and environment variables.
• Run advanced workflows (e.g., multi-step browser actions) with intuitive natural language commands.
• Benefit from robust error handling, automated retry strategies, and flexible authentication methods.

For more detailed usage or to contribute improvements, please refer to the repository’s source code and the embedded comments in individual modules.

────────────────────────────
8. Additional Resources and Next Steps

• For installation and interactive setup instructions, see the Quick Start section.
• For provider-specific documentation (e.g. Gemini, OpenAI, Perplexity, OpenRouter, ModelBox), review the “src/providers/base.ts” file.
• For command-line interface integration and advanced options (such as handling browser automation via Stagehand), please read the subcommand documentation in “src/commands

--- End of Documentation ---
