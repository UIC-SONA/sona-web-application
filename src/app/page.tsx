"use client"
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle/>
      </div>
      <div className="bg-card shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2 text-foreground">SONA</h1>
        <p className="mb-6 text-muted-foreground">
          Sistema de administración interna y gestión de recursos generados por la aplicación móvil oficial.
        </p>
        <div className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={() => router.push('/sign-in')}
          >
            Acceder al panel
          </Button>
          <a
            href="https://play.google.com/store/apps/details?id=ec.gob.conagopare.app.sona"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              Descargar app móvil
            </Button>
          </a>
        </div>
      </div>
      <footer className="mt-8 text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} SONA - Sistema de Administración Interna
      </footer>
    </div>
  );
}