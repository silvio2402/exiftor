/* eslint-disable global-require */
import { vol } from 'memfs';
import path from 'path';
import { z } from 'zod';
import { SettingsWithVersion, MigrationFunctions } from 'common/settings-types';
import SettingsType from 'main/settings';

describe('Settings', () => {
  beforeAll(() => {
    jest.mock(`fs`, () => {
      const unionfs = require('unionfs').default;
      return unionfs.use(vol);
    });
  });
  beforeEach(() => {
    jest.resetModules();
    vol.reset();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to create an instance', async () => {
    jest.mock('electron', () => ({
      app: {
        getVersion: () => '0.0.0',
        getPath: () => path.join(__dirname, 'temp'),
      },
    }));

    const settingsSchema = z.object({
      version: z.string(),
    });
    const testSettings: z.infer<typeof settingsSchema> = {
      version: '0.0.0',
    };

    vol.fromJSON(
      {
        'settings.json': JSON.stringify(testSettings),
      },
      path.join(__dirname, 'temp')
    );

    const Settings = require('main/settings').default;

    const settings: SettingsType<SettingsWithVersion> = new Settings(
      testSettings,
      settingsSchema,
      {
        dir: __dirname,
        fileName: 'settings.json',
      }
    );
    await settings.init();

    const settingsData = await vol.promises.readFile(
      path.join(__dirname, 'temp', 'settings.json'),
      'utf-8'
    );

    const settingsObject = JSON.parse(String(settingsData));

    const { success } = settingsSchema.safeParse(settingsObject);

    expect(settings).toBeDefined();
    expect(success).toBe(true);
  });

  it('should upgrade', async () => {
    jest.mock('electron', () => ({
      app: {
        getVersion: () => '0.1.0',
        getPath: () => path.join(__dirname, 'temp'),
      },
    }));

    const settingsSchema = z.object({
      version: z.string(),
      hasMigrated: z.boolean(),
    });
    const testSettings: z.infer<typeof settingsSchema> = {
      version: '0.0.0',
      hasMigrated: false,
    };

    vol.fromJSON(
      {
        'settings.json': JSON.stringify(testSettings),
      },
      path.join(__dirname, 'temp')
    );

    const migrationFuncs: MigrationFunctions = {
      '0.1.0': {
        up: (oldSettings: SettingsWithVersion) => {
          const newSettings = {
            ...oldSettings,
            version: '0.1.0',
            hasMigrated: true,
          };
          return newSettings;
        },
      },
    };

    const Settings = require('main/settings').default;

    const settings: SettingsType<SettingsWithVersion> = new Settings(
      testSettings,
      settingsSchema,
      migrationFuncs,
      {
        atomicSave: false,
      }
    );
    await settings.init();

    const settingsData = await vol.promises.readFile(
      path.join(__dirname, 'temp', 'settings.json'),
      'utf-8'
    );

    const settingsObject = JSON.parse(String(settingsData));

    const { success } = settingsSchema.safeParse(settingsObject);

    expect(settings).toBeDefined();
    expect(settingsObject.version).toBe('0.1.0');
    expect(settingsObject.hasMigrated).toBe(true);
    expect(success).toBe(true);
  });

  it('should downgrade', async () => {
    jest.mock('electron', () => ({
      app: {
        getVersion: () => '0.0.0',
        getPath: () => path.join(__dirname, 'temp'),
      },
    }));

    const settingsSchema = z.object({
      version: z.string(),
      hasMigrated: z.boolean(),
    });
    const testSettings: z.infer<typeof settingsSchema> = {
      version: '0.1.0',
      hasMigrated: false,
    };

    vol.fromJSON(
      {
        'settings.json': JSON.stringify(testSettings),
      },
      path.join(__dirname, 'temp')
    );

    const migrationFuncs: MigrationFunctions = {
      '0.1.0': {
        up: (oldSettings: SettingsWithVersion) => {
          const newSettings = {
            ...oldSettings,
            version: '0.1.0',
            hasMigrated: false,
          };
          return newSettings;
        },
        down: (oldSettings: SettingsWithVersion) => {
          const newSettings = {
            ...oldSettings,
            version: '0.0.0',
            hasMigrated: true,
          };
          return newSettings;
        },
      },
    };

    const Settings = require('main/settings').default;

    const settings: SettingsType<SettingsWithVersion> = new Settings(
      testSettings,
      settingsSchema,
      migrationFuncs,
      {
        atomicSave: false,
      }
    );
    await settings.init();

    const settingsData = await vol.promises.readFile(
      path.join(__dirname, 'temp', 'settings.json'),
      'utf-8'
    );

    const settingsObject = JSON.parse(String(settingsData));

    const { success } = settingsSchema.safeParse(settingsObject);

    expect(settings).toBeDefined();
    expect(settingsObject.version).toBe('0.0.0');
    expect(settingsObject.hasMigrated).toBe(true);
    expect(success).toBe(true);
  });

  it('should upgrade and set version', async () => {
    jest.mock('electron', () => ({
      app: {
        getVersion: () => '0.2.0',
        getPath: () => path.join(__dirname, 'temp'),
      },
    }));

    const settingsSchema = z.object({
      version: z.string(),
      hasMigrated: z.boolean(),
    });
    const testSettings: z.infer<typeof settingsSchema> = {
      version: '0.0.0',
      hasMigrated: false,
    };

    vol.fromJSON(
      {
        'settings.json': JSON.stringify(testSettings),
      },
      path.join(__dirname, 'temp')
    );

    const migrationFuncs: MigrationFunctions = {
      '0.1.0': {
        up: (oldSettings: SettingsWithVersion) => {
          const newSettings = {
            ...oldSettings,
            version: '0.1.0',
            hasMigrated: true,
          };
          return newSettings;
        },
      },
    };

    const Settings = require('main/settings').default;

    const settings: SettingsType<SettingsWithVersion> = new Settings(
      testSettings,
      settingsSchema,
      migrationFuncs,
      {
        atomicSave: false,
      }
    );
    await settings.init();

    const settingsData = await vol.promises.readFile(
      path.join(__dirname, 'temp', 'settings.json'),
      'utf-8'
    );

    const settingsObject = JSON.parse(String(settingsData));

    const { success } = settingsSchema.safeParse(settingsObject);

    expect(settings).toBeDefined();
    expect(settingsObject.version).toBe('0.2.0');
    expect(settingsObject.hasMigrated).toBe(true);
    expect(success).toBe(true);
  });

  it('should downgrade and set version', async () => {
    jest.mock('electron', () => ({
      app: {
        getVersion: () => '0.1.0',
        getPath: () => path.join(__dirname, 'temp'),
      },
    }));

    const settingsSchema = z.object({
      version: z.string(),
      hasMigrated: z.boolean(),
    });
    const testSettings: z.infer<typeof settingsSchema> = {
      version: '0.2.0',
      hasMigrated: false,
    };

    vol.fromJSON(
      {
        'settings.json': JSON.stringify(testSettings),
      },
      path.join(__dirname, 'temp')
    );

    const migrationFuncs: MigrationFunctions = {
      '0.2.0': {
        up: (oldSettings: SettingsWithVersion) => {
          const newSettings = {
            ...oldSettings,
            version: '0.2.0',
            hasMigrated: false,
          };
          return newSettings;
        },
        down: (oldSettings: SettingsWithVersion) => {
          const newSettings = {
            ...oldSettings,
            version: '0.0.0',
            hasMigrated: true,
          };
          return newSettings;
        },
      },
    };

    const Settings = require('main/settings').default;

    const settings: SettingsType<SettingsWithVersion> = new Settings(
      testSettings,
      settingsSchema,
      migrationFuncs,
      {
        atomicSave: false,
      }
    );
    await settings.init();

    const settingsData = await vol.promises.readFile(
      path.join(__dirname, 'temp', 'settings.json'),
      'utf-8'
    );

    const settingsObject = JSON.parse(String(settingsData));

    const { success } = settingsSchema.safeParse(settingsObject);

    expect(settings).toBeDefined();
    expect(settingsObject.version).toBe('0.1.0');
    expect(settingsObject.hasMigrated).toBe(true);
    expect(success).toBe(true);
  });

  // TODO: Test multiple migrations
});
