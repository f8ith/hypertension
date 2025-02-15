import { createBrowserRouter } from "react-router";
import DashboardLayout from "@/renderer/components/layouts/dashboard-layout";
import Enrol from "@/renderer/app/routes/enrol";
import { ErrorBoundary } from "@/renderer/app/routes/error-boundary";

const routeConfig = [
  {
    path: "/",
    element: <DashboardLayout />,
    handle: {
      crumb: () => "Home",
    },
    children: [
      {
        path: "enrol",
        element: <Enrol />,
        handle: {
          crumb: () => "Enrollment",
        },
      },
    ],
    errorElement: <ErrorBoundary />,
  },
];

const router = createBrowserRouter(routeConfig);

export { router, routeConfig };
