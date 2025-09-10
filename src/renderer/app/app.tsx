import { RouterProvider } from "react-router";
import { router } from "./router";
import { UserDataProvider } from "../contexts/user-data";

export default function App() {
  return (
    <UserDataProvider>
      <RouterProvider router={router} />
    </UserDataProvider>
  );
}
