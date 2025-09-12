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
