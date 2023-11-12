import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

export function middleware(request: NextRequest) {
  console.log(`[HTTP] ${request.url} ${request.method}`);
  return NextResponse.next();
}
