import {DefaultValues, Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

export interface DidaticContent {
  id: string;
  title: string;
  content: string;
  image: string;
}

export interface DidaticContentDto {
  title: string;
  content: string;
  image: File | undefined;
}

export function didactiContentResolver(entity?: DidaticContent): Resolver<DidaticContentDto> {
  return zodResolver(z.object({
    title: z.string().nonempty("El título es requerido"),
    content: z.string().nonempty("El contenido es requerido"),
    image: entity ? z.instanceof(File).optional() : z.instanceof(File),
  }))
}

export function didactiContentDefaultValues(entity?: DidaticContent): DefaultValues<DidaticContentDto> {
  return {
    title: entity?.title ?? "",
    content: entity?.content ?? "",
  }
}