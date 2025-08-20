import { ust } from "@/lib/hkust";
import { exportEnrolGCal } from "@/lib/hkust/calendar";
import UserData from "@/services/user-data";
import { BrowserWindow, ipcMain } from "electron";
import { getAuthenticatedClient, gLimit } from "../gcal";
import { calendar as googleCalendar } from "googleapis/build/src/apis/calendar";
import { toDateString } from "@/lib/utils";
import { OAUTH_URL } from "@/constants";

export const initIpc = (mainWindow: BrowserWindow) => {
  const client = ust.getContext(UserData.get().accessToken);
  ipcMain.handle("user_data", (_) => {
    return UserData.get();
  });
  ipcMain.handle("sign_out", async (_) => {
    await UserData.clear();
    mainWindow.loadURL(OAUTH_URL);
    return;
  });
  ipcMain.handle(
    "courses:catg_course",
    async (_, careerType: string = "UG", termCode: string = " ") => {
      return await client.courses.catg_course(careerType, termCode);
    }
  );
  ipcMain.handle("courses:class_quota", async (_, term: string) => {
    return await client.courses.class_quota(term);
  });
  ipcMain.handle("courses:terms", async (_) => {
    return await client.courses.terms();
  });
  ipcMain.handle("courses:subjects", async (_) => {
    return await client.courses.subjects();
  });
  ipcMain.handle("enrol:cart_list", async (_) => {
    return await client.enrol.cart_list();
  });
  ipcMain.handle(
    "enrol:cart_enrl",
    async (_, termNbr: number, classNbrs: number[]) => {
      return await client.enrol.cart_enrl(termNbr, classNbrs);
    }
  );
  ipcMain.handle(
    "enrol:drop",
    async (_, termNbr: number, classNbrs: number[]) => {
      return await client.enrol.drop(termNbr, classNbrs);
    }
  );
  ipcMain.handle(
    "enrol:swap",
    async (
      _,
      termid: number,
      fromEnrollment: number,
      toEnrollment: number,
      relClassNbr1 = 0,
      relClassNbr2 = 0
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

  ipcMain.handle("student:student_information", async (_) => {
    return await client.student.student_information();
  });
  ipcMain.handle("student:stdt_terms", async (_) => {
    return await client.student.stdt_terms();
  });
  ipcMain.handle("student:stdt_courses", async (_) => {
    return await client.student.stdt_courses();
  });
  ipcMain.handle("student:acad_progress", async (_) => {
    return await client.student.acad_progress();
  });
  ipcMain.handle("whitelist", async (_) => {
    return await client.whitelist();
  });
  ipcMain.handle("gcal:export", async (_) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const enrolData = await client.enrol.stdt_class_enrl();
      const currentEnrollments = enrolData.studentClassEnrl;

      if (currentEnrollments.length == 0) {
        return;
      }

      const events = exportEnrolGCal(currentEnrollments);
      const calendar = googleCalendar({
        version: "v3",
        auth: await getAuthenticatedClient(),
      });

      const createdCalendar = await gLimit(() =>
        calendar.calendars.insert({
          requestBody: {
            summary: currentEnrollments[0].termName,
          },
        })
      );

      const insertPromises = events.map((e) => {
        gLimit(() =>
          calendar.events.insert({
            calendarId: createdCalendar.data.id,
            requestBody: e,
          })
        );
      });

      await Promise.all(insertPromises);

      const holidayPromises = currentEnrollments[0].holidaySchedule.map(
        async (holiday) => {
          let pageToken: string | null = null;
          const holidayDate = new Date(holiday.date);
          do {
            const holidayEvents = await gLimit(() =>
              calendar.events.list({
                calendarId: createdCalendar.data.id,
                timeMin: `${toDateString(holidayDate)}T00:00:00+08:00`,
                timeMax: `${toDateString(holidayDate)}T23:59:59+08:00`,
                pageToken,
                singleEvents: true,
              })
            );
            pageToken = holidayEvents.data.nextPageToken;

            const deletePromises = holidayEvents.data.items.map((e) => {
              gLimit(() =>
                calendar.events.delete({
                  calendarId: createdCalendar.data.id,
                  eventId: e.id,
                })
              );
            });
            await Promise.all(deletePromises);
          } while (pageToken != null);
        }
      );

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
