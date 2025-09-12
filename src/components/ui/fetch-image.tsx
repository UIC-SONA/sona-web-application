"use client";
import {ComponentProps, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {CircleXIcon, ImageIcon, Loader2Icon} from "lucide-react";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";

interface FetchImageProps extends ComponentProps<"img"> {
  fetcher: () => Promise<string>;
  cacheKey: string,
  alt: string;
}

export function FetchImage({fetcher, cacheKey, alt, className, ...rest}: Readonly<FetchImageProps>) {
  
  const query = useQuery({
    queryKey: ['image', cacheKey],
    queryFn: fetcher,
    staleTime: Infinity, // La imagen no se vuelve obsoleta
  });
  
  return (
    <div className="flex justify-center">
      {query.isPending && <Loader2Icon className="animate-spin"/>}
      {query.isError && <CircleXIcon className="text-red-500"/>}
      {query.isSuccess && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={query.data}
          alt={alt}
          className={cn("w-full h-full object-contain", className)}
          {...rest}
        />
      )}
    </div>
  );
}

export function ModalFetchImage({fetcher, cacheKey, alt, className, ...rest}: Readonly<FetchImageProps>) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ['image', cacheKey],
    queryFn: fetcher,
    enabled: open, // Solo se ejecuta cuando el modal está abierto
    staleTime: Infinity, // La imagen no se vuelve obsoleta
  });
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <ImageIcon/>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-h-[80vh] overflow-hidden">
          <DialogTitle>{alt}</DialogTitle>
          <div className="relative flex justify-center items-center w-full max-h-[calc(80vh-8rem)]">
            {query.isPending && <Loader2Icon className="animate-spin"/>}
            {query.isError && <CircleXIcon className="text-red-500"/>}
            {query.isSuccess && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={query.data}
                alt={alt}
                className={cn("w-full h-full object-contain", className)}
                {...rest}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}