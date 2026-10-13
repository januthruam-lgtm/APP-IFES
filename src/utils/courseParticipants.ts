import { CourseTrack, IfesCourse, UserProfile } from "../types";

export interface CourseMember {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  isOnline: boolean;
  role: string;
  matricula: string;
  lastAccess: string;
  city?: string;
}

const GRADIENT_PALETTES = [
  "from-emerald-500 to-teal-700",
  "from-blue-500 to-indigo-700",
  "from-amber-500 to-orange-700",
  "from-purple-500 to-pink-700",
  "from-cyan-500 to-blue-700",
];

export function getCourseParticipants(
  course: CourseTrack | IfesCourse,
  user: UserProfile,
  serverList: CourseMember[] = []
): CourseMember[] {
  const currentUserName = user.name || "Estudante";
  const currentUserInitials = currentUserName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentUserMember: CourseMember = {
    id: user.email || user.name || "current-user",
    name: `${currentUserName} (Você)`,
    initials: currentUserInitials || "EU",
    avatarColor: "from-emerald-600 to-green-700",
    isOnline: true,
    role: "Estudante Regular",
    matricula: user.ifesAccount?.matricula || "20241IFES",
    lastAccess: "Online agora",
    city: user.ifesAccount?.campusName || "IFES",
  };

  // ONLY return REAL users from the server list, never mock/fictitious participants!
  if (serverList && serverList.length > 0) {
    const listWithoutSelf = serverList.filter(
      (m) =>
        m.id !== currentUserMember.id &&
        !m.name.includes("(Você)") &&
        m.name.toLowerCase() !== currentUserName.toLowerCase()
    );
    return [currentUserMember, ...listWithoutSelf];
  }

  return [currentUserMember];
}
