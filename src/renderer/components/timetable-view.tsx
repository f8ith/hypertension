import {
  startOfWeek,
  addDays,
  format,
  parseISO,
  isSameDay,
  areIntervalsOverlapping,
} from "date-fns";

import { useCalendar } from "@/renderer/calendar/contexts/calendar-context";

import { EventBlock } from "@/renderer/components/event-block";
import { CalendarTimeline } from "@/renderer/calendar/components/week-and-day-view/calendar-time-line";

import { cn } from "@/renderer/lib/utils";
import {
  groupEvents,
  getEventBlockStyle,
  isWorkingHour,
  getVisibleHours,
} from "@/renderer/calendar/helpers";

import type { IEvent } from "@/renderer/calendar/interfaces";
import { ScrollArea } from "./ui/scroll-area";

interface IProps {
  singleDayEvents: IEvent[];
  onEventClick: (eventId: number) => void;
}

export function TimetableView({ singleDayEvents, onEventClick }: IProps) {
  const { selectedDate, workingHours, visibleHours } = useCalendar();

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(
    visibleHours,
    singleDayEvents
  );

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        <div>
          {/* Week header */}
          <div className="relative flex border-b">
            <div className="w-16"></div>
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day, index) => (
                <span
                  key={index}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {format(day, "EE")}{" "}
                  <span className="ml-1 font-semibold text-foreground">
                    {format(day, "d")}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="relative w-16">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: "5vh" }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0, 0, 0), "hh a")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = singleDayEvents.filter(
                    (event) =>
                      isSameDay(parseISO(event.startDate), day) ||
                      isSameDay(parseISO(event.endDate), day)
                  );
                  const groupedEvents = groupEvents(dayEvents);

                  return (
                    <div key={dayIndex} className="relative">
                      {hours.map((hour, index) => {
                        const isDisabled = !isWorkingHour(
                          day,
                          hour,
                          workingHours
                        );

                        return (
                          <div
                            key={hour}
                            className={cn(
                              "relative",
                              isDisabled && "bg-calendar-disabled-hour"
                            )}
                            style={{ height: "5vh" }}
                          >
                            {index !== 0 && (
                              <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
                            )}

                            <div className="absolute inset-x-0 top-0 h-1/4 cursor-pointer transition-colors hover:bg-accent" />

                            <div className="absolute inset-x-0 top-1/4 h-1/4 cursor-pointer transition-colors hover:bg-accent" />

                            <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                            <div className="absolute inset-x-0 top-1/2 h-1/4 cursor-pointer transition-colors hover:bg-accent" />

                            <div className="absolute inset-x-0 top-3/4 h-1/4 cursor-pointer transition-colors hover:bg-accent" />
                          </div>
                        );
                      })}

                      {groupedEvents.map((group, groupIndex) =>
                        group.map((event) => {
                          let style = getEventBlockStyle(
                            event,
                            day,
                            groupIndex,
                            groupedEvents.length,
                            { from: earliestEventHour, to: latestEventHour }
                          );
                          const hasOverlap = groupedEvents.some(
                            (otherGroup, otherIndex) =>
                              otherIndex !== groupIndex &&
                              otherGroup.some((otherEvent) =>
                                areIntervalsOverlapping(
                                  {
                                    start: parseISO(event.startDate),
                                    end: parseISO(event.endDate),
                                  },
                                  {
                                    start: parseISO(otherEvent.startDate),
                                    end: parseISO(otherEvent.endDate),
                                  }
                                )
                              )
                          );

                          if (!hasOverlap)
                            style = { ...style, width: "100%", left: "0%" };

                          return (
                            <div
                              key={event.id}
                              className="absolute p-1"
                              style={style}
                              onClick={() => onEventClick(event.id)}
                            >
                              <EventBlock event={event} />
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>

              <CalendarTimeline
                firstVisibleHour={earliestEventHour}
                lastVisibleHour={latestEventHour}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
