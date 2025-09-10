import { StudentClassEnrl } from "@/types";
import { addDays } from "date-fns";
import { toICalDateTime } from "@/lib/utils";
import { EventAttributes } from "ics";

const WEEKDAYS = { mon: 1, tues: 2, wed: 3, thurs: 4, fri: 5, sat: 6, sun: 0 };
type iCalTime = [number, number, number, number, number];

export const exportEnrolICal = (
  enrollments: StudentClassEnrl[]
): EventAttributes[] => {
  // TODO: Unify date calculation with enrollment.tsx
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

          const sessionStart = (adjustedDate.getTime() + Number(session.classStartTime.slice(0, 2)) * 3600000 +
            Number(session.classStartTime.slice(3, 5)) * 60000
          )

          const sessionEnd = (adjustedDate.getTime() + Number(session.classEndTime.slice(0, 2)) * 3600000 +
            Number(session.classEndTime.slice(3, 5)) * 60000
          )

          events.push({
            title: enrollment.crseCode + " - " + enrollment.classSection,
            location: session.classRoom,
            start: sessionStart,
            end: sessionEnd,
            recurrenceRule: `FREQ=WEEKLY;UNTIL=${toICalDateTime(
              new Date(session.classEndDate)
            )}`,
            exclusionDates: enrollment.holidaySchedule.map((holiday) => {
              const date = new Date(holiday.date);
              return (date.getTime() + (Number(session.classStartTime.slice(0, 2)) - 8) * 3600000 +
                (Number(session.classStartTime.slice(3, 5))) * 60000
              )
            }),
          });
        }
      }
    }
  }

  return events;
};
