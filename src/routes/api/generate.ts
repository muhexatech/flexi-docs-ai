import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { prompt, docType, company } = (await request.json()) as {
            prompt?: string; docType?: string; company?: string;
          };
          if (!prompt || prompt.trim().length < 3) {
            return new Response(JSON.stringify({ error: "Prompt required" }), { status: 400, headers: { "content-type": "application/json" } });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), { status: 500, headers: { "content-type": "application/json" } });

          const gateway = createLovableAiGatewayProvider(key);
          const system = `You are DocuAI, an enterprise document drafting assistant. Generate a polished, professional ${docType ?? "general document"}${company ? ` for ${company}` : ""}. 
Return a structured JSON object with this exact shape (no markdown fences, just JSON):
{
  "title": "<doc title>",
  "blocks": [
    { "type": "heading", "text": "..." },
    { "type": "paragraph", "text": "..." },
    { "type": "list", "items": ["...", "..."] },
    { "type": "signature", "name": "...", "role": "..." }
  ]
}
Use 6-12 blocks. Be concrete, formal, and complete. Use placeholders like [Recipient Name] only when truly unknown.`;

          const { text } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            system,
            prompt,
          });

          // Try to extract JSON
          let parsed: any = null;
          try {
            const match = text.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : null;
          } catch {}
          if (!parsed) {
            parsed = {
              title: docType ?? "Document",
              blocks: [{ type: "paragraph", text }],
            };
          }
          return new Response(JSON.stringify(parsed), {
            status: 200, headers: { "content-type": "application/json" },
          });
        } catch (e: any) {
          const msg = String(e?.message ?? e);
          const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
          return new Response(JSON.stringify({ error: msg }), { status, headers: { "content-type": "application/json" } });
        }
      },
    },
  },
});
