import { createRoot } from 'react-dom/client';
import App from './App';
import './index.scss';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer
  .invoke('ipc-example', 'ping')
  .then((result) => {
    // eslint-disable-next-line no-console
    console.log(result);
    return null;
  })
  .catch((error) => {
    throw error;
  });
