/**
 * hooks/useTasksOffline.ts
 * Cloud tasks hook: manages tasks via direct Supabase API routes.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  notes: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  due_date: string | null;
  application_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = Pick<Task, "title"> &
  Partial<Pick<Task, "description" | "priority" | "status" | "due_date" | "application_id">>;

// ── Main Hook ──────────────────────────────────────────────────────────────────

export function useTasksOffline(applicationId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const userIdRef = useRef<string | null>(null);

  // Track online status
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Get current user id
  const getUserId = useCallback(async (): Promise<string | null> => {
    if (userIdRef.current) return userIdRef.current;
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    userIdRef.current = user?.id ?? null;
    return userIdRef.current;
  }, []);

  // Load tasks from Supabase API
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) { setTasks([]); return; }

      const url = applicationId
        ? `/api/v1/tasks?application_id=${applicationId}`
        : "/api/v1/tasks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tasks");
      const { data } = await res.json();
      setTasks(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, getUserId]);

  // Create a task
  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task | null> => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Not authenticated");

      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const { data } = await res.json();
      const newTask: Task = data;
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create task");
      return null;
    }
  }, [getUserId]);

  // Update a task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const { data } = await res.json();
      const updated: Task = data;
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update task");
      return null;
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete task");
      return false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    error,
    isOnline,
    reload: loadTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
