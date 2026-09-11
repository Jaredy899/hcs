import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Save, X } from "lucide-react";
import { HotkeyHint } from "./HotkeyHint";
import { cn } from "@/lib/utils";
import { useSectionFocus } from "../hooks/useSectionFocus";
import { useListNavigation } from "../hooks/useListNavigation";
import { getModifierKeyName } from "../hooks/useClientDetailsHotkeys";
import { formatShortDate } from "@/lib/dateUtils";

interface NotesSectionProps {
  clientId: Id<"clients">;
  isEditing?: boolean;
  showHotkeyHints?: boolean;
  addNoteTextareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function NotesSection({
  clientId,
  isEditing = false,
  showHotkeyHints = false,
  addNoteTextareaRef,
}: NotesSectionProps) {
  const notes = useQuery(api.notes.list, { clientId }) || [];
  const addNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);

  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<Id<"notes"> | null>(null);
  const [editText, setEditText] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const { focusedSection, setFocusedSection } = useSectionFocus();
  const modifierKey = getModifierKeyName();

  const startEditing = (note: { _id: Id<"notes">; text: string }) => {
    setEditingId(note._id);
    setEditText(note.text);
  };

  const { selectedId, setSelectedId } = useListNavigation({
    items: notes,
    enabled: !isEditing && !editingId,
    focusedSection,
    sectionName: 'notes',
    onDelete: (note) => void deleteNote({ id: note._id }),
    onEdit: startEditing,
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await addNote({ clientId, text: newNote });
    setNewNote("");
    addNoteTextareaRef?.current?.blur();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await updateNote({ id: editingId, text: editText });
    cancelEditing();
  };

  const handleSectionBlur = (e: React.FocusEvent) => {
    if (!cardRef.current?.contains(e.relatedTarget)) {
      setFocusedSection(null);
    }
  };

  return (
    <Card
      ref={cardRef}
      className={focusedSection === 'notes' ? "ring-2 ring-primary/50" : ""}
      onFocus={() => setFocusedSection('notes')}
      onBlur={handleSectionBlur}
      onClick={() => setFocusedSection('notes')}
      tabIndex={0}
    >
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">
          Notes {focusedSection === 'notes' && <span className="text-xs text-primary">(Active)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3">
        <form onSubmit={(e) => void handleAddNote(e)} className="space-y-2">
          <Textarea
            ref={addNoteTextareaRef}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add new note"
            className="min-h-[60px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleAddNote(e);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setNewNote("");
                e.currentTarget.blur();
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full h-7 text-xs"
            title={`Add Note (${modifierKey}+M)`}
          >
            Add Note
            <HotkeyHint hotkey={`${modifierKey}+M`} show={!isEditing && showHotkeyHints} />
          </Button>
        </form>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2 text-center">
              No notes yet. Add one above or press {modifierKey}+M.
            </div>
          ) : (
            <>
              {notes.map((note) => (
                <div
                  key={note._id}
                  className={cn(
                    "p-2 rounded-sm transition-colors",
                    selectedId === note._id
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/50 hover:bg-muted/70"
                  )}
                  onClick={() => setSelectedId(note._id)}
                >
                  {editingId === note._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[60px] resize-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void saveEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEditing();
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button onClick={() => void saveEdit()} size="sm" className="h-6 px-2 text-xs">
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button onClick={cancelEditing} variant="outline" size="sm" className="h-6 px-2 text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm grow whitespace-pre-wrap">{note.text}</p>
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(note);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                            title="Edit Note (Enter when selected)"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteNote({ id: note._id });
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive/10"
                            title="Delete Note (Delete/Backspace when selected)"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatShortDate(note.createdAt)}
                      </p>
                    </>
                  )}
                </div>
              ))}
              <div className="text-xs text-muted-foreground p-2 mt-2 border-t">
                Use ↑↓ to select, Enter to edit, Delete to remove
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
