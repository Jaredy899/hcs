import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

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

export function ClientDetails({
  clientId,
  onClose,
}: {
  clientId: Id<"clients">;
  onClose: () => void;
}) {
  const client = useQuery(api.clients.list)?.find((c) => c._id === clientId);
  const todos = useQuery(api.todos.list, { clientId }) || [];
  const notes = useQuery(api.notes.list, { clientId }) || [];
  const updateContact = useMutation(api.clients.updateContact);
  const addTodo = useMutation(api.todos.add);
  const toggleTodo = useMutation(api.todos.toggle);
  const deleteTodo = useMutation(api.todos.remove);
  const addNote = useMutation(api.notes.add);
  const deleteNote = useMutation(api.notes.remove);
  const archiveClient = useMutation(api.clients.archive);

  const [newTodo, setNewTodo] = useState("");
  const [newNote, setNewNote] = useState("");
  const [annualMonth, setAnnualMonth] = useState(() => {
    if (client?.nextAnnualAssessment) {
      return new Date(client.nextAnnualAssessment).getMonth() + 1;
    }
    return new Date().getMonth() + 1;
  });
  const [annualDay, setAnnualDay] = useState(() => {
    if (client?.nextAnnualAssessment) {
      return new Date(client.nextAnnualAssessment).getDate();
    }
    return 1;
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  if (!client) return null;

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodo({ clientId, text: newTodo });
    setNewTodo("");
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await addNote({ clientId, text: newNote });
    setNewNote("");
  };

  const handleArchive = async () => {
    if (confirm("Are you sure you want to archive this consumer?")) {
      await archiveClient({ id: clientId });
      toast.success("Consumer archived");
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{client.name}</h2>
          </div>
          <button
            onClick={handleArchive}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            Archive
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={client.name}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "name",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={client.phoneNumber}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "phoneNumber",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance</label>
                  <input
                    type="text"
                    value={client.insurance}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "insurance",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consumer ID</label>
                  <input
                    type="text"
                    value={client.clientId}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "clientId",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Important Dates</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Annual Assessment Date</label>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={annualMonth}
                      onChange={(e) => {
                        const newMonth = parseInt(e.target.value);
                        setAnnualMonth(newMonth);
                        const annualDate = new Date(new Date().getFullYear(), newMonth - 1, annualDay);
                        updateContact({
                          id: clientId,
                          field: "nextAnnualAssessment",
                          value: annualDate.getTime(),
                        });
                        // Recalculate quarterly review dates
                        const qrDates = getQuarterlyReviewDates(annualDate.getTime());
                        updateContact({
                          id: clientId,
                          field: "nextQuarterlyReview",
                          value: qrDates[0].date.getTime(),
                        });
                      }}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Month</option>
                      {months.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={annualDay}
                      onChange={(e) => {
                        const newDay = parseInt(e.target.value);
                        setAnnualDay(newDay);
                        const annualDate = new Date(new Date().getFullYear(), annualMonth - 1, newDay);
                        updateContact({
                          id: clientId,
                          field: "nextAnnualAssessment",
                          value: annualDate.getTime(),
                        });
                      }}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quarterly Reviews</p>
                    <button
                      onClick={() => {
                        // First, get the current annual assessment date
                        const annualDate = new Date(client.nextAnnualAssessment);
                        // Recalculate all quarterly review dates
                        const qrDates = getQuarterlyReviewDates(annualDate.getTime());
                        
                        // Update each quarter's date to match the calculated date
                        updateContact({
                          id: clientId,
                          field: "qr1Date",
                          value: qrDates[0].date.getTime(),
                        });
                        updateContact({
                          id: clientId,
                          field: "qr2Date",
                          value: qrDates[1].date.getTime(),
                        });
                        updateContact({
                          id: clientId,
                          field: "qr3Date",
                          value: qrDates[2].date.getTime(),
                        });
                        updateContact({
                          id: clientId,
                          field: "qr4Date",
                          value: qrDates[3].date.getTime(),
                        });
                        
                        // Update the next quarterly review date to the first quarter's date
                        updateContact({
                          id: clientId,
                          field: "nextQuarterlyReview",
                          value: qrDates[0].date.getTime(),
                        });
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Reset to Calculated Dates
                    </button>
                  </div>
                  <div className="space-y-2 bg-white dark:bg-gray-800 rounded-md p-3">
                    {getQuarterlyReviewDates(client.nextAnnualAssessment).map((qr, index) => {
                      const qrField = `qr${index + 1}Completed` as "qr1Completed" | "qr2Completed" | "qr3Completed" | "qr4Completed";
                      const qrDateField = `qr${index + 1}Date` as "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date";
                      const calculatedDate = qr.date;
                      const customDate = client[qrDateField];
                      const displayDate = customDate && customDate !== null ? new Date(customDate) : calculatedDate;
                      
                      return (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">{qr.label}:</span>
                          <div className="flex items-center gap-1 flex-1">
                            <select
                              value={displayDate.getMonth() + 1}
                              onChange={(e) => {
                                const month = parseInt(e.target.value);
                                const day = displayDate.getDate();
                                const year = displayDate.getFullYear();
                                const newDate = new Date(year, month - 1, day);
                                updateContact({
                                  id: clientId,
                                  field: qrDateField,
                                  value: newDate.getTime(),
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
                              value={displayDate.getDate()}
                              onChange={(e) => {
                                const month = displayDate.getMonth() + 1;
                                const day = parseInt(e.target.value);
                                const year = displayDate.getFullYear();
                                const newDate = new Date(year, month - 1, day);
                                updateContact({
                                  id: clientId,
                                  field: qrDateField,
                                  value: newDate.getTime(),
                                });
                              }}
                              className="text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-16 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                            <label className="flex items-center gap-1 ml-1">
                              <input
                                type="checkbox"
                                checked={client[qrField] || false}
                                onChange={(e) => {
                                  updateContact({
                                    id: clientId,
                                    field: qrField,
                                    value: e.target.checked,
                                  });
                                }}
                                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Done</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Status</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={client.firstContactCompleted}
                    onChange={() =>
                      updateContact({
                        id: clientId,
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
                        id: clientId,
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Todo List</h3>
              <form onSubmit={handleAddTodo} className="mb-4">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add new todo"
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </form>
              <ul className="space-y-2">
                {todos.map((todo) => (
                  <li key={todo._id} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-md">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo({ id: todo._id })}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-700"
                    />
                    <span className={`flex-grow ${todo.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo({ id: todo._id })}
                      className="text-red-600 hover:text-red-800 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Notes</h3>
              <form onSubmit={handleAddNote} className="mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add new note"
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="w-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add Note
                </button>
              </form>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note._id} className="bg-white dark:bg-gray-800 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-900 dark:text-gray-100">{note.text}</p>
                      <button
                        onClick={() => deleteNote({ id: note._id })}
                        className="text-red-600 hover:text-red-800 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Last Contact</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      updateContact({
                        id: clientId,
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
                          id: clientId,
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
                          id: clientId,
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
                        id: clientId,
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
                          id: clientId,
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
                          id: clientId,
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
          </div>
        </div>
      </div>
    </div>
  );
}
