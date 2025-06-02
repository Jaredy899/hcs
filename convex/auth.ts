import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  args: {},
  returns: v.union(v.null(), v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

// Password reset functionality
export const requestPasswordReset = mutation({
  args: { email: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Check if user exists with this email
    const existingAccount = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", args.email)
      )
      .first();

    if (!existingAccount) {
      // Return success even if user doesn't exist for security
      return { success: true };
    }

    // Generate a secure random token
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Invalidate any existing tokens for this email
    const existingTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    for (const existingToken of existingTokens) {
      await ctx.db.patch(existingToken._id, { used: true });
    }

    // Create new reset token
    await ctx.db.insert("passwordResetTokens", {
      email: args.email,
      token,
      expiresAt,
      used: false,
    });

    // In a real app, you would send an email here
    // For now, we'll just log the token (remove this in production)
    console.log(`Password reset token for ${args.email}: ${token}`);
    console.log(`Reset link: ${process.env.CONVEX_SITE_URL}/?token=${token}`);

    return { success: true };
  },
});

export const verifyResetToken = query({
  args: { token: v.string() },
  returns: v.union(
    v.object({ valid: v.literal(true), email: v.string() }),
    v.object({ valid: v.literal(false) })
  ),
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken || resetToken.used || resetToken.expiresAt < Date.now()) {
      return { valid: false as const };
    }

    return { valid: true as const, email: resetToken.email };
  },
});

export const resetPassword = mutation({
  args: { 
    token: v.string(),
    newPassword: v.string(),
  },
  returns: v.union(
    v.object({ 
      success: v.literal(true), 
      email: v.string(),
      userId: v.id("users")
    }),
    v.object({ 
      success: v.literal(false), 
      error: v.string() 
    })
  ),
  handler: async (ctx, args) => {
    // Verify the token is valid
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    
    if (!resetToken || resetToken.used || resetToken.expiresAt < Date.now()) {
      return { success: false as const, error: "Invalid or expired reset token" };
    }

    // Find the user account
    const existingAccount = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", resetToken.email)
      )
      .first();

    if (!existingAccount) {
      return { success: false as const, error: "Account not found" };
    }

    // Mark the token as used first
    await ctx.db.patch(resetToken._id, { used: true });

    // Store the user ID and email for the frontend to handle re-authentication
    // We can't directly hash the password here, so we'll let the frontend handle the sign-in
    return { 
      success: true as const, 
      email: resetToken.email,
      userId: existingAccount.userId 
    };
  },
});

// New mutation to complete the password reset after the user signs in
export const completePasswordReset = mutation({
  args: { 
    token: v.string(),
    email: v.string(),
  },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    // Verify the token was used for password reset
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    
    if (!resetToken || !resetToken.used || resetToken.expiresAt < Date.now()) {
      return { success: false, error: "Invalid reset session" };
    }

    if (resetToken.email !== args.email) {
      return { success: false, error: "Email mismatch" };
    }

    // Find the old account (should exist since we didn't delete it)
    const oldAccount = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", args.email)
      )
      .first();

    if (oldAccount) {
      // Delete the old account now that we have a new one with the new password
      await ctx.db.delete(oldAccount._id);
    }

    // Clean up the reset token
    await ctx.db.delete(resetToken._id);

    return { success: true };
  },
});
