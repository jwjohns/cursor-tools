Querying perplexity using sonar-pro for: cursor-tools installation guide with maxTokens: 8000
Here's a comprehensive guide on how to install and set up cursor-tools:

## Installation

To install cursor-tools, follow these steps:

1. Ensure you have Node.js 18 or later installed on your system[4].

2. Run the interactive setup command:

```bash
npx cursor-tools@latest install .
```

This command will[4]:
- Add `cursor-tools` as a dev dependency in your package.json
- Guide you through API key configuration
- Update your Cursor project rules for integration

## Requirements

Before installation, make sure you have the following[4]:

- Node.js 18 or later
- Perplexity API key
- Google Gemini API key
- For browser commands:
  - Playwright (`npm install --global playwright`)
  - OpenAI API key or Anthropic API key (for `act`, `extract`, and `observe` commands)

## API Key Configuration

During the installation process, you'll be prompted to enter your API keys[4]. These will be stored in a `.cursor-tools.env` file.

## Cursor Integration

cursor-tools automatically configures Cursor by updating your project rules during installation[4]. This provides:

- Command suggestions
- Usage examples
- Context-aware assistance

For new installations, it uses the `.cursor/rules/cursor-tools.mdc` file. For existing installations, it maintains compatibility with the legacy `.cursorrules` file[4].

## Cursor Agent Configuration

To get the full benefits of cursor-tools, use Cursor agent in "yolo mode"[4]. This allows the agent to execute commands directly.

## Usage

After installation, you can use cursor-tools in your projects. Here are some example commands:

1. Web search:
```bash
cursor-tools web "your query"
```

2. Repository search:
```bash
cursor-tools repo "your query"
```

3. Generate documentation:
```bash
cursor-tools doc "repository_url" "output_file.md"
```

4. GitHub integration:
```bash
cursor-tools github "fetch issue 123"
```

5. Browser automation:
```bash
cursor-tools browser open "https://example.com"
```

## Troubleshooting

If you encounter issues during installation or usage:

1. Ensure `cursor-tools` is properly installed and in your PATH[4].
2. Verify that the `.cursor-tools.env` file exists and contains valid API keys[4].
3. For GitHub operations, ensure your token has the required scopes (repo, read:user)[4].
4. Check your internet connection and API key permissions for model-related errors[4].

Remember, you can always run `cursor-tools install` again to reconfigure API keys or update your Cursor project rules[4].

By following this guide, you should be able to successfully install and set up cursor-tools for use with your Cursor AI editor.