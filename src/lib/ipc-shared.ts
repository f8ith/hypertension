import { UserDataProps } from "@/types";
import { ust } from "./hkust";

type UstContext = ReturnType<typeof ust.getContext>;

export type RequestChannels = {};

export type RequestResponseChannels = {
  "user-data": () => UserDataProps;
  "booking:all": UstContext["booking"]["all"];
  "enrol:add": UstContext["enrol"]["add"];
  "enrol:drop": UstContext["enrol"]["drop"];
  "enrol:swap": UstContext["enrol"]["swap"];
  "enrol:all": UstContext["enrol"]["all"];
  "student-info:get": UstContext["studentInfo"]["get"];
  "cart:all": UstContext["cart"]["all"];
  whitelist: UstContext["whitelist"];
  "gcal:insert": (event: any) => Promise<void>;
  "gcal:export": () => Promise<void>;
};
