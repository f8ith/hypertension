import * as React from "react";
import { ChevronsUpDown, GalleryVerticalEnd, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";
import { useUstClient } from "@/renderer/hooks/use-ust-client";
import { StdtEnrolResp } from "@/types";
import { ust } from "@/lib/hkust";

export function AppSidebarHeader() {
  const [stdtEnrol, setStdtEnrol] = React.useState<StdtEnrolResp>(null);
  const { isMobile } = useSidebar();
  const ustClient = useUstClient();


  const onLogOut = async () => {
    await api.signOut();
  };

  React.useEffect(() => {
    const fun = async () => {
      const userdata = await api.getUserData();
      const data = await ust.auth.requestToken(userdata.ust.id_token);

      const newStdtCourses = await ustClient.enrol.stdt_class_enrl();

      console.log(newStdtCourses);
      setStdtEnrol(newStdtCourses);
    };

    fun();
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">hypertension</span>
                {stdtEnrol && <span className="truncate text-xs">
                  logged in as {stdtEnrol.userName}
                </span>}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuItem onClick={() => onLogOut()} className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <LogOut className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Sign out</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
