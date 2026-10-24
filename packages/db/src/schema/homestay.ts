import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const BUY_HOMESTAY_CATEGORIES = [
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

export type BuyHomestayCategory = (typeof BUY_HOMESTAY_CATEGORIES)[number];

export const buyHomestayCategoryEnum = pgEnum("buy_homestay_category", BUY_HOMESTAY_CATEGORIES);

export const buyHomestays = pgTable("buy_homestays", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  price: text("price").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  whatsappContact: text("whatsapp_contact").notNull(),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type BuyHomestay = typeof buyHomestays.$inferSelect;
export type NewBuyHomestay = typeof buyHomestays.$inferInsert;
