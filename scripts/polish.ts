import { createOpencode } from "ai-sdk-provider-opencode-sdk";
import { generateText } from "ai";

export interface PolishOptions {
  description: string;
  category?: string;
  title?: string;
}

export async function polishListingDescription(
  options: PolishOptions,
  customGenerateText?: typeof generateText,
): Promise<string> {
  const { description, category, title } = options;

  if (!description || description.trim().length === 0) {
    throw new Error("Description cannot be empty");
  }

  const prompt = `Please polish, enhance, and optimize the following homestay listing description for potential buyers/guests. Make it enticing, professional, and clear.
${title ? `Title: ${title}` : ""}
${category ? `Category: ${category}` : ""}
Original Description:
${description}

Polished Description:`;

  const genText = customGenerateText || generateText;

  // Uses provider ai-sdk-provider-opencode-sdk
  const opencodeProvider = createOpencode();
  const model = opencodeProvider("default");

  const result = await genText({
    model,
    prompt,
    system:
      "You are a professional real estate and hospitality copywriter specializing in homestay listings.",
  });

  return result.text;
}

if (process.argv[1] && process.argv[1].endsWith("polish.ts")) {
  const sampleDesc =
    process.argv[2] ||
    "Rumah nyaman dekat pantai, ada 3 kamar tidur, kolam renang.";
  console.log("Original description:", sampleDesc);
  polishListingDescription({ description: sampleDesc })
    .then((polished) => console.log("Polished description:\n", polished))
    .catch((err) => console.error("Error polishing description:", err));
}
