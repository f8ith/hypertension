import { UserDataProps } from "@/types";
import { ust } from "./hkust";

type UstContext = ReturnType<typeof ust.getContext>;

export type RequestChannels = {};

export type RequestResponseChannels = {
  user_data: () => UserDataProps;
  sign_out: () => Promise<void>;
  "booking:all": UstContext["booking"]["all"];
  "courses:catg_course": UstContext["courses"]["catg_course"];
  "courses:class_quota": UstContext["courses"]["class_quota"];
  "courses:terms": UstContext["courses"]["terms"];
  "courses:subjects": UstContext["courses"]["subjects"];
  "enrol:cart_list": UstContext["enrol"]["cart_list"];
  "enrol:cart_enrl": UstContext["enrol"]["cart_enrl"];
  "enrol:drop": UstContext["enrol"]["drop"];
  "enrol:swap": UstContext["enrol"]["swap"];
  "enrol:stdt_class_enrl": UstContext["enrol"]["stdt_class_enrl"];
  "student:student_information": UstContext["student"]["student_information"];
  "student:stdt_terms": UstContext["student"]["stdt_terms"];
  "student:stdt_courses": UstContext["student"]["stdt_courses"];
  "student:acad_progress": UstContext["student"]["acad_progress"];
  whitelist: UstContext["whitelist"];
  "gcal:insert": (event: any) => Promise<void>;
  "gcal:export": () => Promise<void>;
};
