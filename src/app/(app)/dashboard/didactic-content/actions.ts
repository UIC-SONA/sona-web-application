import {restCrud} from "@/lib/rest-crud";
import {DidaticContent, DidaticContentDto} from "@/app/(app)/dashboard/didactic-content/definitions";
import {client} from "@/lib/http/axios-client";

const resource = '/content/didactic';

function dtoConverter(dto: DidaticContentDto): FormData {
  const formData = new FormData();
  formData.append('title', dto.title);
  formData.append('content', dto.content);
  if (dto.image) formData.append('image', dto.image);
  return formData;
}

const crud = restCrud<DidaticContent, DidaticContentDto>(
  client,
  resource,
  {
    requestConfig: () => ({
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }),
    dtoConverter,
  }
);


export const pageDidacticContentAction = crud.page;
export const findDidacticContentAction = crud.find;
export const createDidacticContentAction = crud.create;
export const updateDidacticContentAction = crud.update;
export const deleteDidacticContentAction = crud.delete;

export async function getDidacticContentImageAction(id: string): Promise<string> {
  const response = await client.get<string>(
    `${resource}/${id}/image`,
    {
      responseType: 'arraybuffer',
    }
  );
  const contentType = response.headers['content-type']; // Obtener el tipo de contenido
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return `data:${contentType};base64,${base64}`;
}
