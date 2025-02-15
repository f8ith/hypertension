import fs from "node:fs";
import { app } from "electron";
import path from "node:path";
import { UserDataProps } from "@/types";
import { assignFromPartial } from "@/lib/utils";

const FILEPATH = path.join(app.getPath("userData"), "/userData.json");

const get = () => {
  return _userData;
};

const update = async (userData: UserDataProps) => {
  _userData = assignFromPartial(_userData, userData);
  await fs.promises.writeFile(FILEPATH, JSON.stringify(_userData), {
    flag: "w+",
  });
};

let _userData: UserDataProps;
if (!fs.existsSync(FILEPATH)) fs.writeFileSync(FILEPATH, "{}");

const file = fs.readFileSync(FILEPATH, "utf-8");
_userData = JSON.parse(file);

export default {
  get,
  update,
};
