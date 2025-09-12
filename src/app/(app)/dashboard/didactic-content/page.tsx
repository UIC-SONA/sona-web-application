"use client"

import {useMemo} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {didactiContentDefaultValues, didactiContentResolver, DidaticContent, DidaticContentDto} from "@/app/(app)/dashboard/didactic-content/definitions";
import {TruncateText} from "@/components/ui/truncate-text";
import {ModalFetchImage} from "@/components/ui/fetch-image";
import {createDidacticContentAction, deleteDidacticContentAction, findDidacticContentAction, getDidacticContentImageAction, pageDidacticContentAction, updateDidacticContentAction} from "@/app/(app)/dashboard/didactic-content/actions";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud";
import {EntityForm} from "@/app/(app)/dashboard/didactic-content/_components/form";

export default function Page() {
  
  const columns = useMemo<ColumnDef<DidaticContent>[]>(() => [
    {
      header: "Título",
      accessorKey: "title",
      enableSorting: true,
    },
    {
      header: "Descripción",
      accessorKey: "description",
      enableSorting: true,
      cell: ({row}) => {
        return <TruncateText
          expansionType="modal"
          text={row.original.content}
        />
      }
    },
    {
      header: "Imagen",
      accessorKey: "image",
      cell: ({row}) => {
        return <ModalFetchImage
          cacheKey={`didactic-content-image-${row.original.id}`}
          fetcher={() => getDidacticContentImageAction(row.original.id)}
          alt={row.original.title}
        />
      },
    },
  ], []);
  
  return (
    <EntityCrud<DidaticContent, DidaticContentDto>
      cacheKey="didactic-contents"
      create={{
        renderForm: EntityForm,
        createAction: createDidacticContentAction,
        defaultValues: didactiContentDefaultValues,
        resolver: didactiContentResolver
      }}
      read={{
        title: "Contenidos Didácticos",
        columns,
        pageAction: pageDidacticContentAction,
        findAction: findDidacticContentAction
      }}
      update={{
        renderForm: EntityForm,
        updateAction: updateDidacticContentAction,
        defaultValues: didactiContentDefaultValues,
        resolver: didactiContentResolver
      }}
      delete={{
        deleteAction: deleteDidacticContentAction
      }}
    />
  );
}