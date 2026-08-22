"use client";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useDeadlines } from "@/hooks/useDeadlines";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { TaskModal } from "@/components/modules/tasks/TaskModal";
import { DeadlineModal } from "@/components/modules/tasks/DeadlineModal";
import { useUIStore } from "@/store/uiStore";
import { formatDate } from "@/lib/utils/dates";
import { CheckCircle2, Circle, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import type { Task, Deadline } from "@/lib/types";

interface TasksTabProps { applicationId: string; }

export function TasksTab({ applicationId }: TasksTabProps) {
  const { tasks, isLoading: loadingTasks, mutate: mutateTasks } = useTasks(applicationId);
  const { deadlines, isLoading: loadingDeadlines, mutate: mutateDeadlines } = useDeadlines(applicationId);
  const { openConfirmDialog } = useUIStore();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | undefined>(undefined);

  const cycleStatus = async (task: Task) => {
    const next = task.status === "pending" ? "in_progress" : task.status === "in_progress" ? "completed" : "pending";
    await fetch(`/api/v1/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    mutateTasks();
  };

  const deleteTask = (task: Task) => {
    openConfirmDialog({
      title: "Delete Task",
      description: `Delete "${task.title}"? This cannot be undone.`,
      onConfirm: async () => {
        await fetch(`/api/v1/tasks/${task.id}`, { method: "DELETE" });
        mutateTasks();
      },
    });
  };

  const deleteDeadline = (deadline: Deadline) => {
    openConfirmDialog({
      title: "Delete Deadline",
      description: `Delete "${deadline.label}"? This cannot be undone.`,
      onConfirm: async () => {
        await fetch(`/api/v1/deadlines/${deadline.id}`, { method: "DELETE" });
        mutateDeadlines();
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Deadlines */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Deadlines</h3>
          <button
            onClick={() => { setEditingDeadline(undefined); setDeadlineModalOpen(true); }}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Deadline
          </button>
        </div>
        {loadingDeadlines ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
        ) : deadlines.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400 text-center">No deadlines set</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {deadlines.map((d) => (
              <li key={d.id} className="px-4 py-3 flex items-center gap-3 group">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { setEditingDeadline(d); setDeadlineModalOpen(true); }}
                >
                  <p className="text-sm font-medium text-gray-900">{d.label}</p>
                  <p className="text-xs text-gray-500">{d.type.replace("_", " ")} · {formatDate(d.date)}</p>
                </button>
                <UrgencyBadge date={d.date} />
                <button
                  onClick={() => deleteDeadline(d)}
                  className="p-1.5 rounded text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
          <button
            onClick={() => { setEditingTask(undefined); setTaskModalOpen(true); }}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
        {loadingTasks ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
        ) : tasks.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400 text-center">No tasks added</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <li key={task.id} className="px-4 py-3 flex items-center gap-3 group">
                <button onClick={() => cycleStatus(task)} className="shrink-0" title="Cycle status">
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : task.status === "in_progress" ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </button>
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { setEditingTask(task); setTaskModalOpen(true); }}
                >
                  <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-gray-400">{formatDate(task.due_date)}</p>
                  )}
                </button>
                {task.due_date && task.status !== "completed" && (
                  <UrgencyBadge date={task.due_date} />
                )}
                <button
                  onClick={() => deleteTask(task)}
                  className="p-1.5 rounded text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {taskModalOpen && (
        <TaskModal
          defaultApplicationId={applicationId}
          task={editingTask}
          onClose={() => setTaskModalOpen(false)}
          onSaved={mutateTasks}
        />
      )}
      {deadlineModalOpen && (
        <DeadlineModal
          defaultApplicationId={applicationId}
          deadline={editingDeadline}
          onClose={() => setDeadlineModalOpen(false)}
          onSaved={mutateDeadlines}
        />
      )}
    </div>
  );
}
