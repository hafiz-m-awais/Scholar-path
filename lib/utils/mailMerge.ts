/**
 * Mail Merge / Variable Substitution Utility
 *
 * Replaces {{variable_name}} tokens in email subject and body with actual data.
 * Unknown tokens are left as-is so the user can see what wasn't resolved.
 */

export type MailMergeVariables = {
  supervisor_name?: string;
  professor_name?: string;
  university_name?: string;
  department?: string;
  program_name?: string;
  degree_type?: string;
  your_name?: string;
  your_email?: string;
  deadline?: string;
  today?: string;
  [key: string]: string | undefined;
};

/**
 * Resolves all {{variable}} tokens in a string.
 */
export function applyMerge(template: string, variables: MailMergeVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match; // Leave unresolved tokens as-is
  });
}

/**
 * Lists all unique {{variable}} tokens found in a string.
 */
export function extractTokens(template: string): string[] {
  const tokens = new Set<string>();
  const regex = /\{\{(\w+)\}\}/g;
  let match;
  while ((match = regex.exec(template)) !== null) {
    tokens.add(match[1]);
  }
  return Array.from(tokens);
}

/**
 * Highlights unresolved {{tokens}} in HTML with a yellow badge style.
 * Useful for previewing templates in the UI.
 */
export function highlightTokens(html: string): string {
  return html.replace(
    /\{\{(\w+)\}\}/g,
    `<mark style="background:#fef08a;color:#713f12;padding:0 3px;border-radius:3px;font-size:0.85em">{{$1}}</mark>`
  );
}

/**
 * Common variable tokens with human-readable labels.
 */
export const MERGE_VARIABLE_OPTIONS: { token: string; label: string; example: string }[] = [
  { token: "supervisor_name",  label: "Supervisor Name",  example: "Prof. Smith" },
  { token: "professor_name",   label: "Professor Name",   example: "Prof. Smith" },
  { token: "university_name",  label: "University Name",  example: "MIT" },
  { token: "department",       label: "Department",       example: "Computer Science" },
  { token: "program_name",     label: "Program Name",     example: "PhD in AI" },
  { token: "degree_type",      label: "Degree Type",      example: "PhD" },
  { token: "your_name",        label: "Your Name",        example: "John Doe" },
  { token: "your_email",       label: "Your Email",       example: "john@example.com" },
  { token: "deadline",         label: "Application Deadline", example: "Jan 15, 2026" },
  { token: "today",            label: "Today's Date",     example: "Aug 18, 2025" },
];
