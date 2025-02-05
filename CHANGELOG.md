# Changelog

All notable changes to this project will be documented in this file.

## [0.4.1] - 2024-03-19

### Changed
- Changed default tokenizer to `o200k_base` for better compatibility with Gemini models
- Added configurable tokenizer support through `tokenCount.encoding` in config file
- Updated documentation to reflect new tokenizer configuration options

## [0.4.0] - 2024-03-19

### Improvements
- Big improvements to robustness of command line arguments
- Introduces doc command to generate documentation for local or remote repositories
- Introduces github command to access PRs and issues from github
  - Support for listing recent PRs and issues
  - Detailed view of PR/issue discussions and code review comments
  - Multiple authentication methods:
    - GitHub token via environment variable
    - GitHub CLI integration for automatic token generation
    - Git credentials support (stored tokens or Basic Auth)
  - Support for both local and remote repositories
  - Markdown-formatted output for readability
- Use token count estimation to switch gemini models to pro if repository is large to fit any other model
- Updates GitHub model names to latest versions
- Updates Perplexity model names to latest versions
- Added version command to display the current version of cursor-tools

### Fixed
- Improved GitHub authentication error handling and rate limit messages
- Better detection of stored GitHub tokens in git credentials
- Fixed authentication status messages to accurately reflect available methods

## [0.3.4] - 2024-03-19

### Fixed
- Fixed ESM compatibility issues with Node.js built-in modules
- Removed bundling of Node.js built-ins for better ESM support
- Reduced bundle size by externalizing Node.js core modules

## [0.3.3] - 2024-03-19

### Fixed
- Fixed dynamic require issues with Node.js built-in modules
- Updated build configuration to properly handle Node.js built-ins in ESM context

## [0.3.2] - 2024-03-19

### Fixed
- Fixed dynamic require of url module in ESM context
- Updated import-meta-url.js to use proper ESM imports

## [0.3.1] - 2024-03-19

### Changed
- Improved release process with dedicated release script
- Fixed ESM compatibility issues with dependencies
- Added better error handling for git operations during release

## [0.3.0] - 2024-03-19

### Changed
- Updated build configuration to output ES Module format for better Node.js 20+ compatibility
- Changed output file from CommonJS (.cjs) to ES Module (.mjs)
- Fixed ESM compatibility issues with dependencies

## [0.2.0] - 2024-03-19

### Added
- Added branch support for GitHub repositories in `doc` command
  - Support for specifying branch using `@branch` syntax (e.g. `--fromGithub=username/repo@branch`)
  - Works with both HTTPS URLs and shorthand format
  - Properly integrates with repomix API using the `ref` parameter

## [0.1.0] - 2024-03-19

### Added
- New `doc` command to generate comprehensive repository documentation
  - Support for local repository documentation generation
  - Support for remote GitHub repository documentation via `--fromGithub` option
  - Option to save documentation to file with `--output`
- Development mode support via `pnpm dev` for running latest code without building

### Changed
- Updated `.cursorrules` to include documentation for the new `doc` command
- Improved command-line argument parsing for better option handling

## [0.0.14] - Previous Release

Initial release with basic functionality:
- Web search using Perplexity AI
- Repository context-aware answers using Google Gemini
- Installation and configuration utilities 