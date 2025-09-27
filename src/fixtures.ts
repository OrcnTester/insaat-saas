import { test as base, Page } from '@playwright/test';
import { ConsoleLogger } from './utils/consoleLogger';

type Fixtures = { pageWithConsole: Page };

export const test = base.extend<Fixtures>({
  pageWithConsole: async ({ page }, use, testInfo) => {
    const logger = new ConsoleLogger();
    logger.start(testInfo.title);

    const listener = (msg: any) => {
      logger.attach(`[${new Date().toISOString()}] [${msg.type()}] ${msg.text()}`);
    };
    page.on('console', listener);

    await use(page);

    page.off('console', listener);
    logger.stop();
    await testInfo.attach('console-log', {
      path: `logs/${testInfo.title.replace(/[^a-z0-9-_]+/gi, '_')}.log`,
      contentType: 'text/plain'
    });
  }
});

export const expect = base.expect;
