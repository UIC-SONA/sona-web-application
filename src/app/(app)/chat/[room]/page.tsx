"use client";

import {resolveChatInfo, SendMessage, useChatRoom} from "@/app/(app)/chat/_providers/chat-provider";
import {ImageIcon, LoaderCircle, SendHorizontal} from "lucide-react";
import {ExpandableChatHeader} from "@/app/(app)/chat/_componentes/expandable-chat";
import ChatTopBar from "@/app/(app)/chat/_componentes/chat-top-bar";
import ChatMessageListGenerator from "@/app/(app)/chat/_componentes/chat-message-list-generator";
import {useRef, useState} from "react";
import {ChatMessageType} from "@/app/(app)/chat/definitions";
import {ChatInput} from "@/app/(app)/chat/_componentes/chat-input";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useUser} from "@/app/(app)/chat/_providers/user-provider";

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
        <div className="flex-1 overflow-y-auto">
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


const ChatBottomBar = ({sendMessage}: Readonly<{ sendMessage: SendMessage }>) => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await sendMessage(file, ChatMessageType.IMAGE);
    }
  };
  
  return (
    <div className="bg-sidebar p-4 flex items-center space-x-2">
      <ChatInput
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe un mensaje..."
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon className="h-4 w-4"/>
      </Button>
      <Button
        onClick={async () => {
          const trimmedMessage = message.trim();
          if (trimmedMessage) {
            setMessage("");
            await sendMessage(trimmedMessage, ChatMessageType.TEXT);
          }
        }}
      >
        Enviar
        <SendHorizontal className="ml-2 h-4 w-4"/>
      </Button>
    </div>
  );
};

