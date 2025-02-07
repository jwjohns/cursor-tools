import type { Command, CommandGenerator } from '../../../types';
import {
  initializeBrowser,
  formatOutput,
  handleBrowserError,
  ExtractionSchemaError,
  NavigationError,
} from './stagehandUtils';
import type { Page } from 'playwright';
import type { SharedBrowserCommandOptions } from '../browserOptions';
import {
  setupConsoleLogging,
  setupNetworkMonitoring,
  captureScreenshot,
  outputMessages,
  withVideoRecording,
  BROWSER_LAUNCHED_MESSAGE,
} from '../utilsShared';

export class ExtractCommand implements Command {
  async *execute(query: string, options?: SharedBrowserCommandOptions): CommandGenerator {
    if (!query) {
      yield 'Please provide an extraction instruction and URL. Usage: browser extract "<instruction>" --url <url> [--schema <path>]';
      return;
    }

    const url = options?.url;
    if (!url) {
      yield 'Please provide a URL using the --url option';
      return;
    }

    let consoleMessages: string[] = [];
    let networkMessages: string[] = [];
    const { browser, page } = await initializeBrowser({
      headless: true,
      timeout: 30000,
    });

    try {
      // Setup console and network monitoring
      consoleMessages = await setupConsoleLogging(page, options);
      networkMessages = await setupNetworkMonitoring(page, options);

      try {
        await page.goto(url);
      } catch (error) {
        throw new NavigationError(
          `Failed to navigate to ${url}. Please check if the URL is correct and accessible.`,
          error
        );
      }

      yield BROWSER_LAUNCHED_MESSAGE
      // TODO: Replace with actual Stagehand extract implementation once available
      // For now, we'll simulate extraction using Playwright
      const result = await this.simulateExtraction(page, query);

      // Take screenshot if requested
      await captureScreenshot(page, options);

      // Output result and messages
      yield formatOutput(result, options?.debug);
      for (const message of outputMessages(consoleMessages, networkMessages, options)) {
        yield message;
      }

      if (options?.screenshot) {
        yield `Screenshot saved to ${options.screenshot}\n`;
      }
    } catch (error) {
      yield handleBrowserError(error, options?.debug);
    } finally {
      await browser.close();
    }
  }

  private async simulateExtraction(page: Page, instruction: string): Promise<unknown> {
    // This is a temporary implementation until Stagehand is available
    const normalizedInstruction = instruction.toLowerCase();

    // Basic extraction based on common instructions
    if (normalizedInstruction.includes('title')) {
      const title = await page.title();
      return title;
    }

    if (normalizedInstruction.includes('text')) {
      try {
        const text = await page.$eval('body', (el) => el.innerText);
        return text;
      } catch (error) {
        throw new ExtractionSchemaError('Failed to extract text content from the page', {
          instruction,
          error,
          pageContent: await page.content(),
        });
      }
    }

    if (normalizedInstruction.includes('links')) {
      try {
        const links = await page.$$eval('a', (elements) =>
          elements.map((a) => ({
            text: a.innerText,
            href: a.href,
          }))
        );
        return links;
      } catch (error) {
        throw new ExtractionSchemaError('Failed to extract links from the page', {
          instruction,
          error,
          availableElements: await page.$$eval('a', (elements) =>
            elements.map((el) => ({
              text: el.textContent?.trim(),
              href: el.getAttribute('href'),
            }))
          ),
        });
      }
    }

    if (normalizedInstruction.includes('images')) {
      try {
        const images = await page.$$eval('img', (elements) =>
          elements.map((img) => ({
            alt: img.alt,
            src: img.src,
          }))
        );
        return images;
      } catch (error) {
        throw new ExtractionSchemaError('Failed to extract images from the page', {
          instruction,
          error,
          availableElements: await page.$$eval('img', (elements) =>
            elements.map((el) => ({
              alt: el.getAttribute('alt'),
              src: el.getAttribute('src'),
            }))
          ),
        });
      }
    }

    // Default to extracting visible text content
    try {
      const content = await page.$eval('body', (body) => {
        const getVisibleText = (element: Element): string => {
          // Simple visibility check using offsetParent
          if (
            element instanceof HTMLElement &&
            !element.offsetParent &&
            element.tagName !== 'BODY'
          ) {
            return '';
          }

          let text = '';
          const childNodes = Array.from(element.childNodes);
          for (const child of childNodes) {
            if (child.nodeType === 3) {
              // Node.TEXT_NODE
              text += (child.textContent || '') + ' ';
            } else if (child.nodeType === 1) {
              // Node.ELEMENT_NODE
              text += getVisibleText(child as Element);
            }
          }
          return text;
        };

        return getVisibleText(body).trim();
      });

      return content;
    } catch (error) {
      throw new ExtractionSchemaError('Failed to extract visible text content from the page', {
        instruction,
        error,
        pageContent: await page.content(),
      });
    }
  }
}

// Wrap the execute method with video recording functionality
ExtractCommand.prototype.execute = withVideoRecording(ExtractCommand.prototype.execute);
