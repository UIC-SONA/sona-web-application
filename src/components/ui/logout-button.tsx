"use client"

import {signOut} from "next-auth/react";
import {Button} from "@/components/ui/button";
import IconLoader from "@/components/ui/icon-loader";
import {Undo2Icon} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";

export function LogoutButton() {
  
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => await signOut(),
    onSuccess: queryClient.clear
  })
  
  return (
    <Button
      variant="outline"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <IconLoader
        loading={mutation.isPending || mutation.isSuccess}
        icon={Undo2Icon}
      />
      Aceptar
    </Button>
  );
}