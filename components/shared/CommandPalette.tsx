"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useComposeStore } from "@/store/composeStore";
import { Search, Plus, Mail, BookOpen, Clock, FileText, CheckSquare, Users } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { openCompose } = useComposeStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm px-4">
      <div 
        className="absolute inset-0" 
        onClick={() => setOpen(false)} 
      />
      <Command 
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
      >
        <div className="flex items-center px-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
          <Command.Input 
            autoFocus
            placeholder="Type a command or search..."
            className="w-full py-4 text-sm bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1 ml-2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded border border-gray-200">ESC</kbd>
          </div>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Quick Actions" className="text-xs font-semibold text-gray-500 px-2 py-1.5">
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/tasks?new=true"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Create Task</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/applications/new"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
            >
              <BookOpen className="w-4 h-4" />
              <span>New Application</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => openCompose())}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
            >
              <Mail className="w-4 h-4" />
              <span>Compose Email</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/supervisors/new"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
            >
              <Users className="w-4 h-4" />
              <span>Add Supervisor</span>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px bg-gray-100 my-1 mx-2" />

          <Command.Group heading="Navigation" className="text-xs font-semibold text-gray-500 px-2 py-1.5">
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-gray-100"
            >
              <Search className="w-4 h-4" />
              <span>Dashboard</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/applications"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-gray-100"
            >
              <BookOpen className="w-4 h-4" />
              <span>Applications</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/tasks"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-gray-100"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks & Deadlines</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/supervisors"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-gray-100"
            >
              <Users className="w-4 h-4" />
              <span>Supervisors</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/documents"))}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer aria-selected:bg-gray-100"
            >
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
