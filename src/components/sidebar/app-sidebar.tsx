"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  FaFileContract,
  FaGlobe,
  FaMicrosoft, FaMoneyBill,
  FaSquareFacebook,
} from "react-icons/fa6";
import Image from "next/image";
import Logo from "@/images/logo.svg"
import {useAuth} from "@/hooks/use-auth";
import {NavMain} from "@/components/sidebar/nav-main"
import {NavLinks} from "@/components/sidebar/nav-links";
import {NavUser} from "@/components/sidebar/nav-user"

const navData = {
  dashboard: [
    {
      title: "Dashboard",
      url: "/",
      icon: FaMicrosoft,
    },
  ],
  main: [
    {
      title: "Files",
      url: "/files",
      icon: FaFileContract,
    },
    {
      title: "Balance",
      url: "/balance",
      icon: FaMoneyBill,
      access: "admin",
    },
  ],
  links: [
    {
      title: "Website",
      url: "https://asianliftbd.com/ahsan-enterprise",
      icon: FaGlobe,
    },
    {
      title: "Facebook",
      url: "https://www.facebook.com/ahsanenterprise96",
      icon: FaSquareFacebook,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user, userRole} = useAuth();
  let userData: { name: string, email: string } = {
    name: "", email: "",
  };
  if (user) {
    userData = {
      name: user.displayName ? user.displayName : "",
      email: user.email!,
    }
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
                <div className="flex aspect-square max-h-11">
                  <Image
                      priority
                      src={Logo}
                      alt="Ahsan Enterprise"
                      className="max-w-11"
                    />
                    <div className="font-bold text-lg leading-4"><span className="text-3xl leading-4">AHSAN</span> ENTERPRISE</div>
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.dashboard} />
        <NavMain items={navData.main} userAccess={userRole}/>
        <NavLinks items={navData.links}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}