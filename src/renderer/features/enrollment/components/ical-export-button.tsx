import {
  LoadingButton,
  LoadingState,
} from "@/renderer/components/loading-button";
import { useUstClient } from "@/renderer/hooks/use-ust-client";
import { Upload } from "lucide-react";
import { useState } from "react";

export function ICalExportButton() {
  const ustClient = useUstClient();
  const [iCalLoadingState, setiCalLoadingState] =
    useState<LoadingState>("idle");

  const exportToiCal = async () => {
    try {
      setiCalLoadingState("loading");
      await api.ical.export(await ustClient.enrol.stdt_class_enrl());
      setiCalLoadingState("finished");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <LoadingButton
      icon={<Upload />}
      onClick={exportToiCal}
      loadingState={iCalLoadingState}
    >
      Export to iCal
    </LoadingButton>
  );
}
