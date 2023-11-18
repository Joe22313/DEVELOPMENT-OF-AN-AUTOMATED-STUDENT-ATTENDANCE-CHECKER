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
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  protocol,
  session,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { mkdir, writeFile, readFile, unlink, readdir } from 'node:fs/promises';
import { existsSync } from 'fs';
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'static',
    privileges: {
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
      secure: true,
    },
  },
]);
let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
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

  session.defaultSession.protocol.registerFileProtocol(
    'static',
    (request, callback) => {
      const fileUrl = request.url.replace('static://', '');
      const filePath = path.join(
        app.getAppPath(),
        '.webpack/renderer',
        fileUrl
      );
      callback(filePath);
    }
  );

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
    minWidth: 720,
    minHeight: 1080,
    fullscreenable: true,
    center: true,
    autoHideMenuBar: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webgl: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // const splash = new BrowserWindow({
  //   titleBarStyle: 'hidden',
  //   width: 1024,
  //   height: 728,
  //   center: true,
  //   frame: false,
  //   // alwaysOnTop: true,
  //   resizable: false,
  // });

  // splash.loadURL(resolveHtmlPath('splash.html'));
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    try {
      // splash.destroy();
    } catch (e) {}
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.maximize();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // if (isDebug) menuBuilder.buildMenu();

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

ipcMain.on('get-env', (event) => {
  mainWindow?.webContents.send('get-env-reply', require('dotenv').config());
});

ipcMain.on('toMain', async (event, { method, fileName, file }) => {
  let msg;

  try {
    const path = `${app.getPath('userData')}/offlineImageUploads/`;
    // check if folder path is exists
    if (!existsSync(path)) {
      await mkdir(path);
    }
    // if (!existsSync(`${path}/offlineUploadsTrack.json`)) {
    //   await writeFile(`${path}/offlineUploadsTrack.json`, '[]', 'utf-8');
    // }
    if (method == 'read') {
      msg = await readFile(file, 'base64');
    } else if (method == 'write') {
      await writeFile(`${path}/${fileName}.jpg`, file);

      // json = await readFile(`${path}/offlineUploadsTrack.json`, 'utf-8');

      // const jsonData = JSON.parse(json);
      // const newData = jsonData.push({
      //   url: `${path}/${fileName}`,
      //   name: fileName,
      // });

      // await writeFile(`${path}/${fileName}`, newData, 'utf-8');

      msg = `${path}/${fileName}.jpg`;
    } else if (method == 'delete') {
      await unlink(fileName);
      msg = 'successfully deleted image!';
    } else if (method == 'dirIsNotEmpty') {
      const files = await readdir(path);
      msg = files.length > 0;
    }
  } catch (e) {
    msg = e;
  }

  // Send result back to renderer process
  mainWindow?.webContents.send('fromMain', msg);
});
