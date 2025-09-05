import {client} from "@/lib/http/axios-client";
import {SignupData} from "@/app/(auth)/sign-up/definitions";
import {parseErrorOrValidationErrors} from "@/lib/errors";
import {attempt} from "@/lib/result";


export async function singup(data: SignupData) {
  return attempt(
    async () => await client.post(`/user/sign-up`, data),
    parseErrorOrValidationErrors
  );
}
