import { useEffect, useState } from "react";
import { Replace, Upload } from "lucide-react";
import {
  LoadingState,
  LoadingButton,
} from "@/renderer/components/loading-button";
import { StdtClassEnrol } from "@/types";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Button } from "@/renderer/components/ui/button";

export default function Enrol() {
  const [gCalLoadingState, setGCalLoadingState] =
    useState<LoadingState>("idle");
  const [processCartState, setProcessCartState] =
    useState<LoadingState>("idle");
  const [enrollments, setEnrollments] = useState<StdtClassEnrol>();
  useEffect(() => {
    const setupData = async () => {
      setEnrollments(await api.enrol.all());
      console.log(enrollments);
    };

    setupData();
  }, []);
  const onExportToGCal = async () => {
    try {
      setGCalLoadingState("loading");
      await api.gcal.export();
      setGCalLoadingState("finished");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-row-reverse gap-4 ">
        <LoadingButton
          icon={<Upload />}
          onClick={onExportToGCal}
          loadingState={gCalLoadingState}
        >
          Export to Google Calendar
        </LoadingButton>
        <LoadingButton
          icon={<Replace />}
          onClick={() => {}}
          loadingState={gCalLoadingState}
        >
          Automatically add/swap classes
        </LoadingButton>
      </div>
      <div className="flex flex-row">
        {enrollments ? (
          <div>
            <h3 className="text-sidebar-foreground/70 pb-4 uppercase font-medium outline-none text-sm">
              Enrolled / Waitlisted
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.stdtInfo[0].studentClassEnrl.map((enrollment) => {
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
        <div></div>
      </div>
    </div>
  );
}
