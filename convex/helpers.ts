import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getUserWithFamily(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  if (!user.familyId) throw new Error("User not assigned to a family");
  return user as typeof user & { familyId: Id<"families"> };
}
