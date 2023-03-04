/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { homedir } from 'os';
import fs from 'fs';
import sharp from 'sharp';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import type {
  ReadDirArgs,
  ReadDirResult,
  ReadImgArgs,
  ReadImgResult,
} from '../common/ipc-types';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.handle('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  return msgTemplate('pong');
});

ipcMain.handle('read-dir', async (event, arg: ReadDirArgs) => {
  let { path: dirPath } = arg;
  const { excludeFiles } = arg;
  dirPath = dirPath.replace('%HOME%', homedir());
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  let msgEntries: ReadDirResult['entries'] = [];
  msgEntries = files.flatMap((file) => {
    const isDirectory = file.isDirectory();
    const isFile = file.isFile();
    const isSymbolicLink = file.isSymbolicLink();
    return isDirectory || isFile || isSymbolicLink
      ? {
          name: file.name,
          isDirectory,
          isFile,
          isSymbolicLink,
        }
      : [];
  });
  if (excludeFiles) {
    msgEntries = msgEntries.filter((entry) => !entry.isFile);
  }
  const msg: ReadDirResult = {
    entries: msgEntries,
  };
  return msg;
});

const readImage = async (imgPath: string, thumbnail: boolean) => {
  let img = sharp(imgPath, { sequentialRead: true }).webp({
    nearLossless: !thumbnail,
  });
  const resizeOptions: sharp.ResizeOptions = {
    withoutEnlargement: true,
    fit: 'inside',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  };
  if (thumbnail) img = img.resize(256, 256, resizeOptions);
  else img = img.resize(1200, 800, resizeOptions);
  return img.toBuffer();
};

ipcMain.handle('read-img', async (event, arg: ReadImgArgs) => {
  let { path: imgPath } = arg;
  const { thumbnail } = arg;
  imgPath = imgPath.replace('%HOME%', homedir());
  const imgBuffer = await readImage(imgPath, thumbnail);
  const msg: ReadImgResult = {
    imgBuffer,
  };
  return msg;
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
