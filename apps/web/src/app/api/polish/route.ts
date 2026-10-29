import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { polishListingDescription } from "../../../../../../scripts/polish";

export async function GET() {
  return Response.json({
    status: "ok",
    endpoint: "/api/polish",
    method: "POST",
    description: "Endpoint to polish homestay descriptions with AI (F3)",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, title, category } = body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return Response.json({ error: "Description is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const modelName = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

    let polished = "";

    if (apiKey) {
      try {
        const openrouter = createOpenRouter({ apiKey });
        const result = await generateText({
          model: openrouter(modelName),
          system:
            "You are an expert real estate copywriter. Polish and optimize the listing description to be compelling, high-converting, and clear.",
          prompt: `Please polish the following homestay listing description:
Title: ${title || "Homestay Listing"}
Category: ${category || "Buy Property"}
Original:
${description}

Polished Output:`,
        });
        polished = result.text.trim();
      } catch (e: any) {
        console.warn("OpenRouter polish error:", e?.message);
        try {
          polished = await polishListingDescription({ description, title, category });
        } catch {
          polished = `${description}\n\n✨ Keunggulan Properti:\n• Potensi occupancy rate tinggi & ROI stabil\n• Fasilitas lengkap siap operasional\n• Lokasi prima dengan aksesibilitas prima`;
        }
      }
    } else {
      try {
        polished = await polishListingDescription({ description, title, category });
      } catch {
        polished = `${description}\n\n✨ Keunggulan Properti:\n• Potensi occupancy rate tinggi & ROI stabil\n• Fasilitas lengkap siap operasional\n• Lokasi prima dengan aksesibilitas prima`;
      }
    }

    return Response.json({ polished, original: description });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

