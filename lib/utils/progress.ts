import type { Application } from "@/lib/types";

export function calculateApplicationProgress(app: Application): number {
  if (!app) return 0;
  
  if (app.status === "accepted" || app.status === "rejected" || app.status === "withdrawn") {
    return 100;
  }
  
  let score = 0;
  let totalWeights = 100;
  
  // Base status points (max 60)
  switch (app.status) {
    case "researching": score += 10; break;
    case "preparing": score += 30; break;
    case "submitted": score += 60; break;
    case "interview": score += 80; break;
  }
  
  // Extra criteria
  if (app.status !== "interview" && app.status !== "submitted") {
    if (app.application_portal_url) score += 10;
    if (app.application_fee) score += 10;
    if (app.priority !== "low") score += 5;
    if (app.funding_type !== "unknown") score += 15;
  } else {
    // if submitted or interview, scale up to make it close to 100
    if (app.application_portal_url) score += 5;
    if (app.application_fee) score += 5;
  }
  
  return Math.min(Math.round(score), 95); // cap at 95% until accepted/rejected
}
