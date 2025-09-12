import {restCrud} from "@/lib/rest-crud";
import {Tip, TipDto} from "@/app/(app)/dashboard/tips/definitions";
import {client} from "@/lib/http/axios-client";
import {attempt} from "@/lib/result";

const resource = '/content/tips';

function dtoConverter(dto: TipDto): FormData {
  const formData = new FormData();
  formData.append('title', dto.title);
  formData.append('summary', dto.summary);
  formData.append('description', dto.description);
  formData.append('tags', new Blob([JSON.stringify(dto.tags)], {type: 'application/json'}));
  if (dto.image) formData.append('image', dto.image);
  formData.append('active', dto.active.toString());
  return formData;
}

const crud = restCrud<Tip, TipDto, string>(
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

export const pageTipAction = crud.page;
export const findTipAction = crud.find;
export const createTipAction = crud.create;
export const updateTipAction = crud.update;
export const deleteTipAction = crud.delete;

export async function getTipImageAction(id: string): Promise<string> {
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

export const deleteImageAction = (id: string) => attempt(async () => {
  await client.delete(`${resource}/${id}/image`);
})


export const topTipsAction = () => attempt(async () => {
  const response = await client.get<Tip[]>(`${resource}/top`);
  return response.data;
});