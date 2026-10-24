import { describe, expect, it, vi } from "vitest";
import {
  POST,
  processConciergeMessage,
  wahaWebhookSchema,
} from "../apps/web/src/app/api/webhooks/waha/route";

describe("F2: WAHA Concierge Webhook Validation & Reply Format", () => {
  it("harus memvalidasi payload webhook WAHA yang valid", () => {
    const validPayload = {
      event: "message",
      payload: {
        from: "628123456789@c.us",
        body: "Halo, apakah ada unit homestay di daerah Ubud?",
      },
    };

    const result = wahaWebhookSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event).toBe("message");
      expect(result.data.payload.from).toBe("628123456789@c.us");
      expect(result.data.payload.body).toBe(
        "Halo, apakah ada unit homestay di daerah Ubud?",
      );
    }
  });

  it("harus menolak payload yang tidak memiliki event atau payload", () => {
    const invalidPayloads = [
      {},
      { event: "message" },
      { payload: { from: "628123456789@c.us" } },
      { event: "", payload: { from: "628123456789@c.us", body: "test" } },
      { event: "message", payload: { from: "", body: "test" } },
      { event: "message", payload: { from: "628123456789@c.us", body: "" } },
    ];

    for (const invalid of invalidPayloads) {
      const result = wahaWebhookSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    }
  });

  it("harus menghasilkan format reply JSON yang tepat { to, reply }", async () => {
    const mockPayload = {
      event: "message",
      payload: {
        from: "628999888777@c.us",
        body: "Tanya ketersediaan kamar",
      },
    };

    const mockGenerateText = vi.fn().mockResolvedValue({
      text: "Halo! Unit homestay tersedia untuk tanggal tersebut.",
    });

    const originalEnv = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";

    try {
      const result = await processConciergeMessage(
        mockPayload,
        mockGenerateText as any,
      );

      // Pastikan format reply tepat { to, reply }
      expect(result).toHaveProperty("to");
      expect(result).toHaveProperty("reply");
      expect(result.to).toBe("628999888777@c.us");
      expect(result.reply).toBe(
        "Halo! Unit homestay tersedia untuk tanggal tersebut.",
      );
    } finally {
      process.env.OPENROUTER_API_KEY = originalEnv;
    }
  });

  it("harus mengembalikan response HTTP 200 dan format JSON { to, reply } melalui POST handler", async () => {
    const mockRequest = new Request("http://localhost:3000/api/webhooks/waha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "message",
        payload: {
          from: "628111222333@c.us",
          body: "Berapa harga homestay di Bali?",
        },
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty("to", "628111222333@c.us");
    expect(json).toHaveProperty("reply");
    expect(typeof json.reply).toBe("string");
  });

  it("harus mengembalikan HTTP 400 jika request body tidak valid", async () => {
    const mockRequest = new Request("http://localhost:3000/api/webhooks/waha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "invalid_payload",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toHaveProperty("error");
  });
});
