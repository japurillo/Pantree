import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  families: defineTable({
    name: v.string(),
    adminId: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
    settings: v.optional(v.any()),
  }).index("by_inviteCode", ["inviteCode"]),

  users: defineTable({
    clerkId: v.optional(v.string()),
    username: v.string(),
    email: v.string(),
    password: v.optional(v.string()),
    role: v.union(v.literal("USER"), v.literal("ADMIN")),
    familyId: v.optional(v.id("families")),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_familyId", ["familyId"]),

  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    familyId: v.id("families"),
  })
    .index("by_familyId", ["familyId"])
    .index("by_name_familyId", ["name", "familyId"]),

  items: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    quantity: v.number(),
    threshold: v.number(),
    notes: v.optional(v.string()),
    categoryId: v.id("categories"),
    createdBy: v.id("users"),
    familyId: v.id("families"),
  })
    .index("by_familyId", ["familyId"])
    .index("by_categoryId", ["categoryId"])
    .index("by_name_familyId", ["name", "familyId"])
    .index("by_createdBy", ["createdBy"]),
});
