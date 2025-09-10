import axios from "axios";

const instance = axios.create({
  baseURL: "https://w5.ab.ust.hk/msapi/",
  timeout: 2000,
});

const resp = await instance.post(
  "/sis/stdt_ecard/users/{stdtID}/enrollment/cart_ad"
);

console.log(resp.data)
