import { useContext } from "react";
import { UserDataContext } from "@/renderer/contexts/user-data";
import { ust } from "@/lib/hkust";

export function useUstClient() {
  const { ust: ustToken } = useContext(UserDataContext);

  const ustClient = ust.getContext(ustToken.refresh_token);
  return ustClient;
}
