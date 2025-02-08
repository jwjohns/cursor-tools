import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

export const CURSOR_RULES_VERSION = packageJson.version; // Using version from package.json

const NEW_CURSOR_RULES_PATH = '.cursor/rules/cursor-tool.mdc';
const LEGACY_CURSOR_RULES_PATH = '.cursorrules';

export const CURSOR_RULES_TEMPLATE = `<cursor-tools Integration>
# Instructions
Use the following commands to get AI assistance:

**Web Search:**
\`cursor-tools web "<your question>"\` - Get answers from the web using Perplexity AI (e.g., \`cursor-tools web "latest weather in London"\`)
when using web for complex queries suggest writing the output to a file somewhere like local-research/<query summary>.md.

**Repository Context:**
\`cursor-tools repo "<your question>"\` - Get context-aware answers about this repository using Google Gemini (e.g., \`cursor-tools repo "explain authentication flow"\`)

**Documentation Generation:**
\`cursor-tools doc [options]\` - Generate comprehensive documentation for this repository (e.g., \`cursor-tools doc --output docs.md\`)
when using doc for remote repos suggest writing the output to a file somewhere like local-docs/<repo-name>.md.

**GitHub Information:**
\`cursor-tools github pr [number]\` - Get the last 10 PRs, or a specific PR by number (e.g., \`cursor-tools github pr 123\`)
\`cursor-tools github issue [number]\` - Get the last 10 issues, or a specific issue by number (e.g., \`cursor-tools github issue 456\`)

**Browser Automation (Stateless):**
\`cursor-tools browser open <url> [options]\` - Open a URL and capture page content, console logs, and network activity (e.g., \`cursor-tools browser open "https://example.com" --html\`)
\`cursor-tools browser act "<instruction>" --url=<url> [options]\` - Execute actions on a webpage using natural language instructions (e.g., \`cursor-tools browser act "Click Login" --url=https://example.com\`)
\`cursor-tools browser observe "<instruction>" --url=<url> [options]\` - Observe interactive elements on a webpage and suggest possible actions (e.g., \`cursor-tools browser observe "interactive elements" --url=https://example.com\`)
\`cursor-tools browser extract "<instruction>" --url=<url> [options]\` - Extract data from a webpage based on natural language instructions (e.g., \`cursor-tools browser extract "product names" --url=https://example.com/products\`)

**Notes on Browser Commands:**
- All browser commands are stateless: each command starts with a fresh browser instance and closes it when done.
- When using \`--connect-to\`, special URL values are supported:
  - \`current\`: Use the existing page without reloading
  - \`reload-current\`: Use the existing page and refresh it (useful in development)
- Multi step workflows involving state or combining multiple actions are supported in the \`act\` command using the pipe (|) separator (e.g., \`cursor-tools browser act "Click Login | Type 'user@example.com' into email | Click Submit" --url=https://example.com\`)
- Video recording is available for all browser commands using the \`--video=<directory>\` option. This will save a video of the entire browser interaction at 1280x720 resolution. The video file will be saved in the specified directory with a timestamp.
- DO NOT ask browser act to "wait" for anything, the wait command is currently disabled in Stagehand.

**Tool Recommendations:**
- \`cursor-tools web\` is best for general web information not specific to the repository.
- \`cursor-tools repo\` is ideal for repository-specific questions, planning, code review and debugging.
- \`cursor-tools doc\` generates documentation for local or remote repositories.
- \`cursor-tools browser\` is useful for testing and debugging web apps.

**Running Commands:**
1. **Installed version:** Use \`cursor-tools <command>\` (if in PATH) or \`npm exec cursor-tools "<command>"\`, \`yarn cursor-tools "<command>"\`, \`pnpm cursor-tools "<command>"\`.
2. **Without installation:** Use \`npx -y cursor-tools@latest "<command>"\` or \`bunx -y cursor-tools@latest "<command>"\`.

**General Command Options (Supported by all commands):**
--model=<model name>: Specify an alternative AI model to use
--max-tokens=<number>: Control response length
--save-to=<file path>: Save command output to a file (in *addition* to displaying it)
--help: View all available options (help is not fully implemented yet)

**Documentation Command Options:**
--from-github=<GitHub username>/<repository name>[@<branch>]: Generate documentation for a remote GitHub repository

**GitHub Command Options:**
--from-github=<GitHub username>/<repository name>[@<branch>]: Access PRs/issues from a specific GitHub repository

**Browser Command Options (for 'open', 'act', 'observe', 'extract'):**
--console: Capture browser console logs (enabled by default, use --no-console to disable)
--html: Capture page HTML content
--network: Capture network activity (enabled by default, use --no-network to disable)
--screenshot=<file path>: Save a screenshot of the page
--timeout=<milliseconds>: Set navigation timeout (default: 30000ms)
--viewport=<width>x<height>: Set viewport size (e.g., 1280x720). When using --connect-to, viewport is only changed if this option is explicitly provided
--headless: Run browser in headless mode (default: true)
--no-headless: Show browser UI (non-headless mode) for debugging
--connect-to=<port>: Connect to existing Chrome instance
--wait=<duration or selector>: Wait after page load (e.g., '5s', '#element-id', 'selector:.my-class')
--video=<directory>: Save a video recording of the browser interaction to the specified directory (1280x720 resolution). Not available when using --connect-to

**Additional Notes:**
- For detailed information, see \`node_modules/cursor-tools/README.md\` (if installed locally).
- Configuration is in \`cursor-tools.config.json\` (or \`~/.cursor-tools/config.json\`).
- API keys are loaded from \`.cursor-tools.env\` (or \`~/.cursor-tools/.env\`).
- Browser commands require separate installation of Playwright: \`npm install --save-dev playwright\` or \`npm install -g playwright\`.
- **Remember:** You're part of a team of superhuman expert AIs. Work together to solve complex problems.
<!-- cursor-tools-version: ${CURSOR_RULES_VERSION} -->
</cursor-tools Integration>`;

function getCursorRulesPath(workspacePath: string): string | null {
  const newPath = join(workspacePath, NEW_CURSOR_RULES_PATH);
  if (existsSync(newPath)) {
    return newPath;
  }

  const legacyPath = join(workspacePath, LEGACY_CURSOR_RULES_PATH);
  if (existsSync(legacyPath)) {
    console.warn(
      '\x1b[33m%s\x1b[0m', // Yellow text
      'Warning: You are using the legacy .cursorrules file for cursor-tools integration.\n' +
        'Please migrate to the new standard: .cursor/rules/cursor-tool.mdc\n' +
        '  1. Copy the contents of .cursorrules to .cursor/rules/cursor-tool.mdc\n' +
        '  2. Delete the .cursorrules file\n' +
        '  Future versions of cursor-tools will only support .cursor/rules/cursor-tool.mdc'
    );
    return legacyPath;
  }

  return null; // Neither file found
}

export function checkCursorRules(workspacePath: string): {
  needsUpdate: boolean;
  message?: string;
} {
  const rulesPath = getCursorRulesPath(workspacePath);

  if (!rulesPath) {
    return {
      needsUpdate: true,
      message:
        'No .cursor/rules/cursor-tool.mdc or .cursorrules file found. Run `cursor-tools install .` to set up Cursor integration.',
    };
  }

  try {
    const content = readFileSync(rulesPath, 'utf-8');
    const startTag = '<cursor-tools Integration>';
    const endTag = '</cursor-tools Integration>';

    if (!content.includes(startTag) || !content.includes(endTag)) {
      return {
        needsUpdate: true,
        message:
          'cursor-tools section not found in Cursor rules file. Run `cursor-tools install .` to update.',
      };
    }

    const versionMatch = content.match(
      /<!-- cursor-tools-version: ([\w.-]+) -->/
    );
    const currentVersion = versionMatch ? versionMatch[1] : '0';

    if (currentVersion !== CURSOR_RULES_VERSION) {
      return {
        needsUpdate: true,
        message: `Your Cursor rules file is using version ${currentVersion}, but version ${CURSOR_RULES_VERSION} is available. Run \`cursor-tools install .\` to update.`,
      };
    }

    return { needsUpdate: false };
  } catch (error) {
    return {
      needsUpdate: true,
      message: `Error reading Cursor rules file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

// New function to get the content, handling the logic
export function getCursorRulesContent(workspacePath: string): string | null {
  const rulesPath = getCursorRulesPath(workspacePath);
  if (!rulesPath) {
    return null;
  }
  try {
    return readFileSync(rulesPath, 'utf-8');
  } catch (error) {
    console.error(
      `Error reading Cursor rules file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    return null;
  }
}

// New function to write the new cursor rules file, ensuring the directory exists
export function writeCursorRules(workspacePath: string): void {
  const newPath = join(workspacePath, NEW_CURSOR_RULES_PATH);
  const dir = dirname(newPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(newPath, CURSOR_RULES_TEMPLATE);
}
