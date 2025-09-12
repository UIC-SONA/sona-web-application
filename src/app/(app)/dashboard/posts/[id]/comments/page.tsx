"use client"

import {useCallback, useMemo} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {TruncateText} from "@/components/ui/truncate-text";
import {DateFormatter} from "@internationalized/date";
import {BreadcrumbLayout} from "@/components/design/breadcrumb/breadcrumb-layout";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon} from "lucide-react";
import {useParams, useRouter} from 'next/navigation';
import {deleteCommentActions, findCommentAction, pageCommentsAction} from "@/app/(app)/dashboard/posts/[id]/comments/actions";
import {PageQuery} from "@/lib/crud";
import {Comment} from "@/app/(app)/dashboard/posts/[id]/comments/definitions";

const dateFormatter = new DateFormatter(navigator.language, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const columns = useMemo<ColumnDef<Comment>[]>(() => [
    {
      header: "Contenido",
      accessorKey: "content",
      enableSorting: true,
      cell: ({row}) => {
        return <TruncateText
          expansionType="modal"
          text={row.original.content}
          length={100}
        />
      }
    },
    {
      header: "Publicado",
      accessorKey: "createdAt",
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          {dateFormatter.format(row.original.createdAt.toDate())}
        </div>;
      }
    },
    {
      header: "Likes",
      accessorKey: "likedBy",
      enableSorting: true,
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          {row.original.likedBy.length}
        </div>
      },
    },
    {
      header: "Denuncias",
      accessorKey: "reportedBy",
      enableSorting: true,
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          {row.original.reportedBy.length}
        </div>
      },
    },
  ], [])
  
  const postId = params.id as string;
  
  const findComment = useCallback(async (id: string) => findCommentAction(postId, id), [postId]);
  const pageComments = useCallback(async (query: PageQuery) => pageCommentsAction(postId, query), [postId]);
  const deleteComment = useCallback(async (id: string) => deleteCommentActions(postId, id), [postId]);
  
  return <BreadcrumbLayout
    homePage="/dashboard"
    breadcrumbs={["Dashboard", "Foro", "Comentarios"]}
  >
    <EntityCrud
      cacheKey="post-comments"
      read={{
        title: (
          <div className="flex items-center space-x-2 mb-4">
            <Button variant="outline" size="icon" onClick={router.back}>
              <ChevronLeftIcon/>
            </Button>
            <h2 className="text-2xl font-bold">Comentarios</h2>
          </div>
        ),
        columns,
        findAction: findComment,
        pageAction: pageComments,
      }}
      delete={{
        deleteAction: deleteComment,
      }}
    />
  </BreadcrumbLayout>
}

