import { ChangeEvent, useEffect, useState } from "react";
import { Replace, Upload } from "lucide-react";
import {
  LoadingState,
  LoadingButton,
} from "@/renderer/components/loading-button";
import {
  ClassQuota,
  StdtClassEnrol,
  StdtInfoClassEnrl,
  TermInfo,
} from "@/types";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Button } from "@/renderer/components/ui/button";
import { CalendarProvider } from "@/renderer/calendar/contexts/calendar-context";
import { IEvent } from "@/renderer/calendar/interfaces";
import { TimetableView } from "@/renderer/components/timetable-view";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { Separator } from "@/renderer/components/ui/separator";
import React from "react";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { startOfWeek } from "date-fns";
import { ust } from "@/lib/hkust";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/renderer/components/ui/select";
import { Progress } from "@/renderer/components/ui/progress";
import { Input } from "@/renderer/components/ui/input";
import Fuse, { FuseResult } from "fuse.js";

const fuseOptions = {
  threshold: 0.3,
  keys: ["crseCode"],
};

export default function Enrol() {
  //const [client, setClient] = useState();
  const [progress, setProgress] = useState(13);
  const [gCalLoadingState, setGCalLoadingState] =
    useState<LoadingState>("idle");
  const [processCartState, setProcessCartState] =
    useState<LoadingState>("idle");
  const [enrollments, setEnrollments] = useState<StdtInfoClassEnrl>();
  const [courseQuota, setCourseQuota] = useState<ClassQuota[]>([]);
  const [filteredQuota, setFilteredQuota] = useState<FuseResult<ClassQuota>[]>(
    []
  );
  const [terms, setTerms] = useState<TermInfo[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<StdtClassEnrol>();
  const [selectedTerm, setSelectedTerm] = useState<string>();
  const [searchString, setSearchString] = useState<string>("");
  const [events, setEvents] = useState<IEvent[]>([]);

  useEffect(() => {
    const setupData = async () => {
      const ustClient = ust.getContext((await api.userData()).accessToken);
      const _terms = await ustClient.courses.terms();
      setProgress(47);

      setTerms(_terms);
      setSelectedTerm(_terms[0].term);
      setProgress(90);
      setEnrollments(await ustClient.enrol.stdt_class_enrl());
      setProgress(100);
    };

    setupData();
  }, []);

  useEffect(() => {
    if (!enrollments) return;
    let id = 0;
    const enrollmentArr = enrollments.studentClassEnrl;
    const newEvents = enrollmentArr.flatMap((e) => {
      return e.studentClassSchedule.map((scheduleItem) => {
        if (scheduleItem.classStartTime) {
          id++;
          return {
            id: id,
            startDate: new Date(scheduleItem.classStartDate).toISOString(),
            endDate: new Date(scheduleItem.classStartDate).toISOString(),
            title: e.crseCode,
            color: "red",
            description: e.crseTitle,
          } as IEvent;
        }
      });
    });
    setEvents(newEvents);
  }, [enrollments]);

  useEffect(() => {
    const fun = async () => {
      const ustClient = ust.getContext((await api.userData()).accessToken);

      setCourseQuota(await ustClient.courses.class_quota(selectedTerm));
    };

    fun();
  }, [selectedTerm]);

  useEffect(() => {
    const fuse = new Fuse(courseQuota, fuseOptions);

    setFilteredQuota(fuse.search(searchString));
  }, [courseQuota, searchString]);

  const items = [
    {
      code: "COMP 1021",
      title: "Introduction to programming in Python",
      description: "hello world",
    },
  ];
  const onExportToGCal = async () => {
    try {
      setGCalLoadingState("loading");
      await api.gcal.export();
      setGCalLoadingState("finished");
    } catch (e) {
      console.log(e);
    }
  };

  const onEventClick = (eventId: number) => {};

  const onSearchStringChange: React.EventHandler<
    ChangeEvent<HTMLInputElement>
  > = (e) => {
    setSearchString(e.target.value);
  };

  if (progress != 100) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 justify-center items-center">
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
            onClick={() => {}}
            loadingState={processCartState}
          >
            Automatically add/swap classes
          </LoadingButton>
          <LoadingButton
            icon={<Upload />}
            onClick={onExportToGCal}
            loadingState={gCalLoadingState}
          >
            Export to Google Calendar
          </LoadingButton>
        </div>
        <TabsContent value="list">
          <div className="flex flex-row">
            {enrollments ? (
              <div>
                <h3 className="text-sidebar-foreground/70 pb-4 uppercase font-medium outline-none text-sm">
                  Enrolled / Waitlisted
                </h3>
                <div className="grid grid-flow-col auto-cols-auto gap-4">
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
            ) : (
              <></>
            )}
          </div>
        </TabsContent>
        <TabsContent className="flex flex-row gap-4" value="timetable">
          <div className="w-3/4">
            <CalendarProvider events={events}>
              <TimetableView
                singleDayEvents={events}
                onEventClick={onEventClick}
              />
            </CalendarProvider>
          </div>
          <div className="border-solid rounded-md w-1/4">
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
                    <div className="flex flex-row items-center gap-8 px-4 py-5">
                      <div className="order-2 flex items-center gap-2 md:order-none">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-semibold">
                            {item.subject} {item.catalogNbr}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.crseDesc}
                          </p>
                        </div>
                      </div>
                    </div>
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
