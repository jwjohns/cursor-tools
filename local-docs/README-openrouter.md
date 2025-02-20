
--- Repository Documentation ---

I'll generate comprehensive documentation for the cursor-tools repository focusing on the requested aspects.

# cursor-tools Documentation

## Repository Purpose and Summary
cursor-tools is a CLI tool that expands the capabilities of AI coding agents, particularly optimized for Cursor Composer Agent. It creates an "AI team" by integrating multiple AI services:
- Perplexity for web search and research
- Gemini 2.0 for large codebase analysis 
- Stagehand for browser automation
- Additional capabilities for GitHub integration and documentation generation

## Quick Start

### Installation
```bash
# Interactive setup
npx cursor-tools@latest install .
```

The install command will:
1. Add cursor-tools as a dev dependency
2. Guide through API key configuration
3. Create/update Cursor project rules

### Requirements
- Node.js 18+
- API Keys:
  - Perplexity API key
  - Google Gemini API key
  - For browser commands:
    - OpenAI API key or Anthropic API key
    - Playwright (`npm install --global playwright`)

### Basic Usage Examples
```bash
# Web search
cursor-tools web "What's new in TypeScript 5.7?"

# Repository analysis
cursor-tools repo "Explain the authentication flow"

# Generate documentation
cursor-tools doc --save-to=docs.md

# GitHub integration 
cursor-tools github pr 123

# Browser automation
cursor-tools browser act "Login as user@example.com" --url "https://example.com/login"
```

## Configuration

### API Keys Configuration
Create `.cursor-tools.env` in your home directory or project root:
```env
PERPLEXITY_API_KEY="your-key"
GEMINI_API_KEY="your-key"
# For browser commands:
OPENAI_API_KEY="your-key" # or
ANTHROPIC_API_KEY="your-key"
```

### cursor-tools.config.json
Create a config file to customize behavior:
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
  "browser": {
    "defaultViewport": "1280x720",
    "timeout": 30000,
    "stagehand": {
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-latest"
    }
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

## Public Packages/Features Documentation

### Web Search Command
```typescript
cursor-tools web "<query>" [options]
```
Uses Perplexity AI for web search capabilities.

Options:
- `--model`: Specify model (default: sonar-pro)
- `--maxTokens`: Response length limit
- `--provider`: AI provider (perplexity/openrouter/modelbox)

### Repository Analysis Command
```typescript
cursor-tools repo "<query>" [options]
```
Uses Gemini 2.0 for codebase-aware assistance.

Options:
- `--model`: Specify model
- `--maxTokens`: Response length limit
- `--provider`: AI provider (gemini/openai/openrouter)

### Documentation Generation Command
```typescript
cursor-tools doc [options]
```
Generate repository documentation.

Options:
- `--from-github`: Document remote repository
- `--save-to`: Output file path
- `--hint`: Focus documentation
- `--provider`: AI provider
- `--model`: Specify model

### GitHub Integration Commands
```typescript
cursor-tools github pr [number] [options]
cursor-tools github issue [number] [options]
```

Options:
- `--from-github`: Repository format owner/repo
- `--repo`: Alternative to --from-github

### Browser Automation Commands
```typescript
cursor-tools browser <subcommand> [options]
```

Subcommands:
- `open`: Open URL and capture content
- `act`: Execute actions via natural language
- `observe`: Analyze page elements
- `extract`: Extract data from pages

Common Options:
- `--url`: Target URL
- `--console`: Capture console logs
- `--network`: Monitor network activity
- `--screenshot`: Save screenshot
- `--video`: Record interaction
- `--viewport`: Set window size
- `--headless`: Browser visibility
- `--connect-to`: Use existing browser

## Dependencies
Core:
- Node.js ≥18
- dotenv: Environment loading
- repomix: Repository analysis
- zod: Schema validation
- openai: OpenAI API client
- @browserbasehq/stagehand: Browser automation

Peer Dependencies:
- playwright: Browser automation

## Advanced Usage Examples

### Complex Browser Automation
```bash
# Multi-step workflow
cursor-tools browser act "Click Login | Type 'user@example.com' into email | Click Submit" \
  --url "https://example.com" \
  --video="./recordings" \
  --screenshot="result.png"

# Interactive debugging
cursor-tools browser open "https://example.com" \
  --no-headless \
  --connect-to=9222 \
  --network \
  --console
```

### Repository Documentation
```bash
# Document specific aspects
cursor-tools doc \
  --save-to=docs/api.md \
  --hint="Focus on API endpoints" \
  --provider=perplexity \
  --model=sonar-reasoning-pro

# Document dependencies
cursor-tools doc \
  --from-github=expressjs/express \
  --save-to=docs/EXPRESS.md
```

### GitHub Workflow
```bash
# Review PR with context
cursor-tools github pr 123 \
  --from-github=microsoft/typescript

# Track issues
cursor-tools github issue \
  --from-github=golang/go
```

### Web Search with Different Providers
```bash
# Using Perplexity
cursor-tools web "Latest React features" \
  --provider=perplexity \
  --model=sonar-pro

# Using OpenRouter
cursor-tools web "GraphQL best practices" \
  --provider=openrouter \
  --model=perplexity/sonar
```

--- End of Documentation ---
