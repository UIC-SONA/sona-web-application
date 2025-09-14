import {useStomp} from "@/app/(app)/chat/_providers/stomp-providers";
import {useEffect} from "react";
import {parseChatMessageSent} from "@/app/(app)/chat/actions";
import {ChatMessageSent} from "@/app/(app)/chat/definitions";

type OnReceiveMessage = (message: ChatMessageSent) => void;

export function useReceiveMessage(participantId: number | undefined, onReceiveMessage: OnReceiveMessage) {
  const {subscribe, unsubscribe, connected} = useStomp();
  
  useEffect(() => {
    if (!connected || !participantId) return;
    
    const messageInboxTopic = `/topic/chat.inbox.${participantId}`;
    const subscription = subscribe(messageInboxTopic, (message) => {
      try {
        const parsedMessage = parseChatMessageSent(JSON.parse(message.body));
        onReceiveMessage(parsedMessage);
      } catch (error) {
        console.error('Error parsing incoming message:', error);
      }
    });
    
    return () => {
      if (subscription) unsubscribe(subscription);
    };
  }, [connected, participantId, onReceiveMessage, subscribe, unsubscribe]);
  
  return {connected};
}
