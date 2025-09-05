import {keycloakIssuer, keycloakIssuerMetadata} from "@/lib/keycloak-issuer";
import {AuthOptions} from "next-auth";
import {JWT} from "next-auth/jwt";
import {parseError} from "@/lib/errors";
import {KeycloakProfile} from "next-auth/providers/keycloak";
import {KEYCLOAK_ID, KEYCLOAK_SECRET} from "@/constants";
import {TokenSet, TokenSetParameters} from "openid-client";
import {decodeJwt, JWTPayload} from "jose";

const client = new keycloakIssuer.Client({
  client_id: KEYCLOAK_ID,
  client_secret: KEYCLOAK_SECRET,
})

function authorityConverter(token: JWTPayload): string[] {
  if (token.resource_access) {
    const resourceAccess = token.resource_access as Record<string, { roles: string[] }>;
    return resourceAccess[KEYCLOAK_ID]?.roles || [];
  }
  return []
}

function updateToken(token: JWT, tokenSet: TokenSetParameters): JWT {
  if (!tokenSet.access_token) {
    throw new Error("No access token in token set");
  }
  if (!tokenSet.refresh_token) {
    throw new Error("No refresh token in token set");
  }
  const decodedToken = decodeJwt(tokenSet.access_token);
  return {
    ...token,
    accessToken: tokenSet.access_token,
    accessTokenExpires: Date.now() + (tokenSet.expires_in as number) * 1000,
    refreshToken: tokenSet.refresh_token,
    refreshTokenExpires: Date.now() + (tokenSet.expires_in as number) * 1000,
    authorities: authorityConverter(decodedToken),
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await client.refresh(token.refreshToken);
    return updateToken(token, response);
  } catch (error) {
    console.log("Error refreshing token: ", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'keycloak',
      name: 'Keycloak',
      type: 'oauth',
      version: '2.0',
      authorization: {params: {scope: "openid email profile"}},
      checks: ["pkce", "state"],
      idToken: true,
      clientId: KEYCLOAK_ID,
      clientSecret: KEYCLOAK_SECRET,
      accessTokenUrl: keycloakIssuerMetadata.token_endpoint,
      requestTokenUrl: keycloakIssuerMetadata.authorization_endpoint,
      profileUrl: keycloakIssuerMetadata.userinfo_endpoint,
      profile(profile: KeycloakProfile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        }
      },
      style: {logo: "/keycloak.svg", bg: "#fff", text: "#000"},
    },
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        username: {label: "Username", type: "text"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        const {username, password} = credentials || {};
        if (!username) throw new Error("Email is required");
        if (!password) throw new Error("Password is required");
        try {
          const tokenSet = await client.grant({
            grant_type: 'password',
            username: username,
            password: password,
            scope: 'openid email profile',
          });
          const user = await client.userinfo(tokenSet.access_token as string);
          return {
            id: user.sub,
            name: user.name || user.preferred_username,
            email: user.email,
            image: user.picture,
            token: tokenSet,
          }
        } catch (error) {
          throw new Error(parseError(error).description);
        }
      },
    },
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({user, account}) {
      console.log("signIn");
      if (account && user) {
        // Dado que se puede iniciar sesion tanto desde el proveedor de keycloak como desde el de credenciales
        // Si es desde credenciales, se copian los tokens al account tal como lo haría next-auth de forma nativa
        // con oauth, para que luego estén disponibles en el callback jwt
        // (Esto puede considerar como un "truco", ya que si bien es un credentials provider, en realidad se lo
        // quiere tratar como un oauth provider)
        if (account.provider == "credentials" && "token" in user && user.token instanceof TokenSet) {
          Object.assign(account, user.token, {
            // expires_in está definido como un getter en el tokenSet, por lo cual
            // no se puede realizar la asignación directa con Object.assign, por eso se lo asigna manualmente
            expires_in: user.token.expires_in
          })
          user.token = undefined;
        }
        return true;
      }
      return '/unauthorized';
    },
    async jwt({token, user, account}) {
      if (user && account) {
        console.log("Inicialización de la sesión, expiration time (s): ", account.expires_in);
        return updateToken(token, account);
      }
      
      if (Date.now() < token.accessTokenExpires) {
        console.log("Access token is valid");
        return token;
      }
      
      if (Date.now() < token.refreshTokenExpires) {
        console.log("Access token has expired, refreshing...");
        return await refreshAccessToken(token);
      }
      
      console.log("Refresh token has expired, user must sign in again");
      return {
        ...token,
        error: "RefreshTokenExpired"
      };
    },
    // Se ejecuta cada vez que se chequea la sesión
    async session({session, token}) {
      session.accessToken = token.accessToken
      session.error = token.error;
      session.expires = token.accessTokenExpires;
      session.authorities = token.authorities;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

