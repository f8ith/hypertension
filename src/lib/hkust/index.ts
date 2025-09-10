import {
  CourseInformation,
  StdtEnrolResp,
  StdtInfoCourseGrade,
} from "@/types";
import { OAUTH_BASE, UST_CLIENT_ID, UST_PROTOCOL } from "../../constants";
import axios from "axios";

const auth = {
  testToken: async (token: string): Promise<boolean> => {
    const instance = axios.create({
      baseURL: "https://w5.ab.ust.hk/msapi/",
      timeout: 2000,
      headers: { Authorization: `Bearer ${token}` },
    });

    const resp = await instance.get("sis/catg_course");
    if (resp.data.status != 200)
      return false;
    return true;
  },
  refreshToken: async (token: string) => {
    const resp = await axios(
      OAUTH_BASE + "/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          refresh_token: token,
          grant_type: "refresh_token",
          scope: "openid profile email offline_access",
          redirect_uri: UST_PROTOCOL,
          client_id: UST_CLIENT_ID,
        },
      }
    );
    return resp.data as {
      scope: string,
      ext_expires_in: number,
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      id_token: string;
    };
  },
  accessToken: async (code: string, code_verifier: string) => {
    const resp = await axios(
      OAUTH_BASE + "/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          code: code,
          grant_type: "authorization_code",
          code_verifier: code_verifier,
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

  // NEEDED TO USE ENROLLMENT (i think)
  requestToken: async (token: string) => {
    const resp = await axios("https://w5.ab.ust.hk/msapi/token/request", {
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

const getContext = (refresh_token: string) => {
  const instance = axios.create({
    baseURL: "https://w5.ab.ust.hk/msapi/",
    timeout: 2000,
  });

  instance.interceptors.response.use(async (response) => {
    if ("status" in response.data && response.data.status != 200) {
      const data = await auth.refreshToken(refresh_token)
      if (data.id_token) {
        instance.defaults.headers.common["Authorization"] = `Bearer ${data.id_token}`
        const localInstance = axios.create({
          baseURL: "https://w5.ab.ust.hk/msapi/",
          timeout: 2000,
          headers: { Authorization: `Bearer ${data.id_token}` },
        });
        const newResponse = await localInstance.request({ ...response.config });

        return newResponse;
      }
      else {
        return Promise.reject("unable to refresh token")
      }
    }

    return response;
  }, function(error) {
    return Promise.reject(error);
  });

  const booking = {
    all: async () => {
      return;
    },
  };
  const cart = {};
  const courses = {
    catg_course: async (careerType = "UG", termCode = " ") => {
      const courseInformation = [];
      let i = 0;
      const pagelen = 1000;
      for (; ;) {
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
    queue_it: async () => {
      const resp = await instance.get(
        "/queueIt/config"
      );
      return resp.data;
    },
    cart_list: async () => {
      const resp = await instance.get(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/cart_list"
      );
      return resp.data;
    },
    cart_add: async (term: string, classNbrs: number[]) => {
      const resp = await instance.post(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/cart_add",
        {
          term: term,
          enrollments: classNbrs.map((num) => {
            return { classNbr: num };
          }),
        },
      );
      return resp.data;
    },
    cart_enrl: async (term: string, classNbrs: number[]) => {
      const resp = await instance.post(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/cart_enrl",
        {
          term: term,
          enrollments: classNbrs.map((num) => {
            return { classNbr: num };
          }),
        }
      );
      return resp.data;
    },
    drop: async (term: string, classNbrs: number[]) => {
      const resp = await instance.post(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/drop",
        {
          term: term,
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
      relClassNbr1 = 0,
      relClassNbr2 = 0
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
      return resp.data as StdtEnrolResp;
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
  getContext,
};
