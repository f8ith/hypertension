import { ust } from "@/lib/hkust";
import { exportEnrolGCal } from "@/lib/hkust/calendar";
import UserData from "@/services/user-data";
import { ipcMain } from "electron";
import { getAuthenticatedClient, gLimit } from "../gcal";
import { calendar as googleCalendar } from "googleapis/build/src/apis/calendar";
import { toDateString } from "@/lib/utils";

export const initIpc = () => {
  const client = ust.getContext(UserData.get().accessToken!);
  ipcMain.handle("user-data", (_) => {
    return UserData.get();
  });
  ipcMain.handle(
    "enrol:add",
    async (_, termid: number, classNbrs: number[]) => {
      return await client.enrol.add(termid, classNbrs);
    }
  );
  ipcMain.handle(
    "enrol:drop",
    async (_, termid: number, classNbrs: number[]) => {
      return await client.enrol.drop(termid, classNbrs);
    }
  );
  ipcMain.handle(
    "enrol:swap",
    async (
      _,
      termid: number,
      fromEnrollment: number,
      toEnrollment: number,
      relClassNbr1: number = 0,
      relClassNbr2: number = 0
    ) => {
      return await client.enrol.swap(
        termid,
        fromEnrollment,
        toEnrollment,
        relClassNbr1,
        relClassNbr2
      );
    }
  );
  ipcMain.handle("enrol:all", async (_) => {
    return await client.enrol.all();
  });
  ipcMain.handle("cart:all", async (_) => {
    return await client.cart.all();
  });
  ipcMain.handle("student-info:get", async (_) => {
    return await client.studentInfo.get();
  });
  ipcMain.handle("whitelist", async (_) => {
    return await client.whitelist();
  });
  ipcMain.handle("gcal:export", async (_) => {
    try {
      const enrolData = await client.enrol.all();
      const currentEnrollments = enrolData.stdtInfo[0].studentClassEnrl;

      if (currentEnrollments.length == 0) {
        return;
      }

      const events = exportEnrolGCal(currentEnrollments);
      const calendar = googleCalendar({
        version: "v3",
        auth: await getAuthenticatedClient(),
      });

      const createdCalendar = await gLimit(() => calendar.calendars.insert({
        requestBody: {
          summary: currentEnrollments[0].termName,
        },
      }));

      const insertPromises = events.map((e) => {
        gLimit(() => calendar.events.insert({
          calendarId: createdCalendar.data.id,
          requestBody: e,
        }));
      });

      await Promise.all(insertPromises);

      const holidayPromises = currentEnrollments[0].holidaySchedule.map(async (holiday) => {
        let pageToken: string | null = null;
        const holidayDate = new Date(holiday.date);
        do {
          const holidayEvents = await gLimit(() => calendar.events.list({
            calendarId: createdCalendar.data.id,
            timeMin: `${toDateString(holidayDate)}T00:00:00+08:00`,
            timeMax: `${toDateString(holidayDate)}T23:59:59+08:00`,
            pageToken,
            singleEvents: true
          }));
          pageToken = holidayEvents.data.nextPageToken;

          const deletePromises = holidayEvents.data.items.map((e) => {
            gLimit(() => calendar.events.delete({ calendarId: createdCalendar.data.id, eventId: e.id }))
          });
          await Promise.all(deletePromises);

        } while (pageToken != null);
      });

      await Promise.all(holidayPromises);

      return;
    } catch (error) {
      throw error;
    }
  });
  ipcMain.handle("gcal:insert", async (_, event: any) => {
    return;
  });
};
