import { ust } from "@/lib/hkust";
import { invoke } from "@/lib/ipc-renderer";

//const ustPreload: ReturnType<typeof ust.getContext> = {
//  booking: {
//    all: async () => await invoke("booking:all"),
//  },
//  cart: {},
//  courses: {
//    all: async (careerType: string = "UG") =>
//      await invoke("courses:all", careerType),
//  },
//  enrol: {
//    add: async (termNbr: number, classNbrs: number[]) =>
//      await invoke("enrol:add", termNbr, classNbrs),
//    drop: async (termNbr: number, classNbrs: number[]) =>
//      await invoke("enrol:drop", termNbr, classNbrs),
//    swap: async (
//      termNbr: number,
//      fromEnrollment: number,
//      toEnrollment: number,
//      relClassNbr1?: number,
//      relClassNbr2?: number
//    ) =>
//      await invoke(
//        "enrol:swap",
//        termNbr,
//        fromEnrollment,
//        toEnrollment,
//        relClassNbr1,
//        relClassNbr2
//      ),
//    all: async () => await invoke("enrol:all"),
//  },
//  student: {
//    student_information: async () => await invoke("student:info"),
//    terms: async () => await invoke("student:terms"),
//  },
//  whitelist: async () => await invoke("whitelist"),
//};

export default {
  //...ustPreload,
  userData: async () => await invoke("user_data"),
  signOut: async () => await invoke("sign_out"),
  gcal: {
    insert: async (event: any) => await invoke("gcal:insert", event),
    export: async () => await invoke("gcal:export"),
  },
};
