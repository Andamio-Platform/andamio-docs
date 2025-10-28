import { openapi } from "@/lib/source";

// Create proxy for API documentation
// Requests are forwarded to the server URLs defined in the OpenAPI schema
export const { GET, HEAD, PUT, POST, PATCH, DELETE } = openapi.createProxy({
  // Allow requests to Andamio API Gateway (preprod)
  allowedOrigins: ["https://andamio-api-preprod-308006323670.us-central1.run.app"],

  // Override request to only forward essential headers
  overrides: {
    request: (request) => {
      // Only forward essential headers to avoid 431 (Request Header Fields Too Large)
      const essentialHeaders = new Headers();

      // Forward authentication headers
      const authorization = request.headers.get('authorization');
      if (authorization) {
        essentialHeaders.set('authorization', authorization);
      }

      const apiKey = request.headers.get('x-api-key');
      if (apiKey) {
        essentialHeaders.set('x-api-key', apiKey);
      }

      // Forward content type for request body
      const contentType = request.headers.get('content-type');
      if (contentType) {
        essentialHeaders.set('content-type', contentType);
      }

      // Forward accept header
      const accept = request.headers.get('accept');
      if (accept) {
        essentialHeaders.set('accept', accept);
      }

      return new Request(request.url, {
        method: request.method,
        headers: essentialHeaders,
        body: request.body,
        // @ts-expect-error - duplex is required for body streaming
        duplex: 'half',
      });
    },
  },
});
