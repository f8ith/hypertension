import {
  CourseInformation,
  StdtInfoClassEnrl,
  StdtInfoCourseGrade,
} from "@/types";
import { UST_CLIENT_ID, UST_PROTOCOL } from "../../constants";
import axios from "axios";

const auth = {
  accessToken: async (code: string) => {
    const resp = await axios(
      "https://login.microsoftonline.com/6c1d4152-39d0-44ca-88d9-b8d6ddca0708/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          code: code,
          grant_type: "authorization_code",
          code_verifier:
            "ZEcw0VBturN2cjwpCVMLvZIuYdHtBXhMCk96aIQS9fDnPDDwuIJlxkEuCPtYZG6DW5O03JXGzHAaja5_HgzK0g",
          redirect_uri: UST_PROTOCOL,
          client_id: UST_CLIENT_ID,
        },
      }
    );
    return resp.data as {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      id_token: string;
    };
  },
  requestToken: async (token: string) => {
    const resp = await axios("https://w5.ab.ust.hk/token/request", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      data: {},
    });
    return resp.data as {
      status: string;
      data: {
        access_token: string;
        expire_in: number;
      };
    };
  },
};

const getContextFromCode = async (code: string) => {
  const resp = await auth.accessToken(code);
  return getContext(resp.id_token);
};

const getContext = (token: string) => {
  const _token = token;
  const instance = axios.create({
    baseURL: "https://w5.ab.ust.hk/msapi/",
    timeout: 2000,
    headers: { Authorization: `Bearer ${_token}` },
  });

  const booking = {
    all: async () => {
      return;
    },
  };
  const cart = {};
  const courses = {
    catg_course: async (careerType: string = "UG", termCode: string = " ") => {
      let courseInformation = [];
      let i = 0;
      const pagelen = 1000;
      while (true) {
        const resp = await instance.get("/sis/catg_course", {
          params: {
            careerType,
            termCode,
            offset: i * pagelen,
          },
        });

        if ((i + 1) * pagelen >= resp.data.totalRecord) {
          break;
        }

        i++;

        courseInformation.push(
          ...(resp.data.courseInformation as CourseInformation[])
        );
      }
      return courseInformation;
    },
    class_quota: async (term: string) => {
      const resp = await instance.get("/sis/cq/class_quota", {
        params: {
          term,
        },
      });
      return resp.data.courses;
    },
    terms: async () => {
      const resp = await instance.get("/sis/cq/terms");
      return resp.data.terms;
    },
    subjects: async () => {
      const resp = await instance.get(
        "https://w5.ab.ust.hk/msapi/sis/cq/subjects"
      );
      return resp.data;
    },
  };
  const enrol = {
    cart_list: async () => {
      const resp = await instance.get(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/cart_list"
      );
      return resp.data;
    },
    cart_enrl: async (termNbr: number, classNbrs: number[]) => {
      const resp = await instance.post(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/cart_enrl",
        {
          term: termNbr,
          enrollments: classNbrs.map((num) => {
            return { classNbr: num };
          }),
        }
      );
      return resp.data;
    },
    drop: async (termNbr: number, classNbrs: number[]) => {
      const resp = await instance.post(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/drop",
        {
          term: termNbr,
          enrollments: classNbrs.map((num) => {
            return { classNbr: num };
          }),
        }
      );

      return resp.data;
    },
    swap: async (
      termNbr: number,
      fromEnrollment: number,
      toEnrollment: number,
      relClassNbr1: number = 0,
      relClassNbr2: number = 0
    ) => {
      const resp = await instance.post(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/swap",
        {
          term: termNbr,
          fromEnrollment: { classNbr: fromEnrollment },
          toEnrollment: {
            classNbr: toEnrollment,
            relClassNbr1: relClassNbr1,
            relClassNbr2: relClassNbr2,
          },
        }
      );
      return resp.data;
    },
    stdt_class_enrl: async () => {
      const resp = await instance.get(
        "/sis/stdt_class_enrl/{stdtID}?showInstr=Y"
      );
      return resp.data.stdtInfo[0] as StdtInfoClassEnrl;
    },
  };
  const student = {
    student_information: async () => {
      const resp = await instance.get("api/njggt/student-information");
      return resp.data;
    },
    stdt_terms: async () => {
      const resp = await instance.get(
        "https://w5.ab.ust.hk/msapi/sis/stdt_terms"
      );
      return resp.data;
    },
    stdt_courses: async () => {
      const resp = await instance.get(
        "https://w5.ab.ust.hk/msapi/sis/stdt_courses"
      );
      return resp.data.stdtInfo[0] as StdtInfoCourseGrade;
    },
    acad_progress: async () => {
      const resp =
        "https://w5.ab.ust.hk/msapi/sis/stdt_ecard/users/{stdtID}/acad_progress";
    },
  };

  const whitelist = async () => {
    const resp = await instance.get("/api/whitelist");
    return resp.data;
  };

  return {
    booking,
    cart,
    courses,
    enrol,
    student,
    whitelist,
  };
};

export const ust = {
  auth,
  getContextFromCode,
  getContext,
};
