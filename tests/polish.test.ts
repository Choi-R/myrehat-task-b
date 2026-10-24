import { describe, expect, it, vi } from "vitest";
import { polishListingDescription } from "../scripts/polish";

describe("F3: Listing Description Polish with ai-sdk-provider-opencode-sdk", () => {
  it("harus berhasil memoles deskripsi listing menggunakan generateText", async () => {
    const mockGenerateText = vi.fn().mockResolvedValue({
      text: "Nikmati hunian eksklusif tropis dengan 3 kamar tidur yang nyaman dan kolam renang pribadi.",
    });

    const result = await polishListingDescription(
      {
        title: "Villa Tropis Sanur",
        category: "Buy Airbnb Business",
        description: "Rumah nyaman dekat pantai, 3 kamar tidur, kolam renang.",
      },
      mockGenerateText as any,
    );

    expect(mockGenerateText).toHaveBeenCalled();
    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.prompt).toContain("Villa Tropis Sanur");
    expect(callArgs.prompt).toContain("Buy Airbnb Business");
    expect(result).toBe(
      "Nikmati hunian eksklusif tropis dengan 3 kamar tidur yang nyaman dan kolam renang pribadi.",
    );
  });

  it("harus melempar error jika deskripsi kosong", async () => {
    await expect(
      polishListingDescription({
        description: "",
      }),
    ).rejects.toThrow("Description cannot be empty");
  });
});
