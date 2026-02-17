import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserWithFamily } from "./helpers";

export const listCategories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await getUserWithFamily(ctx, userId);
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_familyId", (q) => q.eq("familyId", user.familyId))
      .collect();
    return categories
      .map((cat) => ({
        ...cat,
        id: cat._id,
        createdAt: new Date(cat._creationTime).toISOString(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const createCategory = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithFamily(ctx, args.userId);
    if (user.role !== "ADMIN") throw new Error("Admin access required");

    // Check uniqueness
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_name_familyId", (q) =>
        q.eq("name", args.name.trim()).eq("familyId", user.familyId)
      )
      .first();
    if (existing) throw new Error("Category already exists in this family");

    const catId = await ctx.db.insert("categories", {
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      familyId: user.familyId,
    });

    const category = await ctx.db.get(catId);
    return { ...category, id: catId };
  },
});

export const updateCategory = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithFamily(ctx, args.userId);
    if (user.role !== "ADMIN") throw new Error("Admin access required");

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.familyId !== user.familyId) {
      throw new Error("Category not found or not accessible");
    }

    // Check name conflict
    const conflict = await ctx.db
      .query("categories")
      .withIndex("by_name_familyId", (q) =>
        q.eq("name", args.name.trim()).eq("familyId", user.familyId)
      )
      .first();
    if (conflict && conflict._id !== args.categoryId) {
      throw new Error("Category name already exists in this family");
    }

    await ctx.db.patch(args.categoryId, {
      name: args.name.trim(),
      description: args.description?.trim() || "",
    });

    const updated = await ctx.db.get(args.categoryId);
    return { ...updated, id: args.categoryId };
  },
});

export const deleteCategory = mutation({
  args: { userId: v.id("users"), categoryId: v.id("categories") },
  handler: async (ctx, { userId, categoryId }) => {
    const user = await getUserWithFamily(ctx, userId);
    if (user.role !== "ADMIN") throw new Error("Admin access required");

    const category = await ctx.db.get(categoryId);
    if (!category || category.familyId !== user.familyId) {
      throw new Error("Category not found or not accessible");
    }

    // Check for items in category
    const itemInCategory = await ctx.db
      .query("items")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
      .first();
    if (itemInCategory) {
      throw new Error(
        "Cannot delete category with existing items. Please move or delete the items first."
      );
    }

    await ctx.db.delete(categoryId);
    return { message: "Category deleted successfully" };
  },
});
