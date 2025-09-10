import { invoke } from "@/lib/ipc-renderer";
import { StdtEnrolResp, UserDataProps } from "@/types";

export default {
  getUserData: async () => await invoke("get_user_data"),
  updateUserData: async (user_data: UserDataProps) => await invoke("update_user_data", user_data),
  signOut: async () => await invoke("sign_out"),
  ical: {
    export: async (enrolData: StdtEnrolResp) => await invoke("ical:export", enrolData),
  },
};
