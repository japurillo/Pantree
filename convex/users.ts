import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserWithFamily } from "./helpers";

export const listUsers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await getUserWithFamily(ctx, userId);
    if (user.role !== "ADMIN") throw new Error("Admin access required");

    const users = await ctx.db
      .query("users")
      .withIndex("by_familyId", (q) => q.eq("familyId", user.familyId))
      .collect();

    // Strip passwords and add id alias
    return users
      .map(({ password, ...rest }) => ({
        ...rest,
        id: rest._id,
        createdAt: new Date(rest._creationTime).toISOString(),
      }))
      .sort((a, b) => a.username.localeCompare(b.username));
  },
});

export const createUser = mutation({
  args: {
    adminUserId: v.id("users"),
    username: v.string(),
    email: v.string(),
    hashedPassword: v.string(),
    role: v.union(v.literal("USER"), v.literal("ADMIN")),
  },
  handler: async (ctx, args) => {
    const admin = await getUserWithFamily(ctx, args.adminUserId);
    if (admin.role !== "ADMIN") throw new Error("Admin access required");

    // Check username uniqueness
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim()))
      .first();
    if (existingUsername) throw new Error("Username already exists");

    // Check email uniqueness
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim()))
      .first();
    if (existingEmail) throw new Error("Email already exists");

    const newUserId = await ctx.db.insert("users", {
      username: args.username.trim(),
      email: args.email.trim(),
      password: args.hashedPassword,
      role: args.role,
      familyId: admin.familyId,
    });

    const newUser = await ctx.db.get(newUserId);
    if (!newUser) throw new Error("Failed to create user");
    const { password, ...userWithoutPassword } = newUser;
    return { ...userWithoutPassword, id: newUserId };
  },
});

export const updateUser = mutation({
  args: {
    adminUserId: v.id("users"),
    targetUserId: v.id("users"),
    username: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("USER"), v.literal("ADMIN"))),
  },
  handler: async (ctx, args) => {
    const admin = await getUserWithFamily(ctx, args.adminUserId);
    if (admin.role !== "ADMIN") throw new Error("Admin access required");

    const target = await ctx.db.get(args.targetUserId);
    if (!target || target.familyId !== admin.familyId) {
      throw new Error("User not found");
    }

    // Check username conflict
    const duplicateUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim()))
      .first();
    if (duplicateUser && duplicateUser._id !== args.targetUserId) {
      throw new Error("Username already exists");
    }

    await ctx.db.patch(args.targetUserId, {
      username: args.username.trim(),
      email: args.email.trim(),
      role: args.role || "USER",
    });

    const updated = await ctx.db.get(args.targetUserId);
    if (!updated) throw new Error("User not found after update");
    const { password, ...userWithoutPassword } = updated;
    return { ...userWithoutPassword, id: args.targetUserId };
  },
});

export const deleteUser = mutation({
  args: { adminUserId: v.id("users"), targetUserId: v.id("users") },
  handler: async (ctx, { adminUserId, targetUserId }) => {
    if (adminUserId === targetUserId) {
      throw new Error("Cannot delete your own account");
    }

    const admin = await getUserWithFamily(ctx, adminUserId);
    if (admin.role !== "ADMIN") throw new Error("Admin access required");

    const target = await ctx.db.get(targetUserId);
    if (!target || target.familyId !== admin.familyId) {
      throw new Error("User not found");
    }

    await ctx.db.delete(targetUserId);
    return { message: "User deleted successfully" };
  },
});
