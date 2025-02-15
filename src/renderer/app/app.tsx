import { RouterProvider } from "react-router";
import { useEffect, useState } from "react";
import { UserDataProps } from "@/types";
import { router } from "./router";

export default function App() {
  const [userData, setUserData] = useState<UserDataProps>({});
  useEffect(() => {
    const fetchUserData = async () => {
      setUserData(await api.userData());
    };

    if (!userData) {
      fetchUserData();
    }
  }, []);
  return userData ? <RouterProvider router={router} /> : <></>;
}
