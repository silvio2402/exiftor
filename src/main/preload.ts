import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { ChannelArgs, ChannelResults, Channel } from '../common/ipc-types';

const electronHandler = {
  ipcRenderer: {
    sendMessage<T extends Channel>(channel: T, arg: ChannelArgs[T]) {
      ipcRenderer.send(channel, arg);
    },
    invoke<T extends Channel>(
      channel: T,
      arg: ChannelArgs[T]
    ): Promise<ChannelResults[T]> {
      return ipcRenderer.invoke(channel, arg);
    },
    on<T extends Channel>(channel: T, func: (arg?: ChannelResults[T]) => void) {
      const subscription = (
        _event: IpcRendererEvent,
        ...args: ChannelResults[T][]
      ) => {
        let arg: ChannelResults[T] | undefined;
        if (args.length > 0) [arg] = args;
        func(arg);
      };
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once<T extends Channel>(
      channel: T,
      func: (arg?: ChannelResults[T]) => void
    ) {
      ipcRenderer.once(channel, (_event, ...args) => {
        let arg: ChannelResults[T] | undefined;
        if (args.length > 0) [arg] = args;
        func(arg);
      });
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
