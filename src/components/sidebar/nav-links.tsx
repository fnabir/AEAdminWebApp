import {
  SidebarGroup, SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {IconType} from "react-icons";

export function NavLinks({
  items
}: {
  items: {
    title: string
    url: string
    icon?: IconType
    access?: string
  }[],
  access?: string,
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Links</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <a
                href={item.url}
                target={"_blank"}
                rel="noopener noreferrer"
              >
                {item.icon && <item.icon/>}
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}