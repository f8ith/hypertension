import { contextBridge } from "electron";
import api from "@/preload/ipc";

contextBridge.exposeInMainWorld("api", api);
