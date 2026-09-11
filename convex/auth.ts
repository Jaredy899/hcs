import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

const userDoc = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  clerkId: v.optional(v.string()),
  email: v.string(),
  name: v.optional(v.string()),
  phone: v.optional(v.string()),
  image: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
});

// Custom auth functions for Clerk integration
export const getCurrentUser = query({
  args: {},
  returns: v.union(v.null(), userDoc),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Look for existing user with this Clerk ID
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const createOrGetUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists with this Clerk ID
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const email = identity.email ?? "";
    const name = identity.name ?? identity.givenName ?? "";

    // Check if there's a user with the same email (migration case)
    const userByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (userByEmail) {
      // If user exists by email but doesn't have a Clerk ID, adopt them
      if (!userByEmail.clerkId) {
        await ctx.db.patch(userByEmail._id, {
          clerkId: identity.subject,
          name: name || userByEmail.name,
        });
      }
      return userByEmail._id;
    }

    // Create new user only if no user exists with this email
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      name,
    });
  },
});

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<Pick<Doc<"users">, "name" | "email">> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return null;
  },
});

/** Look up the signed-in user, matching on Clerk ID first and email second. */
async function findCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const byClerkId = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (byClerkId) {
    return byClerkId;
  }

  // Migration case: the record predates Clerk and is only keyed by email.
  if (!identity.email) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email as string))
    .first();
}

/** Current user ID for use in QUERIES (read-only). */
export const getCurrentUserIdQuery = async (ctx: QueryCtx): Promise<Id<"users"> | null> => {
  const user = await findCurrentUser(ctx);
  return user?._id ?? null;
};

/** Current user ID for use in MUTATIONS; backfills a missing Clerk ID. */
export const getCurrentUserId = async (ctx: MutationCtx): Promise<Id<"users"> | null> => {
  const user = await findCurrentUser(ctx);
  if (!user) {
    return null;
  }

  if (!user.clerkId) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await ctx.db.patch(user._id, { clerkId: identity.subject });
    }
  }

  return user._id;
};
