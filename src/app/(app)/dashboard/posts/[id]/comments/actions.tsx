import {restDeleteable, restFindable, restPageable} from "@/lib/rest-crud";
import {client} from "@/lib/http/axios-client";
import {parseAbsoluteToLocal} from "@internationalized/date";
import {PageQuery} from "@/lib/crud";
import {Comment} from "@/app/(app)/dashboard/posts/[id]/comments/definitions";

const resource = '/forum/post/${id}/comments';

/* eslint-disable  @typescript-eslint/no-explicit-any */
function entityConverter(model: any): Comment {
  return {
    ...model,
    createdAt: parseAbsoluteToLocal(model.createdAt),
  };
}

export function pageCommentsAction(postId: string, query: PageQuery) {
  const operarion = restPageable<Comment>(client, resource.replace('${id}', postId), {entityConverter});
  return operarion.page(query);
}

export function findCommentAction(postId: string, commentId: string) {
  const operarion = restFindable<Comment, string>(client, resource.replace('${id}', postId), {entityConverter});
  return operarion.find(commentId);
}

export function deleteCommentActions(postId: string, commentId: string) {
  const operarion = restDeleteable<string>(client, resource.replace('${id}', postId));
  return operarion.delete(commentId);
}

