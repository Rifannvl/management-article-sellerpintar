import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  // Halaman publik yang boleh diakses tanpa login
  const publicPaths = ["/auth/login", "/auth/register"];

  // Jika token tidak ada dan bukan di halaman login atau register, arahkan ke halaman login
  if (!token && !publicPaths.includes(path)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Cek jika user mencoba mengakses admin area tanpa menjadi admin
  if (role !== "Admin" && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/articles", request.url));
  }

  // Cek jika user sudah login dan mencoba mengakses halaman login atau register
  if (token && (path === "/auth/login" || path === "/auth/register")) {
    // Jika sudah login, redirect ke dashboard admin atau halaman utama
    if (role === "Admin") {
      return NextResponse.redirect(
        new URL("/admin/articles/dashboard", request.url)
      );
    } else {
      return NextResponse.redirect(new URL("/articles", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
