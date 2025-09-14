import {ZonedDateTime} from "@internationalized/date";

export interface ChatUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  email: string;
  hasProfilePicture: boolean;
}

export enum ChatMessageType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  VOICE = 'VOICE',
  CUSTOM = 'CUSTOM'
}

export interface ChatMessage {
  id: string;
  message: string;
  createdAt: ZonedDateTime
  sentBy: ChatUser;
  type: ChatMessageType;
  readBy: ReadBy[];
}

export interface ReadBy {
  participant: ChatUser;
  readAt: ZonedDateTime;
}

export interface ChatMessageSent {
  message: ChatMessage;
  roomId: string;
  requestId: string; // Identificador de la solicitud para el cliente, se envia para confirmar la recepción del mensaje
}

export interface ReadMessages {
  roomId: string;
  readBy: ReadBy;
  messageIds: string[];
}

export enum ChatRoomType {
  PRIVATE = 'PRIVATE', // chat entre dos usuarios, como los chats de whatsapp
  GROUP = 'GROUP' // chat grupal, como los grupos de whatsapp
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  participants: ChatUser[];
}