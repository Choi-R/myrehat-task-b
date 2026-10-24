import { describe, expect, it } from "vitest";
import {
  BUY_HOMESTAY_CATEGORIES,
  buyHomestayCategorySchema,
  createBuyHomestaySchema,
} from "../packages/api/src/routers/homestay";

describe("F1: BuyHomestay Category Validation", () => {
  const acceptedCategories = [
    "Buy Property",
    "Buy land to build homestay",
    "Buy Airbnb Profile",
    "Buy Airbnb Business",
  ] as const;

  it("harus menerima TEPAT 4 kategori yang sah", () => {
    expect(BUY_HOMESTAY_CATEGORIES).toHaveLength(4);
    for (const cat of acceptedCategories) {
      expect(BUY_HOMESTAY_CATEGORIES).toContain(cat);
      const result = buyHomestayCategorySchema.safeParse(cat);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(cat);
      }
    }
  });

  it("harus menolak kategori yang tidak terdaftar (1 ditolak)", () => {
    const rejectedCategory = "Buy Luxury Hotel";
    const result = buyHomestayCategorySchema.safeParse(rejectedCategory);
    expect(result.success).toBe(false);
  });

  it("harus memvalidasi seluruh input form listing BuyHomestay dengan sukses", () => {
    const validListing = {
      title: "Villa Jogja Asri",
      price: "1500000000",
      location: "Yogyakarta",
      category: "Buy Airbnb Business",
      whatsappContact: "6281234567890",
      description: "Bisnis berjalan dengan occupancy rate 85%",
    };

    const parsed = createBuyHomestaySchema.safeParse(validListing);
    expect(parsed.success).toBe(true);
  });

  it("harus menolak form listing jika kategori tidak valid", () => {
    const invalidListing = {
      title: "Villa Jogja Asri",
      price: "1500000000",
      location: "Yogyakarta",
      category: "Buy Apartment", // Kategori salah
      whatsappContact: "6281234567890",
    };

    const parsed = createBuyHomestaySchema.safeParse(invalidListing);
    expect(parsed.success).toBe(false);
  });
});
