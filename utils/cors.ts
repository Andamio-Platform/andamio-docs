import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "https://app.andamio.io",
  "https://preprod.andamio.io"
];

export function addCorsHeaders(response: NextResponse, request: NextRequest): void {
  const origin = request.headers.get("origin");
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
}

export function createOptionsResponse(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");
  
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}