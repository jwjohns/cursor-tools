
--- Repository Documentation ---

# Repomix Documentation

Repomix packs your repository into a single AI-friendly file. It helps analyze, review, and process codebases using AI systems.

## What is Repomix?

Repomix is a tool designed to package repository contents into a single file. This packed representation is optimized for AI systems, facilitating codebase analysis and processing.

Key features include:

- Configurable ignore patterns
- Custom header text support
- Efficient file processing and packing
- Security checks for sensitive information
- Multiple output styles (plain text, XML, Markdown)

## Quick Start

### Installation

Using npx (no installation required):

```bash
npx repomix
```

For global installation using npm:

```bash
npm install -g repomix
```

### Usage

To pack your entire repository, run:

```bash
repomix
```

This command generates `repomix-output.txt` in your current directory. This file contains your entire repository content in a single AI-friendly format.

## Configuration

Repomix can be configured via:

- `repomix.config.json` file
- Command-line options

### Configuration File (`repomix.config.json`)

Create `repomix.config.json` in your project root to customize Repomix.

Example `repomix.config.json`:

```json
{
  "output": {
    "filePath": "repomix-output.xml",
    "style": "xml",
    "headerText": "Custom header text for AI context.",
    "instructionFilePath": "repomix-instruction.md",
    "fileSummary": true,
    "directoryStructure": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "topFilesLength": 5,
    "showLineNumbers": false
  },
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": ["tmp/", "*.log"]
  },
  "security": {
    "enableSecurityCheck": true
  }
}
```

To initialize a configuration file, run:

```bash
repomix --init
```

For global configuration, use:

```bash
repomix --init --global
```

### Configuration Options

| Option                     | CLI Option                    | Type    | Description                                                                                                 | Default                  |
|-----------------------------|---------------------------------|---------|-------------------------------------------------------------------------------------------------------------|--------------------------|
| `output.filePath`           | `-o, --output <file>`           | string  | Output file path.                                                                                             | `repomix-output.txt`     |
| `output.style`              | `--style <type>`                | string  | Output style: `plain`, `xml`, `markdown`.                                                                   | `plain`                  |
| `output.parsableStyle`      | `--parsable-style`              | boolean | Ensure output is parsable as a document of its type.                                                         | `false`                  |
| `output.headerText`         | `--header-text <text>`          | string  | Custom header text in output file.                                                                          | `""`                     |
| `output.instructionFilePath`| `--instruction-file-path <path>`| string  | Path to a file containing custom instructions for AI.                                                      | `""`                     |
| `output.fileSummary`        | `--no-file-summary`             | boolean | Include file summary section in output.                                                                      | `true`                   |
| `output.directoryStructure` | `--no-directory-structure`      | boolean | Include directory structure section in output.                                                                 | `true`                   |
| `output.removeComments`     | `--remove-comments`             | boolean | Remove comments from supported file types.                                                                    | `false`                  |
| `output.removeEmptyLines`   | `--remove-empty-lines`          | boolean | Remove empty lines from output.                                                                               | `false`                  |
| `output.topFilesLength`     | `--top-files-len <number>`      | number  | Number of top files to display in summary.                                                                    | `5`                      |
| `output.showLineNumbers`    | `--output-show-line-numbers`    | boolean | Show line numbers in output.                                                                                  | `false`                  |
| `output.copyToClipboard`    | `--copy`                        | boolean | Copy output to clipboard.                                                                                     | `false`                  |
| `output.includeEmptyDirectories`| `--include-empty-directories` | boolean | Include empty directories in output.                                                                        | `false`                  |
| `include`                   | `--include <patterns>`          | array   | Array of glob patterns to include.                                                                          | `[]`                     |
| `ignore.useGitignore`       | `--no-gitignore`                | boolean | Use `.gitignore` file for ignore patterns.                                                                  | `true`                   |
| `ignore.useDefaultPatterns` | `--no-default-patterns`         | boolean | Use default ignore patterns.                                                                                 | `true`                   |
| `ignore.customPatterns`     | `-i, --ignore <patterns>`       | array   | Array of custom glob patterns to ignore.                                                                     | `[]`                     |
| `security.enableSecurityCheck`| `--no-security-check`         | boolean | Enable security check to prevent inclusion of sensitive information.                                         | `true`                   |
| `tokenCount.encoding`       | `--token-count-encoding <encoding>`| string  | Token count encoding for AI model context limits (e.g., `o200k_base`, `cl100k_base`).                         | `o200k_base`             |

## Features

### Output Styles

Repomix supports three output styles:

- **Plain**: Simple text format with separators.
- **XML**: Structured XML format, optimized for AI parsing.
- **Markdown**: Markdown format for readability and structure.

Use the `--style <style>` option or configure `output.style` in `repomix.config.json` to change the output style.

### Ignore Patterns

Repomix allows flexible file exclusion using:

- **.gitignore**: Respects `.gitignore` by default. Disable with `--no-gitignore`.
- **Default Patterns**: Excludes common directories like `node_modules`, `.git`. Disable with `--no-default-patterns`.
- **`.repomixignore`**:  Create `.repomixignore` for Repomix-specific ignore rules.
- **Custom Patterns**: Use `-i, --ignore <patterns>` or `ignore.customPatterns` to add custom ignore patterns.

### Security Check

Repomix includes a security check using Secretlint to detect sensitive information like API keys and credentials. Enabled by default, disable with `--no-security-check` or `security.enableSecurityCheck: false`.

### Remote Repository Processing

Process remote Git repositories directly using:

```bash
repomix --remote <repository_url>
```

Supports GitHub URLs and shorthand (`user/repo`). Specify branch, tag, or commit with `--remote-branch <name>`.

### Custom Instructions

Include custom instructions for AI in the output file. Create `repomix-instruction.md` and specify its path in `repomix.config.json` using `output.instructionFilePath`.

## Dependencies

Key dependencies:

- `@clack/prompts`
- `commander`
- `globby`
- `handlebars`
- `tiktoken`
- `zod`
- `@secretlint/*`

--- End of Documentation ---
