import { UserDataProps } from "@/types";
import React, { createContext, useEffect, useState } from "react";

export const UserDataContext = createContext<UserDataProps>(null);

export const UserDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userData, setUserData] = useState<UserDataProps>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      setUserData(await api.getUserData());
    };

    if (!userData) {
      fetchUserData();
    }
  }, []);

  return (
    userData && (
      <UserDataContext.Provider value={userData}>
        {children}
      </UserDataContext.Provider>
    )
  );
};
