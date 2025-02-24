/**
 * Checks if Playwright and its browsers are available and returns version/status information
 * @returns Object containing availability status and browser installation info
 */
export async function checkPlaywright(): Promise<{
  available: boolean;
  error?: string;
  browsers?: {
    chromium: boolean;
    firefox: boolean;
    webkit: boolean;
  };
}> {
  try {
    // Try to dynamically import playwright
    const playwright = await import('playwright');
    if (!playwright) {
      return { available: false, error: 'Playwright package not found' };
    }

    // Check browser installations
    const browsers = {
      chromium: false,
      firefox: false,
      webkit: false
    };

    try {
      // This will throw if browsers are not installed
      await Promise.all([
        playwright.chromium.launch().then(browser => {
          browsers.chromium = true;
          return browser.close();
        }).catch(() => {}),
        playwright.firefox.launch().then(browser => {
          browsers.firefox = true;
          return browser.close();
        }).catch(() => {}),
        playwright.webkit.launch().then(browser => {
          browsers.webkit = true;
          return browser.close();
        }).catch(() => {})
      ]);

      // If no browsers are installed, return an error
      if (!browsers.chromium && !browsers.firefox && !browsers.webkit) {
        return {
          available: false,
          browsers,
          error: 'Playwright browsers are not installed. Please install them using:\n  pnpm exec playwright install'
        };
      }

      return { available: true, browsers };

    } catch (error) {
      if (error instanceof Error) {
        return {
          available: false,
          browsers,
          error: `Error checking browser installations: ${error.message}\nPlease install browsers using:\n  pnpm exec playwright install`
        };
      }
      return {
        available: false,
        browsers,
        error: 'Unknown error while checking browser installations'
      };
    }
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('Cannot find package')) {
        return {
          available: false,
          error: 'Playwright is not installed. Please install it using:\n  pnpm add playwright'
        };
      }
      return { available: false, error: error.message };
    }
    return { available: false, error: 'Unknown error while checking Playwright' };
  }
}

/**
 * Ensures Playwright and required browsers are available before proceeding
 * @returns true if Playwright and at least one browser is available, throws error if not
 */
export async function ensurePlaywright(): Promise<boolean> {
  const { available, browsers, error } = await checkPlaywright();

  if (!available) {
    throw new Error(
      `Playwright is required for browser commands but is not available.\n` +
        `Error: ${error}\n`
    );
  }

  if (browsers && !browsers.chromium && !browsers.firefox && !browsers.webkit) {
    throw new Error(
      `Playwright browsers are required but none are installed.\n` +
      `Please install browsers using:\n` +
      `  pnpm exec playwright install\n\n` +
      `You can also install specific browsers:\n` +
      `  pnpm exec playwright install chromium\n` +
      `  pnpm exec playwright install firefox\n` +
      `  pnpm exec playwright install webkit`
    );
  }

  if (browsers) {
    const installedBrowsers = Object.entries(browsers)
      .filter(([, installed]) => installed)
      .map(([name]) => name)
      .join(', ');
    console.log(`Available browsers: ${installedBrowsers}`);
  }
  return true;
}
