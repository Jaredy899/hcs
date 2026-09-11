import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getCurrentUserId, getCurrentUserIdQuery } from "./auth";

const clientFields = {
  _id: v.id("clients"),
  _creationTime: v.number(),
  name: v.string(),
  phoneNumber: v.string(),
  insurance: v.string(),
  clientId: v.optional(v.string()),
  firstContactCompleted: v.boolean(),
  secondContactCompleted: v.boolean(),
  lastContactDate: v.optional(v.number()),
  lastFaceToFaceDate: v.optional(v.number()),
  nextQuarterlyReview: v.number(),
  nextAnnualAssessment: v.number(),
  lastQRCompleted: v.optional(v.number()),
  lastAnnualCompleted: v.optional(v.number()),
  qr1Completed: v.optional(v.boolean()),
  qr2Completed: v.optional(v.boolean()),
  qr3Completed: v.optional(v.boolean()),
  qr4Completed: v.optional(v.boolean()),
  qr1Date: v.optional(v.union(v.number(), v.null())),
  qr2Date: v.optional(v.union(v.number(), v.null())),
  qr3Date: v.optional(v.union(v.number(), v.null())),
  qr4Date: v.optional(v.union(v.number(), v.null())),
};

const assignedClient = v.object({ ...clientFields, assignedDate: v.number() });

/** Clients assigned to this case manager, filtered by archived state. */
async function listAssigned(ctx: QueryCtx, userId: Id<"users">, archived: boolean) {
  const assignments = await ctx.db
    .query("caseManagerClients")
    .withIndex("by_case_manager_and_archived", (q) =>
      q.eq("caseManagerId", userId).eq("archived", archived)
    )
    .collect();

  const clients = await Promise.all(
    assignments.map(async (assignment) => {
      const client = await ctx.db.get(assignment.clientId);
      return client && { ...client, assignedDate: assignment.assignedDate };
    })
  );

  return clients.filter((client): client is Doc<"clients"> & { assignedDate: number } => client !== null);
}

/**
 * Verify the signed-in case manager is actively assigned to this client and
 * return the assignment.
 */
async function getAssignment(ctx: MutationCtx, userId: Id<"users">, clientId: Id<"clients">) {
  const assignment = await ctx.db
    .query("caseManagerClients")
    .withIndex("by_case_manager_client", (q) =>
      q.eq("caseManagerId", userId).eq("clientId", clientId)
    )
    .first();

  if (!assignment) {
    throw new Error("Client not found or not accessible");
  }

  return assignment;
}

export const list = query({
  args: {},
  returns: v.array(assignedClient),
  handler: async (ctx) => {
    const userId = await getCurrentUserIdQuery(ctx);
    if (!userId) return [];

    return await listAssigned(ctx, userId, false);
  },
});

export const listArchived = query({
  args: {},
  returns: v.array(assignedClient),
  handler: async (ctx) => {
    const userId = await getCurrentUserIdQuery(ctx);
    if (!userId) return [];

    return await listAssigned(ctx, userId, true);
  },
});

export const getByClientId = query({
  args: { clientId: v.string() },
  returns: v.union(v.null(), v.object(clientFields)),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdQuery(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("clients")
      .withIndex("by_client_id", (q) => q.eq("clientId", args.clientId))
      .first();
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
  returns: v.id("clients"),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Reuse the existing client record when this Consumer ID is already known
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_client_id", (q) => q.eq("clientId", args.clientId))
      .first();

    const clientDbId =
      existingClient?._id ??
      (await ctx.db.insert("clients", {
        name: args.name,
        phoneNumber: args.phoneNumber,
        insurance: args.insurance,
        clientId: args.clientId,
        firstContactCompleted: false,
        secondContactCompleted: false,
        nextQuarterlyReview: args.nextQuarterlyReview,
        nextAnnualAssessment: args.nextAnnualAssessment,
        qr1Date: null,
        qr2Date: null,
        qr3Date: null,
        qr4Date: null,
      }));

    await assignToCaseManager(ctx, userId, clientDbId);

    return clientDbId;
  },
});

export const archive = mutation({
  args: { id: v.id("clients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Archive only this case manager's assignment, not the client record
    const assignment = await getAssignment(ctx, userId, args.id);
    await ctx.db.patch(assignment._id, { archived: true });
    return null;
  },
});

export const unarchive = mutation({
  args: { id: v.id("clients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const assignment = await getAssignment(ctx, userId, args.id);
    await ctx.db.patch(assignment._id, { archived: false });
    return null;
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("clients"),
    field: v.union(
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
    value: v.union(v.number(), v.boolean(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const assignment = await getAssignment(ctx, userId, args.id);
    if (assignment.archived) throw new Error("Client not found or not accessible");

    await ctx.db.patch(args.id, { [args.field]: args.value });
    return null;
  },
});

export const updateInfo = mutation({
  args: {
    id: v.id("clients"),
    name: v.string(),
    phoneNumber: v.string(),
    insurance: v.string(),
    clientId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const assignment = await getAssignment(ctx, userId, args.id);
    if (assignment.archived) throw new Error("Client not found or not accessible");

    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return null;
  },
});

/** Assign a client to a case manager, reviving an archived assignment if present. */
async function assignToCaseManager(ctx: MutationCtx, userId: Id<"users">, clientId: Id<"clients">) {
  const existing = await ctx.db
    .query("caseManagerClients")
    .withIndex("by_case_manager_client", (q) =>
      q.eq("caseManagerId", userId).eq("clientId", clientId)
    )
    .first();

  if (existing) {
    if (existing.archived) {
      await ctx.db.patch(existing._id, { archived: false });
    }
    return;
  }

  await ctx.db.insert("caseManagerClients", {
    caseManagerId: userId,
    clientId,
    archived: false,
    assignedDate: Date.now(),
  });
}

// Case management programs, highest priority first
const CASE_MANAGEMENT_PROGRAM_PRIORITY: Record<string, number> = {
  WCCSS: 4,
  "MH PSH CM": 3,
  BCSS: 2,
  "NAV CM": 1,
};

const programPriority = (program: string | undefined): number =>
  program ? (CASE_MANAGEMENT_PROGRAM_PRIORITY[program.trim()] ?? 0) : 0;

export const bulkImport = mutation({
  args: {
    clients: v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      preferredName: v.optional(v.string()),
      clientId: v.string(),
      phoneNumber: v.string(),
      insurance: v.string(),
      annualAssessmentDate: v.string(), // MM/DD/YYYY format (Plan End Date)
      planProgram: v.optional(v.string()), // Plan Program field
    })),
  },
  returns: v.array(v.id("clients")),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Keep one row per Consumer ID: case management programs only, highest
    // priority program wins, and the latest plan end date breaks ties.
    const clientMap = new Map<string, typeof args.clients[0]>();

    for (const client of args.clients) {
      const priority = programPriority(client.planProgram);
      if (priority === 0) continue;

      const existing = clientMap.get(client.clientId);
      if (!existing) {
        clientMap.set(client.clientId, client);
        continue;
      }

      const existingPriority = programPriority(existing.planProgram);
      if (priority > existingPriority) {
        clientMap.set(client.clientId, client);
      } else if (
        priority === existingPriority &&
        new Date(client.annualAssessmentDate) > new Date(existing.annualAssessmentDate)
      ) {
        clientMap.set(client.clientId, client);
      }
    }

    const results: Id<"clients">[] = [];
    for (const client of clientMap.values()) {
      const existingClient = await ctx.db
        .query("clients")
        .withIndex("by_client_id", (q) => q.eq("clientId", client.clientId))
        .first();

      let clientDbId = existingClient?._id;
      if (!clientDbId) {
        // Plan end dates arrive as MM/DD/YYYY. Store the 1st of that month at
        // noon UTC so the displayed month is timezone-independent.
        const [month, , year] = client.annualAssessmentDate.split("/").map(Number);
        const nextAnnualAssessment = Date.UTC(year, month - 1, 1, 12, 0, 0);

        clientDbId = await ctx.db.insert("clients", {
          name: client.preferredName
            ? `${client.firstName} (${client.preferredName}) ${client.lastName}`
            : `${client.firstName} ${client.lastName}`,
          phoneNumber: client.phoneNumber,
          insurance: client.insurance,
          clientId: client.clientId,
          firstContactCompleted: false,
          secondContactCompleted: false,
          nextQuarterlyReview: Date.now(),
          nextAnnualAssessment,
          qr1Date: null,
          qr2Date: null,
          qr3Date: null,
          qr4Date: null,
        });
      }

      await assignToCaseManager(ctx, userId, clientDbId);
      results.push(clientDbId);
    }

    console.log(
      `Imported ${results.length} case management clients from ${args.clients.length} CSV rows`
    );
    return results;
  },
});

export const resetMonthlyContacts = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    for (const client of clients) {
      await ctx.db.patch(client._id, {
        firstContactCompleted: false,
        secondContactCompleted: false,
      });
    }
    return null;
  },
});
