import {Post, TopPostsDto} from "@/app/(app)/dashboard/posts/definitions";
import {restDeleteable, restFindable, restPageable} from "@/lib/rest-crud";
import {client} from "@/lib/http/axios-client";
import {parseAbsoluteToLocal} from "@internationalized/date";
import {attempt} from "@/lib/result";

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

export const topPostsAction = attempt(async () => {
  const response = await client.get<any>(`${resource}/top`);
  const data = response.data;
  const mostLikedPost = data.mostLikedPost ? entityConverter(data.mostLikedPost) : null;
  const mostCommentedPost = data.mostCommentedPost ? entityConverter(data.mostCommentedPost) : null;
  return {mostLikedPost, mostCommentedPost} satisfies TopPostsDto;
});