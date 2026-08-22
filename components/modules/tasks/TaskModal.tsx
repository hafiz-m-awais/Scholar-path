"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";
import { ApplicationSelect } from "@/components/modules/applications/ApplicationSelect";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { toInputDate } from "@/lib/utils/dates";

interface TaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  notes?: string;
}

interface TaskModalProps {
  defaultApplicationId?: string;
  task?: Task;
  onClose: () => void;
  onSaved: () => void;
}

export function TaskModal({ defaultApplicationId, task, onClose, onSaved }: TaskModalProps) {
  const [applicationId, setApplicationId] = useState(task?.application_id ?? defaultApplicationId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<TaskFormValues>({
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      status: task?.status ?? "pending",
      due_date: toInputDate(task?.due_date),
      notes: task?.notes ?? "",
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...values, application_id: applicationId || null };
      const res = task
        ? await fetch(`/api/v1/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/v1/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save task");
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              {...register("title", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Request recommendation letter"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Application</label>
            <ApplicationSelect value={applicationId} onChange={setApplicationId} allowNone />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                {...register("priority")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
            <input
              type="date"
              {...register("due_date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              {...register("description")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {task ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
