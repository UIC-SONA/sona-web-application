export interface OAuth2TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

export interface OAuth2UserInfoResponse {
  sub: string;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
}

export interface OAuth2ErrorResponse {
  error: string;
  error_description: string;
  error_uri?: string;
}

export function isOAuth2Error(error: unknown): error is OAuth2ErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    "error_description" in error
  );
}
