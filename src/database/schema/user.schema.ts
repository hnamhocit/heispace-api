import { sql } from "drizzle-orm";
import {
    pgTable,
    timestamp,
    uuid,
    varchar,
    boolean,
    pgEnum,
    date,
    text,
} from "drizzle-orm/pg-core";

export const userGenderEnum = pgEnum("user_gender", ["male", "female", "other", "prefer_not_to_say"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),

    clerkUserId: varchar("clerk_user_id", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),

    fullName: varchar("full_name", { length: 120 }),
    avatar: text("avatar"),
    username: varchar("username", { length: 24 }).unique(),

    isActive: boolean("is_active").notNull().default(true),

    onboardingCompleted: boolean("onboarding_completed")
        .notNull()
        .default(false),

    phoneNumber: varchar("phone_number", { length: 20 }),
    gender: userGenderEnum("gender").notNull().default("prefer_not_to_say"),
    birthDay: date("birth_day"),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;