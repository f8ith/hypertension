import fs from "node:fs";
import { app } from "electron";
import path from "node:path";
import { UserDataProps } from "@/types";
import { assignFromPartial } from "@/lib/utils";

const FILEPATH = path.resolve(path.join(app.getPath("userData"), "/userData.json"));

let _userData: UserDataProps;
if (!fs.existsSync(FILEPATH)) fs.writeFileSync(FILEPATH, "{}");

const file = fs.readFileSync(FILEPATH, "utf-8");
_userData = JSON.parse(file);

const get = () => {
  return _userData;
};

const update = (userData: UserDataProps) => {
  _userData = assignFromPartial(_userData, userData);
  fs.writeFileSync(FILEPATH, JSON.stringify(_userData), {
    flag: "w+",
  });
};

const clear = () => {
  _userData = {};
  fs.writeFileSync(FILEPATH, JSON.stringify(_userData, null, 2), {
    flag: "w+",
  });
};

export default {
  get,
  update,
  clear,
};
