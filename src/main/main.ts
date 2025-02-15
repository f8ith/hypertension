import {
  app,
  BrowserWindow,
  WebContentsWillRedirectEventParams,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { UST_PROTOCOL, OAUTH_URL } from "../constants";
import { ust } from "@/lib/hkust";
import UserData from "@/services/user-data";
import { initIpc } from "@/main/ipc";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const loadUSTOAuth = async (mainWindow: BrowserWindow) => {
  mainWindow.loadURL(OAUTH_URL);
  const handleOAuthRedirect = async (
    event: Electron.Event<WebContentsWillRedirectEventParams>
  ) => {
    if (event.url.startsWith(UST_PROTOCOL)) {
      event.preventDefault();
      let codeUrl = new URL(event.url);
      let code = codeUrl.searchParams.get("code");

      const token = await ust.auth.accessToken(code);
      await UserData.update({ accessToken: token.id_token });

      console.log(token);
      console.log(UserData.get());

      loadUI(mainWindow);

      mainWindow.webContents.removeListener(
        "will-redirect",
        handleOAuthRedirect
      );
    }
  };
  mainWindow.webContents.addListener("will-redirect", handleOAuthRedirect);
};

const loadUI = (mainWindow: BrowserWindow) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const userData = UserData.get();

  if ("accessToken" in userData) {
    loadUI(mainWindow);
  } else {
    loadUSTOAuth(mainWindow);
  }
};

app.on("ready", () => {
  initIpc();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
