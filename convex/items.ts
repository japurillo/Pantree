import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserWithFamily } from "./helpers";

export const listItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await getUserWithFamily(ctx, userId);
    const items = await ctx.db
      .query("items")
      .withIndex("by_familyId", (q) => q.eq("familyId", user.familyId))
      .collect();

    // Join category names
    const itemsWithCategories = await Promise.all(
      items.map(async (item) => {
        const category = await ctx.db.get(item.categoryId);
        return {
          ...item,
          id: item._id,
          category: category ? { id: category._id, name: category.name } : null,
          createdAt: new Date(item._creationTime).toISOString(),
        };
      })
    );

    return itemsWithCategories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getItem = query({
  args: { userId: v.id("users"), itemId: v.id("items") },
  handler: async (ctx, { userId, itemId }) => {
    const user = await getUserWithFamily(ctx, userId);
    const item = await ctx.db.get(itemId);
    if (!item || item.familyId !== user.familyId) {
      throw new Error("Item not found");
    }
    const category = await ctx.db.get(item.categoryId);
    return {
      ...item,
      id: item._id,
      category: category ? { id: category._id, name: category.name } : null,
      createdAt: new Date(item._creationTime).toISOString(),
    };
  },
});

export const createItem = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    quantity: v.number(),
    threshold: v.number(),
    notes: v.optional(v.string()),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithFamily(ctx, args.userId);

    // Verify category belongs to family
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.familyId !== user.familyId) {
      throw new Error("Invalid category");
    }

    // Check uniqueness within family
    const existing = await ctx.db
      .query("items")
      .withIndex("by_name_familyId", (q) =>
        q.eq("name", args.name.trim()).eq("familyId", user.familyId)
      )
      .first();
    if (existing) throw new Error("Item already exists in this family");

    const itemId = await ctx.db.insert("items", {
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      imageUrl: args.imageUrl || undefined,
      quantity: args.quantity || 0,
      threshold: args.threshold || 1,
      notes: args.notes?.trim() || undefined,
      categoryId: args.categoryId,
      createdBy: args.userId,
      familyId: user.familyId,
    });

    const item = await ctx.db.get(itemId);
    return { ...item, id: itemId };
  },
});

export const updateItem = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.id("items"),
    quantity: v.optional(v.number()),
    threshold: v.optional(v.number()),
    notes: v.optional(v.string()),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithFamily(ctx, args.userId);
    const item = await ctx.db.get(args.itemId);
    if (!item || item.familyId !== user.familyId) {
      throw new Error("Item not found");
    }

    const updates: Record<string, any> = {};
    if (args.quantity !== undefined) updates.quantity = args.quantity;
    if (args.threshold !== undefined) updates.threshold = args.threshold;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined) updates.description = args.description?.trim();
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.imageUrl !== undefined) {
      updates.imageUrl = args.imageUrl === null ? undefined : args.imageUrl;
    }

    await ctx.db.patch(args.itemId, updates);
    const updated = await ctx.db.get(args.itemId);
    return { ...updated, id: args.itemId };
  },
});

export const deleteItem = mutation({
  args: { userId: v.id("users"), itemId: v.id("items") },
  handler: async (ctx, { userId, itemId }) => {
    const user = await getUserWithFamily(ctx, userId);
    const item = await ctx.db.get(itemId);
    if (!item || item.familyId !== user.familyId) {
      throw new Error("Item not found");
    }
    const imageUrl = item.imageUrl;
    await ctx.db.delete(itemId);
    return { imageUrl };
  },
});

export const consumeItem = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.id("items"),
    amount: v.number(),
  },
  handler: async (ctx, { userId, itemId, amount }) => {
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    const user = await getUserWithFamily(ctx, userId);
    const item = await ctx.db.get(itemId);
    if (!item || item.familyId !== user.familyId) {
      throw new Error("Item not found");
    }
    if (item.quantity < amount) {
      throw new Error(
        `Not enough quantity. Available: ${item.quantity}, Requested: ${amount}`
      );
    }

    const newQuantity = Math.max(0, item.quantity - amount);
    await ctx.db.patch(itemId, { quantity: newQuantity });
    const updated = await ctx.db.get(itemId);
    return { ...updated, id: itemId };
  },
});
