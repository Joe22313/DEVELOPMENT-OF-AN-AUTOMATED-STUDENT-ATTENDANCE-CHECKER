import { createRoot } from 'react-dom/client';
import App from './App';
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
// window.electron.ipcRenderer.once('ipc-example', (arg) => {
//   // eslint-disable-next-line no-console
//   console.log('arg', arg);
// });
// export const offlineImageUpload = () => {
//   ipcRenderer
//     .invoke('read-user-data', 'fileName.txt')
//     .then((res) => console.log('res', res));
// };

// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
