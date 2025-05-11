import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("clients")
      .withIndex("by_case_manager_and_archived", (q) => 
        q.eq("caseManagerId", userId).eq("archived", false)
      )
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    phoneNumber: v.string(),
    insurance: v.string(),
    clientId: v.string(),
    nextQuarterlyReview: v.number(),
    nextAnnualAssessment: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("clients", {
      ...args,
      caseManagerId: userId,
      firstContactCompleted: false,
      secondContactCompleted: false,
      archived: false,
    });
  },
});

export const archive = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const client = await ctx.db.get(args.id);
    if (!client || client.caseManagerId !== userId) {
      throw new Error("Client not found");
    }

    await ctx.db.patch(args.id, { archived: true });
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("clients"),
    field: v.union(
      v.literal("name"),
      v.literal("phoneNumber"),
      v.literal("insurance"),
      v.literal("clientId"),
      v.literal("firstContactCompleted"),
      v.literal("secondContactCompleted"),
      v.literal("lastContactDate"),
      v.literal("lastFaceToFaceDate"),
      v.literal("nextQuarterlyReview"),
      v.literal("nextAnnualAssessment"),
      v.literal("lastQRCompleted"),
      v.literal("lastAnnualCompleted"),
      v.literal("qr1Completed"),
      v.literal("qr2Completed"),
      v.literal("qr3Completed"),
      v.literal("qr4Completed")
    ),
    value: v.union(v.string(), v.number(), v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const client = await ctx.db.get(args.id);
    if (!client || client.caseManagerId !== userId) {
      throw new Error("Client not found");
    }

    await ctx.db.patch(args.id, { [args.field]: args.value });
  },
});
