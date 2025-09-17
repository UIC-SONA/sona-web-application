"use client";

import {resolveChatInfo, useChatRoom} from "@/app/(app)/chat/_providers/chat-provider";
import {LoaderCircle} from "lucide-react";
import {ExpandableChatHeader} from "@/app/(app)/chat/_components/expandable-chat";
import ChatTopBar from "@/app/(app)/chat/_components/chat-top-bar";
import ChatMessageListGenerator from "@/app/(app)/chat/_components/chat-message-list-generator";
import {useParams} from "next/navigation";
import {useUser} from "@/app/(app)/chat/_providers/user-provider";
import {ChatBottomBar} from "@/app/(app)/chat/_components/chat-bottom-bar";

export default function Page() {
  
  const {user} = useUser();
  const {room: roomId} = useParams<{ room: string }>();
  const {loading, room, messages, sendMessage} = useChatRoom(roomId);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <LoaderCircle className="w-8 h-8 animate-spin"/>
      <p>Cargando...</p>
    </div>
  }
  
  if (!room) {
    return <div className="flex items-center justify-center h-screen">
      <p>Conversación no encontrada</p>
    </div>
  }
  
  return (
    <div className="flex flex-col h-screen">
      
      <div className="sticky top-0 z-10 bg-sidebar">
        <ExpandableChatHeader>
          <ChatTopBar {...resolveChatInfo(room, user)}/>
        </ExpandableChatHeader>
      </div>
      
      {loading ? <div className="flex items-center justify-center h-32 flex-col">
        <LoaderCircle className="w-8 h-8 animate-spin"/>
        <p>Cargando...</p>
      </div> : <>
        <div className="flex-1 overflow-y-auto overscroll-behavior-contain overflow-anchor-auto">
          <ChatMessageListGenerator
            participans={room.participants}
            messages={messages}
            isMe={(senderId) => senderId === user?.id}
          />
        </div>
        
        <div className="sticky bottom-0 z-10">
          <ChatBottomBar sendMessage={sendMessage}/>
        </div>
      </>}
    </div>
  );
}

