import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3">
        <form onSubmit={handleAddNote} className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add new note"
            className="min-h-[60px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote(e);
              }
            }}
          />
          <Button type="submit" size="sm" className="w-full h-7 text-xs">
            Add Note
          </Button>
        </form>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes.map((note) => (
            <div key={note._id} className="bg-muted/50 p-2 rounded-sm">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm flex-grow">{note.text}</p>
                <Button
                  onClick={() => deleteNote({ id: note._id })}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(note.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 