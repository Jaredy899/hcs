import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface NotesSectionProps {
  clientId: Id<"clients">;
}

export function NotesSection({ clientId }: NotesSectionProps) {
  const notes = useQuery(api.notes.list, { clientId }) || [];
  const addNote = useMutation(api.notes.create);
  const deleteNote = useMutation(api.notes.remove);

  const [newNote, setNewNote] = useState("");

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await addNote({ clientId, text: newNote });
    setNewNote("");
  };

  return (
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
  );
} 