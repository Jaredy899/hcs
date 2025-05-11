import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function AddClientForm({ onClose }: { onClose: () => void }) {
  const addClient = useMutation(api.clients.add);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    insurance: "",
    clientId: "",
    nextQuarterlyReview: {
      month: new Date().getMonth() + 1,
      day: 1
    },
    nextAnnualAssessment: {
      month: new Date().getMonth() + 1,
      day: 1
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date();
      const qrDate = new Date(today.getFullYear(), formData.nextQuarterlyReview.month - 1, formData.nextQuarterlyReview.day);
      const annualDate = new Date(today.getFullYear(), formData.nextAnnualAssessment.month - 1, formData.nextAnnualAssessment.day);
      
      await addClient({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        insurance: formData.insurance,
        clientId: formData.clientId,
        nextQuarterlyReview: qrDate.getTime(),
        nextAnnualAssessment: annualDate.getTime(),
      });
      toast.success("Client added successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to add client");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold">Add New Client</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Insurance
            </label>
            <input
              type="text"
              required
              value={formData.insurance}
              onChange={(e) =>
                setFormData({ ...formData, insurance: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client ID
            </label>
            <input
              type="text"
              required
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Next Quarterly Review
            </label>
            <div className="flex gap-2 mt-1">
              <select
                value={formData.nextQuarterlyReview.month}
                onChange={(e) => setFormData({
                  ...formData,
                  nextQuarterlyReview: {
                    ...formData.nextQuarterlyReview,
                    month: parseInt(e.target.value)
                  }
                })}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                value={formData.nextQuarterlyReview.day}
                onChange={(e) => setFormData({
                  ...formData,
                  nextQuarterlyReview: {
                    ...formData.nextQuarterlyReview,
                    day: parseInt(e.target.value)
                  }
                })}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Next Annual Assessment
            </label>
            <div className="flex gap-2 mt-1">
              <select
                value={formData.nextAnnualAssessment.month}
                onChange={(e) => setFormData({
                  ...formData,
                  nextAnnualAssessment: {
                    ...formData.nextAnnualAssessment,
                    month: parseInt(e.target.value)
                  }
                })}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                value={formData.nextAnnualAssessment.day}
                onChange={(e) => setFormData({
                  ...formData,
                  nextAnnualAssessment: {
                    ...formData.nextAnnualAssessment,
                    day: parseInt(e.target.value)
                  }
                })}
                className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
          >
            Add Client
          </button>
        </form>
      </div>
    </div>
  );
}
