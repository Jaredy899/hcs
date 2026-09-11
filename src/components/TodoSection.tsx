import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { HotkeyHint } from "./HotkeyHint";
import { cn } from "@/lib/utils";
import { useSectionFocus } from "../hooks/useSectionFocus";
import { useListNavigation } from "../hooks/useListNavigation";
import { getModifierKeyName } from "../hooks/useClientDetailsHotkeys";
import { PendingChanges } from "../hooks/usePendingChanges";

interface TodoSectionProps {
  clientId: Id<"clients">;
  pendingChanges: PendingChanges;
  isEditing?: boolean;
  showHotkeyHints?: boolean;
  addTodoInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function TodoSection({
  clientId,
  pendingChanges,
  isEditing = false,
  showHotkeyHints = false,
  addTodoInputRef,
}: TodoSectionProps) {
  const todos = useQuery(api.todos.list, { clientId }) || [];
  const addTodo = useMutation(api.todos.create);
  const deleteTodo = useMutation(api.todos.remove);
  const [newTodo, setNewTodo] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const { focusedSection, setFocusedSection } = useSectionFocus();
  const modifierKey = getModifierKeyName();

  const { selectedId, setSelectedId } = useListNavigation({
    items: todos,
    enabled: !isEditing,
    focusedSection,
    sectionName: 'todo',
    onDelete: (todo) => void deleteTodo({ id: todo._id }),
    onToggle: (todo) => {
      const currentCompleted = pendingChanges.getTodoState(todo._id, todo.completed);
      pendingChanges.addTodoChange(todo._id, !currentCompleted);
    },
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodo({ clientId, text: newTodo });
    setNewTodo("");
    addTodoInputRef?.current?.blur();
  };

  const handleSectionBlur = (e: React.FocusEvent) => {
    if (!cardRef.current?.contains(e.relatedTarget)) {
      setFocusedSection(null);
    }
  };

  return (
    <Card
      ref={cardRef}
      className={focusedSection === 'todo' ? "ring-2 ring-primary/50" : ""}
      onFocus={() => setFocusedSection('todo')}
      onBlur={handleSectionBlur}
      onClick={() => setFocusedSection('todo')}
      tabIndex={0}
    >
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">
          Todo List {focusedSection === 'todo' && <span className="text-xs text-primary">(Active)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3">
        <form onSubmit={(e) => void handleAddTodo(e)} className="space-y-2">
          <Input
            ref={addTodoInputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new todo"
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setNewTodo("");
                e.currentTarget.blur();
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full h-7 text-xs"
            title={`Add Todo (${modifierKey}+N)`}
          >
            Add Todo
            <HotkeyHint hotkey={`${modifierKey}+N`} show={!isEditing && showHotkeyHints} />
          </Button>
        </form>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {todos.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2 text-center">
              No todos yet. Add one above or press {modifierKey}+N.
            </div>
          ) : (
            <>
              {todos.map((todo) => {
                const displayCompleted = pendingChanges.getTodoState(todo._id, todo.completed);
                return (
                  <div
                    key={todo._id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-sm transition-colors",
                      selectedId === todo._id
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted/70"
                    )}
                    onClick={() => setSelectedId(todo._id)}
                  >
                    <Checkbox
                      checked={displayCompleted}
                      onCheckedChange={() => pendingChanges.addTodoChange(todo._id, !displayCompleted)}
                    />
                    <span className={`grow text-sm ${displayCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {todo.text}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteTodo({ id: todo._id });
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      title="Delete Todo (Delete/Backspace when selected)"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
              <div className="text-xs text-muted-foreground p-2 mt-2 border-t">
                Use ↑↓ to select, Space to toggle, Delete to remove
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
