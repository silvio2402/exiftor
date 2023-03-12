/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { SettingsObject } from './settings-definitions';

declare global {
  var s: { settings: SettingsObject };
}
export {};
