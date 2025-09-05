"use client"

import Image from "next/image";
import iconWhite from "@/assets/only_logo.png";
import iconColor from "@/assets/only_logo.png";
import {useTheme} from "next-themes";
import {ComponentProps, useEffect, useState} from "react";


export default function AppIcon(props: Readonly<Omit<ComponentProps<typeof Image>, "src" | "alt">>) {
  const {resolvedTheme} = useTheme();
  const [src, setSrc] = useState(iconWhite);
  
  useEffect(() => {
    setSrc(resolvedTheme === "dark" ? iconWhite : iconColor);
  }, [resolvedTheme]);
  
  return (
    <Image
      {...props}
      src={src}
      alt="App Icon"
    />
  )
}