import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type ContactField =
  | "firstContactCompleted"
  | "secondContactCompleted"
  | "qr1Completed"
  | "qr2Completed"
  | "qr3Completed"
  | "qr4Completed";

export type DateField =
  | "lastContactDate"
  | "lastFaceToFaceDate"
  | "nextAnnualAssessment"
  | "qr1Date"
  | "qr2Date"
  | "qr3Date"
  | "qr4Date";

type PendingChange =
  | { type: "todo"; id: Id<"todos">; completed: boolean }
  | { type: "contact"; clientId: Id<"clients">; field: ContactField; value: boolean }
  | { type: "date"; clientId: Id<"clients">; field: DateField; value: number };

/** One pending change per target, so re-editing the same field replaces the previous value. */
function changeKey(change: PendingChange): string {
  return change.type === "todo"
    ? `todo:${change.id}`
    : `${change.type}:${change.clientId}:${change.field}`;
}

export function usePendingChanges() {
  const [changes, setChanges] = useState<Record<string, PendingChange>>({});
  const toggleTodo = useMutation(api.todos.toggle);
  const updateContact = useMutation(api.clients.updateContact);

  return useMemo(() => {
    const add = (change: PendingChange) =>
      setChanges((prev) => ({ ...prev, [changeKey(change)]: change }));

    return {
      addTodoChange: (id: Id<"todos">, completed: boolean) =>
        add({ type: "todo", id, completed }),

      addContactChange: (clientId: Id<"clients">, field: ContactField, value: boolean) =>
        add({ type: "contact", clientId, field, value }),

      addDateChange: (clientId: Id<"clients">, field: DateField, value: number) =>
        add({ type: "date", clientId, field, value }),

      getTodoState: (id: Id<"todos">, originalCompleted: boolean) => {
        const change = changes[`todo:${id}`];
        return change?.type === "todo" ? change.completed : originalCompleted;
      },

      getContactState: (clientId: Id<"clients">, field: ContactField, originalValue: boolean) => {
        const change = changes[`contact:${clientId}:${field}`];
        return change?.type === "contact" ? change.value : originalValue;
      },

      getDateState: (clientId: Id<"clients">, field: DateField, originalValue: number | undefined) => {
        const change = changes[`date:${clientId}:${field}`];
        return change?.type === "date" ? change.value : originalValue;
      },

      syncChanges: async () => {
        // Sequential so a failure leaves the remaining changes pending for a retry.
        for (const change of Object.values(changes)) {
          try {
            if (change.type === "todo") {
              await toggleTodo({ id: change.id, completed: change.completed });
            } else {
              await updateContact({ id: change.clientId, field: change.field, value: change.value });
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to sync ${change.type} change: ${message}`, { cause: error });
          }
        }
        setChanges({});
      },

      clearChanges: () => setChanges({}),

      hasPendingChanges: Object.keys(changes).length > 0,
    };
  }, [changes, toggleTodo, updateContact]);
}

export type PendingChanges = ReturnType<typeof usePendingChanges>;
