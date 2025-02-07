import type { Command, CommandGenerator } from '../src/types';
import {
  formatOutput,
  handleBrowserError,
  ActionError,
  NavigationError,
} from '../src/commands/browser/stagehand/stagehandUtils';
import { ConstructorParams, Stagehand, BrowserContext, InitResult, LogLine, BrowserResult } from '@browserbasehq/stagehand';
import { loadConfig, loadEnv } from '../src/config';
import {
  loadStagehandConfig,
  validateStagehandConfig,
  getStagehandApiKey,
  getStagehandModel,
} from '../src/commands/browser/stagehand/config';
import type { SharedBrowserCommandOptions } from '../src/commands/browser/browserOptions';
import {
  setupConsoleLogging,
  setupNetworkMonitoring,
  captureScreenshot,
  outputMessages,
  withVideoRecording,
  BROWSER_LAUNCHED_MESSAGE,
} from '../src/commands/browser/utilsShared';
import { chromium } from 'playwright';
import path from "path";
import fs from "fs";
import os from "os";
import { configDotenv } from 'dotenv';

loadEnv();

export class ActCommand implements Command {
  page: Stagehand['page'] | undefined;

  async *execute(query: string, options?: SharedBrowserCommandOptions): CommandGenerator {
    if (!query) {
      yield 'Please provide an instruction and URL. Usage: browser act "<instruction>" --url <url>';
      return;
    }

    const url = options?.url;
    if (!url) {
      yield 'Please provide a URL using the --url option';
      return;
    }

    // Load and validate configuration
    const config = loadConfig();
    const stagehandConfig = loadStagehandConfig(config);
    validateStagehandConfig(stagehandConfig);

    let stagehand: Stagehand | undefined;
    let actionSuccessful = false;
    let consoleMessages: string[] = [];
    let networkMessages: string[] = [];

    try {
      const config = {
        env: 'LOCAL',
        headless: stagehandConfig.headless,
        verbose: stagehandConfig.verbose ? 1 : 0,
        debugDom: stagehandConfig.debugDom,
        modelName: getStagehandModel(stagehandConfig),
        apiKey: getStagehandApiKey(stagehandConfig),
        enableCaching: stagehandConfig.enableCaching,
        logger: (message) => {
          console.log('stagehand message', message);
          if ((message.level ?? 0) <= config.verbose) {
            console.log('stagehand message', message);
          }
        },
      } satisfies ConstructorParams;

      console.log('using stagehand config', config);
      stagehand = new Stagehand(config);

      // Initialize with timeout
      const initPromise = stagehand.init();
      const initTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 30000)
      );
      await Promise.race([initPromise, initTimeoutPromise])

    //   // Setup console and network monitoring
    //   consoleMessages = await setupConsoleLogging(stagehand.page, options || {});
    //   networkMessages = await setupNetworkMonitoring(stagehand.page, options || {});

    //   this.page = stagehand.page;
      
      try {
        // Navigate with timeout
        const gotoPromise = stagehand.page.goto(url);
        const gotoTimeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Navigation timeout')),
            stagehandConfig.timeout ?? 30000
          )
        );
        await Promise.race([gotoPromise, gotoTimeoutPromise]);
      } catch (error) {
        throw new NavigationError(
          `Failed to navigate to ${url}. Please check if the URL is correct and accessible.`,
          error
        );
      }

      yield BROWSER_LAUNCHED_MESSAGE
      const result = await this.performAction(stagehand, query, options.timeout ?? stagehandConfig.timeout);
      actionSuccessful = true;

      // Take screenshot if requested
      await captureScreenshot(stagehand.page, options || {});

      // Output result and messages
      yield formatOutput(result, options?.debug);
      for (const message of outputMessages(consoleMessages, networkMessages, options || {})) {
        yield message;
      }

      if (options?.screenshot) {
        yield `Screenshot saved to ${options.screenshot}\n`;
      }
    } catch (error) {
      yield handleBrowserError(error, options?.debug);
    } finally {
      try {
        // Clean up with timeout
        await Promise.race([
          stagehand?.close(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Page close timeout')), 5000)
          ),
        ]);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }

      if (!actionSuccessful) {
        process.exit(1);
      }
    }
  }

  private async performAction(
    stagehand: Stagehand,
    instruction: string,
    timeout = 60000
  ): Promise<string> {
    try {

      console.log("perform action timeout", {timeout})
      // Get the current URL before the action
      const startUrl = await stagehand.page.url();

      // Perform action with timeout
      const actionPromise = stagehand.page.act(instruction);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Action timeout')), timeout)
      );

      await Promise.race([actionPromise, timeoutPromise]);

      // Wait for potential navigation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the current URL after the action
      const endUrl = await stagehand.page.url();

      // If the URL changed, consider the action successful
      if (endUrl !== startUrl) {
        return `Successfully performed action: ${instruction} (final url ${endUrl})`;
      }

      return `Successfully performed action: ${instruction}`;
    } catch (error) {
      if (error instanceof Error) {
        throw new ActionError(
          `${error.message} error occured while performing action:\n${instruction}. `,
          {
            instruction,
            error,
            
          }
        );
      }
      throw error;
    }
  }
}

// Wrap the execute method with video recording functionality
ActCommand.prototype.execute = withVideoRecording(ActCommand.prototype.execute);



const oldInit = Stagehand.prototype.init;
const tempStagehand = new Stagehand({
  env: "LOCAL",
  apiKey: "test",
  verbose: 0,
  debugDom: false,
  headless: true,
  logger: () => {},
});
await oldInit.call(tempStagehand);
const StagehandPage = tempStagehand["stagehandPage"]!.constructor;
const StagehandContext = tempStagehand["stagehandContext"]!.constructor;
await tempStagehand.close();

//@ts-ignore
Stagehand.prototype.init = async function myinit(initOptions: undefined | { recordVideo: RecordVideoOptions }) : Promise<InitResult> {

  const { context, contextPath, sessionId, env } =
    await getBrowser(
      this["apiKey"],
      this["projectId"],
      this.env,
      this.headless,
      initOptions?.recordVideo,
      this.logger,
    )
  this["intEnv"] = env;
  this["contextPath"] = contextPath;
  this["stagehandContext"] = await StagehandContext.init(
    context, 
    // @ts-ignore
    this
  );
  const defaultPage = this.context.pages()[0];
  this["stagehandPage"] = await new StagehandPage(
    defaultPage,
    // @ts-ignore
    this,
    this["stagehandContext"],
    this["llmClient"],
    this["userProvidedInstructions"],
  ).init();

  // Set the browser to headless mode if specified
  if (this.headless) {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  // await this.context.addInitScript({
  //   content: scriptContent,
  // });

  this.browserbaseSessionID = sessionId;

  return { debugUrl: "", sessionUrl: "", sessionId: "" };
}

async function getBrowser(
  apiKey: string | undefined,
  projectId: string | undefined,
  env: "LOCAL" | "BROWSERBASE" = "LOCAL",
  headless: boolean = false,
  recordVideo: RecordVideoOptions | undefined,
  logger: (message: LogLine) => void,

): Promise<BrowserResult> {

    logger({
      category: "init",
      message: "launching local browser",
      level: 0,
      auxiliary: {
        headless: {
          value: headless.toString(),
          type: "boolean",
        },
      },
    });

    const tmpDirPath = path.join(os.tmpdir(), "stagehand");
    if (!fs.existsSync(tmpDirPath)) {
      fs.mkdirSync(tmpDirPath, { recursive: true });
    }

    const tmpDir = fs.mkdtempSync(path.join(tmpDirPath, "ctx_"));
    fs.mkdirSync(path.join(tmpDir, "userdir/Default"), { recursive: true });

    const defaultPreferences = {
      plugins: {
        always_open_pdf_externally: true,
      },
    };

    fs.writeFileSync(
      path.join(tmpDir, "userdir/Default/Preferences"),
      JSON.stringify(defaultPreferences),
    );

    const downloadsPath = path.join(process.cwd(), "downloads");
    fs.mkdirSync(downloadsPath, { recursive: true });

    const context = await chromium.launchPersistentContext(
      path.join(tmpDir, "userdir"),
      {
        recordVideo,
        acceptDownloads: true,
        headless: headless,
        viewport: {
          width: 1250,
          height: 800,
        },
        locale: "en-US",
        timezoneId: "America/New_York",
        deviceScaleFactor: 1,
        args: [
          "--enable-webgl",
          "--use-gl=swiftshader",
          "--enable-accelerated-2d-canvas",
          "--disable-blink-features=AutomationControlled",
          "--disable-web-security",
        ],
        bypassCSP: true,
      },
    );

    logger({
      category: "init",
      message: "local browser started successfully.",
    });

    await applyStealthScripts(context);

    return { context, contextPath: tmpDir, env: "LOCAL" };
}

async function applyStealthScripts(context: BrowserContext) {
  await context.addInitScript(() => {
    // Override the navigator.webdriver property
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });

    // Mock languages and plugins to mimic a real browser
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });

    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });

    // Remove Playwright-specific properties
    // @ts-ignore
    delete window.__playwright;
    // @ts-ignore
    delete window.__pw_manual;
    // @ts-ignore
    delete window.__PW_inspect;

    // Redefine the headless property
    Object.defineProperty(navigator, "headless", {
      get: () => false,
    });

    // Override the permissions API
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({
            state: Notification.permission,
          } as PermissionStatus)
        : originalQuery(parameters);
  });
}

export type RecordVideoOptions = {
  /**
   * Path to the directory to put videos into.
   */
  dir: string;

  /**
   * Optional dimensions of the recorded videos. If not specified the size will be equal to `viewport` scaled down to
   * fit into 800x800. If `viewport` is not configured explicitly the video size defaults to 800x450. Actual picture of
   * each page will be scaled down if necessary to fit the specified size.
   */
  size?: {
    /**
     * Video frame width.
     */
    width: number;

    /**
     * Video frame height.
     */
    height: number;
  };
};


for await (const message of new ActCommand().execute("test", {
  url: "https://www.google.com",
  timeout: 60000,
  screenshot: "screenshot.png",
  debug: true,
  headless: false,
})) {
  console.log(message);
}
