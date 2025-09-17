import {ChatReadMessages} from "@/app/(app)/chat/definitions";
import {useStomp} from "@/app/(app)/chat/_providers/stomp-providers";
import {useEffect} from "react";
import {parseReadMessages} from "@/app/(app)/chat/actions";

type OnReadChatMessage = (readMessage: ChatReadMessages) => void;

export function useReadChatMessage(participantId: number | undefined, onReadMessage: OnReadChatMessage) {
  const {subscribe, unsubscribe, connected} = useStomp();
  
  useEffect(() => {
    if (!connected || !participantId) return;
    
    const readMessagesTopic = `/topic/chat.inbox.${participantId}.read`;
    const subscription = subscribe(readMessagesTopic, (message) => {
      try {
        const parsedReadMessage = parseReadMessages(JSON.parse(message.body));
        onReadMessage(parsedReadMessage);
      } catch (error) {
        console.error('Error parsing read message:', error);
      }
    });
    
    return () => {
      if (subscription) {
        unsubscribe(subscription);
      }
    };
  }, [connected, participantId, onReadMessage, subscribe, unsubscribe]);
  
  return {connected};
}