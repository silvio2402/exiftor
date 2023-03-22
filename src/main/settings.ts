import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { compare } from 'semver';
import writeFileAtomic from 'write-file-atomic';
import {
  DeepSettingsObject,
  SettingsConfig,
  settingsWithVersionSchema,
  SettingsWithVersion,
  MigrationFunctions,
} from '../common/settings-types';

const defaultConfig: SettingsConfig = {
  atomicSave: true,
  fileName: 'settings.json',
  numSpaces: 2,
  prettify: true,
};

export default class Settings<SettingsObject extends SettingsWithVersion> {
  private defaultSettings: SettingsObject;

  private migrationFuncs: MigrationFunctions;

  private config: SettingsConfig;

  private settingsSchema: z.ZodSchema<SettingsObject>;

  constructor(
    defaultSettings: SettingsObject,
    settingsSchema: z.ZodSchema<SettingsObject>,
    migrationFuncs: MigrationFunctions,
    config: Partial<SettingsConfig> = {}
  ) {
    this.defaultSettings = defaultSettings;
    this.settingsSchema = settingsSchema;
    this.migrationFuncs = migrationFuncs;
    this.config = { ...defaultConfig, ...config };
  }

  private getSettingsFilePath() {
    const dir = this.config.dir || app.getPath('userData');
    return path.join(dir, this.config.fileName);
  }

  private async ensureSettingsDir() {
    const dir = this.config.dir || app.getPath('userData');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private async ensureSettingsFile() {
    const filePath = this.getSettingsFilePath();
    if (!fs.existsSync(filePath)) {
      await this.reset();
    }
  }

  private async saveSettings(newSettings: SettingsObject) {
    let typed: SettingsWithVersion;
    try {
      typed = settingsWithVersionSchema.parse(newSettings);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Settings are invalid, not saving');
      return;
    }
    const { atomicSave, numSpaces, prettify } = this.config;
    await this.ensureSettingsDir();
    const filePath = this.getSettingsFilePath();
    const json = JSON.stringify(typed, null, prettify ? numSpaces : 0);
    if (atomicSave) {
      await writeFileAtomic(filePath, json);
    } else {
      fs.writeFileSync(filePath, json);
    }
  }

  private async loadSettings(): Promise<SettingsWithVersion> {
    await this.ensureSettingsDir();
    await this.ensureSettingsFile();
    const filePath = this.getSettingsFilePath();
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    let typed: SettingsWithVersion;
    try {
      typed = settingsWithVersionSchema.parse(parsed);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Settings file is invalid');
      this.reset();
      return this.defaultSettings;
    }
    return typed;
  }

  public async loadSettingsObject(): Promise<SettingsObject> {
    const parsed = await this.loadSettings();
    let typed: SettingsObject;
    try {
      typed = this.settingsSchema.parse(parsed);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Settings file is invalid');
      this.reset();
      return this.defaultSettings;
    }
    return typed;
  }

  async init() {
    const currentVersion = app.getVersion();
    const currentSettings = await this.loadSettings();
    const settingsVersion = currentSettings.version;
    const versionComparison = compare(settingsVersion, currentVersion);
    let newSettings: SettingsWithVersion = currentSettings;
    if (versionComparison < 0) {
      // Upgrade the settings
      newSettings = Object.keys(this.migrationFuncs)
        // Only include migration functions that are newer than the settings version
        .filter(
          (version) =>
            compare(version, settingsVersion) > 0 &&
            compare(version, currentVersion) <= 0
        )
        .sort(compare)
        .reduce(
          (oldSettings, version) =>
            this.migrationFuncs[version].up(oldSettings),
          currentSettings
        );

      newSettings.version = currentVersion;
    } else if (versionComparison > 0) {
      // Downgrade the settings
      newSettings = Object.keys(this.migrationFuncs)
        .filter(
          (version) =>
            compare(version, settingsVersion) <= 0 &&
            compare(version, currentVersion) > 0
        )
        .sort((a, b) => compare(a, b) * -1)
        .reduce(
          (oldSettings: SettingsWithVersion, version): SettingsWithVersion => {
            if (oldSettings.error) return oldSettings;
            const { down } = this.migrationFuncs[version];

            if (down === undefined) {
              // eslint-disable-next-line no-console
              console.error(
                "Couldn't find downgrade function for settings version",
                version
              );
              this.reset();
              return { version: 'x.x.x', error: true };
            }

            return down(oldSettings);
          },
          currentSettings
        );

      if (newSettings.error) return;

      newSettings.version = currentVersion;
    }

    let typedNewSettings: SettingsObject;
    try {
      typedNewSettings = this.settingsSchema.parse(newSettings);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Settings are invalid, resetting to default');
      await this.reset();
      return;
    }

    await this.saveSettings(typedNewSettings);
  }

  /*
  {
    settings: {
      foo:
        get: () => 'bar',
        set: (newValue) => {parentSetter({ ...obj, [key]: newValue });},
    }
  }
  */
  private getRefRecursive<
    ToProxy extends DeepSettingsObject,
    Parent extends DeepSettingsObject
  >(
    paramObj: ToProxy,
    parentSetter: (callback: (oldValue: Parent) => Parent) => void
  ): ToProxy {
    const obj = JSON.parse(JSON.stringify(paramObj));
    const ref = Object.defineProperties(
      obj,
      Object.entries(obj).reduce(
        <T extends keyof typeof obj>(
          refObj: typeof obj,
          [key, value]: [T, typeof obj[T]]
        ) => {
          const setter = (newValue: typeof value) =>
            parentSetter((oldValue) => ({ ...oldValue, [key]: newValue }));
          const getter =
            typeof value === 'object' && value !== null
              ? () =>
                  this.getRefRecursive(value, (callback) =>
                    setter(callback(value))
                  )
              : () => value;
          return {
            ...refObj,
            [key]: {
              get: getter,
              set: setter,
            },
          };
        },
        {}
      )
    );
    return ref;
  }

  async getRef(): Promise<{ settings: SettingsObject }> {
    const settings = await this.loadSettingsObject();
    const setter = async (newValue: SettingsObject) => {
      let typed: SettingsObject;
      try {
        typed = this.settingsSchema.parse(newValue);
      } catch {
        // eslint-disable-next-line no-console
        console.warn('Settings are invalid, not saving');
        return;
      }
      await this.saveSettings(typed);
    };

    const refSettings = Object.defineProperty({ settings }, 'settings', {
      get: (): SettingsObject =>
        this.getRefRecursive<SettingsObject, SettingsObject>(
          settings,
          (callback) => setter(callback(settings))
        ),
      set: setter,
    });

    return refSettings;
  }

  async reset() {
    await this.saveSettings(this.defaultSettings);
  }
}
