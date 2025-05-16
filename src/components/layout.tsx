import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { FC, ReactNode } from "react";
import {ThemeToggle} from "@/components/header/themeToggle";
import { BreadcrumbInterface } from "@/lib/interfaces";

const Layout: FC<{ breadcrumb: BreadcrumbInterface[], children: ReactNode }> = ({breadcrumb, children}) => {
  return(
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className={"flex flex-col h-screen pb-2"}>
          <header
            className="flex px-4 py-2 h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1"/>
            <Separator orientation="vertical" className="mr-2 max-h-3/4 bg-slate-600"/>
            <Breadcrumb className={"flex-auto"}>
              <BreadcrumbList>
                {breadcrumb.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {index === breadcrumb.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumb.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <ThemeToggle/>
          </header>
          <div className="flex-1 px-2 md:px-4 overflow-y-auto">
            {children}
          </div>
          <footer
            className={`hidden md:flex text-center shrink-0 items-center md:justify-between gap-2 mx-4 mt-2 transition-[width,height] ease-linear p-4 rounded-xl bg-muted/100 text-sm text-primary`}>
            <span className="flex-1 text-center md:text-left">
              © {new Date().getFullYear()} Ahsan Enterprise. All Rights Reserved.
            </span>
              <ul className="flex space-x-4">
                <li>
                  <a
                    className="hover:underline"
                    href="https://asianliftbd.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="hover:underline"
                    href="https://asianliftbd.com/terms-of-use"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms Of Use
                  </a>
                </li>
              </ul>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout;
