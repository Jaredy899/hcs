import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  clients: defineTable({
    name: v.string(),
    caseManagerId: v.id("users"),
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
    archived: v.boolean(),
  })
    .index("by_case_manager", ["caseManagerId"])
    .index("by_case_manager_and_archived", ["caseManagerId", "archived"]),

  todos: defineTable({
    clientId: v.id("clients"),
    caseManagerId: v.id("users"),
    text: v.string(),
    completed: v.boolean(),
    dueDate: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_case_manager", ["caseManagerId"]),

  notes: defineTable({
    clientId: v.id("clients"),
    caseManagerId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_client", ["clientId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
