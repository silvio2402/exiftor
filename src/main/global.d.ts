/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import type { ExifTool } from 'exiftool-vendored';
import type { Settings } from './settings';
import type { SettingsObject } from './settings-definitions';

declare global {
  var s: { settings: SettingsObject };
  var settings: Settings<SettingsObject>;
  var exiftool: ExifTool;
}
export {};
