import { app } from 'electron';
import { SettingsObject, MigrationFunctions } from '../common/settings-types';

export const defaultSettings: SettingsObject = {
  version: app.getVersion(),
  image: {
    thumbnail: {
      disableResize: false,
      resolution: {
        width: 256,
        height: 256,
      },
      webpOptions: {},
    },
    preview: {
      disableResize: false,
      resolution: {
        width: 1200,
        height: 1200,
      },
      webpOptions: {
        nearLossless: true,
      },
    },
  },
  exiftool: {
    maxProcs: 2,
  },
};

export const migrationFuncs: MigrationFunctions = {
  [app.getVersion()]: {
    up: (): SettingsObject => {
      const newSettings: SettingsObject = {
        ...defaultSettings,
      };
      return newSettings;
    },
  },
  // '0.1.0': {
  //   up: (oldSettings: SettingsWithVersion): SettingsObject => {
  //     const newSettings: SettingsWithVersion = {
  //       ...oldSettings,
  //       version: '0.1.0',
  //     };
  //     const newSettingsTyped = settingsObjectSchema.parse(newSettings);
  //     return newSettingsTyped;
  //   },
  // },
};
