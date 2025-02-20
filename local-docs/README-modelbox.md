
--- Repository Documentation ---

I'll provide comprehensive documentation for the cursor-tools repository focusing on the key aspects you requested.

# cursor-tools Documentation

## Repository Purpose and Summary
cursor-tools is a CLI tool that enhances AI coding agents (particularly Cursor Composer) by providing additional capabilities through a team of specialized AI models:
- Perplexity for web search and research
- Gemini 2.0 for large codebase context and reasoning
- Stagehand for browser automation and testing
- Support for GitHub integration and documentation generation

The tool is designed to be used by AI agents but can also be used directly by developers through the CLI.

## Quick Start

### Installation
```bash
# Interactive setup
npx cursor-tools@latest install .

# This will:
# 1. Add cursor-tools as a dev dependency
# 2. Guide you through API key configuration
# 3. Update Cursor project rules
```

### Basic Usage
```bash
# Web search
cursor-tools web "What's new in TypeScript 5.7?"

# Repository context
cursor-tools repo "Explain the authentication flow"

# Generate documentation
cursor-tools doc --save-to=docs.md

# GitHub integration
cursor-tools github pr 123

# Browser automation
cursor-tools browser open "https://example.com" --html
```

## Configuration

### API Keys Required
- Perplexity API key
- Google Gemini API key
- For browser commands: OpenAI API key or Anthropic API key

### Configuration File
Create `cursor-tools.config.json`:
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
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-latest"
    }
  }
}
```

## Public Packages/Features

### 1. Web Search Package

#### Installation/Import
```typescript
import { WebCommand } from 'cursor-tools/commands/web';
```

#### Public API
```typescript
interface WebCommand {
  execute(query: string, options?: CommandOptions): CommandGenerator;
}

interface CommandOptions {
  model?: string;
  maxTokens?: number;
  provider?: Provider;
  debug?: boolean;
}
```

### 2. Repository Context Package

#### Installation/Import
```typescript
import { RepoCommand } from 'cursor-tools/commands/repo';
```

#### Public API
```typescript
interface RepoCommand {
  execute(query: string, options?: CommandOptions): CommandGenerator;
}
```

### 3. Documentation Generator Package

#### Installation/Import
```typescript
import { DocCommand } from 'cursor-tools/commands/doc';
```

#### Public API
```typescript
interface DocCommand {
  execute(query: string, options?: DocCommandOptions): CommandGenerator;
}

interface DocCommandOptions extends CommandOptions {
  fromGithub?: string;
  hint?: string;
}
```

### 4. GitHub Integration Package

#### Installation/Import
```typescript
import { GithubCommand } from 'cursor-tools/commands/github';
```

#### Public API
```typescript
interface GithubCommand {
  execute(query: string, options?: GithubOptions): CommandGenerator;
}

interface GithubOptions extends CommandOptions {
  repo?: string;
  fromGithub?: string;
}
```

### 5. Browser Automation Package

#### Installation/Import
```typescript
import { BrowserCommand } from 'cursor-tools/commands/browser';
```

#### Public API
```typescript
interface BrowserCommand {
  execute(query: string, options?: BrowserCommandOptions): CommandGenerator;
}

interface BrowserCommandOptions extends CommandOptions {
  url?: string;
  screenshot?: string;
  viewport?: string;
  timeout?: number;
  headless?: boolean;
  console?: boolean;
  network?: boolean;
  html?: boolean;
  video?: string;
}
```

## Dependencies and Requirements

### Core Dependencies
- Node.js 18 or later
- dotenv: 16.4.7
- openai: ^4.83.0
- repomix: 0.2.24
- zod: 3.24.1

### Peer Dependencies
- playwright: 1.50.1 (required for browser commands)

### API Requirements
- Perplexity API key
- Google Gemini API key
- For browser commands: OpenAI API key or Anthropic API key

## Advanced Usage Examples

### Complex Browser Automation
```bash
# Multi-step workflow
cursor-tools browser act "Click Login | Type 'user@example.com' into email | Click Submit" \
  --url "https://example.com" \
  --video="./recordings" \
  --screenshot="result.png"

# Extract data with network monitoring
cursor-tools browser extract "Get API responses" \
  --url "https://example.com/api-test" \
  --network \
  --console
```

### Custom Documentation Generation
```bash
# Document specific aspects
cursor-tools doc --save-to=docs/api.md \
  --hint="Focus on API endpoints" \
  --provider=perplexity \
  --model=sonar-reasoning-pro

# Document remote repository
cursor-tools doc --from-github=username/repo@branch \
  --save-to=docs/REPO.md
```

### Advanced GitHub Integration
```bash
# View PR with code review comments
cursor-tools github pr 123 \
  --from-github=microsoft/typescript \
  --debug

# Track issue discussions
cursor-tools github issue 456 \
  --repo=golang/go \
  --save-to=issues/456.md
```

This documentation covers the main aspects of cursor-tools. For more detailed information about specific features or advanced configurations, please refer to the README.md file or the source code.

--- End of Documentation ---
