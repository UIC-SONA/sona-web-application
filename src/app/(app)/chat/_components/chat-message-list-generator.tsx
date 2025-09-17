"use client";

import {Check, CheckCheck, CircleX, Clock} from "lucide-react";
import {ChatMessage, StatusMessage} from "@/app/(app)/chat/_providers/chat-provider";
import {ChatMessageList} from "@/app/(app)/chat/_components/chat-message-list";
import {ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp} from "@/app/(app)/chat/_components/chat-bubble";
import {profilePicturePath} from "@/app/(app)/dashboard/users/actions";
import {ChatMessageType, ChatUser} from "@/app/(app)/chat/definitions";
import {DateFormatter, getLocalTimeZone, isSameDay, today, ZonedDateTime} from "@internationalized/date";
import {ChatMessageAudioPlayer} from "@/app/(app)/chat/_components/chat-message-audio-player";
import {LazyContainer} from "@/components/lazy/lazy-container";
import {ChatMessageImageViewer} from "@/app/(app)/chat/_components/chat-message-image-viewer";

interface ChatListProps {
  messages: ChatMessage[];
  participans: ChatUser[];
  isMe: (senderId: number) => boolean;
}

export default function ChatMessageListGenerator({messages, participans, isMe}: Readonly<ChatListProps>) {
  return <div className="w-full overflow-y-hidden h-full flex flex-col">
    <ChatMessageList>
      {messages.map(message => {
        
        const variant = isMe(message.sentBy.id) ? "sent" : "received";
        const otherParticipants = participans.filter(participant => !isMe(participant.id));
        const hasRead = message.readBy.length === otherParticipants.length;
        
        return <ChatBubble
          key={message.id}
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
              <ChatBubbleTimestamp timestamp={getFormattedTime(message.createdAt)}/>
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
    if (message.status === StatusMessage.SENDING) {
      return <span className="italic text-sm ">Enviando imagen...</span>;
    }
    return <LazyContainer placeholder={<div className="w-64 h-64 bg-muted animate-pulse rounded-lg"/>}>
      <ChatMessageImageViewer src={message.message}/>
    </LazyContainer>
  }
  
  if (message.type === ChatMessageType.VOICE) {
    if (message.status === StatusMessage.SENDING) {
      return <span className="italic text-sm ">Enviando mensaje de voz...</span>;
    }
    return <LazyContainer placeholder={<div className="h-10 bg-muted animate-pulse rounded-lg"/>}>
      <ChatMessageAudioPlayer src={message.message}/>
    </LazyContainer>
  }
  
  if (message.type === ChatMessageType.VIDEO) {
    if (message.status === StatusMessage.SENDING) {
      return <span className="italic text-sm ">Enviando video...</span>;
    }
    return <LazyContainer placeholder={<div className="w-64 h-36 bg-muted animate-pulse rounded-lg"/>}>
      <video
        src={message.message}
        className="rounded-lg max-h-60"
        controls
      >
        Your browser does not support the video tag.
        <track kind="captions"/>
      </video>
    </LazyContainer>
  }
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