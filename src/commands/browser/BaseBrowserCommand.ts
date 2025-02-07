import { Browser, Page } from 'playwright';
import { Command } from '../../types';
import { loadConfig } from '../../config';
import { SharedBrowserCommandOptions } from './browserOptions';
import { ensurePlaywright } from './utils';
import { chromium } from 'playwright';
import {
  setupConsoleLogging,
  setupNetworkMonitoring,
  captureScreenshot,
  outputMessages,
} from './utilsShared';
import { join } from 'path';

/**
 * Base class for browser commands that handles common browser functionality
 */
export abstract class BaseBrowserCommand implements Command {
  protected browser?: Browser;
  protected page?: Page;
  protected config = loadConfig();
  protected consoleMessages: string[] = [];
  protected networkMessages: string[] = [];

  /**
   * Initialize browser and page with common setup
   */
  protected async initializeBrowser(options?: SharedBrowserCommandOptions): Promise<void> {
    // Check for Playwright availability first
    await ensurePlaywright();

    // Launch browser
    this.browser = await chromium.launch({
      headless: options?.headless !== undefined ? options.headless : (this.config.browser?.headless ?? true),
    });
    this.browser.contexts().forEach(async (context) => {
      await context
    });

    // Create new page with video recording if enabled
    const context = await this.browser.newContext({
      recordVideo: options?.video ? {
        dir: join(options.video, new Date().toISOString().replace(/[:.]/g, '-')),
        size: { width: 1280, height: 720 }
      } : undefined,
      serviceWorkers: 'allow',
      extraHTTPHeaders: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      },
    });

    this.page = await context.newPage();

    // Set up console and network monitoring
    this.consoleMessages = await setupConsoleLogging(this.page, options || {});
    this.networkMessages = await setupNetworkMonitoring(this.page, options || {});

    // Set viewport if specified
    if (options?.viewport) {
      const [width, height] = options.viewport.split('x').map(Number);
      if (!isNaN(width) && !isNaN(height)) {
        await this.page.setViewportSize({ width, height });
      }
    } else if (this.config.browser?.defaultViewport) {
      const [width, height] = this.config.browser.defaultViewport.split('x').map(Number);
      if (!isNaN(width) && !isNaN(height)) {
        await this.page.setViewportSize({ width, height });
      }
    }
  }

  /**
   * Navigate to a URL with timeout
   */
  protected async navigateToUrl(url: string, timeout?: number): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    await this.page.goto(url, { 
      timeout: timeout ?? this.config.browser?.timeout ?? 30000 
    });
  }

  /**
   * Clean up browser resources
   */
  protected async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Output console and network messages
   */
  protected *outputMessages(options?: SharedBrowserCommandOptions) {
    for (const message of outputMessages(this.consoleMessages, this.networkMessages, options || {})) {
      yield message;
    }
  }

  /**
   * Take screenshot if requested in options
   */
  protected async takeScreenshot(options?: SharedBrowserCommandOptions): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    await captureScreenshot(this.page, options || {});
  }

  abstract execute(query: string, options?: SharedBrowserCommandOptions): AsyncGenerator<string>;
} 
