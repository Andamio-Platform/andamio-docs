import { openapi } from "@/lib/source";

// Create proxy for API documentation
// Requests are forwarded to the server URLs defined in the OpenAPI schema
export const { GET, HEAD, PUT, POST, PATCH, DELETE } = openapi.createProxy({
  // Allow requests to Andamio API Gateway
  allowedOrigins: ["https://andamio-api-308006323670.us-central1.run.app"],

  // Override request to strip CORS-blocking headers
  overrides: {
    request: (request) => {
      // Create new request without origin header that causes CORS issues
      const headers = new Headers(request.headers);
      headers.delete('origin');
      headers.delete('referer');

      return new Request(request.url, {
        method: request.method,
        headers,
        body: request.body,
        // @ts-expect-error - duplex is required for body streaming
        duplex: 'half',
      });
    },
  },
});
