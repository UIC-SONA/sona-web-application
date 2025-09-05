import {PropsWithChildren} from "react";
import {getServerSession} from "@/lib/session-server";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {LogoutButton} from "@/components/ui/logout-button";
import {redirect} from "next/navigation";
import {authErrorMessages} from "@/lib/errors";

export default async function AppLayout({children}: Readonly<PropsWithChildren>) {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  if (session.error) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {authErrorMessages[session.error]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <LogoutButton/>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  
  return <>
    {children}
  </>
}
