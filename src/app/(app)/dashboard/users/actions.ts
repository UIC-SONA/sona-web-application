import {client} from "@/lib/http/axios-client";
import {attempt} from "@/lib/result";
import {restCrud} from "@/lib/rest-crud";
import {User, UserDto} from "@/app/(app)/dashboard/users/definitions";

const resource = '/user';

const crud = restCrud<User, UserDto>(client, resource);

export const findUsersAction = crud.find;
export const pageUsersAction = crud.page;
export const createUserAction = crud.create;
export const updateUserAction = crud.update;
export const deleteUserAction = crud.delete;

export const profilePictureAction = async (): Promise<string> => {
  const response = await client.get<string>(
    `${resource}/profile-picture`,
    {
      responseType: 'arraybuffer',
    }
  );
  const contentType = response.headers['content-type']; // Obtener el tipo de contenido
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return `data:${contentType};base64,${base64}`;
};

export const profilePicturePath = (userId: number): string => {
  return client.defaults.baseURL + `${resource}/${userId}/profile-picture`;
};

export const deleteProfilePictureAction = async () => attempt(() => {
  client.delete<void>(`${resource}/profile-picture`);
});


export const enableUserAction = async (id: number, enabled: boolean) => attempt(async () => {
  const response = await client.put<void>(
    `${resource}/enable`,
    null,
    {
      params: {
        id,
        value: enabled,
      },
    }
  );
  return response.data;
});


