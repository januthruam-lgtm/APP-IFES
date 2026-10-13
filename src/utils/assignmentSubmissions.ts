export interface ActivitySubmission {
  id: string;
  assignmentId: string;
  courseId: string;
  courseName: string;
  studentEmail: string;
  studentName?: string;
  studentMatricula?: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string;
  textContent?: string;
  notes?: string;
  submittedAt: string;
  status?: "submitted" | "graded" | "pending";
  grade?: string | number;
  feedback?: string;
}

const STORAGE_KEY = "brain_studio_activity_submissions";

export function loadSubmissions(): ActivitySubmission[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load submissions:", e);
  }
  return [];
}

export function saveSubmission(submission: ActivitySubmission): void {
  try {
    const current = loadSubmissions();
    const updated = [submission, ...current.filter((s) => s.assignmentId !== submission.assignmentId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    fetch("/api/activities/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    }).catch(() => {});
  } catch (e) {
    console.warn("Failed to save submission:", e);
  }
}

export function removeSubmission(assignmentId: string): void {
  try {
    const current = loadSubmissions();
    const updated = current.filter((s) => s.assignmentId !== assignmentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    fetch(`/api/activities/submissions/${assignmentId}`, {
      method: "DELETE",
    }).catch(() => {});
  } catch (e) {
    console.warn("Failed to remove submission:", e);
  }
}
