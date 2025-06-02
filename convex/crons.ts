import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Clean up expired password reset tokens
export const cleanupExpiredTokens = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiredTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_expiration", (q) => q.lt("expiresAt", now))
      .collect();

    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
    }

    console.log(`Cleaned up ${expiredTokens.length} expired password reset tokens`);
    return null;
  },
});

const crons = cronJobs();

// Run at midnight on the first day of each month
crons.cron(
  "Reset contacts monthly",
  "0 0 1 * *", // 1st of every month at 00:00
  internal.clients.resetMonthlyContacts,
  {}
);

// Clean up expired tokens daily at 2 AM
crons.interval("cleanup expired password reset tokens", { hours: 24 }, internal.crons.cleanupExpiredTokens, {});

export default crons; 