import { ust } from "@/lib/hkust";
import { invoke } from "@/lib/ipc-renderer";

const ustPreload: ReturnType<typeof ust.getContext> = {
  booking: {
    all: async () => await invoke("booking:all"),
  },
  cart: {
    all: async () => await invoke("cart:all"),
  },
  enrol: {
    add: async (termNbr: number, classNbrs: number[]) =>
      await invoke("enrol:add", termNbr, classNbrs),
    drop: async (termNbr: number, classNbrs: number[]) =>
      await invoke("enrol:drop", termNbr, classNbrs),
    swap: async (
      termNbr: number,
      fromEnrollment: number,
      toEnrollment: number,
      relClassNbr1?: number,
      relClassNbr2?: number
    ) =>
      await invoke(
        "enrol:swap",
        termNbr,
        fromEnrollment,
        toEnrollment,
        relClassNbr1,
        relClassNbr2
      ),
    all: async () => await invoke("enrol:all"),
  },
  studentInfo: {
    get: async () => await invoke("student-info:get"),
  },
  whitelist: async () => await invoke("whitelist"),
};

export default {
  ...ustPreload,
  userData: async () => await invoke("user-data"),
  gcal: {
    insert: async (event: any) => await invoke("gcal:insert", event),
    export: async () => await invoke("gcal:export"),
  },
};
