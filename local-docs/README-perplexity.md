
--- Repository Documentation ---

# cursor-tools Documentation

## Repository Purpose and Summary

cursor-tools is a CLI tool designed to enhance AI agents' capabilities, particularly for use with Cursor Composer Agent. It provides a set of commands that allow AI agents to perform various tasks such as web searches, repository analysis, documentation generation, and browser automation. The tool integrates with multiple AI providers including Perplexity, Google Gemini, OpenAI, and Anthropic.

## Quick Start

### Installation

To install cursor-tools, run the following command:

```bash
npx cursor-tools@latest install .
```

This command will:
1. Add cursor-tools as a dev dependency in your package.json
2. Guide you through API key configuration
3. Update your Cursor project rules for integration

### Basic Usage

After installation, you can use cursor-tools with the following syntax:

```bash
cursor-tools <command> [options] "<query>"
```

For example:

```bash
cursor-tools web "What is TypeScript?"
```

## Configuration

cursor-tools can be configured using a `cursor-tools.config.json` file in your project root. Here's an example configuration:

```json
{
  "perplexity": {
    "model": "sonar-pro",
    "maxTokens": 8000
  },
  "gemini": {
    "model": "gemini-2.0-pro-exp",
    "maxTokens": 10000
  },
  "tokenCount": {
    "encoding": "o200k_base"
  },
  "browser": {
    "defaultViewport": "1280x720",
    "timeout": 30000,
    "stagehand": {
      "env": "LOCAL",
      "headless": true,
      "verbose": 1,
      "debugDom": false,
      "enableCaching": false,
      "model": "claude-3-5-sonnet-latest",
      "provider": "anthropic",
      "timeout": 30000
    }
  }
}
```

## Public Packages

cursor-tools is primarily distributed as a single package, but it includes several distinct command modules.

### Package Summary

Package Name: cursor-tools
Installation: `npm install cursor-tools`

### Public Features/API

1. Web Search Command
   ```typescript
   cursor-tools web "<query>" [options]
   ```

2. Repository Analysis Command
   ```typescript
   cursor-tools repo "<query>" [options]
   ```

3. Documentation Generation Command
   ```typescript
   cursor-tools doc [options]
   ```

4. GitHub Integration Command
   ```typescript
   cursor-tools github <pr|issue> [number] [options]
   ```

5. Browser Automation Commands
   ```typescript
   cursor-tools browser <open|act|observe|extract> "<instruction>" [options]
   ```

### Detailed Documentation of Public Features

#### Web Search Command

The `web` command uses Perplexity AI to perform web searches and return up-to-date information.

Usage:
```bash
cursor-tools web "<query>" [options]
```

Options:
- `--model`: Specify an alternative model (default: sonar-pro)
- `--max-tokens`: Control response length
- `--provider`: AI provider to use (perplexity or openrouter)

#### Repository Analysis Command

The `repo` command uses Google Gemini to analyze the current repository and provide context-aware assistance.

Usage:
```bash
cursor-tools repo "<query>" [options]
```

Options:
- `--model`: Specify an alternative model (default: gemini-2.0-pro-exp)
- `--max-tokens`: Control response length
- `--provider`: AI provider to use (gemini, openai, openrouter, perplexity, or modelbox)

#### Documentation Generation Command

The `doc` command generates comprehensive documentation for local or remote GitHub repositories.

Usage:
```bash
cursor-tools doc [options]
```

Options:
- `--from-github`: Generate documentation for a remote GitHub repository
- `--save-to`: Save output to a file
- `--hint`: Provide additional context or focus for documentation
- `--provider`: AI provider to use (gemini, openai, openrouter, perplexity, or modelbox)
- `--model`: Specify an alternative model
- `--max-tokens`: Control response length

#### GitHub Integration Command

The `github` command allows access to GitHub issues and pull requests directly from the command line.

Usage:
```bash
cursor-tools github <pr|issue> [number] [options]
```

Options:
- `--from-github`: Specify a GitHub repository (format: owner/repo)
- `--repo`: Alternative to --from-github (format: owner/repo)

#### Browser Automation Commands

The `browser` commands use Stagehand AI to automate browser interactions for web scraping, testing, and debugging.

Usage:
```bash
cursor-tools browser <open|act|observe|extract> "<instruction>" [options]
```

Common Options:
- `--url`: Specify the URL to navigate to
- `--console`: Capture browser console logs (default: true)
- `--network`: Capture network activity (default: true)
- `--screenshot`: Save a screenshot of the page
- `--timeout`: Set navigation timeout
- `--viewport`: Set viewport size
- `--headless`: Run browser in headless mode (default: true)
- `--no-headless`: Show browser UI for debugging
- `--connect-to`: Connect to existing Chrome instance
- `--wait`: Wait after page load
- `--video`: Save a video recording

## Dependencies and Requirements

- Node.js 18 or later
- Perplexity API key
- Google Gemini API key
- For browser commands:
  - Playwright (`npm install --global playwright`)
  - OpenAI API key or Anthropic API key (for `act`, `extract`, and `observe` commands)

## Advanced Usage Examples

1. Web Search with Custom Model:
   ```bash
   cursor-tools web "Latest JavaScript frameworks" --model=sonar-medium-chat
   ```

2. Repository Analysis with Specific Provider:
   ```bash
   cursor-tools repo "Explain the authentication flow" --provider=openai --model=gpt-4
   ```

3. Documentation Generation for Remote Repository:
   ```bash
   cursor-tools doc --from-github=username/repo-name@branch --save-to=docs.md
   ```

4. GitHub PR Analysis:
   ```bash
   cursor-tools github pr 123 --from-github=microsoft/typescript
   ```

5. Browser Automation with Video Recording:
   ```bash
   cursor-tools browser act "Fill out registration form" --url "https://example.com/signup" --video="./recordings"
   ```

These examples demonstrate the flexibility and power of cursor-tools in various scenarios, from web research to code analysis and browser automation.

--- End of Documentation ---
