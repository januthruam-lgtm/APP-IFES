import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, TabId } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { LessonModal } from "./components/LessonModal";
import { OfflineCacheModal } from "./components/OfflineCacheModal";
import { ProfileSettingsModal } from "./components/ProfileSettingsModal";
import { SettingsModal, SettingsTabId } from "./components/SettingsModal";
import { AccessibilityModal } from "./components/AccessibilityModal";
import PaywallModal from "./components/PaywallModal";
import { NotificationSettingsModal } from "./components/NotificationSettingsModal";
import { DashboardTab } from "./components/tabs/DashboardTab";
import { SocraticTutorTab } from "./components/tabs/SocraticTutorTab";
import { SequenceTrackTab } from "./components/tabs/SequenceTrackTab";
import { PdfGameGeneratorTab } from "./components/tabs/PdfGameGeneratorTab";
import { GuildsBattlesTab } from "./components/tabs/GuildsBattlesTab";
import { IfesAvaTab } from "./components/tabs/IfesAvaTab";
import { StoreTab } from "./components/tabs/StoreTab";
import { LibraryTab } from "./components/tabs/LibraryTab";
import { DictionaryTab } from "./components/tabs/DictionaryTab";
import { ColorThemeTab } from "./components/tabs/ColorThemeTab";
import { TasksTab } from "./components/tabs/TasksTab";
import { AgendaTab } from "./components/tabs/AgendaTab";
import { FlashcardsAnkiTab } from "./components/tabs/FlashcardsAnkiTab";
import { StudyMethodsCentralTab } from "./components/tabs/StudyMethodsCentralTab";
import { StudyRoomVirtualTab } from "./components/tabs/StudyRoomVirtualTab";
import { ActiveCallModal } from "./components/calls/ActiveCallModal";
import { WhatsAppChatModal } from "./components/chat/WhatsAppChatModal";
import { OnlineUsersDrawer } from "./components/users/OnlineUsersDrawer";
import { realtimeCallService } from "./services/realtimeCallService";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { NativeTitleBar } from "./components/NativeTitleBar";
import { NativeAppModal } from "./components/NativeAppModal";
import { SplashScreen } from "./components/SplashScreen";
import { FirstLaunchTutorial } from "./components/FirstLaunchTutorial";
import { AvaConnectModal } from "./components/ava/AvaConnectModal";
import { avaConnectionManager } from "./utils/avaConnectionManager";
import { initializeCapacitorApp } from "./utils/capacitorInit";
import {
  UserProfile,
  TrackModule,
  ThemeId,
  CourseTrack,
  IfesAccountInfo,
  IfesCourse,
  IfesAssignment,
  IfesClassSchedule,
  CustomThemeColors,
  UserPet,
} from "./types";
import { INITIAL_USER, INITIAL_PET, createBlankUser } from "./data/initialData";
import {
  loadSyncedCourses,
  saveSyncedCourses,
  convertIfesCoursesToTracks,
  saveSyncedAssignments,
  saveSyncedSchedules,
  clearAllSyncedAcademicData,
  purgeAnyFictitiousCourses,
} from "./utils/courseSync";
import { speakText, stopSpeaking } from "./utils/speech";
import { renameUserPet } from "./features/gamificacao/petService";
import {
  seedDefaultOfflineCache,
  cacheStudyTracks,
  saveOfflineModuleProgress,
  clearOfflineCache,
} from "./utils/indexedDB";
import { loadSavedTheme, applyThemeToDOM, saveTheme } from "./utils/themeManager";
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from "./lib/firebase";
import confetti from "canvas-confetti";
import { sanitizeUserStreak, getSaoPauloDateString } from "./utils/streakCalculator";

export default function App() {
  // Theme state with Paper & Focus default
  const [currentTheme, setCurrentTheme] = useState<CustomThemeColors>(() => loadSavedTheme());

  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  // Purge any fictitious/mock courses immediately on mount so only real IFES data exists
  useEffect(() => {
    const { courses: realCourses } = purgeAnyFictitiousCourses();
    setIfesCourses(realCourses);
    const tracks = convertIfesCoursesToTracks(realCourses);
    setCourses(tracks);
    if (tracks.length > 0) {
      setCurrentCourse((prev) => (prev.id === "empty-course" ? tracks[0] : prev));
    }
  }, []);

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("brain_studio_user_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.maxEnergy) {
          parsed.maxEnergy = 50;
        }
        // Se a conta AVA não estiver marcada como conectada mas temos dados do AVA salvos, restaura automaticamente
        if (!parsed.ifesAccount?.connected) {
          const avaStatusStr = localStorage.getItem("brain_studio_ava_status_v2");
          if (avaStatusStr) {
            try {
              const statusObj = JSON.parse(avaStatusStr);
              if (statusObj && statusObj.isConnected) {
                parsed.ifesAccount = {
                  connected: true,
                  username: statusObj.username,
                  fullname: statusObj.fullname || parsed.name,
                  campusUrl: statusObj.campusUrl,
                  campusName: statusObj.campusName,
                  matricula: statusObj.matricula || statusObj.username,
                  lastSync: statusObj.lastSync || "Sincronizado",
                  token: "restored_session_token",
                };
              }
            } catch {}
          }
        }
        return parsed;
      }

      // Se não houver perfil salvo mas existirem credenciais salvas do AVA IFES
      const savedCredsStr = localStorage.getItem("brain_studio_moodle_creds_v2");
      if (savedCredsStr) {
        try {
          const credsObj = JSON.parse(savedCredsStr);
          if (credsObj && credsObj.username) {
            const newUser = createBlankUser(credsObj.username, `${credsObj.username}@ifes.edu.br`);
            newUser.ifesAccount = {
              connected: true,
              username: credsObj.username,
              fullname: credsObj.username,
              campusUrl: credsObj.campusUrl,
              campusName: credsObj.campusName,
              matricula: credsObj.username,
              lastSync: "Sincronizado",
              token: "restored_session_token",
            };
            return newUser;
          }
        } catch {}
      }
    } catch (e) {
      console.warn(e);
    }
    return createBlankUser();
  });

  // Synced IFES Courses (from localStorage / Moodle profile)
  const [ifesCourses, setIfesCourses] = useState<IfesCourse[]>(() => {
    try {
      return loadSyncedCourses();
    } catch {
      return [];
    }
  });

  // Dynamic CourseTracks derived directly from user's synced IFES subjects
  const [courses, setCourses] = useState<CourseTrack[]>(() => {
    try {
      const synced = loadSyncedCourses();
      return convertIfesCoursesToTracks(synced);
    } catch {
      return [];
    }
  });

  const [currentCourse, setCurrentCourse] = useState<CourseTrack>(() => {
    try {
      const initialTracks = convertIfesCoursesToTracks(loadSyncedCourses());
      if (initialTracks.length > 0) {
        const found = initialTracks.find((c) => c.id === user?.selectedCourseId);
        if (found) return found;
        return initialTracks[0];
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      id: "empty-course",
      name: "Nenhuma matéria",
      title: "Nenhuma matéria selecionada",
      icon: "📚",
      category: "Geral",
      description: "Conecte sua matrícula IFES para sincronizar suas matérias.",
      color: "#5D5CDE",
      accentBg: "rgba(93, 92, 222, 0.15)",
      tags: [],
      modules: [],
    };
  });

  const [modules, setModules] = useState<TrackModule[]>(() => {
    return currentCourse.modules && currentCourse.modules.length > 0
      ? currentCourse.modules
      : [];
  });

  const [currentTab, setCurrentTab] = useState<TabId>("dashboard");
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => {
    try {
      const isLoggedIn = localStorage.getItem("brain_studio_is_logged_in") === "true";
      const savedUser = localStorage.getItem("brain_studio_user_v3");
      const savedCreds = localStorage.getItem("brain_studio_moodle_creds_v2");
      const avaStatus = localStorage.getItem("brain_studio_ava_status_v2");
      const tutorialCompleted = localStorage.getItem("brain_studio_tutorial_completed") === "true";

      // Se qualquer um desses dados existir, o primeiro acesso já ocorreu e o app abre pronto!
      if (isLoggedIn || savedUser || savedCreds || avaStatus || tutorialCompleted) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabId>("idioma");
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeLessonModule, setActiveLessonModule] = useState<TrackModule | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isNativeAppModalOpen, setIsNativeAppModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [selectedDeckForGames, setSelectedDeckForGames] = useState<string | null>(null);
  const [targetCallPeer, setTargetCallPeer] = useState<{ id: string; name: string; isVideo?: boolean } | null>(null);
  const [isOnlineUsersOpen, setIsOnlineUsersOpen] = useState(false);
  const [activeChatTargetUser, setActiveChatTargetUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
    campus?: string;
    isOnline?: boolean;
  } | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isAvaConnectOpen, setIsAvaConnectOpen] = useState(false);

  // Poll online count periodically
  useEffect(() => {
    const fetchCount = () => {
      fetch("/api/online-status")
        .then((r) => r.json())
        .then((data) => {
          if (data && typeof data.onlineCount === "number") {
            setOnlineCount(Math.max(1, data.onlineCount));
          }
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Native Android Capacitor Lifecycle & Hardware Back Button Handler
  useEffect(() => {
    initializeCapacitorApp({
      onBackButtonPressed: () => {
        if (isNativeAppModalOpen) {
          setIsNativeAppModalOpen(false);
          return true;
        }
        if (isProfileSettingsOpen) {
          setIsProfileSettingsOpen(false);
          return true;
        }
        if (isNotificationModalOpen) {
          setIsNotificationModalOpen(false);
          return true;
        }
        if (isOfflineModalOpen) {
          setIsOfflineModalOpen(false);
          return true;
        }
        if (isAvaConnectOpen) {
          setIsAvaConnectOpen(false);
          return true;
        }
        if (activeLessonModule) {
          setActiveLessonModule(null);
          return true;
        }
        if (currentTab !== "dashboard") {
          setCurrentTab("dashboard");
          return true;
        }
        return false;
      },
    });
  }, [
    isNativeAppModalOpen,
    isProfileSettingsOpen,
    isNotificationModalOpen,
    isOfflineModalOpen,
    isAvaConnectOpen,
    activeLessonModule,
    currentTab,
  ]);

  const handleStartCallWithMember = useCallback(
    (member: { id: string; name: string; avatar?: string; isVideo?: boolean }, isVideo: boolean = true) => {
      realtimeCallService.startCall(
        {
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          isVideo,
        },
        isVideo
      );
      stopSpeaking();
    },
    []
  );

  const handleOpenPrivateChatWithMember = useCallback(
    (member: { id: string; name: string; avatar?: string; campus?: string; isOnline?: boolean }) => {
      setActiveChatTargetUser(member);
      stopSpeaking();
    },
    []
  );
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("brain_studio_splash_shown") !== "true";
    } catch {
      return true;
    }
  });
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    try {
      return localStorage.getItem("brain_studio_tutorial_completed") !== "true";
    } catch {
      return true;
    }
  });

  const handleTutorialComplete = (chosenPet: UserPet) => {
    try {
      localStorage.setItem("brain_studio_tutorial_completed", "true");
    } catch {}
    setUser((prev) => {
      const updated = {
        ...prev,
        pet: chosenPet,
      };
      try {
        localStorage.setItem("brain_studio_user_v3", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setShowTutorial(false);
    setCurrentTab("dashboard");
  };

  // Initialize IndexedDB Cache on App Launch
  useEffect(() => {
    const initIndexedDB = async () => {
      try {
        if (courses.length > 0) {
          await seedDefaultOfflineCache(courses);
          await cacheStudyTracks(courses);
        }
      } catch (err) {
        console.warn("IndexedDB init error:", err);
      }
    };
    initIndexedDB();
  }, []);

  // Listen to network status online / offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync courses whenever updated via CustomEvent or function
  const handleUpdateCourses = useCallback((newIfesCourses: IfesCourse[]) => {
    setIfesCourses(newIfesCourses);
    saveSyncedCourses(newIfesCourses);
    const newTracks = convertIfesCoursesToTracks(newIfesCourses);
    setCourses(newTracks);
    if (newTracks.length > 0) {
      cacheStudyTracks(newTracks).catch(() => {});
    }

    // Keep current course valid
    setCurrentCourse((prev) => {
      const match = newTracks.find(
        (t) => t.id === prev?.id || t.title.toLowerCase() === prev?.title.toLowerCase()
      );
      if (match) {
        setModules(match.modules);
        return match;
      }
      if (newTracks.length > 0) {
        setModules(newTracks[0].modules);
        return newTracks[0];
      }
      return {
        id: "empty-course",
        name: "Nenhuma matéria",
        title: "Nenhuma matéria selecionada",
        icon: "📚",
        category: "Geral",
        description: "Importe suas matérias do AVA IFES.",
        color: "#5D5CDE",
        accentBg: "rgba(93, 92, 222, 0.15)",
        tags: [],
        modules: [],
      };
    });
  }, []);

  // Reset/Clear courses for a clean start
  const handleResetCourses = useCallback(() => {
    saveSyncedCourses([]);
    setIfesCourses([]);
    setCourses([]);
    setCurrentCourse({
      id: "empty-course",
      name: "Nenhuma matéria",
      title: "Nenhuma matéria selecionada",
      icon: "📚",
      category: "Geral",
      description: "Importe suas matérias do AVA IFES.",
      color: "#5D5CDE",
      accentBg: "rgba(93, 92, 222, 0.15)",
      tags: [],
      modules: [],
    });
    setModules([]);
  }, []);

  // Delete a single course universally from everywhere
  const handleDeleteSingleCourse = useCallback((courseId: string) => {
    setIfesCourses((prevIfes) => {
      const filtered = prevIfes.filter((c) => c.id !== courseId && c.shortname !== courseId);
      saveSyncedCourses(filtered);
      return filtered;
    });
    setCourses((prevCourses) => {
      const filtered = prevCourses.filter((c) => c.id !== courseId);
      if (filtered.length > 0) {
        cacheStudyTracks(filtered).catch(() => {});
      }
      return filtered;
    });
    setCurrentCourse((prev) => {
      if (prev?.id === courseId) {
        const remaining = courses.filter((c) => c.id !== courseId);
        if (remaining.length > 0) {
          setModules(remaining[0].modules);
          return remaining[0];
        }
        setModules([]);
        return {
          id: "empty-course",
          name: "Nenhuma matéria",
          title: "Nenhuma matéria selecionada",
          icon: "📚",
          category: "Geral",
          description: "Importe suas matérias do AVA IFES.",
          color: "#5D5CDE",
          accentBg: "rgba(93, 92, 222, 0.15)",
          tags: [],
          modules: [],
        };
      }
      return prev;
    });
  }, [courses]);

  // Listen to global course update events
  useEffect(() => {
    const handleCoursesChanged = (e: any) => {
      if (e.detail && e.detail.courses) {
        handleUpdateCourses(e.detail.courses);
      }
    };
    window.addEventListener("brainstudio:courses-updated", handleCoursesChanged);
    return () => window.removeEventListener("brainstudio:courses-updated", handleCoursesChanged);
  }, [handleUpdateCourses]);

  // Synchronize and calibrate streak based on real calendar days & study activity
  useEffect(() => {
    const todayStr = getSaoPauloDateString();
    setUser((prev) => {
      const accurateStreak = sanitizeUserStreak(prev, todayStr);
      const isToday = prev.lastActiveDate && prev.lastActiveDate.slice(0, 10) === todayStr;

      if (accurateStreak !== prev.streakDays || !isToday) {
        const updated: UserProfile = {
          ...prev,
          streakDays: accurateStreak,
          lastActiveDate: new Date().toISOString(),
        };
        try {
          localStorage.setItem("brain_studio_user_v3", JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  }, []);

  // Auto-Regenerate Energy: +1 energy every 5 minutes (max user.maxEnergy)
  useEffect(() => {
    const energyTimer = setInterval(() => {
      setUser((prev) => {
        const maxEnergy = prev.maxEnergy || 50;
        if (prev.energy < maxEnergy) {
          const updated = { ...prev, energy: Math.min(maxEnergy, prev.energy + 1) };
          localStorage.setItem("brain_studio_user_v3", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }, 300000);

    return () => clearInterval(energyTimer);
  }, []);

  // Save user profile state changes ONLY when authenticated
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("brain_studio_is_logged_in") === "true";
      if (isLoggedIn && user.email) {
        localStorage.setItem("brain_studio_user_v3", JSON.stringify(user));
      }
    } catch (e) {
      console.warn("Erro ao salvar perfil:", e);
    }
  }, [user]);

  // Save selected course
  const handleSelectCourse = (course: CourseTrack) => {
    setCurrentCourse(course);
    setModules(course.modules);
    setUser((prev) => ({ ...prev, selectedCourseId: course.id }));
  };

  const handleOpenDeckInGames = (deckId: string) => {
    setSelectedDeckForGames(deckId);
    setCurrentTab("games");
  };

  const handleRewardXp = (amount: number) => {
    setUser((prev) => {
      const newXp = Math.max(0, prev.xp + amount);
      const newLevel = Math.floor(newXp / 500) + 1;
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const handleRewardCoins = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      coins: Math.max(0, (prev.coins ?? 250) + amount),
    }));
  };

  const handleStudyOnAva = () => {
    if (user.energy < 3) {
      console.warn("⚡ Energia insuficiente! Visite a Loja para comprar uma Poção de Energia (🪙 50).");
      return;
    }
    setUser((prev) => {
      const newCoins = (prev.coins ?? 250) + 30;
      const newXp = prev.xp + 25;
      const newLevel = Math.floor(newXp / 500) + 1;
      const newEnergy = Math.max(0, prev.energy - 3);
      return {
        ...prev,
        coins: newCoins,
        xp: newXp,
        level: newLevel,
        energy: newEnergy,
      };
    });
  };

  const handleUnlockCard = (cardName: string) => {
    setUser((prev) => {
      const currentCards = prev.unlockedCards || ["🦊 Foxy Cientista"];
      if (currentCards.includes(cardName)) {
        return prev;
      }
      return {
        ...prev,
        unlockedCards: [...currentCards, cardName],
      };
    });
  };

  const handleConsumeEnergy = (amount: number = 1): boolean => {
    if (user.energy < amount) {
      console.warn("Você não possui energias suficientes! Recarregue na Loja ou peça doação na sua Equipe.");
      return false;
    }
    setUser((prev) => ({ ...prev, energy: Math.max(0, prev.energy - amount) }));
    return true;
  };

  const handleAddEnergy = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      energy: Math.min(prev.maxEnergy || 50, prev.energy + amount),
    }));
  };

  const handlePermanentEnergyUpgrade = (amount: number, cost: number) => {
    setUser((prev) => {
      const currentMax = prev.maxEnergy || 50;
      const newMax = currentMax + amount;
      return {
        ...prev,
        xp: prev.xp - cost,
        maxEnergy: newMax,
        energy: newMax, // Instant full refill
      };
    });
  };

  const handleUpdatePet = (newPet: UserPet) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        pet: newPet,
      };
      try {
        localStorage.setItem("brain_studio_user_v3", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("brain_studio_user_updated", { detail: updated }));
        window.dispatchEvent(new CustomEvent("pet_updated", { detail: newPet }));
      } catch {}
      return updated;
    });

    const userUid = user.id || user.uid || user.email || user.ifesAccount?.matricula || "januthruam@gmail.com";
    if (userUid && newPet.name) {
      renameUserPet(userUid, newPet.name).catch((err) => {
        console.warn("[App] Aviso ao salvar nome do pet no Firestore:", err);
      });
      saveUserProfileToFirestore(userUid, { ...user, pet: newPet }).catch((err) => {
        console.warn("[App] Aviso ao salvar perfil com pet no Firestore:", err);
      });
    }
  };

  const handleCompleteLesson = (moduleId: number) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, status: "completed" } : mod))
    );

    saveOfflineModuleProgress(moduleId, 100, currentCourse.title);

    const currentIndex = modules.findIndex((m) => m.id === moduleId);
    if (currentIndex !== -1 && currentIndex + 1 < modules.length) {
      setModules((prev) =>
        prev.map((mod, idx) => (idx === currentIndex + 1 ? { ...mod, status: "active" } : mod))
      );
      saveOfflineModuleProgress(modules[currentIndex + 1].id, 50, currentCourse.title);
    }
  };

  const handleBuyBadge = (badgeId: string, price: number) => {
    if (user.xp < price) {
      console.warn("XP insuficiente para desbloquear este distintivo!");
      return;
    }
    setUser((prev) => ({
      ...prev,
      xp: prev.xp - price,
      unlockedBadges: [...prev.unlockedBadges, badgeId],
      equippedBadge: badgeId,
    }));
  };

  const handleEquipBadge = (badgeId: string) => {
    setUser((prev) => ({ ...prev, equippedBadge: badgeId }));
  };

  const handleUpdateUserTeam = (teamId: string | null) => {
    setUser((prev) => ({ ...prev, teamId }));
  };

  const handleLogin = (email: string, name?: string, ifesAccount?: IfesAccountInfo) => {
    let existingUser: Partial<UserProfile> = {};
    try {
      const saved = localStorage.getItem("brain_studio_user_v3");
      if (saved) {
        existingUser = JSON.parse(saved);
      }
    } catch {}

    const baseUser = createBlankUser(
      name || ifesAccount?.fullname || email.split("@")[0],
      email
    );

    const isFirstTime = localStorage.getItem("brain_studio_tutorial_completed") !== "true";

    const loggedInUser: UserProfile = {
      ...baseUser,
      ...existingUser,
      email: email.trim(),
      name: name?.trim() || existingUser.name || ifesAccount?.fullname || email.split("@")[0],
      ifesAccount: ifesAccount || existingUser.ifesAccount,
      level: existingUser.level ?? baseUser.level,
      xp: existingUser.xp ?? baseUser.xp,
      coins: existingUser.coins ?? baseUser.coins,
      energy: existingUser.energy ?? baseUser.energy,
      streakDays: existingUser.streakDays ?? baseUser.streakDays,
      activeTheme: existingUser.activeTheme || baseUser.activeTheme,
      pet: existingUser.pet || baseUser.pet,
      unlockedThemes: existingUser.unlockedThemes || baseUser.unlockedThemes,
      unlockedBadges: existingUser.unlockedBadges || baseUser.unlockedBadges,
      unlockedCards: existingUser.unlockedCards || baseUser.unlockedCards,
    };

    setUser(loggedInUser);
    try {
      localStorage.setItem("brain_studio_is_logged_in", "true");
      localStorage.setItem("brain_studio_user_v3", JSON.stringify(loggedInUser));
    } catch (e) {
      console.warn("Erro ao salvar dados de login:", e);
    }
    setIsAuthOpen(false);

    if (isFirstTime) {
      setShowTutorial(true);
    }

    // Refresh courses if available
    const synced = loadSyncedCourses();
    setIfesCourses(synced);
    const tracks = convertIfesCoursesToTracks(synced);
    setCourses(tracks);
    if (tracks.length > 0) {
      setCurrentCourse(tracks[0]);
      setModules(tracks[0].modules || []);
    }
  };

  const handleUpdateProfile = (updatedUser: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...updatedUser,
      };
      try {
        localStorage.setItem("brain_studio_user_v3", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("brain_studio_user_updated", { detail: updated }));
      } catch {}
      return updated;
    });

    const uid = user.id || user.uid || user.email || user.ifesAccount?.matricula || "local-student";
    if (uid) {
      saveUserProfileToFirestore(uid, { ...user, ...updatedUser }).catch(() => {});
    }
  };

  const handleUpdateIfesAccount = (ifesAccount: IfesAccountInfo | undefined) => {
    setUser((prev) => ({
      ...prev,
      ifesAccount,
      name: ifesAccount?.fullname ? ifesAccount.fullname : prev.name,
    }));
  };

  const handleAvaConnectionSuccess = (account: IfesAccountInfo, connectedCourses: IfesCourse[]) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ifesAccount: account,
        name: account.fullname && prev.name === "Estudante IFES" ? account.fullname : (account.fullname || prev.name),
      };
      try {
        localStorage.setItem("brain_studio_user_v3", JSON.stringify(updated));
        localStorage.setItem("brain_studio_is_logged_in", "true");
      } catch {}
      return updated;
    });

    const validCourses = connectedCourses || [];
    setIfesCourses(validCourses);
    saveSyncedCourses(validCourses);
    const tracks = convertIfesCoursesToTracks(validCourses);
    setCourses(tracks);
    if (tracks.length > 0) {
      setCurrentCourse(tracks[0]);
      setModules(tracks[0].modules || []);
    }
  };

  const handleAvaDisconnect = () => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ifesAccount: {
          connected: false,
          username: "",
          fullname: prev.name,
          campusUrl: "",
          campusName: "",
          lastSync: "",
        },
      };
      try {
        localStorage.setItem("brain_studio_user_v3", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Salvamento contínuo no localStorage e no Firestore para garantir retenção de tudo que o usuário faz
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem("brain_studio_user_v3", JSON.stringify(user));
      if (user.ifesAccount?.connected || user.name !== "Estudante IFES" || user.email !== "estudante@ifes.edu.br") {
        localStorage.setItem("brain_studio_is_logged_in", "true");
      }
    } catch (err) {
      console.warn("Aviso ao persistir dados do usuário localmente:", err);
    }

    const uid = user.id || user.uid || user.email;
    if (uid && uid !== "estudante@ifes.edu.br") {
      saveUserProfileToFirestore(uid, user).catch((err) => {
        console.warn("Aviso ao salvar perfil no Firestore:", err);
      });
    }
  }, [user]);

  // Restauração transparente a partir da nuvem Firestore (se disponível)
  useEffect(() => {
    const restoreFromCloud = async () => {
      const uid = user.id || user.uid || user.email || "januthruam@gmail.com";
      if (uid && uid !== "estudante@ifes.edu.br") {
        try {
          const remoteProfile = await getUserProfileFromFirestore(uid);
          if (remoteProfile) {
            setUser((prev) => {
              // Se o pet local já possui nome e espécie escolhidos pelo aluno, preservamos ambos estritamente
              const mergedPet = prev.pet?.name
                ? {
                    ...(remoteProfile.pet || {}),
                    ...prev.pet,
                    id: prev.pet.id || prev.pet.type || remoteProfile.pet?.id,
                    type: prev.pet.type || remoteProfile.pet?.type || "coruja",
                    name: prev.pet.name,
                  }
                : (remoteProfile.pet || prev.pet);
              return {
                ...prev,
                ...remoteProfile,
                ifesAccount: remoteProfile.ifesAccount || prev.ifesAccount,
                pet: mergedPet,
              };
            });
          }
        } catch {}
      }
    };
    restoreFromCloud();
  }, []);

  // Reconexão automática transparente com o AVA IFES para manter sessão estável e permanente
  useEffect(() => {
    let isCancelled = false;
    const autoReconnect = async () => {
      try {
        const userId = user.id || user.uid || user.email || "local-student";
        const res = await avaConnectionManager.autoReconnectIfSaved(userId);
        if (!isCancelled && res.reconnected && res.account) {
          handleAvaConnectionSuccess(res.account, res.courses || []);
        }
      } catch (err) {
        console.warn("Auto-reconexão com AVA IFES:", err);
      }
    };
    autoReconnect();
    return () => {
      isCancelled = true;
    };
  }, [user.id, user.uid, user.email]);

  // Sincronização automática contínua em segundo plano com o AVA IFES
  useEffect(() => {
    const userId = user.id || user.uid || user.email || "local-student";

    if (user.ifesAccount?.connected) {
      avaConnectionManager.startAutoSync(
        userId,
        ({ courses, account }) => {
          if (courses && courses.length > 0) {
            handleUpdateCourses(courses);
          }
          if (account) {
            setUser((prev) => ({
              ...prev,
              ifesAccount: {
                ...prev.ifesAccount,
                ...account,
                lastSync: account.lastSync || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            }));
          }
        },
        60000 // A cada 60s
      );
    } else {
      avaConnectionManager.stopAutoSync();
    }

    const handleAvaAutoSynced = (e: any) => {
      const { courses, account } = e.detail || {};
      if (courses && Array.isArray(courses) && courses.length > 0) {
        handleUpdateCourses(courses);
      }
      if (account) {
        setUser((prev) => ({
          ...prev,
          ifesAccount: {
            ...prev.ifesAccount,
            ...account,
          },
        }));
      }
    };
    window.addEventListener("ava:auto-synced", handleAvaAutoSynced);

    return () => {
      avaConnectionManager.stopAutoSync();
      window.removeEventListener("ava:auto-synced", handleAvaAutoSynced);
    };
  }, [user.ifesAccount?.connected, user.id, user.uid, user.email, handleUpdateCourses]);

  const handleLogout = async () => {
    // 1. Zera e apaga todos os dados do LocalStorage e SessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("Erro ao limpar storage:", e);
    }

    // 2. Limpa o IndexedDB offline completamente
    try {
      await clearOfflineCache();
    } catch (e) {
      console.warn("Erro ao limpar cache offline:", e);
    }

    // 3. Limpa todas as matérias e dados acadêmicos sincronizados
    try {
      clearAllSyncedAcademicData();
    } catch (e) {
      console.warn("Erro ao limpar dados acadêmicos:", e);
    }

    // 4. Zera todos os estados da memória da aplicação
    setUser(createBlankUser());
    setIfesCourses([]);
    setCourses([]);
    setCurrentCourse({
      id: "empty-course",
      name: "Nenhuma matéria",
      title: "Nenhuma matéria selecionada",
      icon: "📚",
      category: "Geral",
      description: "Faça login com sua matrícula IFES para carregar suas matérias.",
      color: "#5D5CDE",
      accentBg: "rgba(93, 92, 222, 0.15)",
      tags: [],
      modules: [],
    });
    setModules([]);
    setCurrentTab("dashboard");
    setIsProfileSettingsOpen(false);
    setIsOfflineModalOpen(false);
    setActiveLessonModule(null);
    setSelectedDeckForGames(null);

    // 5. Exige que a pessoa faça login novamente e zera o tutorial
    setShowTutorial(true);
    setIsAuthOpen(true);
  };

  return (
    <div
      id="app-body"
      className="h-screen flex font-sans overflow-hidden transition-colors duration-300 bg-[var(--app-bg)] text-[var(--app-text)]"
    >
      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onLogin={handleLogin} />

      {/* Profile & Matrícula Settings Modal (Fallback direto) */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        user={user}
        onSaveUser={handleUpdateProfile}
        onResetCourses={handleResetCourses}
        onReopenTutorial={() => {
          setIsProfileSettingsOpen(false);
          setShowTutorial(true);
        }}
      />

      {/* Central de Configurações Geral do App (Idioma, Acessibilidade, Perfil, Notificações, Cache, Planos) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onSaveUser={handleUpdateProfile}
        onResetCourses={handleResetCourses}
        onReopenTutorial={() => {
          setIsSettingsOpen(false);
          setShowTutorial(true);
        }}
        onOpenAccessibilityDetail={() => {
          setIsSettingsOpen(false);
          setIsAccessibilityOpen(true);
        }}
        onOpenOfflineDetail={() => {
          setIsSettingsOpen(false);
          setIsOfflineModalOpen(true);
        }}
        onOpenNotificationDetail={() => {
          setIsSettingsOpen(false);
          setIsNotificationModalOpen(true);
        }}
        onOpenPaywall={() => {
          setIsSettingsOpen(false);
          setIsPaywallOpen(true);
        }}
        initialTab={settingsInitialTab}
      />

      {/* Painel Especializado de Inclusão e Acessibilidade (WCAG AAA) */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />

      {/* Modal de Planos e Assinatura Lumina Pro */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onUnlocked={() => {
          setIsPaywallOpen(false);
        }}
      />

      {/* Strict Notification Settings & Dynamic Lead Time Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* Official Native App Center & Standalone Window Modal */}
      <NativeAppModal
        isOpen={isNativeAppModalOpen}
        onClose={() => setIsNativeAppModalOpen(false)}
      />

      {/* Offline IndexedDB Cache Management Modal */}
      <OfflineCacheModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isOnline={isOnline}
        courses={courses}
        onSelectTrack={(track) => {
          handleSelectCourse(track);
          setIsOfflineModalOpen(false);
        }}
        onSelectDeck={(deckId) => {
          setIsOfflineModalOpen(false);
          handleOpenDeckInGames(deckId);
        }}
      />

      {/* Main Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          stopSpeaking();
        }}
        user={user}
        onLogout={handleLogout}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenProfileSettings={() => {
          setSettingsInitialTab("perfil");
          setIsSettingsOpen(true);
        }}
        onOpenSettings={(tab) => {
          setSettingsInitialTab(tab || "idioma");
          setIsSettingsOpen(true);
        }}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        isOnline={isOnline}
        currentTheme={currentTheme}
      />

      {/* Main App Container */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[var(--app-bg)] text-[var(--app-text)]">
        {/* Native Standalone Window TitleBar */}
        <NativeTitleBar onOpenNativeModal={() => setIsNativeAppModalOpen(true)} />

        {/* App Header */}
        <Header
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            stopSpeaking();
          }}
          user={user}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onLogout={handleLogout}
          onRechargeEnergy={() => setCurrentTab("store")}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          onOpenProfileSettings={() => {
            setSettingsInitialTab("perfil");
            setIsSettingsOpen(true);
          }}
          onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
          onOpenOnlineUsers={() => setIsOnlineUsersOpen(true)}
          onOpenAvaConnect={() => setIsAvaConnectOpen(true)}
          onOpenSettings={(tab) => {
            setSettingsInitialTab(tab || "idioma");
            setIsSettingsOpen(true);
          }}
          onOpenAccessibility={() => setIsAccessibilityOpen(true)}
          onlineCount={onlineCount}
          isOnline={isOnline}
          currentTheme={currentTheme}
        />

        {/* Tab Views */}
        <div className="flex-1 overflow-y-auto">
          {currentTab === "dashboard" && (
            <DashboardTab
              user={user}
              modules={modules}
              courses={courses}
              currentCourse={currentCourse}
              onSelectCourse={handleSelectCourse}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                stopSpeaking();
              }}
              onOpenActiveLesson={() => {
                const active = modules.find((m) => m.status === "active") || modules[0];
                if (active) {
                  setActiveLessonModule(active);
                }
              }}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
              onStudyOnAva={handleStudyOnAva}
              onDeleteCourse={handleDeleteSingleCourse}
              onOpenAvaConnect={() => setIsAvaConnectOpen(true)}
              onUpdatePet={handleUpdatePet}
            />
          )}

          {currentTab === "lumina" && (
            <SocraticTutorTab
              user={user}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              onRewardXp={handleRewardXp}
              courses={courses}
              onNavigateToGames={() => setCurrentTab("games")}
            />
          )}

          {currentTab === "sequence" && (
            <SequenceTrackTab
              modules={modules}
              user={user}
              courses={courses}
              currentCourse={currentCourse}
              onSelectCourse={handleSelectCourse}
              onOpenLesson={(mod) => setActiveLessonModule(mod)}
              onOpenDeck={handleOpenDeckInGames}
              onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
              onResetCourses={handleResetCourses}
              onDeleteCourse={handleDeleteSingleCourse}
              onStartCallWithMember={(member, isVideo) => {
                handleStartCallWithMember(member, isVideo);
              }}
              onStartGroupCallWithCourse={() => {
                setCurrentTab("study_room");
                stopSpeaking();
              }}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
              onOpenPrivateChatWithMember={handleOpenPrivateChatWithMember}
            />
          )}

          {currentTab === "games" && (
            <PdfGameGeneratorTab
              user={user}
              initialDeckId={selectedDeckForGames}
              onRewardXp={handleRewardXp}
              onConsumeEnergy={handleConsumeEnergy}
              onNavigateToStore={() => setCurrentTab("store")}
            />
          )}

          {currentTab === "teams" && (
            <GuildsBattlesTab
              user={user}
              onRewardXp={handleRewardXp}
              onConsumeEnergy={handleConsumeEnergy}
              onAddEnergy={handleAddEnergy}
              onUpdateUserTeam={handleUpdateUserTeam}
              onStartCallWithMember={handleStartCallWithMember}
              onOpenPrivateChatWithMember={handleOpenPrivateChatWithMember}
            />
          )}

          {currentTab === "ifes" && (
            <IfesAvaTab
              user={user}
              courses={ifesCourses}
              onUpdateCourses={handleUpdateCourses}
              onGenerateQuizFromTopic={(topic) => {
                setCurrentTab("games");
              }}
              onOpenSocraticWithTopic={(topic) => {
                setCurrentTab("lumina");
              }}
              onUpdateIfesAccount={handleUpdateIfesAccount}
              onRewardXp={handleRewardXp}
              onOpenAvaConnect={() => setIsAvaConnectOpen(true)}
            />
          )}

          {currentTab === "store" && (
            <StoreTab
              user={user}
              onBuyBadge={handleBuyBadge}
              onEquipBadge={handleEquipBadge}
              onAddEnergy={handleAddEnergy}
              onPermanentEnergyUpgrade={handlePermanentEnergyUpgrade}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
              onStudyOnAva={handleStudyOnAva}
              onUnlockCard={handleUnlockCard}
              onUpdatePet={handleUpdatePet}
              currentTheme={currentTheme}
            />
          )}

          {currentTab === "library" && (
            <LibraryTab
              user={user}
              onOpenSocraticWithContext={(topic) => {
                setCurrentTab("lumina");
              }}
              onOpenDeckWithDocument={() => {
                setCurrentTab("games");
              }}
              onRewardXp={handleRewardXp}
            />
          )}

          {currentTab === "dictionary" && (
            <DictionaryTab
              user={user}
              onOpenSocraticWithTerm={(term) => {
                setCurrentTab("lumina");
              }}
              onNavigateToFlashcards={() => {
                setCurrentTab("flashcards");
              }}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
            />
          )}

          {currentTab === "tasks" && (
            <TasksTab
              user={user}
              courses={courses}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
            />
          )}

          {currentTab === "agenda" && (
            <AgendaTab
              user={user}
              courses={courses}
              onNavigateToStudyRoom={() => {
                setCurrentTab("study_room");
                stopSpeaking();
              }}
            />
          )}

          {currentTab === "study_methods" && (
            <StudyMethodsCentralTab
              user={user}
              courses={courses}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
              onNavigateToFlashcards={() => {
                setCurrentTab("flashcards");
                stopSpeaking();
              }}
              onOpenSocraticWithTopic={(topic: string) => {
                setCurrentTab("lumina");
                stopSpeaking();
              }}
            />
          )}

          {currentTab === "flashcards" && (
            <FlashcardsAnkiTab
              user={user}
              courses={courses}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
            />
          )}

          {currentTab === "study_room" && (
            <StudyRoomVirtualTab
              user={user}
              courses={courses}
              onRewardXp={handleRewardXp}
              targetCallPeer={targetCallPeer}
              onClearTargetCallPeer={() => setTargetCallPeer(null)}
              onNavigate={(tab) => {
                setCurrentTab(tab as TabId);
                stopSpeaking();
              }}
              onStartCallWithMember={handleStartCallWithMember}
              onOpenPrivateChatWithMember={handleOpenPrivateChatWithMember}
            />
          )}

          {currentTab === "settings" && (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[var(--app-text)]">Central de Configurações</h2>
                  <p className="text-sm text-[var(--app-text-muted)]">Gerencie conta, idioma, temas de cores, acessibilidade, AVA IFES e armazenamento.</p>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-[var(--app-primary)] text-white font-bold text-sm shadow hover:opacity-90 transition cursor-pointer"
                >
                  Abrir Painel Completo
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Interactive Lesson Modal */}
      {activeLessonModule && (
        <LessonModal
          module={activeLessonModule}
          isOpen={!!activeLessonModule}
          onClose={() => setActiveLessonModule(null)}
          onComplete={handleCompleteLesson}
          onRewardXp={handleRewardXp}
          onAskLumina={(question) => {
            setCurrentTab("lumina");
          }}
        />
      )}
      {/* Offline Status Indicator */}
      <OfflineIndicator />
      {/* First Launch Mandatory Tutorial & Starter Pet Selection */}
      {!isAuthOpen && (showTutorial || !user.pet) && (
        <FirstLaunchTutorial
          isOpen={!isAuthOpen && (showTutorial || !user.pet)}
          onComplete={handleTutorialComplete}
        />
      )}
      {/* Tela de Abertura (Splash Screen) Brain Studio */}
      {showSplash && (
        <SplashScreen
          videoSrc="/splash.mp4"
          onComplete={() => {
            try {
              sessionStorage.setItem("brain_studio_splash_shown", "true");
            } catch {}
            setShowSplash(false);
          }}
        />
      )}

      {/* Real-time WebRTC Video & Audio Call Modal (Receber e Fazer Ligações) */}
      <ActiveCallModal
        currentUserId={user.email || user.name || "user-id"}
        currentUserName={user.name || "Estudante"}
      />

      {/* WhatsApp-Style 1-on-1 Private Chat Modal */}
      {activeChatTargetUser && (
        <WhatsAppChatModal
          currentUserId={user.email || user.name || "user-id"}
          currentUserName={user.name || "Estudante"}
          targetUser={activeChatTargetUser}
          onClose={() => setActiveChatTargetUser(null)}
          onStartCall={(target, isVideo) => {
            handleStartCallWithMember(target, isVideo);
          }}
        />
      )}

      {/* Real Online Users Drawer (Apenas Usuários Reais Conectados) */}
      <OnlineUsersDrawer
        isOpen={isOnlineUsersOpen}
        onClose={() => setIsOnlineUsersOpen(false)}
        currentUser={user}
        onStartCall={(target, isVideo) => {
          setIsOnlineUsersOpen(false);
          handleStartCallWithMember(target, isVideo);
        }}
        onOpenPrivateChat={(target) => {
          setIsOnlineUsersOpen(false);
          handleOpenPrivateChatWithMember(target);
        }}
      />

      {/* Modal de Conexão Estável e Permanente com o AVA IFES */}
      <AvaConnectModal
        isOpen={isAvaConnectOpen}
        onClose={() => setIsAvaConnectOpen(false)}
        user={user}
        onConnectionSuccess={handleAvaConnectionSuccess}
        onDisconnect={handleAvaDisconnect}
      />
    </div>
  );
}
