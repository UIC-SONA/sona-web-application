import "next-auth";

declare module "next-auth" {
  
  interface Session {
    accessToken: string;
    error?: string;
    expires?: number;
    authorities: string[];
  }
}

declare module "next-auth/jwt" {
  export interface JWT {
    
    accessToken: string;
    accessTokenExpires: number,
    
    refreshToken: string
    refreshTokenExpires: number
    
    authorities: string[];
    
    error?: string;
  }
}