"use client";

import {Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, useSidebar,} from "@/components/ui/sidebar";
import {ArrowBigLeft, ArrowBigRight, LoaderCircle, Menu, MessageCircleMore, MessageSquare} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {PropsWithChildren, useEffect} from "react";
import {cn} from "@/lib/utils";
import {useIsMobile} from "@/hooks/use-mobile";
import {Skeleton} from "@/components/ui/skeleton";
import {ChatMessageType} from "@/app/(app)/chat/definitions";
import Link from "next/link";
import {ChatProvider, ChatRoom, resolveChatInfo, useChat} from "@/app/(app)/chat/_providers/chat-provider";
import {User} from "@/app/(app)/dashboard/users/definitions";
import {StompProvider} from "@/app/(app)/chat/_providers/stomp-providers";
import {STOMP_SERVER_URL} from "@/constants";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import {useQuery} from "@tanstack/react-query";
import {unwrap} from "@/lib/result";
import {profileAction} from "@/app/(app)/dashboard/users/actions";
import {ErrorDescription} from "@/lib/errors";
import {useParams} from "next/navigation";
import {UserProvider} from "@/app/(app)/chat/_providers/user-provider";


export default function Layout({children}: Readonly<PropsWithChildren>) {
  
  const query = useQuery<User, ErrorDescription>({
    queryKey: ['user', 'profile'],
    queryFn: async () => unwrap(await profileAction())
  })
  
  useEffect(() => {
    document.body.style.pointerEvents = "";
  }, []);
  
  if (query.isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <LoaderCircle className="w-8 h-8 animate-spin"/>
      <p>Cargando...</p>
    </div>
  }
  
  if (query.isSuccess) {
    const user = query.data;
    return <StompProvider url={STOMP_SERVER_URL}>
      <ChatProvider chatUser={user}>
        <SidebarProvider>
          <ChatSidebar user={user}/>
          <SidebarInset className="overflow-hidden">
            <ChatSidebarTrigger/>
            <div className="absolute top-4 right-4 z-40">
              <ThemeToggle/>
            </div>
            <UserProvider value={{user}}>
              {children}
            </UserProvider>
          </SidebarInset>
        </SidebarProvider>
      </ChatProvider>
    </StompProvider>
  }
}

function ChatSidebarTrigger() {
  const {toggleSidebar, open} = useSidebar();
  const isMobile = useIsMobile();
  
  return <div className="absolute top-[50%] left-0 transform -translate-y-1/2 z-40">
    {isMobile
      ? <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
      >
        <Menu/>
      </Button>
      
      : <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="rounded-r-full border-l-0"
      >
        {open ? <ArrowBigLeft/> : <ArrowBigRight/>}
      </Button>
    }
  </div>
}


function ChatSidebar({user}: Readonly<{ user: User }>) {
  return <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <div className="flex items-center">
          <SidebarMenuItem className="mr-2">
            <SidebarMenuButton
              size="default"
            >
              <MessageSquare/>
              <p className="text-lg font-bold">
                Mensajes
              </p>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarMenu>
    </SidebarHeader>
    <ChatSidebarContent user={user}/>
    <SidebarFooter>
      <Link href="/dashboard">
        <SidebarMenuButton size="default">
          <ArrowBigLeft/>
          <span className="ml-2">Volver</span>
        </SidebarMenuButton>
      </Link>
    </SidebarFooter>
    <SidebarRail/>
  </Sidebar>
}

function ChatSidebarContent({user}: Readonly<{ user: User }>) {
  
  const {toggleSidebar} = useSidebar();
  const {rooms, loading} = useChat();
  const {room: roomId} = useParams<{ room?: string }>();
  
  const isMobile = useIsMobile();
  
  return <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>
        Conversaciones
      </SidebarGroupLabel>
      <SidebarMenu>
        {loading && <div>
          {[...Array(10).keys()].map((i) => <ChatRoomSckeleton key={i}/>)}
        </div>}
        {rooms.map((room) => {
          
          const {lastMessage} = room;
          
          const hasRead = lastMessage.sentBy.id === user.id
            || lastMessage
            .readBy
            .map(readBy => readBy.participant.id).includes(user.id);
          
          return (
            <SidebarMenuItem
              key={room.id}
            >
              <Link href={`/chat/${room.id}`} onClick={() => {
                if (isMobile) {
                  toggleSidebar();
                }
              }}>
                <SidebarMenuButton
                  size="lg"
                  className={cn("data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                    roomId === room.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                  )}
                >
                  <ChatPreviewMenu room={room} user={user}/>
                  {hasRead ? <></> : <MessageCircleMore className="w-4 h-4"/>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>;
}

interface ChatPreviewMenuProps {
  user: User
  room: ChatRoom
}

function ChatPreviewMenu({room, user}: Readonly<ChatPreviewMenuProps>) {
  
  const {avatar, roomName, fallback} = resolveChatInfo(room, user);
  
  const lastMessage = room.lastMessage;
  const lastMessagePreview = {
    [ChatMessageType.IMAGE]: "Imagen",
    [ChatMessageType.VOICE]: "Audio",
    [ChatMessageType.TEXT]: lastMessage.message,
    [ChatMessageType.CUSTOM]: "..."
  }[lastMessage.type];
  
  return <>
    <Avatar className="h-8 w-8 data-[state=close]:h-3 data-[state=close]:w-3">
      <AvatarImage src={avatar} alt="Avatar"/>
      <AvatarFallback className="rounded-lg font-bold">
        {fallback.toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-semibold">{roomName}</span>
      <span className="truncate text-xs">{lastMessagePreview}</span>
    </div>
  </>
}

function ChatRoomSckeleton() {
  return <SidebarMenuItem>
    <SidebarMenuButton
      size="lg"
      className={cn("data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground")}
    >
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full"/>
        <div className="space-y-2">
          <Skeleton className="h-2 w-[150px]"/>
          <Skeleton className="h-2 w-[150px]"/>
        </div>
      </div>
    </SidebarMenuButton>
  </SidebarMenuItem>
}

