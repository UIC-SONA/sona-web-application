import {MessageSquare} from "lucide-react";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-full flex-col">
      <p className="text-2xl font-bold">
        Selecciona una conversación
      </p>
      <MessageSquare className="w-16 h-16 ml-4 mt-4"/>
    </div>
  );
}