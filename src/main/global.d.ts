/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import type { ExifTool } from 'exiftool-vendored';
import { SettingsObject } from './settings-definitions';

declare global {
  var s: { settings: SettingsObject };
  var exiftool: ExifTool;
}
export {};
