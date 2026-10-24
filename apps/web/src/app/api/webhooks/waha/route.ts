import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";

export const wahaWebhookSchema = z.object({
  event: z.string().min(1, "Event is required"),
  payload: z.object({
    from: z.string().min(1, "Sender is required"),
    body: z.string().min(1, "Body is required"),
  }),
});

export type WahaWebhookPayload = z.infer<typeof wahaWebhookSchema>;

export async function processConciergeMessage(
  data: WahaWebhookPayload,
  customGenerateText?: typeof generateText,
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  let replyText = "";
  const genText = customGenerateText || generateText;

  if (apiKey) {
    try {
      const openrouter = createOpenRouter({ apiKey });
      const response = await genText({
        model: openrouter(modelName),
        system:
          "You are a helpful and polite concierge for MyRehat homestays. Answer guest questions accurately and concisely.",
        prompt: data.payload.body,
      });
      replyText = response.text;
    } catch (err: any) {
      console.warn("OpenRouter API call failed or in mock mode, falling back to local response:", err?.message);
      replyText = `Halo! Terima kasih telah menghubungi MyRehat Concierge. Pesan Anda: "${data.payload.body}". Tim kami siap membantu kebutuhan homestay Anda.`;
    }
  } else {
    replyText = `Halo! Terima kasih telah menghubungi MyRehat Concierge. Pesan Anda: "${data.payload.body}". Tim kami siap membantu kebutuhan homestay Anda.`;
  }

  return {
    to: data.payload.from,
    reply: replyText,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = wahaWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid WAHA webhook payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await processConciergeMessage(parsed.data);
    return Response.json(result, { status: 200 });
  } catch (error: any) {
    console.error("WAHA Webhook error:", error);
    return Response.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
