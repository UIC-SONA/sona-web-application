import {ChatMessage, ChatMessageSent, ChatRoom, ReadBy, ReadMessages} from "@/app/(app)/chat/definitions";
import {client} from "@/lib/http/axios-client";
import {attempt} from "@/lib/result";
import {parseAbsoluteToLocal} from "@internationalized/date";

const resource = '/chat';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function parseReadBy(data: any): ReadBy {
  return {
    ...data,
    readAt: parseAbsoluteToLocal(data.readAt)
  }
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function parseChatMessage(data: any): ChatMessage {
  return {
    ...data,
    createdAt: parseAbsoluteToLocal(data.createdAt),
    readBy: data.readBy.map(parseReadBy)
  }
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function parseChatMessageSent(data: any): ChatMessageSent {
  return {
    message: parseChatMessage(data.message),
    roomId: data.roomId,
    requestId: data.requestId
  }
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function parseReadMessages(data: any): ReadMessages {
  return {
    roomId: data.roomId,
    readBy: parseReadBy(data.readBy),
    messageIds: data.messageIds
  }
}

export const sendMessageAction = ({roomId, requestId, message}: { roomId: string, requestId: string, message: string }) => attempt(async () => {
  const response = await client.post(
    `${resource}/send/${roomId}`,
    message,
    {
      headers: {
        'Content-Type': 'text/plain'
      },
      params: {requestId}
    }
  );
  return parseChatMessageSent(response.data);
});

export const sendImageAction = ({roomId, requestId, image}: { roomId: string, requestId: string, image: File }) => attempt(async () => {
  const formData = new FormData();
  formData.append('image', image);
  const response = await client.post(
    `${resource}/send/${roomId}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {requestId}
    }
  );
  return parseChatMessageSent(response.data);
});

export const sendVoiceAction = ({roomId, requestId, voice}: { roomId: string, requestId: string, voice: File }) => attempt(async () => {
  const formData = new FormData();
  formData.append('voice', voice);
  const response = await client.post(
    `${resource}/send/${roomId}/voice`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {requestId}
    }
  );
  return parseChatMessageSent(response.data);
});

export const readMessagesAction = ({roomId, messageIds}: { roomId: string, messageIds: string[] }) => attempt(async () => {
  await client.put(`${resource}/room/${roomId}/read`, messageIds);
});

export const getChatRoomsAction = () => attempt(async () => {
  const response = await client.get<ChatRoom[]>(`${resource}/rooms`);
  return response.data;
});

export const getChatRoomAction = (id: string) => attempt(async () => {
  const response = await client.get<ChatRoom>(`${resource}/room/${id}`);
  return response.data;
});

export const getRoomWithUserAction = (userId: number) => attempt(async () => {
  const response = await client.get<ChatRoom>(`${resource}/user/${userId}/room`);
  return response.data;
});

export const getChatMessagesAction = (roomId: string, chunk: number) => attempt(async () => {
  const response = await client.get<[]>(
    `${resource}/room/${roomId}/messages`,
    {
      params: {chunk}
    }
  );
  return response.data.map(parseChatMessage);
});

export const getLastMessageAction = (roomId: string) => attempt(async () => {
  const response = await client.get<ChatMessage>(`${resource}/room/${roomId}/last-message`);
  return parseChatMessage(response.data);
});

export const chunkCountAction = (roomId: string) => attempt(async () => {
  const response = await client.get<number>(`${resource}/room/${roomId}/chunk-count`);
  return response.data;
});
