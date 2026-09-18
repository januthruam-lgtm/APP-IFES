export interface CourseMember {
  id: string;
  name: string;
  role: "aluno" | "professor" | "tutor";
  isOnline: boolean;
  avatar?: string;
  avatarColor?: string;
  initials?: string;
  matricula?: string;
  lastActive?: string;
  lastAccess?: string;
}

export function getCourseParticipants(courseOrId: any, user?: any, extraList: any[] = []): CourseMember[] {
  const courseId = typeof courseOrId === "string" ? courseOrId : courseOrId?.id || "curso";

  const defaultList: CourseMember[] = [
    {
      id: `prof-${courseId}`,
      name: "Docente Titular (IFES)",
      role: "professor",
      isOnline: true,
      lastActive: "Agora",
      lastAccess: "Hoje às 08:30",
      avatarColor: "#22c55e",
      initials: "DT",
      matricula: "20180IFES012",
    },
    {
      id: "student-1",
      name: "Lucas Mendes",
      role: "aluno",
      isOnline: true,
      lastActive: "Há 2 min",
      lastAccess: "Há 2 minutos",
      avatarColor: "#3b82f6",
      initials: "LM",
      matricula: "20231TI0041",
    },
    {
      id: "student-2",
      name: "Mariana Costa",
      role: "aluno",
      isOnline: false,
      lastActive: "Hoje às 10:30",
      lastAccess: "Hoje às 10:30",
      avatarColor: "#ec4899",
      initials: "MC",
      matricula: "20231TI0055",
    },
    {
      id: "student-3",
      name: "Gabriel Silva",
      role: "aluno",
      isOnline: true,
      lastActive: "Agora",
      lastAccess: "Agora",
      avatarColor: "#f59e0b",
      initials: "GS",
      matricula: "20241TI0089",
    },
  ];

  if (extraList && extraList.length > 0) {
    return [...defaultList, ...extraList];
  }
  return defaultList;
}
