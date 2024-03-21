import { type NextMiddleware, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dayjs from "dayjs";

export const middleware: NextMiddleware = async (req) => {
  const token = await getToken({ req });
  const res = NextResponse.next();

  const isTokenExpired =
    (token?.exp && dayjs.unix(token.exp as number) < dayjs()) ?? !token?.email;

  const useSecureCookies = req.url.startsWith("https://");

  const isUnauthedPath = ["/login", "/register", "/demo", "/"].includes(
    req.nextUrl.pathname,
  );

  if(req.nextUrl.pathname.startsWith("/monitoring")){
    return res
  }

  if (isTokenExpired) {
    // Clear cookie if the user object isn't populated
    useSecureCookies
      ? res.cookies.delete("__Secure-next-auth.session-token")
      : res.cookies.delete("next-auth.session-token");
  } else if (isUnauthedPath) {
    return NextResponse.redirect(new URL("/meeting", req.url));
  }

  return res;
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
