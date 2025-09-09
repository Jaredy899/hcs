import { useState, forwardRef, useEffect } from "react";
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

interface NotesSectionProps {
  clientId: Id<"clients">;
  isEditing?: boolean;
  showHotkeyHints?: boolean;
  addNoteTextareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export const NotesSection = forwardRef<HTMLDivElement, NotesSectionProps>(
  ({ clientId, isEditing = false, showHotkeyHints = false, addNoteTextareaRef }, ref) => {
  const notes = useQuery(api.notes.list, { clientId }) || [];
  const addNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);

  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<Id<"notes"> | null>(null);
  const [editText, setEditText] = useState("");
  const { focusedSection, selectedNoteId, setSelectedNoteId, setFocusedSection } = useSectionFocus();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await addNote({ clientId, text: newNote });
    setNewNote("");
    // Blur the textarea to allow hotkeys to work again
    addNoteTextareaRef?.current?.blur();
  };

  const startEditing = (note: { _id: Id<"notes">; text: string }) => {
    setEditingId(note._id);
    setEditText(note.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await updateNote({ id: editingId, text: editText });
    setEditingId(null);
    setEditText("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (notes.length === 0) return;

    // Only handle keyboard navigation when not editing and section is focused
    if (isEditing || editingId || focusedSection !== 'notes') return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (selectedNoteId) {
          const currentIndex = notes.findIndex(note => note._id === selectedNoteId);
          const newIndex = currentIndex <= 0 ? notes.length - 1 : currentIndex - 1;
          setSelectedNoteId(notes[newIndex]._id);
        } else {
          setSelectedNoteId(notes[0]._id);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (selectedNoteId) {
          const currentIndex = notes.findIndex(note => note._id === selectedNoteId);
          const newIndex = currentIndex >= notes.length - 1 ? 0 : currentIndex + 1;
          setSelectedNoteId(notes[newIndex]._id);
        } else {
          setSelectedNoteId(notes[0]._id);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedNoteId) {
          const selectedNote = notes.find(note => note._id === selectedNoteId);
          if (selectedNote) {
            startEditing(selectedNote);
          }
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        if (selectedNoteId) {
          const selectedNote = notes.find(note => note._id === selectedNoteId);
          if (selectedNote) {
            deleteNote({ id: selectedNote._id });
            // Move to next note or clear selection
            const currentIndex = notes.findIndex(note => note._id === selectedNoteId);
            if (currentIndex < notes.length - 1) {
              setSelectedNoteId(notes[currentIndex + 1]._id);
            } else if (notes.length > 1) {
              setSelectedNoteId(notes[currentIndex - 1]._id);
            } else {
              setSelectedNoteId(null);
            }
          }
        }
        break;
      case 'Escape':
        setSelectedNoteId(null);
        break;
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [notes, selectedNoteId, isEditing, editingId, focusedSection]);

  // Handle focus/blur events for the section
  const handleSectionFocus = () => {
    setFocusedSection('notes');
  };

  const handleSectionBlur = (e: React.FocusEvent) => {
    // Only blur if focus is moving outside the entire section
    if (ref && 'current' in ref && ref.current && !ref.current.contains(e.relatedTarget as Node)) {
      setFocusedSection(null);
    }
  };

  const handleSectionClick = () => {
    setFocusedSection('notes');
  };

  // Reset selection when notes change or selected note is deleted
  useEffect(() => {
    if (selectedNoteId && !notes.find(note => note._id === selectedNoteId)) {
      setSelectedNoteId(null);
    }
  }, [notes, selectedNoteId]);

  return (
    <Card
      ref={ref}
      className={focusedSection === 'notes' ? "ring-2 ring-primary/50" : ""}
      onFocus={handleSectionFocus}
      onBlur={handleSectionBlur}
      onClick={handleSectionClick}
      tabIndex={0}
    >
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">
          Notes {focusedSection === 'notes' && <span className="text-xs text-primary">(Active)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3">
        <form onSubmit={handleAddNote} className="space-y-2">
          <Textarea
            ref={addNoteTextareaRef}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add new note"
            className="min-h-[60px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote(e);
                // Blur the textarea to allow hotkeys to work again
                addNoteTextareaRef?.current?.blur();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                // Clear unsaved text and blur the textarea
                setNewNote("");
                addNoteTextareaRef?.current?.blur();
              }
            }}
            onBlur={() => {
              // Clear unsaved text when textarea loses focus
              setNewNote("");
            }}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full h-7 text-xs"
            title={`Add Note (${navigator.userAgent.toLowerCase().includes('mac') ? 'Ctrl+M' : 'Alt+M'})`}
          >
            Add Note
            <HotkeyHint hotkey="Ctrl+M" show={!isEditing && showHotkeyHints} />
          </Button>
        </form>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2 text-center">
              {`No notes yet. Add one above or press ${navigator.userAgent.toLowerCase().includes('mac') ? 'Ctrl+M' : 'Alt+M'}.`}
            </div>
          ) : (
            <>
              {notes.map((note) => {
                const isSelected = selectedNoteId === note._id;
                return (
                  <div
                    key={note._id}
                    className={cn(
                      "p-2 rounded-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted/70"
                    )}
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
                              saveEdit();
                            }
                            if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            onClick={saveEdit}
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm grow">{note.text}</p>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => startEditing(note)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-primary/10"
                              title="Edit Note (Enter when selected)"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => deleteNote({ id: note._id })}
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
                          {new Date(note.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
              {notes.length > 0 && (
                <div className="text-xs text-muted-foreground p-2 mt-2 border-t">
                  Use ↑↓ to select, Enter to edit, Delete to remove
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}); 