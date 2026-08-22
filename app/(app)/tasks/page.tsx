"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTasksOffline } from "@/hooks/useTasksOffline";
import { useDeadlines } from "@/hooks/useDeadlines";
import { PageHeader } from "@/components/shared/PageHeader";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { TaskModal } from "@/components/modules/tasks/TaskModal";
import { DeadlineModal } from "@/components/modules/tasks/DeadlineModal";
import { useUIStore } from "@/store/uiStore";
import { formatDate } from "@/lib/utils/dates";
import {
  CheckCircle2, Circle, Loader2, CheckSquare, Plus, Trash2, Clock,
  WifiOff, CloudOff,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Deadline } from "@/lib/types";
import type { Task } from "@/hooks/useTasksOffline";

function TasksContent() {
  const {
    tasks,
    isLoading: loadingTasks,
    isOnline,
    reload: mutateTasks,
    updateTask,
    deleteTask: deleteTaskFn,
  } = useTasksOffline();

  const { deadlines, isLoading: loadingDeadlines, mutate: mutateDeadlines } = useDeadlines();
  const { openConfirmDialog } = useUIStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | undefined>(undefined);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setTaskModalOpen(true);
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const cycleStatus = async (task: Task) => {
    const next =
      task.status === "pending"
        ? "in_progress"
        : task.status === "in_progress"
        ? "completed"
        : "pending";
    await updateTask(task.id, { status: next });
  };

  const deleteTask = (task: Task) => {
    openConfirmDialog({
      title: "Delete Task",
      description: `Delete "${task.title}"? This cannot be undone.`,
      onConfirm: async () => {
        await deleteTaskFn(task.id);
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

  const pending = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div>
      <PageHeader
        title="Tasks & Deadlines"
        description="All tasks and deadlines across your applications"
        action={
          <div className="flex items-center gap-2">
            {/* Offline indicator */}
            {!isOnline && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                <WifiOff className="w-3.5 h-3.5" />
                Offline — changes saved locally
              </div>
            )}
            <button
              onClick={() => { setEditingDeadline(undefined); setDeadlineModalOpen(true); }}
              disabled={!isOnline}
              title={!isOnline ? "Deadlines require an internet connection" : undefined}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Deadline
            </button>
            <button
              onClick={() => { setEditingTask(undefined); setTaskModalOpen(true); }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        }
      />


      {/* Deadlines */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Deadlines</h2>
        {!isOnline ? (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            Deadlines require an internet connection.
          </p>
        ) : loadingDeadlines ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
        ) : deadlines.length === 0 ? (
          <p className="text-sm text-gray-400">No deadlines set</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-50">
            {deadlines.map((d) => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between gap-3 group">
                <button
                  className="flex-1 text-left"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Pending Tasks ({pending.length})</h2>
        {loadingTasks ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-8 h-8" />}
            title="No pending tasks"
            description="All caught up!"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-50">
            {pending.map((task) => (
              <div key={task.id} className="px-4 py-3 flex items-center gap-3 group">
                <button onClick={() => cycleStatus(task)} className="shrink-0" title="Cycle status">
                  {task.status === "in_progress" ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500" />
                  )}
                </button>
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { setEditingTask(task as Task); setTaskModalOpen(true); }}
                >
                  <span className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  </span>
                  {task.due_date && <p className="text-xs text-gray-400">{formatDate(task.due_date)}</p>}
                </button>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === "high" ? "bg-red-100 text-red-700" :
                  task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {task.priority}
                </span>
                {task.status === "in_progress" && (
                  <span className="text-xs text-blue-500 font-medium">In Progress</span>
                )}
                {task.due_date && <UrgencyBadge date={task.due_date} />}
                <button
                  onClick={() => deleteTask(task as Task)}
                  className="p-1.5 rounded text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Completed ({completed.length})</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-50 opacity-60">
            {completed.slice(0, 5).map((task) => (
              <div key={task.id} className="px-4 py-3 flex items-center gap-3 group">
                <button onClick={() => cycleStatus(task)} className="shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </button>
                <p className="text-sm text-gray-500 line-through flex-1">{task.title}</p>
                <button
                  onClick={() => deleteTask(task as Task)}
                  className="p-1.5 rounded text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {taskModalOpen && (
        <TaskModal
          task={editingTask as Task}
          onClose={() => setTaskModalOpen(false)}
          onSaved={mutateTasks}
        />
      )}
      {deadlineModalOpen && (
        <DeadlineModal
          deadline={editingDeadline}
          onClose={() => setDeadlineModalOpen(false)}
          onSaved={mutateDeadlines}
        />
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <TasksContent />
    </Suspense>
  );
}
