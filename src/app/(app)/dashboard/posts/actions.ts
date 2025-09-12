import {Post} from "@/app/(app)/dashboard/posts/definitions";
import {restDeleteable, restFindable, restPageable} from "@/lib/rest-crud";
import {client} from "@/lib/http/axios-client";
import {parseAbsoluteToLocal} from "@internationalized/date";

const resource = '/forum/post';

/* eslint-disable  @typescript-eslint/no-explicit-any */
function entityConverter(model: any): Post {
  return {
    ...model,
    createdAt: parseAbsoluteToLocal(model.createdAt),
    comments: model.comments.map((model: any): Comment => ({
      ...model,
      createdAt: parseAbsoluteToLocal(model.createdAt),
    })),
  };
}

const pageable = restPageable<Post>(client, resource, {entityConverter});
const findable = restFindable<Post>(client, resource, {entityConverter});
const deletable = restDeleteable<string>(client, resource);

export const pagePostsAction = pageable.page;
export const findPostAction = findable.find;
export const deletePostAction = deletable.delete;