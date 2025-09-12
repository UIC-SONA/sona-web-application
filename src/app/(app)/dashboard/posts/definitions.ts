import {Entity} from "@/lib/crud";
import {ZonedDateTime} from "@internationalized/date";
import {Comment} from "@/app/(app)/dashboard/posts/[id]/comments/definitions";

export interface Post extends Entity<string> {
  id: string;
  content: string;
  likedBy: string[];
  reportedBy: string[];
  createdAt: ZonedDateTime;
  comments: Comment[];
  author: number | null; // null if the author is anonymous
}

export interface TopPostsDto {
  mostLikedPost: Post | null;
  mostCommentedPost: Post | null;
}

export interface PostDto {
  anonymous: boolean | undefined;
  content: string;
}