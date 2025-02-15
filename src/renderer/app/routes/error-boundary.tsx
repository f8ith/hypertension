import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

export function ErrorBoundary() {
  let error = useRouteError();
  let errorTitle = "";
  let errorDesc = "";

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        errorTitle = "This page does not exist";
        break;
      case 401:
        errorTitle = "No authorization";
        break;
      case 503:
        errorTitle = "API is temporarily down. Try again later";
        break;
      case 418:
        errorTitle = "I'm a teapot";
        break;
    }
    errorDesc = error.data;
  } else if (error instanceof Error) {
    errorTitle = error.message;
    errorDesc = error.stack;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{errorTitle}</CardTitle>
          <CardDescription className="text-md">{errorDesc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row justify-center items-center text-xl">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
