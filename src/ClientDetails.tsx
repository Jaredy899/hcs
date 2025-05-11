import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

function getQuarterlyReviewDates(annualAssessmentDate: number) {
  const date = new Date(annualAssessmentDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Calculate the dates for each quarter (3 months after annual assessment)
  const q1 = new Date(year, (month + 3) % 12, 1);
  const q2 = new Date(year, (month + 6) % 12, 1);
  const q3 = new Date(year, (month + 9) % 12, 1);
  
  // For Q4, we need to handle the end of the month before the annual assessment
  // If annual assessment is in January (0), Q4 should be in December (11) of previous year
  const q4Month = month === 0 ? 11 : month - 1;
  const q4Year = month === 0 ? year - 1 : year;
  const lastDay = new Date(q4Year, q4Month + 1, 0).getDate(); // Get last day of the month
  const q4 = new Date(q4Year, q4Month, lastDay);

  // Adjust years for quarters that cross into next year
  if (month + 3 >= 12) q1.setFullYear(year + 1);
  if (month + 6 >= 12) q2.setFullYear(year + 1);
  if (month + 9 >= 12) q3.setFullYear(year + 1);

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
    if (confirm("Are you sure you want to archive this client?")) {
      await archiveClient({ id: clientId });
      toast.success("Client archived");
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
          </div>
          <button
            onClick={handleArchive}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            Archive
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={client.name}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "name",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={client.phoneNumber}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "phoneNumber",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
                  <input
                    type="text"
                    value={client.insurance}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "insurance",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                  <input
                    type="text"
                    value={client.clientId}
                    onChange={(e) => updateContact({
                      id: clientId,
                      field: "clientId",
                      value: e.target.value,
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Important Dates</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Annual Assessment</p>
                  <div className="flex gap-2">
                    <select
                      id="annualAssessmentMonth"
                      defaultValue={new Date(client.nextAnnualAssessment).getMonth() + 1}
                      onChange={(e) => {
                        const month = parseInt(e.target.value);
                        const day = parseInt((document.getElementById('annualAssessmentDay') as HTMLSelectElement)?.value || '1');
                        const existingDate = new Date(client.nextAnnualAssessment);
                        const date = new Date(existingDate.getFullYear(), month - 1, day);
                        updateContact({
                          id: clientId,
                          field: "nextAnnualAssessment",
                          value: date.getTime(),
                        });
                        const qrDates = getQuarterlyReviewDates(date.getTime());
                        updateContact({
                          id: clientId,
                          field: "nextQuarterlyReview",
                          value: qrDates[0].date.getTime(),
                        });
                      }}
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                      id="annualAssessmentDay"
                      defaultValue={new Date(client.nextAnnualAssessment).getDate()}
                      onChange={(e) => {
                        const month = parseInt((document.getElementById('annualAssessmentMonth') as HTMLSelectElement)?.value || '1');
                        const day = parseInt(e.target.value);
                        const existingDate = new Date(client.nextAnnualAssessment);
                        const date = new Date(existingDate.getFullYear(), month - 1, day);
                        updateContact({
                          id: clientId,
                          field: "nextAnnualAssessment",
                          value: date.getTime(),
                        });
                        const qrDates = getQuarterlyReviewDates(date.getTime());
                        updateContact({
                          id: clientId,
                          field: "nextQuarterlyReview",
                          value: qrDates[0].date.getTime(),
                        });
                      }}
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Current: {new Date(client.nextAnnualAssessment).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">Quarterly Reviews</p>
                    <button
                      onClick={() => {
                        const qrDates = getQuarterlyReviewDates(client.nextAnnualAssessment);
                        updateContact({
                          id: clientId,
                          field: "nextQuarterlyReview",
                          value: qrDates[0].date.getTime(),
                        });
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Reset to Calculated Dates
                    </button>
                  </div>
                  <div className="space-y-2 bg-white rounded-md p-3">
                    {getQuarterlyReviewDates(client.nextAnnualAssessment).map((qr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 w-24">{qr.label}:</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={new Date(qr.date).getMonth() + 1}
                            onChange={(e) => {
                              const month = parseInt(e.target.value);
                              const day = new Date(qr.date).getDate();
                              const year = new Date(qr.date).getFullYear();
                              const newDate = new Date(year, month - 1, day);
                              updateContact({
                                id: clientId,
                                field: "nextQuarterlyReview",
                                value: newDate.getTime(),
                              });
                            }}
                            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                            value={new Date(qr.date).getDate()}
                            onChange={(e) => {
                              const month = new Date(qr.date).getMonth() + 1;
                              const day = parseInt(e.target.value);
                              const year = new Date(qr.date).getFullYear();
                              const newDate = new Date(year, month - 1, day);
                              updateContact({
                                id: clientId,
                                field: "nextQuarterlyReview",
                                value: newDate.getTime(),
                              });
                            }}
                            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Status</h3>
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
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">First Contact</span>
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
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">Second Contact</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Last Contact</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
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
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-900">
                  {client.lastContactDate
                    ? new Date(client.lastContactDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : "No contact recorded"}
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 mb-4 mt-6">Last Face to Face</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
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
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-900">
                  {client.lastFaceToFaceDate
                    ? new Date(client.lastFaceToFaceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : "No face to face recorded"}
                </p>
                {client.lastFaceToFaceDate && (
                  <p className="text-sm font-bold text-gray-900">
                    Next face to face due: {new Date(client.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Todo List</h3>
              <form onSubmit={handleAddTodo} className="mb-4">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add new todo"
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </form>
              <ul className="space-y-2">
                {todos.map((todo) => (
                  <li key={todo._id} className="flex items-center gap-3 bg-white p-3 rounded-md">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo({ id: todo._id })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`flex-grow ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
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

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
              <form onSubmit={handleAddNote} className="mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add new note"
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
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
                  <div key={note._id} className="bg-white p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-900">{note.text}</p>
                      <button
                        onClick={() => deleteNote({ id: note._id })}
                        className="text-red-600 hover:text-red-800 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
