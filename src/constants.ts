import { TDaysInWeek } from "./types";

const UST_PROTOCOL = "hk-ust-studentapp://callback";
const OAUTH_BASE =
  "https://login.microsoftonline.com/6c1d4152-39d0-44ca-88d9-b8d6ddca0708/oauth2/v2.0";

const UST_CLIENT_ID = "6364e3a0-9014-4773-8f76-0eeb07ccd67e";

const TDaysInWeek: TDaysInWeek = {
  mon: 0,
  tues: 1,
  wed: 2,
  thurs: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

export { UST_PROTOCOL, OAUTH_BASE, UST_CLIENT_ID, TDaysInWeek as DaysInWeek };
