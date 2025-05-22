import {
  SidebarGroup, SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "@/components/link";
import {IconType} from "react-icons";
export function NavMain({
  items, isAdmin, label
}: {
  items: {
    title: string
    url: string
    icon?: IconType
    isAdmin?: boolean
  }[],
  access?: string,
  isAdmin?: boolean,
  label?: string
}) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          (item.isAdmin ? item.isAdmin === isAdmin : true) && <SidebarMenuItem key={item.title}>
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