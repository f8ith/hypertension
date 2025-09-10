import { createBrowserRouter, RouteObject } from "react-router";
import DashboardLayout from "@/renderer/components/layouts/dashboard-layout";
import Enrollment from "@/renderer/app/routes/enrollment";
import { ErrorBoundary } from "@/renderer/app/routes/error-boundary";
import FindRoom from "./routes/find-room";

const routeConfig: RouteObject[] = [
  {
    path: "/",
    element: <DashboardLayout />,
    handle: {
      crumb: () => "Home",
    },
    children: [
      {
        path: "enrollment",
        element: <Enrollment />,
        handle: {
          crumb: () => "Enrollment",
        },
      },
      {
        path: "find-room",
        element: <FindRoom />,
        handle: {
          crumb: () => "Find room",
        },
      },
    ],
    errorElement: <ErrorBoundary />,
  },
];

const router = createBrowserRouter(routeConfig);

export { router, routeConfig };
