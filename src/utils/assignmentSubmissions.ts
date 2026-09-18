export interface ActivitySubmission {
  id: string;
  assignmentId: string;
  courseId: string;
  courseName: string;
  title?: string;
  studentEmail?: string;
  studentName?: string;
  studentMatricula?: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string;
  textContent?: string;
  submittedAt: string;
  feedback?: string;
  status: "submetido" | "avaliado" | "rascunho" | "submitted";
  grade?: string;
}

const STORAGE_KEY = "brain_studio_activity_submissions";

export function loadSubmissions(courseId?: string): ActivitySubmission[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const list: ActivitySubmission[] = JSON.parse(saved);
      if (courseId) {
        return list.filter((s) => s.courseId === courseId);
      }
      return list;
    }
  } catch (e) {
    console.warn("loadSubmissions error:", e);
  }
  return [];
}

export function saveSubmission(submission: ActivitySubmission): void {
  try {
    const current = loadSubmissions();
    const filtered = current.filter((s) => s.id !== submission.id);
    filtered.unshift(submission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("saveSubmission error:", e);
  }
}

export function removeSubmission(submissionId: string): void {
  try {
    const current = loadSubmissions();
    const filtered = current.filter((s) => s.id !== submissionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("removeSubmission error:", e);
  }
}
