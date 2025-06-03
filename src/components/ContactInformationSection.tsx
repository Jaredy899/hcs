import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ContactInformationSectionProps {
  client: {
    _id: Id<"clients">;
    name?: string;
    phoneNumber?: string;
    insurance?: string;
    clientId?: string;
  };
}

export function ContactInformationSection({ client }: ContactInformationSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);
  
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editedContact, setEditedContact] = useState({
    name: "",
    phoneNumber: "",
    insurance: "",
    clientId: ""
  });

  // Sync local state with client changes
  useEffect(() => {
    if (client) {
      setEditedContact({
        name: client.name || "",
        phoneNumber: client.phoneNumber || "",
        insurance: client.insurance || "",
        clientId: client.clientId || ""
      });
    }
  }, [client]);

  const handleSaveContact = async () => {
    try {
      await Promise.all([
        updateContact({ id: client._id, field: "name", value: editedContact.name }),
        updateContact({ id: client._id, field: "phoneNumber", value: editedContact.phoneNumber }),
        updateContact({ id: client._id, field: "insurance", value: editedContact.insurance }),
        updateContact({ id: client._id, field: "clientId", value: editedContact.clientId })
      ]);
      setIsEditingContact(false);
      toast.success("Contact information updated");
    } catch (error) {
      toast.error("Failed to update contact information");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingContact(false);
    if (client) {
      setEditedContact({
        name: client.name || "",
        phoneNumber: client.phoneNumber || "",
        insurance: client.insurance || "",
        clientId: client.clientId || ""
      });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
        {!isEditingContact ? (
          <button
            onClick={() => setIsEditingContact(true)}
            className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveContact}
              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {isEditingContact ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={editedContact.name}
                onChange={(e) => setEditedContact(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={editedContact.phoneNumber}
                onChange={(e) => setEditedContact(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance</label>
              <input
                type="text"
                value={editedContact.insurance}
                onChange={(e) => setEditedContact(prev => ({ ...prev, insurance: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
              <input
                type="text"
                value={editedContact.clientId}
                onChange={(e) => setEditedContact(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
              <p className="text-gray-900 dark:text-gray-100">{client.phoneNumber || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance</p>
              <p className="text-gray-900 dark:text-gray-100">{client.insurance || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Client ID</p>
              <p className="text-gray-900 dark:text-gray-100">{client.clientId || "Not provided"}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 