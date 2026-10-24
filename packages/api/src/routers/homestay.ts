import { desc } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { BUY_HOMESTAY_CATEGORIES, buyHomestays } from "@myrehat-task-b/db";

export { BUY_HOMESTAY_CATEGORIES };
export const buyHomestayCategorySchema = z.enum(BUY_HOMESTAY_CATEGORIES);

export const createBuyHomestaySchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.string().min(1, "Price is required"),
  location: z.string().min(1, "Location is required"),
  category: buyHomestayCategorySchema,
  whatsappContact: z.string().min(1, "WhatsApp contact is required"),
  description: z.string().optional(),
});

export type CreateBuyHomestayInput = z.infer<typeof createBuyHomestaySchema>;

export const homestayRouter = {
  list: publicProcedure.handler(async ({ context }) => {
    return await context.db
      .select()
      .from(buyHomestays)
      .orderBy(desc(buyHomestays.createdAt));
  }),
  create: protectedProcedure
    .input(createBuyHomestaySchema)
    .handler(async ({ input, context }) => {
      const [created] = await context.db
        .insert(buyHomestays)
        .values({
          title: input.title,
          price: input.price,
          location: input.location,
          category: input.category,
          whatsappContact: input.whatsappContact,
          description: input.description,
          userId: context.session.user.id,
        })
        .returning();

      return created;
    }),
};
