import { StdtClassEnrol } from "@/types";
import { UST_STUDENT_SECRET } from "../../constants";
import axios from "axios";

const auth = {
  accessToken: async (code: string) => {
    const resp = await axios("https://cas.ust.hk/cas/oidc/accessToken", {
      method: "POST",
      headers: {
        authorization: UST_STUDENT_SECRET,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "hk.ust.staff://login",
      },
    });
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
  const cart = {
    all: async () => {
      const resp = await instance.get(
        "/sis/stdt_ecard/users/{stdtID}/enrollment/cart_list"
      );
      return await resp.data;
    },
  };
  const enrol = {
    add: async (termNbr: number, classNbrs: number[]) => {
      const resp = await instance.post(
        "sis/stdt_ecard/users/{stdtID}/enrollment/cart_enrl",
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
        "sis/stdt_ecard/users/{stdtID}/enrollment/drop",
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
        "sis/stdt_ecard/users/{stdtID}/enrollment/drop",
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
    all: async () => {
      const resp = await instance.get(
        "/sis/stdt_class_enrl/{stdtID}?showInstr=Y"
      );
      return (await resp.data) as StdtClassEnrol;
    },
  };
  const studentInfo = {
    get: async () => {
      const resp = await instance.get("api/njggt/student-information");
      return resp.data;
    },
  };

  const whitelist = async () => {
    const resp = await instance.get("api/whitelist");
    return resp.data;
  };

  return {
    booking,
    cart,
    enrol,
    studentInfo,
    whitelist,
  };
};

export const ust = {
  auth,
  getContextFromCode,
  getContext,
};
