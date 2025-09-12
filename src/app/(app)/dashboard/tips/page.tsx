"use client"

import {useMemo} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {TruncateText} from "@/components/ui/truncate-text";
import {ModalFetchImage} from "@/components/ui/fetch-image";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud";
import {EntityForm} from "@/app/(app)/dashboard/tips/_components/form";
import {Tip, tipDefaultValues, TipDto, tipResolver} from "@/app/(app)/dashboard/tips/definitions";
import {createTipAction, deleteTipAction, findTipAction, getTipImageAction, pageTipAction, updateTipAction} from "@/app/(app)/dashboard/tips/actions";
import {Checkbox} from "@/components/ui/checkbox";
import {Badge} from "@/components/ui/badge";

export default function Page() {
  
  const columns = useMemo<ColumnDef<Tip>[]>(() => [
    {
      header: "Título",
      accessorKey: "title",
      enableSorting: true,
    },
    {
      header: "Resumen",
      accessorKey: "summary",
      enableSorting: true,
      cell: ({row}) => {
        return <TruncateText text={row.original.summary}/>
      }
    },
    {
      header: "Descripción",
      accessorKey: "description",
      enableSorting: true,
      cell: ({row}) => {
        return <TruncateText text={row.original.description}/>
      }
    },
    {
      header: "Tags",
      accessorKey: "tags",
      enableSorting: false,
      cell: ({row}) => {
        return row.original.tags.map(tag => (
          <Badge key={tag} className="mr-1">{tag}</Badge>
        ));
      }
    },
    {
      header: "Activo",
      accessorKey: "active",
      enableSorting: true,
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          <Checkbox checked={row.original.active} disabled/>
        </div>
      },
    },
    {
      header: "Calificación",
      accessorKey: "averageRate",
      enableSorting: true,
      cell: ({row}) => {
        return row.original.averageRate.toFixed(2);
      }
    },
    {
      header: "Calificaciones",
      accessorKey: "totalRate",
      enableSorting: true,
      cell: ({row}) => {
        return row.original.totalRate;
      }
    },
    {
      header: "Imagen",
      accessorKey: "image",
      enableSorting: false,
      cell: ({row}) => {
        return <ModalFetchImage
          cacheKey={`tip-image-${row.original.id}`}
          fetcher={() => getTipImageAction(row.original.id)}
          alt={row.original.title}/>
      },
    },
  ], []);
  
  return (
    <EntityCrud<Tip, TipDto, string>
      cacheKey="tips"
      create={{
        renderForm: EntityForm,
        createAction: createTipAction,
        defaultValues: tipDefaultValues,
        resolver: tipResolver
      }}
      read={{
        title: "Tips",
        columns,
        pageAction: pageTipAction,
        findAction: findTipAction
      }}
      update={{
        renderForm: EntityForm,
        updateAction: updateTipAction,
        defaultValues: tipDefaultValues,
        resolver: tipResolver
      }}
      delete={{
        deleteAction: deleteTipAction
      }}
    />
  );
}