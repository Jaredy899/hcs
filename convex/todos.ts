import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId, getCurrentUserIdQuery } from "./auth";

export const list = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdQuery(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("todos")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const create = mutation({
  args: { 
    clientId: v.id("clients"), 
    text: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("todos", {
      clientId: args.clientId,
      caseManagerId: userId,
      text: args.text,
      completed: false,
      dueDate: args.dueDate,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const todo = await ctx.db.get(args.id);
    if (!todo) throw new Error("Todo not found");
    
    // Only the case manager who created the todo can toggle it
    if (todo.caseManagerId !== userId) {
      throw new Error("Not authorized to modify this todo");
    }

    await ctx.db.patch(args.id, { completed: !todo.completed });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const todo = await ctx.db.get(args.id);
    if (!todo) throw new Error("Todo not found");
    
    // Only the case manager who created the todo can delete it
    if (todo.caseManagerId !== userId) {
      throw new Error("Not authorized to delete this todo");
    }

    await ctx.db.delete(args.id);
  },
});
