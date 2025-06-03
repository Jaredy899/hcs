import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface LastContactSectionProps {
  client: {
    _id: Id<"clients">;
    lastContactDate?: number;
    lastFaceToFaceDate?: number;
  };
}

export function LastContactSection({ client }: LastContactSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Last Contact</h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              const today = new Date();
              updateContact({
                id: client._id,
                field: "lastContactDate",
                value: today.getTime(),
              });
              const monthSelect = document.getElementById('lastContactMonth') as HTMLSelectElement;
              const daySelect = document.getElementById('lastContactDay') as HTMLSelectElement;
              if (monthSelect) monthSelect.value = (today.getMonth() + 1).toString();
              if (daySelect) daySelect.value = today.getDate().toString();
            }}
            className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Set to Today
          </button>
          <div className="flex gap-2">
            <select
              id="lastContactMonth"
              defaultValue={client.lastContactDate ? new Date(client.lastContactDate).getMonth() + 1 : new Date().getMonth() + 1}
              onChange={(e) => {
                const month = parseInt(e.target.value);
                const day = parseInt((document.getElementById('lastContactDay') as HTMLSelectElement)?.value || '1');
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastContactDate",
                  value: date.getTime(),
                });
              }}
              className="text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
            <select
              id="lastContactDay"
              defaultValue={client.lastContactDate ? new Date(client.lastContactDate).getDate() : new Date().getDate()}
              onChange={(e) => {
                const month = parseInt((document.getElementById('lastContactMonth') as HTMLSelectElement)?.value || '1');
                const day = parseInt(e.target.value);
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastContactDate",
                  value: date.getTime(),
                });
              }}
              className="text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          {client.lastContactDate
            ? new Date(client.lastContactDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : "No contact recorded"}
        </p>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">Last Face to Face</h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              const today = new Date();
              updateContact({
                id: client._id,
                field: "lastFaceToFaceDate",
                value: today.getTime(),
              });
              const monthSelect = document.getElementById('lastFaceToFaceMonth') as HTMLSelectElement;
              const daySelect = document.getElementById('lastFaceToFaceDay') as HTMLSelectElement;
              if (monthSelect) monthSelect.value = (today.getMonth() + 1).toString();
              if (daySelect) daySelect.value = today.getDate().toString();
            }}
            className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Set to Today
          </button>
          <div className="flex gap-2">
            <select
              id="lastFaceToFaceMonth"
              defaultValue={client.lastFaceToFaceDate ? new Date(client.lastFaceToFaceDate).getMonth() + 1 : new Date().getMonth() + 1}
              onChange={(e) => {
                const month = parseInt(e.target.value);
                const day = parseInt((document.getElementById('lastFaceToFaceDay') as HTMLSelectElement)?.value || '1');
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastFaceToFaceDate",
                  value: date.getTime(),
                });
              }}
              className="text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
            <select
              id="lastFaceToFaceDay"
              defaultValue={client.lastFaceToFaceDate ? new Date(client.lastFaceToFaceDate).getDate() : new Date().getDate()}
              onChange={(e) => {
                const month = parseInt((document.getElementById('lastFaceToFaceMonth') as HTMLSelectElement)?.value || '1');
                const day = parseInt(e.target.value);
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastFaceToFaceDate",
                  value: date.getTime(),
                });
              }}
              className="text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          {client.lastFaceToFaceDate
            ? new Date(client.lastFaceToFaceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : "No face to face recorded"}
        </p>
        {client.lastFaceToFaceDate && (
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Next face to face due: {new Date(client.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
} 