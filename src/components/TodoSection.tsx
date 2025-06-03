import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface TodoSectionProps {
  clientId: Id<"clients">;
}

export function TodoSection({ clientId }: TodoSectionProps) {
  const todos = useQuery(api.todos.list, { clientId }) || [];
  const addTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const deleteTodo = useMutation(api.todos.remove);

  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodo({ clientId, text: newTodo });
    setNewTodo("");
  };

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">Todo List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3">
        <form onSubmit={handleAddTodo} className="space-y-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new todo"
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" className="w-full h-7 text-xs">
            Add Todo
          </Button>
        </form>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {todos.map((todo) => (
            <div key={todo._id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo({ id: todo._id })}
              />
              <span className={`flex-grow text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.text}
              </span>
              <Button
                onClick={() => deleteTodo({ id: todo._id })}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 