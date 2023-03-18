import { expect, test } from '@playwright/test';
import { ElectronApplication, Page, _electron as electron } from 'playwright';
import path from 'path';

const { describe, beforeAll, afterAll } = test;

describe('Main', () => {
  let electronApp: ElectronApplication;

  beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join('release', 'app', 'dist', 'main', 'main.js')],
    });

    // await electronApp.evaluate(async ({ app }) => {
    //   // This runs in the main Electron process, parameter here is always
    //   // the result of the require('electron') in the main app script.
    // });

    const window: Page = await electronApp.firstWindow();

    // eslint-disable-next-line no-console
    window.on('console', console.log);
    // eslint-disable-next-line no-console
    window.on('pageerror', console.error);
  });

  test('opens window', async () => {
    const window = await electronApp.firstWindow();
    expect(window).toBeDefined();
  });
  test('has correct title', async () => {
    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    expect(await window.title()).toBe('ExifTor');
  });

  afterAll(async () => {
    await electronApp.close();
  });
});
