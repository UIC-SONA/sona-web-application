"use client"

import {useMemo} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Post} from "@/app/(app)/dashboard/posts/definitions";
import {DateFormatter} from "@internationalized/date";
import {EntityAction} from "@/components/crud/entity-crud";
import {MessageSquareText} from "lucide-react";
import {useRouter} from "next/navigation";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud";
import {deletePostAction, findPostAction, pagePostsAction} from "@/app/(app)/dashboard/posts/actions";
import {TruncateText} from "@/components/ui/truncate-text";
import {BreadcrumbLayout} from "@/components/design/breadcrumb/breadcrumb-layout";

const dateFormatter = new DateFormatter(navigator.language, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export default function Page() {
  
  const router = useRouter();
  
  const columns = useMemo<ColumnDef<Post>[]>(() => [
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
      id: "createdAt",
      header: "Publicado",
      accessorKey: "createdAt",
      enableSorting: true,
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          {dateFormatter.format(row.original.createdAt.toDate())}
        </div>;
      }
    },
    {
      id: "likesCount",
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
      id: "commentsCount",
      header: "Comentarios",
      accessorKey: "comments",
      enableSorting: true,
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          {row.original.comments.length}
        </div>
      },
    },
    {
      id: "reportsCount",
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
  
  const entityActions = useMemo<EntityAction<Post>[]>(() => [
    {
      id: "comments",
      label: "Comentarios",
      icon: <MessageSquareText/>,
      onClick: (post: Post) => router.push(`/dashboard/posts/${post.id}/comments`)
    }
  ], [router])
  
  return <BreadcrumbLayout
    homePage="/dashboard"
    breadcrumbs={["Dashboard", "Foro"]}
  >
    <EntityCrud
      cacheKey="posts"
      read={{
        title: "Publicaciones",
        columns,
        entityActions,
        pageAction: pagePostsAction,
        findAction: findPostAction
      }}
      delete={{
        deleteAction: deletePostAction
      }}
    />
  </BreadcrumbLayout>
}
