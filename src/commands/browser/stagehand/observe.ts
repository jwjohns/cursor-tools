import type { Command, CommandGenerator } from '../../../types';
import {
  initializeBrowser,
  formatOutput,
  handleBrowserError,
  ObservationError,
  NavigationError,
} from './stagehandUtils';
import type { Page } from 'playwright';
import type { ObservationResult } from '../../../types/browser/browser';
import type { SharedBrowserCommandOptions } from '../browserOptions';
import {
  setupConsoleLogging,
  setupNetworkMonitoring,
  captureScreenshot,
  outputMessages,
  withVideoRecording,
  BROWSER_LAUNCHED_MESSAGE,
} from '../utilsShared';

export class ObserveCommand implements Command {
  async *execute(query: string, options?: SharedBrowserCommandOptions): CommandGenerator {
    if (!options?.url) {
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
        await page.goto(options.url);
      } catch (error) {
        throw new NavigationError(
          `Failed to navigate to ${options.url}. Please check if the URL is correct and accessible.`,
          error
        );
      }

      yield BROWSER_LAUNCHED_MESSAGE
      // TODO: Replace with actual Stagehand observe implementation once available
      // For now, we'll simulate observation using Playwright
      const result = await this.simulateObservation(page, query);

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
      console.error(error)
      yield handleBrowserError(error, options?.debug);
    } finally {
      await browser.close();
    }
  }

  private async simulateObservation(page: Page, instruction?: string): Promise<ObservationResult> {
    // This is a temporary implementation until Stagehand is available
    try {
      const elements = await page.$$eval('*', (elements) => {
        const isInteractive = (element: Element): boolean => {
          if (!(element instanceof HTMLElement)) return false;

          const tagName = element.tagName.toLowerCase();

          // Check for common interactive elements
          return (
            tagName === 'a' ||
            tagName === 'button' ||
            tagName === 'input' ||
            tagName === 'select' ||
            tagName === 'textarea' ||
            element.getAttribute('role') === 'button' ||
            element.getAttribute('role') === 'link' ||
            element.getAttribute('onclick') !== null ||
            element.getAttribute('tabindex') !== null
          );
        };

        const getElementDescription = (
          element: Element
        ): { type: string; description: string; actions: string[]; location: string } | null => {
          if (!isInteractive(element)) return null;

          const tagName = element.tagName.toLowerCase();
          const type = element.getAttribute('type')?.toLowerCase();
          const text = element.textContent?.trim() || '';
          const ariaLabel = element.getAttribute('aria-label');
          const placeholder = (element as HTMLInputElement).placeholder;
          const description = ariaLabel || text || placeholder || `${tagName} element`;

          const actions: string[] = [];
          if (tagName === 'a') actions.push('click', 'hover');
          if (tagName === 'button') actions.push('click');
          if (tagName === 'input') {
            if (type === 'text' || type === 'email' || type === 'password') {
              actions.push('type', 'focus', 'blur');
            } else if (type === 'checkbox' || type === 'radio') {
              actions.push('click', 'check');
            } else {
              actions.push('click');
            }
          }
          if (tagName === 'select') actions.push('select');
          if (tagName === 'textarea') actions.push('type', 'focus', 'blur');

          // Get a simple path to the element
          let location = '';
          let current: Element | null = element;
          while (current && current.tagName !== 'BODY') {
            const tag = current.tagName.toLowerCase();
            const id = current.id ? `#${current.id}` : '';
            const classes = Array.from(current.classList)
              .map((c) => `.${c}`)
              .join('');
            location = `${tag}${id}${classes} > ${location}`;
            current = current.parentElement;
          }
          location = location.replace(/ > $/, '');

          return {
            type: tagName,
            description,
            actions,
            location,
          };
        };

        return elements
          .map(getElementDescription)
          .filter((desc): desc is NonNullable<typeof desc> => desc !== null);
      });

      if (elements.length === 0) {
        throw new ObservationError('No interactive elements found on the page', {
          instruction,
          pageContent: await page.content(),
        });
      }

      const summary = `Found ${elements.length} interactive elements on the page`;

      return {
        elements,
        summary,
      };
    } catch (error) {
      if (error instanceof ObservationError) {
        throw error;
      }
      throw new ObservationError('Failed to observe interactive elements on the page', {
        instruction,
        error,
        pageContent: await page.content(),
      });
    }
  }
}

// Wrap the execute method with video recording functionality
ObserveCommand.prototype.execute = withVideoRecording(ObserveCommand.prototype.execute);
