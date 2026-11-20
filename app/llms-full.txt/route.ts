import { llmsFull } from "@/lib/llms";

// Built once at build time; the docs only change on deploy.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
