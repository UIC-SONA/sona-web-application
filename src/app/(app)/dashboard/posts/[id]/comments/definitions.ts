import {ZonedDateTime} from "@internationalized/date";

export interface Comment {
  id: string;
  content: string;
  likedBy: string[];
  reportedBy: string[];
  createdAt: ZonedDateTime;
  author: number | null; // null if the author is anonymous
}