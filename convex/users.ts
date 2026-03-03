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

    return users
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ password, ...rest }) => ({
        ...rest,
        id: rest._id,
        createdAt: new Date(rest._creationTime).toISOString(),
      }))
      .sort((a, b) => a.username.localeCompare(b.username));
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
