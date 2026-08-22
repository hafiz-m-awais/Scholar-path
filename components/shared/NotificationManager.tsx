"use client";
import { useEffect } from "react";
import { useDeadlines } from "@/hooks/useDeadlines";

export function NotificationManager() {
  const { deadlines } = useDeadlines();

  useEffect(() => {
    // Request permission if not granted
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!deadlines || deadlines.length === 0) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const notifiedStr = localStorage.getItem("phdos_notified_deadlines");
    const notified = notifiedStr ? JSON.parse(notifiedStr) : {};
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    deadlines.forEach((deadline) => {
      const dDate = new Date(deadline.date);
      const diffTime = dDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Notify for 7 days, 3 days, 1 day before, and on the day (0)
      if (diffDays === 7 || diffDays === 3 || diffDays === 1 || diffDays === 0) {
        const notifyKey = `${deadline.id}_${diffDays}`;
        
        if (!notified[notifyKey]) {
          let body = `Deadline in ${diffDays} days`;
          if (diffDays === 0) body = "Deadline is TODAY!";
          else if (diffDays === 1) body = "Deadline is TOMORROW!";
          
          new Notification(`ScholarPath: ${deadline.label}`, {
            body,
            icon: "/favicon.ico",
          });
          
          notified[notifyKey] = true;
        }
      }
    });

    localStorage.setItem("scholarpath_notified_deadlines", JSON.stringify(notified));

  }, [deadlines]);

  return null;
}
