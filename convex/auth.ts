import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
  },
});

export const register = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    hashedPassword: v.string(),
  },
  handler: async (ctx, { username, email, hashedPassword }) => {
    // Check if username exists
    const existingByUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username.trim()))
      .first();
    if (existingByUsername) throw new Error("Username already exists");

    // Check if email exists
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.trim()))
      .first();
    if (existingByEmail) throw new Error("Email already exists");

    // Create user without familyId initially
    const userId = await ctx.db.insert("users", {
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: "ADMIN",
    });

    // Create family
    const familyId = await ctx.db.insert("families", {
      name: `${username}'s Family`,
      adminId: userId,
    });

    // Update user with familyId
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
      const catId = await ctx.db.insert("categories", {
        name: cat.name,
        description: cat.description,
        familyId,
      });
      if (cat.name === "Spices") spicesCategoryId = catId;
    }

    // Create sample item
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

    return { userId, familyId };
  },
});
