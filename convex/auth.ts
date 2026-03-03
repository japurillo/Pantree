import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Look up user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

// Create initial user record after Clerk signup
export const createUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, username, email }) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (existing) return existing._id;

    // Create user as ADMIN (first user creates their own family)
    const userId = await ctx.db.insert("users", {
      clerkId,
      username: username.trim(),
      email: email.trim(),
      role: "ADMIN",
    });

    // Create family with invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const familyId = await ctx.db.insert("families", {
      name: `${username}'s Family`,
      adminId: userId,
      inviteCode,
    });

    await ctx.db.patch(userId, { familyId });

    // Create default categories
    const defaultCategories = [
      { name: "Pantry", description: "Dry goods and non-perishables" },
      { name: "Refrigerator", description: "Cold items and leftovers" },
      { name: "Freezer", description: "Frozen foods" },
      { name: "Spices", description: "Herbs and seasonings" },
    ];
    let spicesCategoryId;
    for (const cat of defaultCategories) {
      const catId = await ctx.db.insert("categories", { ...cat, familyId });
      if (cat.name === "Spices") spicesCategoryId = catId;
    }
    if (spicesCategoryId) {
      await ctx.db.insert("items", {
        name: "Black Pepper",
        description: "Ground black pepper for seasoning",
        quantity: 1,
        threshold: 1,
        categoryId: spicesCategoryId,
        createdBy: userId,
        familyId,
      });
    }

    return userId;
  },
});

// Join a family via invite code
export const joinFamily = mutation({
  args: {
    clerkId: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, { clerkId, inviteCode }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    if (user.familyId) throw new Error("User already belongs to a family");

    const family = await ctx.db
      .query("families")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
      .first();
    if (!family) throw new Error("Invalid invite code");

    await ctx.db.patch(user._id, { familyId: family._id, role: "USER" });
    return family._id;
  },
});

// Get family invite code (admin only)
export const getInviteCode = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "ADMIN" || !user.familyId) return null;

    const family = await ctx.db.get(user.familyId);
    return family?.inviteCode ?? null;
  },
});

// Regenerate invite code (admin only)
export const regenerateInviteCode = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "ADMIN" || !user.familyId) {
      throw new Error("Unauthorized");
    }

    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    await ctx.db.patch(user.familyId, { inviteCode: newCode });
    return newCode;
  },
});
