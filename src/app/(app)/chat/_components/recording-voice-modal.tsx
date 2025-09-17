import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {MicIcon, XIcon} from "lucide-react";
import {Button} from "@/components/ui/button";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface RecordingVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordingTime: number;
  onStop: () => void;
  onCancel: () => void;
}

export const RecordingVoiceModal = ({
  isOpen,
  onClose,
  recordingTime,
  onStop,
  onCancel
}:Readonly<RecordingVoiceModalProps>) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <MicIcon className="h-5 w-5 text-primary"/>
            Grabando audio
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Animación de grabación */}
          <div className="relative">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <MicIcon className="h-10 w-10 text-primary-foreground"/>
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
              <XIcon className="h-4 w-4"/>
              Cancelar
            </Button>
            <Button
              onClick={onStop}
              className="flex items-center gap-2"
            >
              <MicIcon className="h-4 w-4"/>
              Detener
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
