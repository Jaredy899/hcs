import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getCurrentUserId, getCurrentUserIdQuery } from "./auth";

const todoDoc = v.object({
  _id: v.id("todos"),
  _creationTime: v.number(),
  clientId: v.id("clients"),
  caseManagerId: v.id("users"),
  text: v.string(),
  completed: v.boolean(),
  dueDate: v.optional(v.number()),
});

/** Load a todo, asserting the signed-in case manager owns it. */
async function getOwnTodo(ctx: MutationCtx, userId: Id<"users">, id: Id<"todos">): Promise<Doc<"todos">> {
  const todo = await ctx.db.get(id);
  if (!todo) throw new Error("Todo not found");
  if (todo.caseManagerId !== userId) throw new Error("Not authorized to modify this todo");
  return todo;
}

export const list = query({
  args: { clientId: v.id("clients") },
  returns: v.array(todoDoc),
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
  returns: v.id("todos"),
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
  args: {
    id: v.id("todos"),
    completed: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const todo = await getOwnTodo(ctx, userId, args.id);
    await ctx.db.patch(args.id, { completed: args.completed ?? !todo.completed });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await getOwnTodo(ctx, userId, args.id);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const getClientTodoCounts = query({
  args: {},
  returns: v.record(v.id("clients"), v.object({ total: v.number(), incomplete: v.number() })),
  handler: async (ctx) => {
    const userId = await getCurrentUserIdQuery(ctx);
    if (!userId) return {};

    const assignments = await ctx.db
      .query("caseManagerClients")
      .withIndex("by_case_manager_and_archived", (q) =>
        q.eq("caseManagerId", userId).eq("archived", false)
      )
      .collect();

    const counts = await Promise.all(
      assignments.map(async (assignment) => {
        const todos = await ctx.db
          .query("todos")
          .withIndex("by_client", (q) => q.eq("clientId", assignment.clientId))
          .collect();

        return [
          assignment.clientId,
          { total: todos.length, incomplete: todos.filter((todo) => !todo.completed).length },
        ] as const;
      })
    );

    return Object.fromEntries(counts);
  },
});
