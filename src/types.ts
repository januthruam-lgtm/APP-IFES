export type ThemeId =
  | "default"
  | "cyberpunk"
  | "solar"
  | "emerald"
  | "sunset"
  | "custom"
  | "paper"
  | "dark"
  | "nordic"
  | "cyber_green"
  | "paper_focus"
  | "sakura_warm"
  | "sunset_amber";

export type PetType =
  | "bunny"
  | "bird"
  | "elephant"
  | "tiger"
  | "custom"
  | "owl"
  | "coruja"
  | (string & {});

export interface PuppetRigPin {
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
  label: string;
}

export interface PuppetRigConfig {
  bodyRoot: { x: number; y: number };
  headPivot: { x: number; y: number };
  leftEarPivot: { x: number; y: number };
  rightEarPivot: { x: number; y: number };
  leftPawPivot: { x: number; y: number };
  rightPawPivot: { x: number; y: number };
  swayIntensity: number; // 0.5 to 2.5
  breatheIntensity: number; // 0.5 to 2.5
  earTwitchSpeed: number; // in seconds, e.g. 1.8s
  headTiltAngle: number; // in degrees, e.g. 3.5
  activeMotionPreset: "idle" | "studying" | "victory" | "eating" | "alert";
  rigProfile: "mammal" | "bird" | "biped" | "quadruped" | "robot";
}

export interface PetStageInfo {
  stageName: string;
  minLevel: number;
  perks: string[];
  auraColor: string;
  badge: string;
  avatarEmoji?: string;
  accessoryBadge?: string;
}

export interface UserPet {
  id?: string;
  activePetId?: string;
  type: PetType;
  name: string;
  level: number;
  exp: number;
  experience?: number;
  maxExp: number;
  happiness: number; // 0 - 100
  hunger: number; // 0 - 100 (100 = satisfeito)
  energy?: number; // 0 - 100
  totalMeals?: number;
  lastFedTimestamp?: string;
  lastFed?: string;
  unlockedPets: (PetType | string)[];
  customImageUrl?: string;
  customRigConfig?: PuppetRigConfig;
  customAccessory?: "glasses" | "cap" | "crown" | "aura" | "badge" | "none";
  customSpeciesName?: string;
  customSpeciesEmoji?: string;
}

export interface CustomThemeColors {
  id: string;
  name: string;
  bgMain?: string;
  bgPrimary: string;
  bgCard: string;
  bgCardSecondary?: string;
  bgCardHover: string;
  textPrimary: string;
  textMuted: string;
  colorPrimary: string;
  colorPrimaryHover: string;
  colorSuccess: string;
  colorAccent: string;
  borderColor: string;
  isDark?: boolean;
}

export interface IfesAccountInfo {
  connected: boolean;
  username: string;
  fullname: string;
  campusUrl: string;
  campusName: string;
  password?: string;
  token?: string;
  userPictureUrl?: string;
  lastSync: string;
  matricula?: string;
  email?: string;
  department?: string;
  city?: string;
  gradesSummary?: {
    totalDisciplinas: number;
    aprovadas: number;
    cursando: number;
    emExame: number;
    totalFaltas: number;
    mediaGeral: string;
    crOficial?: number;
    lastGradesSync?: string;
  };
  academicGrades?: QAcademicoGradeItem[];
  academicSchedules?: QAcademicoScheduleItem[];
}

export interface QAcademicoAccountInfo {
  connected: boolean;
  matricula: string;
  fullname?: string;
  curso?: string;
  campus?: string;
  campusUrl?: string;
  periodo?: string;
  coeficienteRendimento?: number; // CR Oficial (ex: 85.4)
  portalUrl: string; // https://academico.ifes.edu.br/qacademico/index.asp?t=2000
  lastSync: string;
  authMethod?: "direct_session" | "pasted_report" | "bookmarklet";
}

export interface QAcademicoEtapaGrade {
  etapa: string; // "1ª Etapa", "2ª Etapa", "3ª Etapa", "4ª Etapa", "Exame Final"
  rotulo?: string;
  nota?: number;
  notaMax?: number;
  faltas?: number;
}

export interface QAcademicoGradeItem {
  id: string;
  disciplina: string;
  codigo?: string;
  turma?: string;
  docente?: string;
  cargaHoraria?: number;
  aulasDadas?: number;
  faltas?: number;
  etapas: QAcademicoEtapaGrade[];
  mediaParcial?: number;
  exameFinal?: number;
  mediaFinal?: number;
  situacao: "Aprovado" | "Cursando" | "Reprovado" | "Em Exame" | "Cancelado";
}

export interface QAcademicoScheduleItem {
  id: string;
  diaSemana: string; // "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
  horario: string; // "07:00 - 08:40"
  disciplina: string;
  turma?: string;
  sala?: string;
  docente?: string;
}

export interface QAcademicoSyncData {
  account: QAcademicoAccountInfo;
  grades: QAcademicoGradeItem[];
  schedules: QAcademicoScheduleItem[];
  courses: IfesCourse[];
}

export interface CollectibleCard {
  id: string;
  name: string;
  emoji: string;
  rarity: "Comum" | "Rara" | "Épica" | "Lendária" | "Mítica";
  category: string;
  description: string;
  buffDescription: string;
  cardColor: string;
}

export interface UserProfile {
  id?: string;
  uid?: string;
  email: string;
  name: string;
  xp: number;
  coins: number; // Coins economy (🪙)
  level: number;
  energy: number; // Current energy
  maxEnergy: number; // Max energy (50 base, upgradable permanently)
  lastEnergyRecharge: string;
  streakDays: number;
  lastActiveDate: string;
  streakHistory?: { date: string; activitiesCount: number; xpGained: number }[];
  selectedCourseId: string;
  teamId: string | null;
  lastEnergyRequestDate?: string;
  activeTheme: ThemeId;
  unlockedThemes: ThemeId[];
  customColors?: CustomThemeColors;
  pet?: UserPet;
  unlockedCards?: string[]; // Collectible cards from chests
  equippedBadge: string;
  unlockedBadges: string[];
  completedModules: number[];
  ifesAccount?: IfesAccountInfo;
  qacademicoAccount?: QAcademicoAccountInfo;
  notificationPreferences?: StrictNotificationPreferences;
  stats: {
    socraticInteractions: number;
    quizzesAnswered: number;
    correctQuizzes: number;
    battlesWon: number;
    battlesTotal: number;
    flashcardsReviewed: number;
    energyDonated?: number;
  };
}

export interface SocraticMessage {
  id: string;
  role: "lumina" | "user" | "system";
  text: string;
  timestamp: string;
  topic?: string;
  courseId?: string;
}

export interface SavedSocraticChat {
  id: string;
  title: string;
  courseName: string;
  date: string;
  timestamp: number;
  messages: SocraticMessage[];
  summary?: string;
  keyLearnings?: string[];
  lastMessageSnippet?: string;
}

export interface SavedDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: "pdf" | "txt" | "syllabus" | "notes" | "image";
  uploadDate: string;
  timestamp: number;
  courseTag: string;
  textContent: string;
  summary?: string;
  generatedQuizzesCount?: number;
  tags?: string[];
  fileSizeFormatted?: string;
}

export interface LessonStep {
  id: string;
  title: string;
  conceptText: string;
  socraticPrompt: string;
  quizQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface TrackModule {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  status: "completed" | "active" | "locked";
  completed?: boolean;
  description?: string;
  xpReward: number;
  estimatedMinutes: number;
  summary: string;
  keyConcepts: string[];
  lessons: LessonStep[];
}

export interface CourseDefinition {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  color: string;
  accentBg: string;
  tags: string[];
  modules: TrackModule[];
}

export interface CourseTrack {
  id: string;
  title: string;
  code?: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  color: string;
  accentBg: string;
  tags: string[];
  modules: TrackModule[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

export interface AnswerVerificationResult {
  isCorrect: boolean;
  score: number;
  verdict: "Correta" | "Parcialmente Correta" | "Incorreta";
  feedback: string;
  detailedExplanation: string;
  keyStrengths: string[];
  pointsToImprove: string[];
  xpEarned: number;
}

export interface StoreItem {
  id: string;
  name: string;
  type: "badge" | "boost" | "energy" | "permanent_energy" | "pet_food" | "pet_unlock";
  badgeId?: string;
  energyAmount?: number;
  petFoodGain?: {
    happiness: number;
    exp: number;
    hunger: number;
  };
  petType?: PetType;
  cost: number;
  description: string;
  icon: string;
  badgeEmoji?: string;
  badgeClass?: string;
}

export interface BattleQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimitSeconds: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: "leader" | "co-leader" | "elder" | "member";
  level: number;
  xpContributed: number;
  lastActive: string;
  isOnline: boolean;
}

export interface TeamEnergyRequest {
  id: string;
  userId: string;
  userName: string;
  amountRequested: number; // e.g. 5
  amountReceived: number;
  donors: string[];
  timestamp: string;
  fulfilled: boolean;
}

export interface TeamChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface TeamInfo {
  id: string;
  name: string;
  tag: string;
  badgeIcon: string;
  badgeColor: string;
  description: string;
  type: "open" | "closed";
  minLevel: number;
  membersCount: number;
  maxMembers: number; // padrão 50 membros
  totalXp: number;
  rank: number;
  createdBy: string;
  creatorId?: string;
  members: TeamMember[];
  energyRequests: TeamEnergyRequest[];
  chatMessages: TeamChatMessage[];
  chestProgress: number; // e.g. 240 / 500
  chestTarget: number;
  chestLevel: number;
  score?: number;
  lider?: string;
  metasBau?: number[];
  resgatesBau?: { [key: string]: boolean };
}

export interface IfesCourse {
  id: string;
  name: string;
  code: string;
  professor: string;
  campus: string;
  progressPercent: number;
  shortname?: string;
}

export interface IfesAssignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: string;
  description: string;
  status: "pending" | "submitted" | "graded" | "urgent";
  weight?: string;
  type: "tarefa" | "questionario" | "forum" | "projeto";
  link?: string;
}

export interface IfesClassSchedule {
  dayOfWeek: string;
  timeSlot: string;
  courseName: string;
  room?: string;
  professor?: string;
}

export interface IfesSyncConfig {
  campusUrl: string;
  studentId: string;
  isConnected: boolean;
  lastSyncTimestamp: string;
  autoSync: boolean;
}

export interface SavedSocraticChat {
  id: string;
  title: string;
  courseName: string;
  date: string;
  timestamp: number;
  messages: SocraticMessage[];
  lastMessageSnippet?: string;
  summary?: string;
}

export interface SavedDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: "pdf" | "txt" | "syllabus" | "notes" | "image";
  courseTag: string;
  uploadDate: string;
  timestamp: number;
  fileSizeFormatted?: string;
  textContent: string;
  summary?: string;
  extractedConcepts?: string[];
  extractedQuestions?: string[];
}

export type TaskPriority = "alta" | "média" | "baixa";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  category?: string;
  completed: boolean;
  createdAt: string;
  reminderEnabled?: boolean;
}

export type EventType = "prova" | "trabalho" | "reuniao" | "estudo" | "plantao";

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: EventType;
  courseId?: string;
  courseName?: string;
  locationOrLink?: string;
  participants?: string[];
  reminderMinutesBefore?: number;
}

export type AnkiIntervalGrade = "again" | "hard" | "good" | "easy";

export interface FlashcardItem {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags?: string[];
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  courseName: string;
  color?: string;
  cardsCount?: number;
  cards?: FlashcardItem[];
}

export type StrictNotificationTrigger = "new_content" | "team_message" | "deadline_approaching";

export type LeadTimePreset = "15m" | "1h" | "3h" | "1d" | "2d" | "custom";

export interface StrictNotificationPreferences {
  enabled: boolean;
  enableNewContent: boolean; // 1. Novo Conteúdo Postado no AVA IFES
  enableTeamMessages: boolean; // 2. Nova Mensagem na Equipe (Sala Virtual)
  enableDeadlines: boolean; // 3. Prazos Próximos do Fim
  leadTimePreset: LeadTimePreset;
  customLeadTimeValue: number;
  customLeadTimeUnit: "hours" | "days";
  webPushSubscribed?: boolean;
}

export interface ScheduledDeadlineItem {
  id: string;
  taskName: string;
  title: string;
  body: string;
  dueTimestamp: number;
  alertTimestamp: number;
  leadTimeMinutes: number;
  url?: string;
}

export interface StudyNotificationSettings {
  intensity: "leve" | "moderada" | "foco_total";
  tasksReminders: boolean;
  agendaReminders: boolean;
  flashcardsReminders: boolean;
  soundEnabled: boolean;
}
