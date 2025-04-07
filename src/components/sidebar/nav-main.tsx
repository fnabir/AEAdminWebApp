import {
  SidebarGroup, SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import {IconType} from "react-icons";
export function NavMain({
  items, userAccess, label
}: {
  items: {
    title: string
    url: string
    icon?: IconType
    access?: string
  }[],
  access?: string,
  userAccess?: string,
  label?: string
}) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          (!item.access || item.access === userAccess) && <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <Link href={item.url}>
                {item.icon && <item.icon/>}
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}