import {
  app,
  BrowserWindow,
  WebContentsWillRedirectEventParams,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { UST_PROTOCOL } from "@/constants";
import { ust } from "@/lib/hkust";
import { initIpc } from "@/main/ipc";
import UserData from "@/services/user-data";
import { constructUSTOAuth } from "./hkust";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

export const loadUSTOAuth = async (callback: () => Promise<void>) => {
  const win = new BrowserWindow({
    width: 480,
    height: 320,
  });

  const { url, codeVerifier } = constructUSTOAuth();
  win.loadURL(url);
  const handleOAuthRedirect = async (
    event: Electron.Event<WebContentsWillRedirectEventParams>
  ) => {
    if (event.url.startsWith(UST_PROTOCOL)) {
      event.preventDefault();
      const codeUrl = new URL(event.url);
      const code = codeUrl.searchParams.get("code");

      const token = await ust.auth.accessToken(code, codeVerifier);
      UserData.update({ ust: token });

      await callback();

      win.webContents.removeListener(
        "will-redirect",
        handleOAuthRedirect
      );

      win.close();
    }
  };
  win.webContents.addListener("will-redirect", handleOAuthRedirect);
};

export const loadUI = (mainWindow: BrowserWindow) => {
  initIpc(mainWindow);
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

export const createWindow = async () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  loadUI(win);

  return win;
};

app.on("ready", async () => {
  const savedToken = UserData.get().ust;

  if (!savedToken) {
    loadUSTOAuth(async () => {
      await createWindow();
    });
  } else {
    //const newToken = await ust.auth.refreshToken(savedToken.refresh_token);

    await ust.auth.requestToken(savedToken.id_token);
    await createWindow();
  }
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

app.on("web-contents-created", (_, contents) => {
  const outFilter = { urls: ["*://login.microsoftonline.com/*"] };
  contents.session.webRequest.onBeforeSendHeaders(outFilter, (details, callback) => {
    delete details.requestHeaders["Origin"]
    delete details.requestHeaders["Referer"]
    delete details.requestHeaders["Sec-Ch-Ua"]
    delete details.requestHeaders["Sec-Ch-Ua-Mobile"]
    delete details.requestHeaders["Sec-Ch-Ua-Platform"]
    delete details.requestHeaders["Sec-Fetch-Dest"]
    delete details.requestHeaders["Sec-Fetch-Mode"]
    delete details.requestHeaders["Sec-Fetch-Site"]
    details.referrer = UST_PROTOCOL;

    callback({
      requestHeaders: details.requestHeaders
    });
  });

  const inFilter = { urls: ["*://w5.ab.ust.hk/*", "*://login.microsoftonline.com/*"] };
  contents.session.webRequest.onHeadersReceived(inFilter, (details, callback) => {
    if (!details.responseHeaders) details.responseHeaders = {};
    // ignore if the header already exists.
    if (
      Object.keys(details.responseHeaders)
        .map((k) => k.toLowerCase())
        .includes("access-control-allow-origin")
    )
      return;

    if (!details.responseHeaders["access-control-allow-origin"])
      details.responseHeaders["access-control-allow-origin"] = ["*"];
    if (
      details.method === "OPTIONS" &&
      !details.responseHeaders["access-control-allow-methods"]
    ) {
      details.statusLine = "HTTP/1.1 200 OK";
      details.responseHeaders["access-control-allow-methods"] = [
        "GET, POST, OPTIONS",
      ];
      details.responseHeaders["access-control-allow-headers"] = ["*"];
    }
    callback({
      responseHeaders: details.responseHeaders,
      statusLine: details.statusLine,
    });
  });
});
