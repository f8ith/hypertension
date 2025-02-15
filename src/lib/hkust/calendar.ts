import { StdtClassEnrol, StudentClassEnrl } from "@/types";
import { addDays, toDateString, toICalDateTime } from "../utils";

const WEEKDAYS = { mon: 1, tues: 2, wed: 3, thurs: 4, fri: 5, sat: 6, sun: 0 };



export const exportEnrolGCal = (enrollments: StudentClassEnrl[]) => {
  const events = [];

  for (const enrollment of enrollments) {
    for (const session of enrollment.studentClassSchedule) {
      const startDate = new Date(session.classStartDate);
      const startWeekday = startDate.getDay();
      for (const [dayName, dayNum] of Object.entries(WEEKDAYS)) {
        if (session[dayName as keyof typeof session] == "Y") {
          const dayDiff =
            dayNum < startWeekday
              ? dayNum - startWeekday + 7
              : dayNum - startWeekday;
          const adjustedDate = addDays(startDate, dayDiff);

          events.push({
            summary: enrollment.crseCode + " - " + enrollment.classSection,
            location: session.classRoom,
            start: {
              dateTime: `${toDateString(adjustedDate)}T${session.classStartTime
                }:00+08:00`,
              timeZone: "Asia/Hong_Kong",
            },
            end: {
              dateTime: `${toDateString(adjustedDate)}T${session.classEndTime
                }:00+08:00`,
              timeZone: "Asia/Hong_Kong",
            },
            recurrence: [
              `RRULE:FREQ=WEEKLY;UNTIL=${toICalDateTime(
                new Date(session.classEndDate)
              )}`,
            ],
            reminders: {
              useDefault: false,
            },
          });
        }
      }
    }
  }

  return events;
};
