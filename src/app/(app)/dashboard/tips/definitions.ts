import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {DefaultValues, Resolver} from "react-hook-form";

export interface Tip {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  image: string;
  active: boolean;
  myRate?: number;
  averageRate: number;
  totalRate: number;
}

export interface TipDto {
  title: string;
  summary: string;
  description: string;
  tags: string[];
  image: File | undefined;
  active: boolean;
}

export function tipResolver(entity?: Tip): Resolver<TipDto> {
  return zodResolver(z.object({
    
    title: z
    .string()
    .nonempty("El título es requerido"),
    
    summary: z
    .string()
    .nonempty("El resumen es requerido"),
    
    description: z
    .string()
    .nonempty("La descripción es requerida"),
    
    tags: z
    .array(z.string())
    .nonempty("Los tags son requeridos"),
    
    active: z
    .boolean(),
    
    image: entity
      ? z.instanceof(File).optional()
      : z.instanceof(File),
    
  }))
}

export function tipDefaultValues(entity?: Tip): DefaultValues<TipDto> {
  return {
    title: entity?.title ?? "",
    summary: entity?.summary ?? "",
    description: entity?.description ?? "",
    tags: entity?.tags ?? [],
    active: entity?.active ?? true,
  }
}