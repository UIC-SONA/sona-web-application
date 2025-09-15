import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {User} from "@/app/(app)/dashboard/users/definitions";
import {ChatMessage as ChM, ChatMessageSent, ChatMessageType, ChatRoom as ChR, ChatRoomType, ChatUser} from "@/app/(app)/chat/definitions";
import {chunkCountAction, getChatMessagesAction, getChatRoomsAction, getLastMessageAction, readMessagesAction, sendImageAction, sendMessageAction, sendVoiceAction} from "@/app/(app)/chat/actions";
import {profilePicturePath} from "@/app/(app)/dashboard/users/actions";
import {useReadMessage} from "@/app/(app)/chat/_hooks/use-read-message";
import {useReceiveMessage} from "@/app/(app)/chat/_hooks/use-receive-message";
import {InfiniteData, useInfiniteQuery, useQuery, useQueryClient} from "@tanstack/react-query";
import {ErrorDescription} from "@/lib/errors";
import {alert} from "@/providers/alert-dialogs";
import {getLocalTimeZone, now} from "@internationalized/date";
import {functionalUpdate, Updater} from "@tanstack/react-table";

export enum StatusMessage {
  DELIVERED = 'DELIVERED',
  SENDING = 'SENDING',
  UNDELIVERED = 'UNDELIVERED',
}

export interface ChatMessage extends ChM {
  status: StatusMessage;
}

export interface ChatRoom extends ChR {
  lastMessage: ChatMessage;
  chunkSize: number;
}

type SendRoomMessage = (roomId: string, message: string | Blob, type: ChatMessageType) => Promise<void>;

interface ChatContextType {
  loading: boolean;
  rooms: ChatRoom[];
  sendMessage: SendRoomMessage;
  chatUser: ChatUser;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

const orderRoomsWithLastMessages = (a: ChatRoom, b: ChatRoom) => a.lastMessage.createdAt.compare(b.lastMessage.createdAt);

export function ChatProvider({children, chatUser}: Readonly<PropsWithChildren<{ chatUser: ChatUser }>>) {
  
  const [requestIds, setRequestIds] = useState<string[]>([]);
  
  const queryClient = useQueryClient();
  
  const queryRoom = useQuery<ChatRoom[], ErrorDescription>({
    queryKey: ['chat-rooms', chatUser.id],
    queryFn: async () => {
      const chatRooms = await getChatRoomsAction().unwrap();
      const promises = chatRooms.map<Promise<ChatRoom>>(async room => {
        const lastMessage = await getLastMessageAction(room.id).unwrap();
        const chunkSize = await chunkCountAction(room.id).unwrap();
        return {
          ...room,
          lastMessage: {...lastMessage, status: StatusMessage.DELIVERED},
          chunkSize
        };
      });
      const resolvedRooms = await Promise.all(promises);
      return resolvedRooms.sort(orderRoomsWithLastMessages);
    }
  });
  
  const updateRooms = useCallback((updater: Updater<ChatRoom[] | undefined>) => {
    queryClient.setQueryData<ChatRoom[]>(['chat-rooms', chatUser.id], updater);
  }, [queryClient, chatUser.id]);
  
  const updateLastMessages = useCallback((roomId: string, updater: Updater<ChatMessage[] | undefined>) => {
    queryClient.setQueryData<InfiniteData<ChatMessage[], number>>(['chat-messages', roomId], oldData => {
      if (!oldData) return undefined;
      const lastPage = oldData.pages[oldData.pages.length - 1];
      const newLastPage = functionalUpdate(updater, lastPage);
      if (newLastPage === lastPage) return oldData;
      if (!newLastPage) {
        return {
          pages: oldData.pages.slice(0, -1),
          pageParams: oldData.pageParams.slice(0, -1)
        }
      }
      
      return {
        pages: [...oldData.pages.slice(0, -1), newLastPage],
        pageParams: oldData.pageParams
      };
    });
    
  }, [queryClient]);
  
  const setLastMessage = useCallback((roomId: string, message: ChatMessage) => {
    updateRooms(oldData => {
      if (!oldData) return oldData;
      return oldData.map(room => room.id !== roomId ? room : {...room, lastMessage: message}).sort(orderRoomsWithLastMessages);
    });
  }, [updateRooms]);
  
  useReceiveMessage(chatUser.id, async ({roomId, message, requestId}) => {
    if (!queryRoom.isSuccess) return;
    
    const received: ChatMessage = {
      ...message,
      status: StatusMessage.DELIVERED
    };
    
    if (requestIds.includes(requestId)) {
      setRequestIds(prev => prev.filter(id => id !== requestId));
    } else {
      updateLastMessages(roomId, oldMessages => ([...(oldMessages || []), received]));
    }
    setLastMessage(roomId, received);
  });
  
  useReadMessage(chatUser.id, ({roomId, readBy, messageIds}) => {
    
    updateLastMessages(roomId, oldMessages => {
      if (!oldMessages) return oldMessages;
      return oldMessages.map(message => {
        if (!messageIds.includes(message.id)) return message;
        return {
          ...message,
          readBy: [...message.readBy, readBy,]
        };
      })
    });
    
    updateRooms(cachedRooms => {
      if (!cachedRooms) return cachedRooms;
      return cachedRooms.map(room => {
        if (room.id !== roomId) return room;
        if (!messageIds.includes(room.lastMessage.id)) return room;
        return {
          ...room,
          lastMessage: {
            ...room.lastMessage,
            readBy: [...room.lastMessage.readBy, readBy,]
          }
        };
      });
    });
  });
  
  const sendMessage = useCallback(async (roomId: string, message: string | Blob, type: ChatMessageType) => {
    if (type === ChatMessageType.CUSTOM) {
      console.error('Custom message type not supported');
      return;
    }
    
    const requestId = crypto.randomUUID().toString();
    setRequestIds(prev => [...prev, requestId]);
    
    const messageToSent: ChatMessage = {
      id: "",
      message: typeof message === 'string' ? message : "Enviando...",
      createdAt: now(getLocalTimeZone()),
      type,
      sentBy: chatUser,
      readBy: [],
      status: StatusMessage.SENDING
    };
    
    setLastMessage(roomId, messageToSent);
    updateLastMessages(roomId, oldMessages => [...(oldMessages || []), messageToSent]);
    
    try {
      
      let chatMessage: ChatMessageSent;
      
      if (type === ChatMessageType.TEXT && typeof message === 'string') {
        chatMessage = await sendMessageAction({roomId, requestId, message}).unwrap();
      } else if (type === ChatMessageType.VOICE && message instanceof Blob) {
        chatMessage = await sendVoiceAction({roomId, requestId, voice: message}).unwrap();
      } else if (type === ChatMessageType.IMAGE && message instanceof Blob) {
        chatMessage = await sendImageAction({roomId, requestId, image: message}).unwrap();
      } else {
        console.error('Invalid message type or message');
        return;
      }
      
      const sentMessage: ChatMessage = {
        ...chatMessage.message,
        sentBy: chatUser,
        readBy: [],
        status: StatusMessage.DELIVERED
      };
      
      updateLastMessages(roomId, oldMessages => (oldMessages || []).map(msg => msg === messageToSent
        ? sentMessage
        : msg
      ));
      
    } catch (error) {
      console.error('Error sending message:', error);
      updateLastMessages(roomId, oldMessages => (oldMessages || []).map(msg => msg === messageToSent
        ? {...msg, status: StatusMessage.UNDELIVERED}
        : msg
      ));
      
      await alert.error({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Intente nuevamente más tarde.'
      });
    }
  }, [setLastMessage, updateLastMessages, chatUser])
  
  const value = useMemo<ChatContextType>(() => ({
    rooms: queryRoom.data || [],
    loading: queryRoom.isLoading,
    sendMessage,
    chatUser: chatUser
  }), [queryRoom.data, queryRoom.isLoading, sendMessage, chatUser]);
  
  
  return <ChatContext.Provider value={value}>
    {children}
  </ChatContext.Provider>;
}


export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export type SendMessage = (message: string | Blob, type: ChatMessageType) => Promise<void>;

interface UseChatRoomReturn {
  room?: ChatRoom;
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: SendMessage;
  loadMore: () => void;
}

export function useChatRoom(roomId: string): UseChatRoomReturn {
  
  const {rooms, sendMessage, loading, chatUser} = useChat();
  
  const room = useMemo(() => {
    return rooms.find(r => r.id === roomId);
  }, [rooms, roomId]);
  
  const chunks = useMemo(() => room?.chunkSize || 1, [room]);
  
  const query = useInfiniteQuery({
    initialPageParam: chunks, // arrancamos desde el más reciente
    queryKey: ['chat-messages', roomId],
    queryFn: async ({pageParam}) => {
      const messages = await getChatMessagesAction(room!.id, pageParam).unwrap();
      return messages.map<ChatMessage>(message => ({
        ...message,
        status: StatusMessage.DELIVERED
      }));
    },
    enabled: !!room && !loading,
    
    // cargar más antiguos
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length === 0 || lastPageParam <= 1) return undefined;
      return lastPageParam + 1;
    },
    
    // cargar más recientes (si empezaste desde el medio, o refrescas)
    getPreviousPageParam: (firstPage, _, firstPageParam) => {
      if (firstPage.length === 0 || firstPageParam >= chunks) return undefined;
      return firstPageParam - 1;
    }
  });
  
  const sendChatMessage = useCallback(async (message: string | Blob, type: ChatMessageType) => {
    await sendMessage(roomId, message, type);
  }, [roomId, sendMessage])
  
  
  useEffect(() => {
    if (query.isSuccess) {
      const lastMessages = query.data.pages[query.data.pages.length - 1];
      if (!lastMessages || lastMessages.length === 0) return;
      
      const unreadMessages: string[] = [];
      for (let i = lastMessages.length - 1; i >= 0; i--) {
        const message = lastMessages[i];
        if (message.sentBy.id === chatUser.id) {
          continue;
        }
        if (message.readBy.some(readBy => readBy.participant.id === chatUser.id)) {
          break;
        }
        unreadMessages.push(message.id);
      }
      
      if (unreadMessages.length > 0) {
        console.log("Read messages: ", unreadMessages);
        readMessagesAction({roomId, messageIds: unreadMessages}).then();
      }
    }
  }, [chatUser.id, query.data?.pages, query.isSuccess, roomId]);
  
  const loadMore = useCallback(() => {
    if (query.hasNextPage) {
      query.fetchNextPage().then();
    }
  }, [query]);
  
  return {
    loading: query.isLoading && !query.isSuccess,
    messages: query.data ? query.data.pages.flat() : [],
    room,
    sendMessage: sendChatMessage,
    loadMore
  };
}

export function resolveChatInfo(room: ChatRoom, user: User): { roomName: string, avatar?: string, fallback: string } {
  
  if (room.type === ChatRoomType.PRIVATE) {
    const participant = room.participants.find(participant => participant.id !== user.id);
    
    if (!participant) {
      return {
        roomName: "Desconocido",
        fallback: "D"
      }
    }
    
    return {
      roomName: participant.firstName + " " + participant.lastName,
      avatar: participant.hasProfilePicture ? profilePicturePath(participant.id) : undefined,
      fallback: participant.firstName[0] || "D"
    }
  }
  
  return {
    roomName: room.name,
    fallback: room.name[0]
  }
}
