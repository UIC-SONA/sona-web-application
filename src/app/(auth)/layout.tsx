import {PropsWithChildren} from "react";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import onlyLogo from "@/assets/only_logo.png";
import Image from "next/image";

export default function Layout({children}: Readonly<PropsWithChildren>) {
  return (
    <div className="min-h-screen flex">
      <div className="md:w-1/2  p-8 bg-primary rounded-r-[1.5rem] hidden md:flex flex-col justify-center items-center border-2">
        <h1 className="text-3xl font-bold text-primary-foreground mb-4">
          Bienvenido a SONA!
        </h1>
        <Image src={onlyLogo} alt="Logo" className="w-1/2 mx-auto mb-8"/>
      </div>
      <div className="md:w-1/2 w-full p-8 bg-background flex flex-col justify-center z-0">
        <div className="absolute top-4 right-4">
          <ThemeToggle/>
        </div>
        <div className="mx-auto w-full md:w-3/4">
          {children}
        </div>
      </div>
    </div>
  )
}