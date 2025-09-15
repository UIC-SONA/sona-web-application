import {ChatMessage, ChatMessageSent, ChatRoom, ReadBy, ReadMessages} from "@/app/(app)/chat/definitions";
import {client} from "@/lib/http/axios-client";
import {attempt} from "@/lib/result";
import {parseAbsoluteToLocal} from "@internationalized/date";
import {parseErrorOrValidationErrors} from "@/lib/errors";

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

export const sendMessageAction = attempt(async ({roomId, requestId, message}: { roomId: string, requestId: string, message: string }) => {
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
}, parseErrorOrValidationErrors);

export const sendImageAction = attempt(async ({roomId, requestId, image}: { roomId: string, requestId: string, image: Blob }) => {
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
}, parseErrorOrValidationErrors);

export const sendVoiceAction = attempt(async ({roomId, requestId, voice}: { roomId: string, requestId: string, voice: Blob }) => {
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
}, parseErrorOrValidationErrors);

export const readMessagesAction = attempt(async ({roomId, messageIds}: { roomId: string, messageIds: string[] }) => {
  await client.put(`${resource}/room/${roomId}/read`, messageIds);
});

export const getChatRoomsAction = attempt(async () => {
  const response = await client.get<ChatRoom[]>(`${resource}/rooms`);
  return response.data;
});

export const getChatRoomAction = attempt(async (id: string) => {
  const response = await client.get<ChatRoom>(`${resource}/room/${id}`);
  return response.data;
});

export const getRoomWithUserAction = attempt(async (userId: number) => {
  const response = await client.get<ChatRoom>(`${resource}/user/${userId}/room`);
  return response.data;
});

export const getChatMessagesAction = attempt(async (roomId: string, chunk: number) => {
  const response = await client.get<[]>(
    `${resource}/room/${roomId}/messages`,
    {
      params: {chunk}
    }
  );
  return response.data.map(parseChatMessage);
});

export const getLastMessageAction = attempt(async (roomId: string) => {
  const response = await client.get<ChatMessage>(`${resource}/room/${roomId}/last-message`);
  return parseChatMessage(response.data);
});

export const chunkCountAction = attempt(async (roomId: string) => {
  const response = await client.get<number>(`${resource}/room/${roomId}/chunk-count`);
  return response.data;
})