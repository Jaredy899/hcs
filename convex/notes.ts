import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getCurrentUserId, getCurrentUserIdQuery } from "./auth";

const noteDoc = v.object({
  _id: v.id("notes"),
  _creationTime: v.number(),
  clientId: v.id("clients"),
  caseManagerId: v.id("users"),
  text: v.string(),
  createdAt: v.number(),
});

/** Assert the signed-in case manager wrote this note. */
async function assertOwnNote(ctx: MutationCtx, userId: Id<"users">, id: Id<"notes">) {
  const note = await ctx.db.get(id);
  if (!note) throw new Error("Note not found");
  if (note.caseManagerId !== userId) throw new Error("Not authorized to modify this note");
}

export const list = query({
  args: { clientId: v.id("clients") },
  returns: v.array(noteDoc),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdQuery(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("notes")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: { clientId: v.id("clients"), text: v.string() },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("notes", {
      clientId: args.clientId,
      caseManagerId: userId,
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await assertOwnNote(ctx, userId, args.id);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const update = mutation({
  args: { id: v.id("notes"), text: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await assertOwnNote(ctx, userId, args.id);
    await ctx.db.patch(args.id, { text: args.text });
    return null;
  },
});
