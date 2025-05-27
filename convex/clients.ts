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
      qr1Date: null,
      qr2Date: null,
      qr3Date: null,
      qr4Date: null,
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
      v.literal("qr4Completed"),
      v.literal("qr1Date"),
      v.literal("qr2Date"),
      v.literal("qr3Date"),
      v.literal("qr4Date")
    ),
    value: v.union(v.string(), v.number(), v.boolean(), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const client = await ctx.db.get(args.id);
    if (!client || client.caseManagerId !== userId) {
      throw new Error("Client not found");
    }

    if (args.value === undefined) {
      // Remove the field if value is undefined
      const { [args.field]: _, ...rest } = client;
      await ctx.db.patch(args.id, rest);
    } else {
      await ctx.db.patch(args.id, { [args.field]: args.value });
    }
  },
});

export const bulkImport = mutation({
  args: {
    clients: v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      preferredName: v.optional(v.string()),
      clientId: v.string(),
      phoneNumber: v.string(),
      insurance: v.string(),
      annualAssessmentDate: v.string(), // MM/DD/YYYY format
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const results = [];
    for (const client of args.clients) {
      // Parse the annual assessment date from MM/DD/YYYY format
      const [month, day, year] = client.annualAssessmentDate.split('/').map(Number);
      console.log('Parsed date:', { month, day, year, original: client.annualAssessmentDate });
      
      // Set the date to the first of the month at noon UTC to avoid timezone issues
      // Note: JavaScript months are 0-based, so we subtract 1 from the month
      const annualAssessmentDate = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)).getTime();
      console.log('Created date:', new Date(annualAssessmentDate).toLocaleDateString());
      
      // Create the client record
      const clientId = await ctx.db.insert("clients", {
        name: client.preferredName 
          ? `${client.firstName} (${client.preferredName}) ${client.lastName}`
          : `${client.firstName} ${client.lastName}`,
        caseManagerId: userId,
        phoneNumber: client.phoneNumber,
        insurance: client.insurance,
        clientId: client.clientId,
        firstContactCompleted: false,
        secondContactCompleted: false,
        archived: false,
        nextQuarterlyReview: Date.now(),
        nextAnnualAssessment: annualAssessmentDate,
        qr1Date: null,
        qr2Date: null,
        qr3Date: null,
        qr4Date: null,
      });
      
      results.push(clientId);
    }
    
    return results;
  },
});
