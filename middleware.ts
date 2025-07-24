import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "https://app.andamio.io",
  "https://preprod.andamio.io"
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  // Handle YAML file requests
  if (request.nextUrl.pathname.startsWith('/yaml/') && request.nextUrl.pathname.endsWith('.yaml')) {
    const response = NextResponse.next();
    
    // Add CORS headers for YAML files
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Content-Type', 'application/x-yaml');
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    
    return response;
  }

  // Handle OPTIONS requests for YAML files
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/yaml/')) {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
    
    return new NextResponse(null, {
      status: 200,
      headers,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/yaml/:path*',
  ],
};