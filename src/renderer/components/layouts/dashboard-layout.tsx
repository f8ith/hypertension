import { AppSidebar } from "@/renderer/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/renderer/components/ui/breadcrumb";
import { Separator } from "@/renderer/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/renderer/components/ui/sidebar";
import React from "react";
import { Outlet, useMatches } from "react-router";

export default function DashboardLayout() {
  const matches = useMatches();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {matches.map((route: any, index) => (
                <React.Fragment key={route.handle.crumb()}>
                  {index > 0 ? (
                    <BreadcrumbSeparator className="hidden md:block" />
                  ) : (
                    <></>
                  )}
                  <BreadcrumbItem>
                    {index === matches.length - 1 ? (
                      <BreadcrumbPage>{route.handle.crumb()}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="/">
                        {route.handle.crumb()}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
