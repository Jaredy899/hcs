import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ContactStatusSectionProps {
  client: {
    _id: Id<"clients">;
    firstContactCompleted?: boolean;
    secondContactCompleted?: boolean;
  };
}

export function ContactStatusSection({ client }: ContactStatusSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Status</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={client.firstContactCompleted}
            onChange={() =>
              updateContact({
                id: client._id,
                field: "firstContactCompleted",
                value: !client.firstContactCompleted,
              })
            }
            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
          />
          <span className="text-gray-700 dark:text-gray-300">First Contact</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={client.secondContactCompleted}
            onChange={() =>
              updateContact({
                id: client._id,
                field: "secondContactCompleted",
                value: !client.secondContactCompleted,
              })
            }
            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
          />
          <span className="text-gray-700 dark:text-gray-300">Second Contact</span>
        </label>
      </div>
    </div>
  );
} 