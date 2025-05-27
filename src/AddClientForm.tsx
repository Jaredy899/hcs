import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ImportClientsForm } from "./ImportClientsForm";

function getQuarterlyReviewDates(annualAssessmentDate: number) {
  const date = new Date(annualAssessmentDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Calculate the dates for each quarter
  // Q1: 3 months after annual assessment
  // Q2: 6 months after annual assessment
  // Q3: 9 months after annual assessment
  // Q4: Last day of the month before annual assessment
  const q1 = new Date(year, month + 3, day);
  const q2 = new Date(year, month + 6, day);
  const q3 = new Date(year, month + 9, day);
  
  // For Q4, we need to handle the end of the month before the annual assessment
  const q4Month = month === 0 ? 11 : month - 1;
  const q4Year = month === 0 ? year - 1 : year;
  const lastDay = new Date(q4Year, q4Month + 1, 0).getDate(); // Get last day of the month
  const q4 = new Date(q4Year, q4Month, lastDay);

  return [
    { label: "1st Quarter", date: q1 },
    { label: "2nd Quarter", date: q2 },
    { label: "3rd Quarter", date: q3 },
    { label: "4th Quarter", date: q4 }
  ];
}

export function AddClientForm({ onClose }: { onClose: () => void }) {
  const addClient = useMutation(api.clients.add);
  const [showImportForm, setShowImportForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    insurance: "",
    clientId: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const qrDates = getQuarterlyReviewDates(firstOfMonth.getTime());
    
    await addClient({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      insurance: formData.insurance,
      clientId: formData.clientId,
      nextQuarterlyReview: today.getTime(),
      nextAnnualAssessment: firstOfMonth.getTime()
    });

    setFormData({
      name: "",
      phoneNumber: "",
      insurance: "",
      clientId: ""
    });
    onClose();
  };

  if (showImportForm) {
    return <ImportClientsForm onClose={() => setShowImportForm(false)} />;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Consumer</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Import CSV
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Insurance
              </label>
              <input
                type="text"
                id="insurance"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Consumer ID
              </label>
              <input
                type="text"
                id="clientId"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            >
              Add Consumer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
