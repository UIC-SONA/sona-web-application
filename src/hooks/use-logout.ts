import {signOut} from "next-auth/react";
import {alert} from "@/providers/alert-dialogs";
import {parseError} from "@/lib/errors";
import {useCallback} from "react";

export function useLogout() {
  return useCallback(async () => {
    
    try {
      await alert.question({
        title: "¿Seguro que deseas cerrar sesión?",
        description: "Si cierras sesión, tendrás que volver a iniciar sesión para acceder a tu cuenta.",
        onConfirm: signOut
      })
    } catch (error) {
      await alert.error(parseError(error));
    }
  }, [])
}