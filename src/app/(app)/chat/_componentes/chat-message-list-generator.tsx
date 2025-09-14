"use client";

import {Check, CheckCheck, CircleX, Clock} from "lucide-react";
import {MAIN_SERVER_URL} from "@/constants";
import {useState} from "react";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {ChatMessage, StatusMessage} from "@/app/(app)/chat/_providers/chat-provider";
import {ChatMessageList} from "@/app/(app)/chat/_componentes/chat-message-list";
import {ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp} from "@/app/(app)/chat/_componentes/chat-bubble";
import {profilePicturePath} from "@/app/(app)/dashboard/users/actions";
import {ChatMessageType, ChatUser} from "@/app/(app)/chat/definitions";
import {DateFormatter, getLocalTimeZone, isSameDay, today, ZonedDateTime} from "@internationalized/date";
import Image from "next/image";

interface ChatListProps {
  messages: ChatMessage[];
  participans: ChatUser[];
  isMe: (senderId: number) => boolean;
}

export default function ChatMessageListGenerator({messages, participans, isMe}: Readonly<ChatListProps>) {
  return <div className="w-full overflow-y-hidden h-full flex flex-col">
    <ChatMessageList>
      {messages.map((message, index) => {
        
        const variant = isMe(message.sentBy.id) ? "sent" : "received";
        const otherParticipants = participans.filter(participant => !isMe(participant.id));
        const hasRead = message.readBy.length === otherParticipants.length;
        
        return <ChatBubble
          key={"Chat-" + index}
          variant={variant}
        >
          {message.sentBy.hasProfilePicture && <ChatBubbleAvatar
            className="font-bold"
            src={profilePicturePath(message.sentBy.id)}
            fallback={message.sentBy.firstName[0].toUpperCase() || "D"}
          />}
          
          <ChatBubbleMessage
            variant={variant}
            className="p-2 text-sm"
          >
            
            <BuildChatMessage message={message}/>
            
            <div className="flex items-center justify-between space-x-2 mt-2">
              <ChatBubbleTimestamp
                timestamp={getFormattedTime(message.createdAt)}
              />
              
              <ChatBubbleStatus
                hasRead={hasRead}
                status={message.status}
              />
            </div>
          
          </ChatBubbleMessage>
        </ChatBubble>
      })}
    </ChatMessageList>
  </div>;
}

interface BuildChatMessageProps {
  message: ChatMessage,
}

function BuildChatMessage({message}: Readonly<BuildChatMessageProps>) {
  if (message.type === ChatMessageType.TEXT) {
    return message.message;
  }
  
  if (message.type === ChatMessageType.IMAGE) {
    
    const uri = new URL(`/chat/resource`, MAIN_SERVER_URL);
    uri.searchParams.append("id", message.message);
    
    return <ImageWithDialog src={uri.toString()}/>;
  }
}

interface ImageWithDialogProps {
  src: string;
}

function ImageWithDialog({src}: Readonly<ImageWithDialogProps>) {
  
  const [open, setOpen] = useState(false);
  
  const toggleDialog = () => setOpen(!open);
  
  return (
    <Dialog open={open} onOpenChange={toggleDialog}>
      <DialogTrigger asChild>
        <div className="relative w-64 h-64 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            className="object-contain rounded-lg w-full h-full"
            alt="Preview"
            width={256}
          />
        </div>
      </DialogTrigger>
      
      <DialogContent className="w-[90vw] h-[90vh] p-5 overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            className="object-contain w-full h-full"
            alt="Full View"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


function ChatBubbleStatus({status, hasRead}: Readonly<{ status: StatusMessage, hasRead: boolean }>) {
  if (hasRead) {
    return <CheckCheck size={16}/>
  }
  if (status === StatusMessage.SENDING) {
    return <Clock size={16}/>
  }
  if (status === StatusMessage.DELIVERED) {
    return <Check size={16}/>
  }
  if (status === StatusMessage.UNDELIVERED) {
    return <CircleX size={16}/>
  }
  return <></>
}

function getFormattedTime(date: ZonedDateTime) {
  const now = new Date();
  
  const todayDate = today(getLocalTimeZone())
  
  if (isSameDay(date, todayDate)) {
    let minutesAgo = Math.floor((now.getTime() - date.toDate().getTime()) / 1000 / 60);
    minutesAgo = minutesAgo < 0 ? 0 : minutesAgo;
    
    if (minutesAgo == 0) {
      return "Recientemente";
    }
    
    if (minutesAgo < 60) {
      return `hace ${minutesAgo} ${minutesAgo === 1 ? 'minuto' : 'minutos'}`;
    }
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `hace ${hoursAgo} ${hoursAgo === 1 ? 'hora' : 'horas'}`;
  }
  
  if (isSameDay(date, todayDate.subtract({days: 1}))) {
    return 'ayer ' + timeFormatter.format(date.toDate());
  }
  
  return formatter.format(date.toDate());
}

const formatter = new DateFormatter(navigator.language, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h12",
  calendar: "gregory",
});

const timeFormatter = new DateFormatter(navigator.language, {
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h12",
  calendar: "gregory",
});