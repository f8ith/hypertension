import { RequestChannels, RequestResponseChannels } from "../lib/ipc-shared";
import { ipcMain } from "electron";
import { IpcMainEvent, IpcMainInvokeEvent } from "electron/main";

type RequestChannelListener<T extends keyof RequestChannels> = (
  event: IpcMainEvent,
  ...args: Parameters<RequestChannels[T]>
) => void;

type RequestResponseChannelListener<T extends keyof RequestResponseChannels> = (
  event: IpcMainInvokeEvent,
  ...args: Parameters<RequestResponseChannels[T]>
) => ReturnType<RequestResponseChannels[T]>;

/**
 * Subscribes to the specified IPC channel and provides strong typing of
 * the channel name, and request parameters. This is the equivalent of
 * using ipcMain.on.
 */
export function on<T extends keyof RequestChannels>(
  channel: T,
  listener: RequestChannelListener<T>
) {
  ipcMain.on(channel, listener);
}

/**
 * Subscribes to the specified IPC channel and provides strong typing of
 * the channel name, and request parameters. This is the equivalent of
 * using ipcMain.once
 */
export function once<T extends keyof RequestChannels>(
  channel: T,
  listener: RequestChannelListener<T>
) {
  ipcMain.once(channel, listener);
}
