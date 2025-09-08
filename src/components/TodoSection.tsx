import { useState, forwardRef, useEffect } from "react";
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

interface TodoSectionProps {
  clientId: Id<"clients">;
  pendingChanges: {
    addTodoChange: (id: Id<"todos">, completed: boolean) => void;
    getTodoState: (id: Id<"todos">, originalCompleted: boolean) => boolean;
  };
  isEditing?: boolean;
  addTodoInputRef?: React.RefObject<HTMLInputElement>;
}

export const TodoSection = forwardRef<HTMLDivElement, TodoSectionProps>(
  ({ clientId, pendingChanges, isEditing = false, addTodoInputRef }, ref) => {
  const todos = useQuery(api.todos.list, { clientId }) || [];
  const addTodo = useMutation(api.todos.create);
  const deleteTodo = useMutation(api.todos.remove);

  const [newTodo, setNewTodo] = useState("");
  const { focusedSection, selectedTodoId, setSelectedTodoId, setFocusedSection } = useSectionFocus();

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodo({ clientId, text: newTodo });
    setNewTodo("");
    // Blur the input to allow hotkeys to work again
    addTodoInputRef?.current?.blur();
  };

  const handleToggleTodo = (todoId: Id<"todos">, newCompleted: boolean) => {
    console.log('Setting todo completion:', { id: todoId, completed: newCompleted });
    pendingChanges.addTodoChange(todoId, newCompleted);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (todos.length === 0) return;

    // Only handle keyboard navigation when not editing and section is focused
    if (isEditing || focusedSection !== 'todo') return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (selectedTodoId) {
          const currentIndex = todos.findIndex(todo => todo._id === selectedTodoId);
          const newIndex = currentIndex <= 0 ? todos.length - 1 : currentIndex - 1;
          setSelectedTodoId(todos[newIndex]._id);
        } else {
          setSelectedTodoId(todos[0]._id);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (selectedTodoId) {
          const currentIndex = todos.findIndex(todo => todo._id === selectedTodoId);
          const newIndex = currentIndex >= todos.length - 1 ? 0 : currentIndex + 1;
          setSelectedTodoId(todos[newIndex]._id);
        } else {
          setSelectedTodoId(todos[0]._id);
        }
        break;
      case ' ':
        e.preventDefault();
        if (selectedTodoId) {
          const selectedTodo = todos.find(todo => todo._id === selectedTodoId);
          if (selectedTodo) {
            const currentCompleted = pendingChanges.getTodoState(selectedTodo._id, selectedTodo.completed);
            console.log('Toggling todo:', {
              id: selectedTodo._id,
              text: selectedTodo.text,
              originalCompleted: selectedTodo.completed,
              currentCompleted,
              newCompleted: !currentCompleted
            });
            handleToggleTodo(selectedTodo._id, !currentCompleted); // Pass the new state directly
          }
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        if (selectedTodoId) {
          const selectedTodo = todos.find(todo => todo._id === selectedTodoId);
          if (selectedTodo) {
            deleteTodo({ id: selectedTodo._id });
            // Move to next todo or clear selection
            const currentIndex = todos.findIndex(todo => todo._id === selectedTodoId);
            if (currentIndex < todos.length - 1) {
              setSelectedTodoId(todos[currentIndex + 1]._id);
            } else if (todos.length > 1) {
              setSelectedTodoId(todos[currentIndex - 1]._id);
            } else {
              setSelectedTodoId(null);
            }
          }
        }
        break;
      case 'Escape':
        setSelectedTodoId(null);
        break;
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [todos, selectedTodoId, isEditing, focusedSection]);

  // Handle focus/blur events for the section
  const handleSectionFocus = () => {
    setFocusedSection('todo');
  };

  const handleSectionBlur = (e: React.FocusEvent) => {
    // Only blur if focus is moving outside the entire section
    if (ref && 'current' in ref && ref.current && !ref.current.contains(e.relatedTarget as Node)) {
      setFocusedSection(null);
    }
  };

  const handleSectionClick = () => {
    setFocusedSection('todo');
  };

  // Reset selection when todos change or selected todo is deleted
  useEffect(() => {
    if (selectedTodoId && !todos.find(todo => todo._id === selectedTodoId)) {
      setSelectedTodoId(null);
    }
  }, [todos, selectedTodoId]);

  return (
    <Card
      ref={ref}
      className={focusedSection === 'todo' ? "ring-2 ring-primary/50" : ""}
      onFocus={handleSectionFocus}
      onBlur={handleSectionBlur}
      onClick={handleSectionClick}
      tabIndex={0}
    >
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">
          Todo List {focusedSection === 'todo' && <span className="text-xs text-primary">(Active)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3">
        <form onSubmit={handleAddTodo} className="space-y-2">
          <Input
            ref={addTodoInputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new todo"
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTodo(e);
                // Blur the input to allow hotkeys to work again
                addTodoInputRef?.current?.blur();
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full h-7 text-xs"
            title={`Add Todo (${navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Ctrl+N' : 'Alt+N'})`}
          >
            Add Todo
            <HotkeyHint hotkey="Ctrl+N" show={!isEditing} />
          </Button>
        </form>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {todos.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2 text-center">
              No todos yet. Add one above or press Ctrl+N.
            </div>
          ) : (
            <>
              {todos.map((todo) => {
                const displayCompleted = pendingChanges.getTodoState(todo._id, todo.completed);
                const isSelected = selectedTodoId === todo._id;
                return (
                  <div
                    key={todo._id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted/70"
                    )}
                  >
                    <Checkbox
                      checked={displayCompleted}
                      onCheckedChange={() => handleToggleTodo(todo._id, !displayCompleted)}
                    />
                    <span className={`grow text-sm ${displayCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {todo.text}
                    </span>
                    <Button
                      onClick={() => deleteTodo({ id: todo._id })}
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
              {todos.length > 0 && (
                <div className="text-xs text-muted-foreground p-2 mt-2 border-t">
                  Use ↑↓ to select, Space to toggle, Delete to remove
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}); 