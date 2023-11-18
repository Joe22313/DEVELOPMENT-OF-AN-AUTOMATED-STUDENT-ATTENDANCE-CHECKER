// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  // send: (channel: string, data: any) => {
  //   // whitelist channels
  //   let validChannels = ['toMain'];
  //   if (validChannels.includes(channel)) {
  //     ipcRenderer.send(channel, data);
  //   }
  // },
  // receive: (channel: string, func: any) => {
  //   let validChannels = ['fromMain'];
  //   if (validChannels.includes(channel)) {
  //     // Deliberately strip event as it includes `sender`
  //     ipcRenderer.on(channel, (event, ...args) => func(...args));
  //   }
  // },
  getEnv: async function () {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-env');
      ipcRenderer.on('get-env-reply', (event, arg) => {
        resolve(arg.parsed);
      });
      // return reject('Error retrieving env variables');
    });
  },
  cleanEnvListners: function () {
    ipcRenderer.removeAllListeners('get-env');
    ipcRenderer.removeAllListeners('get-env-reply');
  },
};
contextBridge.exposeInMainWorld('api', electronHandler);
export type ElectronHandler = typeof electronHandler;
