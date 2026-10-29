import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { cors } from "@elysiajs/cors";
import { appRouter } from "@myrehat-task-b/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
  wrapLanguageModel,
} from "ai";
import { Elysia } from "elysia";

import { createContext } from "./context";
import { ENV } from "./env.server";
import { auth } from "./services";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

new Elysia()
  .use(
    cors({
      origin: ENV.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .all(
    "/rpc*",
    async (context) => {
      const { response } = await rpcHandler.handle(context.request, {
        prefix: "/rpc",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api-reference*",
    async (context) => {
      const { response } = await apiHandler.handle(context.request, {
        prefix: "/api-reference",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .get("/api/webhooks/waha", () => {
    return {
      status: "ok",
      endpoint: "/api/webhooks/waha",
      method: "POST",
      message: "WAHA Concierge webhook active. Send POST with { event, payload: { from, body } }",
    };
  })
  .post("/api/webhooks/waha", async (context) => {
    try {
      const body = (await context.request.json()) as any;
      const from = body?.payload?.from || body?.from;
      const userText = body?.payload?.body || body?.body;
      if (!from || !userText) {
        context.set.status = 400;
        return { error: "Invalid WAHA webhook payload" };
      }
      return {
        to: from,
        reply: `Halo! Terima kasih telah menghubungi MyRehat Concierge. Pesan Anda: "${userText}". Tim kami siap membantu kebutuhan homestay Anda.`,
      };
    } catch (e: any) {
      context.set.status = 500;
      return { error: e?.message || "Internal server error" };
    }
  })
  .post("/ai", async (context) => {
    try {
      const body = (await context.request.json()) as { messages?: UIMessage[] };
      const uiMessages = body.messages || [];
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!apiKey || apiKey === "placeholder") {
        // Fallback response for AI chat when no external key is configured
        const lastMsg = uiMessages[uiMessages.length - 1]?.parts?.[0] || uiMessages[uiMessages.length - 1];
        const lastText = typeof lastMsg === "string" ? lastMsg : (lastMsg as any)?.text || "Halo";
        
        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            const text = `Halo! Saya asisten AI MyRehat. Anda bertanya: "${lastText}". Ada yang bisa saya bantu seputar pemesanan homestay atau listing BuyHomestay?`;
            controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Vercel-AI-Data-Stream": "v1",
          },
        });
      }

      const model = wrapLanguageModel({
        model: google("gemini-2.5-flash"),
        middleware: devToolsMiddleware(),
      });
      const result = streamText({
        model,
        messages: await convertToModelMessages(uiMessages),
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    } catch (err: any) {
      console.warn("AI generation error, sending fallback:", err?.message);
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const text = "Halo! Layanan AI Concierge MyRehat siap membantu kebutuhan homestay Anda.";
          controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Vercel-AI-Data-Stream": "v1",
        },
      });
    }
  })
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
