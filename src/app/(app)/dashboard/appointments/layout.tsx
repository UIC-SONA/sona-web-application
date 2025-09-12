import {PropsWithChildren} from "react";
import {BreadcrumbLayout} from "@/components/design/breadcrumb/breadcrumb-layout";

export default async function Layout({children}: Readonly<PropsWithChildren>) {
  return (
    <BreadcrumbLayout
      homePage="/dashboard"
      breadcrumbs={["Dashboard", "Agendamientos"]}
    >
      {children}
    </BreadcrumbLayout>
  )
}