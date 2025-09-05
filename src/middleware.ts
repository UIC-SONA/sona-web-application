import {NextResponse} from 'next/server';
import {NextRequestWithAuth, withAuth} from 'next-auth/middleware';
import {guards} from "@/guards";
import {NEXTAUTH_SECRET} from "@/constants";

function toUrl(redirect: string, req: NextRequestWithAuth): URL {
  return new URL(redirect, req.url);
}

export default withAuth(req => {
    const {nextUrl, nextauth} = req;
    const {guestOnly, authenticated} = guards;
    
    const path = nextUrl.pathname;
    const token = nextauth?.token;
    
    // Verificar rutas de solo invitados
    for (const guard of guestOnly) {
      if (matchesAnyPath(path, guard.paths)) {
        if (token) {
          return NextResponse.redirect(toUrl(guard.redirect, req));
        }
        return NextResponse.next();
      }
    }
    
    // Verificar rutas autenticadas
    for (const guard of authenticated) {
      if (matchesAnyPath(path, guard.paths)) {
        // Usuario no autenticado
        if (!token) {
          return NextResponse.redirect(toUrl(guard.redirect, req));
        }
        
        // Verificar autorización personalizada si existe
        if (guard.authorized && !guard.authorized(token)) {
          return NextResponse.redirect(toUrl(guard.redirect, req));
        }
        
        // Usuario autorizado, permitir acceso
        return NextResponse.next();
      }
    }
    
    // Para rutas no configuradas, permitir acceso por defecto
    return NextResponse.next();
  },
  {
    secret: NEXTAUTH_SECRET,
    callbacks: {
      authorized: () => true, // La lógica se maneja en el middleware
    },
  }
);

function matchesAnyPath(currentPath: string, patterns: string[] | string): boolean {
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      const basePath = pattern.slice(0, -1);
      return currentPath === basePath || currentPath.startsWith(basePath);
    }
    return currentPath === pattern;
  });
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}