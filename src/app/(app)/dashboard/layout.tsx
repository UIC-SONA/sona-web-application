import {AppSidebarLayout} from "@/components/design/sidebar/app-sidebar-layout";
import {getServerSession} from "@/lib/session-server";
import {MenuGroup} from "@/components/design/sidebar/app-sidebar-main-menu";
import {BlocksIcon, BookOpenIcon, CalendarIcon, MessageSquareIcon, ThumbsUpIcon, UserIcon} from "lucide-react";
import {PropsWithChildren} from "react";

export default async function Layout({children}: Readonly<PropsWithChildren>) {
  
  const session = await getServerSession();
  if (!session) {
    throw new Error("No session found");
  }
  
  const user = session.user;
  const authorities = session.authorities;
  
  if (!user) {
    throw new Error("User not found in session");
  }
  
  const menu: MenuGroup[] = [
    {
      label: "Panel",
      menu: [
        ...(anyRole(authorities, ["admin", "administative"]) ?
          [
            {
              title: "Usuarios",
              path: "/dashboard/users",
              icon: <UserIcon/>,
            },
            {
              title: "Tips",
              path: "/dashboard/tips",
              icon: <BookOpenIcon/>
            },
            {
              title: "Posts",
              path: "/dashboard/posts",
              icon: <ThumbsUpIcon/>
            },
            {
              title: "Contenido didáctico",
              path: "/dashboard/didactic-content",
              icon: <BlocksIcon/>
            },
            {
              title: "Profesionales",
              path: "#",
              icon: <UserIcon/>,
              subMenu: [
                {
                  title: "Gestion",
                  path: "/dashboard/professionals",
                },
                {
                  title: "Horarios de atención",
                  path: "/dashboard/professionals-schedules",
                },
              ],
            },
          ] : []),
        ...(anyRole(authorities, ["legal_professional", "medical_professional", "admin", "administative"]) ?
          [
            {
              title: "Ver Agenda",
              path: "#",
              icon: <CalendarIcon/>,
              subMenu: [
                {
                  title: "Gestion",
                  path: "/dashboard/appointments",
                },
                {
                  title: "Calendario",
                  path: "/appointments-calendar",
                },
              ]
            },
          ] : []),
      ],
    }
  ]
  
  return <AppSidebarLayout
    user={user}
    menuGroups={menu}
    grettings={<span className="truncate text-xs">Bienvenido</span>}
    appName={"Sona"}
  >
    {children}
  </AppSidebarLayout>
}

function anyRole(authorities: string[], roles: string[], prefix = "ROLE_"): boolean {
  return roles.some(role => authorities.includes(prefix + role));
}
