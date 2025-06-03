import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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
  );
} 