import { writeFile } from "node:fs/promises";

import { BrowserWindow, ipcMain, dialog } from "electron";
import { createEvents } from "ics";

import { exportEnrolICal } from "@/lib/hkust/calendar";
import { createWindow, loadUSTOAuth } from "@/main/main";
import { ust } from "@/lib/hkust";
import UserData from "@/services/user-data";
import { StdtEnrolResp, UserDataProps } from "@/types";

export const initIpc = (mainWindow: BrowserWindow) => {
  const client = ust.getContext(UserData.get().ust.refresh_token)
  ipcMain.handle("get_user_data", (_) => {
    return UserData.get();
  });
  ipcMain.handle("update_user_data", (_, user_data: UserDataProps) => {
    return UserData.update(user_data);
  });
  ipcMain.handle("sign_out", async (_) => {
    UserData.update({ ust: null });
    mainWindow.close()
    loadUSTOAuth(async () => {
      mainWindow = await createWindow();
    });
  });
  ipcMain.handle("ical:export", async (_, enrolData: StdtEnrolResp) => {
    const currentEnrollments = enrolData.stdtInfo[0].studentClassEnrl;

    if (currentEnrollments.length == 0) {
      return;
    }

    const events = exportEnrolICal(currentEnrollments);

    const { error, value } = createEvents(events);

    if (error) return;

    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: "ust-events.ics",
      properties: ["showOverwriteConfirmation"],
    });

    if (!canceled) {
      await writeFile(filePath, value, {
        flag: "w+",
      });
    }
  });
};
