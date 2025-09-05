import {AppSidebarLayout} from "@/components/design/sidebar/app-sidebar-layout";
import {getServerSession} from "@/lib/session-server";
import {MenuGroup} from "@/components/design/sidebar/app-sidebar-main-menu";
import {BoxIcon, ClipboardListIcon, ContactIcon, FileTextIcon, HandCoinsIcon, HouseIcon, UserIcon} from "lucide-react";
import {PropsWithChildren} from "react";


export default async function Layout({children}: Readonly<PropsWithChildren>) {
  
  const session = await getServerSession();
  if (!session) {
    throw new Error("No session found");
  }
  
  const user = session.user;
  
  if (!user) {
    throw new Error("User not found in session");
  }
  
  const menu: MenuGroup[] = [
    {
      label: "Gestión de Avalúos",
      menu: [
        {
          title: "Miembros",
          path: "/dashboard/members",
          icon: <UserIcon/>,
        },
        {
          title: "Solicitudes",
          path: "/dashboard/appraisal-orders",
          icon: <ClipboardListIcon/>,
        },
        {
          title: "Avalúos",
          path: "/dashboard/appraisals",
          icon: <HandCoinsIcon/>,
        },
        {
          title: "Activos",
          path: "/dashboard/assets",
          icon: <BoxIcon/>,
        },
        {
          title: "Clientes",
          path: "/dashboard/customers",
          icon: <ContactIcon/>,
        },
        {
          title: 'Informes',
          path: '/avaluos/informes',
          icon: <FileTextIcon/>,
        },
        {
          title: 'Referencias',
          path: '/dashboard/references',
          icon: <HouseIcon/>,
        },
      
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