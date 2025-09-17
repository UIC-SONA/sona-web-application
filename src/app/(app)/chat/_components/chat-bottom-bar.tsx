// Modal de grabación
import {ImageIcon, MicIcon, SendHorizontalIcon, VideoIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {SendMessage} from "@/app/(app)/chat/_providers/chat-provider";
import {ChatMessageType} from "@/app/(app)/chat/definitions";
import {alert} from "@/providers/alert-dialogs";
import {ChatInput} from "@/app/(app)/chat/_components/chat-input";
import {useIsMobile} from "@/hooks/use-mobile";
import {RecordingVoiceModal} from "@/app/(app)/chat/_components/recording-voice-modal";


// Hook personalizado para manejo de grabación
const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const cleanupRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setRecordingTime(0);
  }, []);
  
  const startRecording = useCallback(async (onComplete: (audioFile: File) => Promise<void>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      
      // Intentar diferentes formatos según disponibilidad
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (!selectedMimeType) {
        await alert.error({
          title: "Formato de grabación no soportado",
          description: "Tu navegador no soporta los formatos de grabación necesarios.",
        });
        cleanupRecording();
        return;
      }
      
      const mediaRecorder = new MediaRecorder(stream, {mimeType: selectedMimeType});
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      const getFileExtension = (mimeType: string) => {
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('ogg')) return 'ogg';
        return 'dat';
      }
      
      mediaRecorder.onstop = async () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, {type: selectedMimeType});
          const extension = getFileExtension(selectedMimeType);
          const audioFile = new File(
            [audioBlob],
            `audio-${Date.now()}.${extension}`,
            {type: selectedMimeType}
          );
          await onComplete(audioFile);
        }
        cleanupRecording();
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('Error en MediaRecorder:', event);
        cleanupRecording();
      };
      
      mediaRecorder.start(1000); // Recopilar datos cada segundo
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar contador
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone: ", err);
      cleanupRecording();
      throw err;
    }
  }, [cleanupRecording]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);
  
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Remover el handler para evitar procesar el audio
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = () => cleanupRecording();
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, cleanupRecording]);
  
  // Cleanup en unmount
  useEffect(() => {
    return () => cleanupRecording();
  }, [cleanupRecording]);
  
  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording
  };
};

export const ChatBottomBar = ({sendMessage}: Readonly<{ sendMessage: SendMessage }>) => {
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording
  } = useAudioRecording();
  
  // Manejar el envío de mensajes
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isRecording) {
      setMessage("");
      await sendMessage(trimmedMessage, ChatMessageType.TEXT);
    }
  }, [message, isRecording, sendMessage]);
  
  // Manejar teclas en el input
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile) {
      // En pantallas grandes: Enter envía, Shift+Enter hace salto de línea
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Shift+Enter: salto de línea
          return;
        } else {
          // Solo Enter: enviar mensaje
          e.preventDefault();
          await handleSendMessage();
        }
      }
    }
    // En móvil, Enter siempre hace salto de línea (comportamiento por defecto)
  }, [isMobile, handleSendMessage]);
  
  const handleImageChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await sendMessage(file, ChatMessageType.IMAGE);
      // Limpiar el input para poder seleccionar el mismo archivo otra vez
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  }, [sendMessage]);
  
  const handleVideoChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await sendMessage(file, ChatMessageType.VIDEO);
      // Limpiar el input para poder seleccionar el mismo archivo otra vez
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  }, [sendMessage]);
  
  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording(async (audioFile) => {
        await sendMessage(audioFile, ChatMessageType.VOICE);
      });
      setShowRecordingModal(true);
    } catch (err) {
      console.error("Error starting recording: ", err);
      await alert.error({
        title: "Error al acceder al micrófono",
        description: "No se pudo acceder al micrófono. Por favor, verifica los permisos de tu navegador.",
      });
    }
  }, [startRecording, sendMessage]);
  
  const handleStopRecording = useCallback(() => {
    stopRecording();
    setShowRecordingModal(false);
  }, [stopRecording]);
  
  const handleCancelRecording = useCallback(() => {
    cancelRecording();
    setShowRecordingModal(false);
  }, [cancelRecording]);
  
  const isMessageEmpty = !message.trim();
  
  return (
    <>
      <div className="bg-sidebar p-4 flex items-center space-x-2">
        <ChatInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !isMobile
              ? "Escribe un mensaje... (Enter para enviar, Shift+Enter para salto de línea)"
              : "Escribe un mensaje..."
          }
          disabled={isRecording}
          className="flex-1"
        />
        
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        
        <input
          type="file"
          ref={videoInputRef}
          onChange={handleVideoChange}
          accept="video/*"
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => imageInputRef.current?.click()}
          disabled={isRecording}
          title="Subir imagen"
        >
          <ImageIcon className="h-4 w-4"/>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleStartRecording}
          disabled={isRecording}
          title="Grabar audio"
        >
          <MicIcon className="h-4 w-4"/>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => videoInputRef.current?.click()}
          disabled={isRecording}
          title="Subir video"
        >
          <VideoIcon className="h-4 w-4"/>
        </Button>
        
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={isRecording || isMessageEmpty}
          title="Enviar mensaje"
        >
          <SendHorizontalIcon className="h-4 w-4"/>
        </Button>
      </div>
      
      {/* Modal de grabación */}
      <RecordingVoiceModal
        isOpen={showRecordingModal}
        onClose={handleCancelRecording}
        recordingTime={recordingTime}
        onStop={handleStopRecording}
        onCancel={handleCancelRecording}
      />
    </>
  );
};