"use client";

import {resolveChatInfo, SendMessage, useChatRoom} from "@/app/(app)/chat/_providers/chat-provider";
import {ImageIcon, LoaderCircle, Mic, SendHorizontal, X, MicIcon} from "lucide-react";
import {ExpandableChatHeader} from "@/app/(app)/chat/_components/expandable-chat";
import ChatTopBar from "@/app/(app)/chat/_components/chat-top-bar";
import ChatMessageListGenerator from "@/app/(app)/chat/_components/chat-message-list-generator";
import {useRef, useState, useEffect} from "react";
import {ChatMessageType} from "@/app/(app)/chat/definitions";
import {ChatInput} from "@/app/(app)/chat/_components/chat-input";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useUser} from "@/app/(app)/chat/_providers/user-provider";
import {alert} from "@/providers/alert-dialogs";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

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

// Modal de grabación
const RecordingModal = ({
  isOpen,
  onClose,
  recordingTime,
  onStop,
  onCancel
}: {
  isOpen: boolean;
  onClose: () => void;
  recordingTime: number;
  onStop: () => void;
  onCancel: () => void;
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <MicIcon className="h-5 w-5 text-primary" />
            Grabando audio
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Animación de grabación */}
          <div className="relative">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Mic className="h-10 w-10 text-primary-foreground" />
            </div>
            {/* Ondas de sonido animadas */}
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          {/* Contador de tiempo */}
          <div className="text-2xl font-mono font-bold text-foreground">
            {formatTime(recordingTime)}
          </div>
          
          {/* Botones */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={onStop}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Detener
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ChatBottomBar = ({sendMessage}: Readonly<{ sendMessage: SendMessage }>) => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Efecto para el contador de tiempo
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await sendMessage(file, ChatMessageType.IMAGE);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      streamRef.current = stream;
      
      // Especificamos el formato de audio explícitamente
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
          // Crear un File especificando que es un audio WebM
          const audioFile = new File(
            [audioBlob],
            `audio-${Date.now()}.webm`,
            { type: 'audio/webm;codecs=opus' }
          );
          await sendMessage(audioFile, ChatMessageType.VOICE);
        }
        cleanupRecording();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setShowRecordingModal(true);
    } catch (err) {
      console.error("Error accessing microphone: ", err);
      await alert.error({
        title: "Error al acceder al micrófono",
        description: "No se pudo acceder al micrófono. Por favor, verifica los permisos de tu navegador.",
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowRecordingModal(false);
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // No enviamos el audio al cancelar
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = () => {
        cleanupRecording();
      };
      setIsRecording(false);
      setShowRecordingModal(false);
    }
  };
  
  const cleanupRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };
  
  return (
    <>
      <div className="bg-sidebar p-4 flex items-center space-x-2">
        <ChatInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={isRecording}
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
          disabled={isRecording}
        >
          <ImageIcon className="h-4 w-4"/>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={startRecording}
          disabled={isRecording}
        >
          <Mic className="h-4 w-4"/>
        </Button>
        <Button
          onClick={async () => {
            const trimmedMessage = message.trim();
            if (trimmedMessage) {
              setMessage("");
              await sendMessage(trimmedMessage, ChatMessageType.TEXT);
            }
          }}
          disabled={isRecording}
        >
          Enviar
          <SendHorizontal className="ml-2 h-4 w-4"/>
        </Button>
      </div>
      
      {/* Modal de grabación */}
      <RecordingModal
        isOpen={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        recordingTime={recordingTime}
        onStop={stopRecording}
        onCancel={cancelRecording}
      />
    </>
  );
};