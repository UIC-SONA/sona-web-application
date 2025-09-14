import type {Metadata} from "next";
import {K2D} from "next/font/google";
import "./globals.css";
import {SessionProvider} from "@/providers/session-provider";
import {PropsWithChildren} from "react";
import {ThemeProvider} from "@/providers/theme-provider";
import {Toaster} from "@/components/ui/sonner";
import {AlertDialogs} from "@/providers/alert-dialogs";
import {QueryClientProvider} from "@/providers/query-client-provider";

const k2d = K2D({
  subsets: ["latin"],
  weight: ["200", "400", "700"], // Elige los pesos que necesites
  variable: "--font-k2d", // Opcional: para usarla como variable CSS
});

export const metadata: Metadata = {
  title: "SONA",
  description: "Sistema de administración SONA"
};

export default function RootLayout({children}: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body
      className={`${k2d.className} antialiased`}
    >
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
        <Toaster/>
        <AlertDialogs/>
      </SessionProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
