"use client";

import {useMemo} from "react";
import {ColumnDef, ColumnFilter} from "@tanstack/react-table";
import {authorities as a, Authority, User, userDefaultValues, userResolver} from "@/app/(app)/dashboard/users/definitions";
import {Checkbox} from "@/components/ui/checkbox";
import {Badge} from "@/components/ui/badge";
import {EntityAction} from "@/components/crud/entity-crud";
import {ShieldCheck, ShieldMinus} from "lucide-react";
import {alert} from "@/providers/alert-dialogs";
import {createUserAction, deleteUserAction, enableUserAction, findUsersAction, pageUsersAction, updateUserAction} from "@/app/(app)/dashboard/users/actions";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud";
import {EntityForm} from "@/app/(app)/dashboard/users/_components/form";

export interface UserBasePage {
  title: string;
  authorities?: Authority[];
}

export function UserBasePage({title, authorities}: Readonly<UserBasePage>) {
  
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      header: "Nombre de Usuario",
      accessorKey: "username",
      enableSorting: true,
    },
    {
      header: "Nombre",
      accessorKey: "firstName",
      enableSorting: true,
    },
    {
      header: "Apellido",
      accessorKey: "lastName",
      enableSorting: true,
    },
    {
      header: "Correo",
      accessorKey: "email",
      enableSorting: true,
    },
    {
      header: "Roles",
      accessorKey: "authorities",
      enableSorting: false,
      cell: ({row}) => {
        return row.original.authorities.map(authority => (
          <Badge key={authority} className="mr-1 mb-1">
            {a[authority] || authority}
          </Badge>
        ));
      },
    },
    {
      header: "Habilitado",
      accessorKey: "enabled",
      enableSorting: true,
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          <Checkbox checked={row.original.enabled} disabled/>
        </div>
      },
    }
  ], []);
  
  const entityActions = useMemo<EntityAction<User>[]>(() => [
    {
      id: "enable-disable",
      label: user => user.enabled ? "Deshabilitar" : "Habilitar",
      icon: user => user.enabled ? <ShieldMinus/> : <ShieldCheck/>,
      onClick: async (user, crudApi) => {
        
        const result = await alert.question({
          title: user.enabled ? "Deshabilitar Usuario" : "Habilitar Usuario",
          description: `¿Estás seguro de ${user.enabled ? "deshabilitar" : "habilitar"} al usuario ${user.username}?`,
          onConfirm: async () => await enableUserAction(user.id, !user.enabled),
        });
        
        if (result.isCancelled) {
          return;
        }
        
        if (!result.value.success) {
          await alert.error(result.value.error);
          return;
        }
        
        await crudApi.refreshEntity(user.id);
      }
    }
  ], []);
  
  return <EntityCrud
    cacheKey="users"
    create={{
      renderForm: EntityForm,
      createAction: createUserAction,
      defaultValues: userDefaultValues,
      resolver: userResolver,
    }}
    read={{
      title,
      columns,
      entityActions,
      initialState: {
        columnFilters: [
          {
            id: "authorities",
            value: authorities,
          }
        ]
      },
      toQuery,
      pageAction: pageUsersAction,
      findAction: findUsersAction,
    }}
    update={{
      renderForm: EntityForm,
      updateAction: updateUserAction,
      defaultValues: userDefaultValues,
      resolver: userResolver,
    }}
    delete={{
      deleteAction: deleteUserAction
    }}
  />
}

function toQuery(columnFilters: ColumnFilter[]): string {
  const rsqlParts: string[] = [];
  const authorities = columnFilters.find(f => f.id === "authorities")?.value as Authority[] | undefined;
  if (authorities && authorities.length > 0) {
    rsqlParts.push(`authorities=in=(${authorities.join(",")})`);
  }
  return rsqlParts.join(";");
}