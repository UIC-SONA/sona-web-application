import {useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";

export interface ImageWithDialogProps {
  src: string;
}

export function ChatMessageImageViewer({src}: Readonly<ImageWithDialogProps>) {
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
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
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

