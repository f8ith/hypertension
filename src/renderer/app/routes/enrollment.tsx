import React, { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { Replace, Upload } from "lucide-react";
import {
  LoadingState,
  LoadingButton,
} from "@/renderer/components/loading-button";
import {
  ClassQuota,
  TDaysInWeek,
  StdtEnrolResp,
  StdtInfoClassEnrl,
  TermInfo,
  StudentClassWaitlist,
  UstClass,
} from "@/types";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Button } from "@/renderer/components/ui/button";
import { CalendarProvider } from "@/renderer/features/timetable/contexts/calendar-context";
import { IEvent } from "@/renderer/features/timetable/interfaces";
import { TimetableView } from "@/renderer/features/timetable/components/timetable-view";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { Separator } from "@/renderer/components/ui/separator";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/renderer/components/ui/select";
import { Progress } from "@/renderer/components/ui/progress";
import { Input } from "@/renderer/components/ui/input";
import Fuse, { FuseResult } from "fuse.js";
import { CourseCard } from "@/renderer/features/enrollment/components/course-card";
import { ICalExportButton } from "@/renderer/features/enrollment/components/ical-export-button";
import { useUstClient } from "@/renderer/hooks/use-ust-client";
import { DaysInWeek } from "@/constants";
import { addDays } from "date-fns";

const fuseOptions = {
  threshold: 0.3,
  keys: ["crseCode"],
};

export default function Enrol() {
  const [progress, setProgress] = useState(13);
  const [processCartState, setProcessCartState] =
    useState<LoadingState>("idle");
  const [enrollments, setEnrollments] = useState<StdtInfoClassEnrl>();
  const [courseQuota, setCourseQuota] = useState<ClassQuota[]>([]);
  const [terms, setTerms] = useState<TermInfo[]>([]);
  const [hoveredSection, setHoveredSection] = useState<UstClass>(null);
  const [selectedCourse, setSelectedSource] = useState<ClassQuota>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>();
  const [searchString, setSearchString] = useState<string>("");

  const ustClient = useUstClient();

  useEffect(() => {
    const setupData = async () => {
      const _terms = await ustClient.courses.terms();

      setProgress(47);

      setTerms(_terms);
      setSelectedTerm(_terms[0].term);
      setProgress(90);

      const stdt_enrol = await ustClient.enrol.stdt_class_enrl();
      setEnrollments(stdt_enrol.stdtInfo[0]);
      setProgress(100);
    };

    setupData();
  }, []);

  const enrollEvents = useMemo(() => {
    if (!enrollments) return;
    return enrollments.studentClassEnrl.flatMap((e) => {
      return e.studentClassSchedule.flatMap((scheduleItem) => {
        const ret: IEvent[] = [];
        let day: keyof TDaysInWeek;
        for (day in DaysInWeek) {
          if (scheduleItem[day] == "Y" && scheduleItem.classStartTime) {
            const startDate = addDays(
              new Date(
                scheduleItem.classStartDate + " " + scheduleItem.classStartTime
              ),
              DaysInWeek[day]
            );
            const endDate = addDays(
              new Date(
                scheduleItem.classStartDate + " " + scheduleItem.classEndTime
              ),
              DaysInWeek[day]
            );
            ret.push({
              id: e.classNbr,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              title: e.crseCode,
              title2: e.classSection,
              color: "red",
              description: e.crseTitle,
            } as IEvent);
          }
        }

        // TODO: We assume classStartDate is always a monday. Make this more robust
        return ret
      });
    });
  }, [enrollments]);

  const events: IEvent[] = useMemo(() => {
    const ret = [];

    if (!enrollEvents)
      return null

    ret.push(...enrollEvents)

    if (hoveredSection && selectedCourse) {
      // TODO: Do not highlight if course is already enrolled
      ret.push(...hoveredSection.schedules.flatMap((scheduleItem) => {
        const hoveredEvents: IEvent[] = [];
        for (const day of scheduleItem.weekdays) {
          const startDate = addDays(
            new Date(
              scheduleItem.startDt + " " + scheduleItem.startTime
            ),
            day - 1
          );
          const endDate = addDays(
            new Date(
              scheduleItem.startDt + " " + scheduleItem.endTime
            ),
            day - 1
          );
          hoveredEvents.push({
            id: hoveredSection.classNbr,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            title: selectedCourse.crseCode,
            title2: hoveredSection.section,
            color: "yellow",
            description: selectedCourse.crseDesc
          } as IEvent);
        }
        return hoveredEvents;
      }))
    }

    return ret
  }, [enrollEvents, hoveredSection])

  useEffect(() => {
    const fun = async () => {
      setCourseQuota(await ustClient.courses.class_quota(selectedTerm));
    };

    fun();
  }, [selectedTerm]);

  const filteredQuota = useMemo(() => {
    const fuse = new Fuse(courseQuota, fuseOptions);

    return fuse.search(searchString);
  }, [courseQuota, searchString]);

  const onEventClick = (eventId: number) => {
    console.log(`${eventId} clicked`);
  };

  const onSearchStringChange: React.EventHandler<
    ChangeEvent<HTMLInputElement>
  > = (e) => {
    setSearchString(e.target.value);
  };

  if (progress != 100) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 justify-center items-center">
        <h1 className="font-semibold">Increasing your blood pressure...</h1>
        <Progress value={progress} className="flex w-[60%]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Tabs className="w-full" defaultValue="timetable">
        <div className="flex flex-row gap-4 mb-8">
          <TabsList className="mr-auto">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
          </TabsList>
          <div className="ml-auto"></div>

          <Select onValueChange={setSelectedTerm} defaultValue={selectedTerm}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a term" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {terms.map((t) => {
                  return (
                    <SelectItem key={t.term} value={t.term}>
                      {t.termDesc}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          <LoadingButton
            icon={<Replace />}
            loadingState={processCartState}
          >
            Automatically add/swap classes
          </LoadingButton>
          <ICalExportButton />
        </div>
        <TabsContent value="list">
          <div className="flex flex-col gap-8">
            {enrollments && (
              <>
                <div>
                  <h3 className="text-sidebar-foreground/70 pb-4 uppercase font-medium outline-none text-sm">
                    Enrolled
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 gap-4">
                    {enrollments.studentClassEnrl.map((enrollment) => {
                      if (enrollment.enrlComponent === "N") {
                        return;
                      }
                      return (
                        <Card key={enrollment.crseCode}>
                          <CardHeader>
                            <CardTitle className="md:text-base text-sm">
                              {enrollment.crseCode}
                            </CardTitle>
                            <CardDescription className="md:text-base">
                              {enrollment.classSection}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-between gap-4">
                            <Button variant="outline">Drop</Button>
                            <Button>Swap</Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sidebar-foreground/70 pb-4 uppercase font-medium outline-none text-sm">
                    Waitlisted
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {enrollments.studentClassWaitlist.map((enrollment) => {
                      return (
                        <Card key={enrollment.crseCode}>
                          <CardHeader>
                            <CardTitle className="md:text-base text-sm">
                              {enrollment.crseCode}
                            </CardTitle>
                            <CardDescription className="md:text-base">
                              {enrollment.classSections.join(", ")}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-between gap-4">
                            Position: {enrollment.waitPosition}
                            <Button variant="outline">Drop</Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent className="flex flex-row gap-4" value="timetable">
          {events && <div className="w-3/5 md:w-3/4">
            <CalendarProvider events={events}>
              <TimetableView
                singleDayEvents={events}
                onEventClick={onEventClick}
              />
            </CalendarProvider>
          </div>}
          <div className="border-solid rounded-md w-2/5 md:w-1/4">
            <div className="flex flex-col gap-4">
              <div>
                <Input
                  autoFocus={true}
                  value={searchString}
                  onChange={onSearchStringChange}
                  placeholder="LANG 1404"
                  id="url"
                />
              </div>

              <ScrollArea className="w-full h-[70vh]">
                {filteredQuota.map(({ item }, index) => (
                  <React.Fragment key={index}>
                    <CourseCard selectedCourse={selectedCourse} setSelectedCourse={setSelectedSource} setSection={setHoveredSection} term={selectedTerm} course={item} />
                    <Separator />
                  </React.Fragment>
                ))}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
