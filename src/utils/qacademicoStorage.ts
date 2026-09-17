import {
  QAcademicoAccountInfo,
  QAcademicoGradeItem,
  QAcademicoScheduleItem,
  IfesCourse,
} from "../types";
import { saveSyncedCourses, saveSyncedSchedules } from "./courseSync";

const QACADEMICO_ACCOUNT_KEY = "brainstudio_qacademico_account_v1";
const QACADEMICO_GRADES_KEY = "brainstudio_qacademico_grades_v1";
const QACADEMICO_SCHEDULES_KEY = "brainstudio_qacademico_schedules_v1";

export const loadQAcademicoAccount = (): QAcademicoAccountInfo | null => {
  try {
    const raw = localStorage.getItem(QACADEMICO_ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveQAcademicoAccount = (account: QAcademicoAccountInfo | null): void => {
  try {
    if (account) {
      localStorage.setItem(QACADEMICO_ACCOUNT_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(QACADEMICO_ACCOUNT_KEY);
    }
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("brainstudio:qacademico-account-updated", { detail: { account } })
      );
    }, 0);
  } catch (e) {
    console.warn("Erro ao salvar conta do Q-Acadêmico:", e);
  }
};

export const loadQAcademicoGrades = (): QAcademicoGradeItem[] => {
  try {
    const raw = localStorage.getItem(QACADEMICO_GRADES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveQAcademicoGrades = (grades: QAcademicoGradeItem[]): void => {
  try {
    localStorage.setItem(QACADEMICO_GRADES_KEY, JSON.stringify(grades));
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("brainstudio:qacademico-grades-updated", { detail: { grades } })
      );
    }, 0);
  } catch (e) {
    console.warn("Erro ao salvar boletim do Q-Acadêmico:", e);
  }
};

export const loadQAcademicoSchedules = (): QAcademicoScheduleItem[] => {
  try {
    const raw = localStorage.getItem(QACADEMICO_SCHEDULES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveQAcademicoSchedules = (schedules: QAcademicoScheduleItem[]): void => {
  try {
    localStorage.setItem(QACADEMICO_SCHEDULES_KEY, JSON.stringify(schedules));
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("brainstudio:qacademico-schedules-updated", { detail: { schedules } })
      );
    }, 0);
  } catch (e) {
    console.warn("Erro ao salvar horários do Q-Acadêmico:", e);
  }
};

/**
 * Sincroniza e mescla as matérias do Q-Acadêmico com o repositório principal de cursos do Brain Studio
 */
export const syncQAcademicoCoursesToApp = (
  newCourses: IfesCourse[],
  schedules?: QAcademicoScheduleItem[]
): void => {
  if (newCourses.length > 0) {
    saveSyncedCourses(newCourses);
  }
  if (schedules && schedules.length > 0) {
    const mapped = schedules.map((s) => ({
      dayOfWeek: s.diaSemana,
      timeSlot: s.horario,
      courseName: s.disciplina,
      room: s.sala,
      professor: s.docente,
    }));
    saveSyncedSchedules(mapped);
  }
};

export const clearAllQAcademicoData = (): void => {
  try {
    localStorage.removeItem(QACADEMICO_ACCOUNT_KEY);
    localStorage.removeItem(QACADEMICO_GRADES_KEY);
    localStorage.removeItem(QACADEMICO_SCHEDULES_KEY);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("brainstudio:qacademico-account-updated", { detail: { account: null } })
      );
      window.dispatchEvent(
        new CustomEvent("brainstudio:qacademico-grades-updated", { detail: { grades: [] } })
      );
      window.dispatchEvent(
        new CustomEvent("brainstudio:qacademico-schedules-updated", { detail: { schedules: [] } })
      );
    }, 0);
  } catch (e) {
    console.warn("Erro ao limpar dados do Q-Acadêmico:", e);
  }
};
