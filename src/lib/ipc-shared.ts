import { StdtEnrolResp, UserDataProps } from "@/types";
import { ust } from "./hkust";

type UstContext = ReturnType<typeof ust.getContext>;

export type RequestChannels = {};

export type RequestResponseChannels = {
  get_user_data: () => UserDataProps;
  update_user_data: (user_data: UserDataProps) => UserDataProps;
  sign_out: () => Promise<void>;
  whitelist: UstContext["whitelist"];
  "ical:export": (enrolData: StdtEnrolResp) => Promise<void>;
};
