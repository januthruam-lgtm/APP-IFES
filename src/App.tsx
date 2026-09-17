import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, TabId } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { LessonModal } from "./components/LessonModal";
import { OfflineCacheModal } from "./components/OfflineCacheModal";
import { ProfileSettingsModal } from "./components/ProfileSettingsModal";
import { NotificationSettingsModal } from "./components/NotificationSettingsModal";
import { DashboardTab } from "./components/tabs/DashboardTab";
import { SocraticTutorTab } from "./components/tabs/SocraticTutorTab";
import { SequenceTrackTab } from "./components/tabs/SequenceTrackTab";
import { PdfGameGeneratorTab } from "./components/tabs/PdfGameGeneratorTab";
import { GuildsBattlesTab } from "./components/tabs/GuildsBattlesTab";
import { IfesAvaTab } from "./components/tabs/IfesAvaTab";
import { StoreTab } from "./components/tabs/StoreTab";
import { LibraryTab } from "./components/tabs/LibraryTab";
import { ColorThemeTab } from "./components/tabs/ColorThemeTab";
import { TasksTab } from "./components/tabs/TasksTab";
import { AgendaTab } from "./components/tabs/AgendaTab";
import { FlashcardsAnkiTab } from "./components/tabs/FlashcardsAnkiTab";
import { StudyMethodsCentralTab } from "./components/tabs/StudyMethodsCentralTab";
import { StudyRoomVirtualTab } from "./components/tabs/StudyRoomVirtualTab";
import { QAcademicoView } from "./components/qacademico/QAcademicoView";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { Splash3DIntro } from "./components/Splash3DIntro";
import { FirstLaunchTutorial } from "./components/FirstLaunchTutorial";
import {
  UserProfile,
  TrackModule,
  ThemeId,
  CourseTrack,
  IfesAccountInfo,
  QAcademicoAccountInfo,
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
import {
  seedDefaultOfflineCache,
  cacheStudyTracks,
  saveOfflineModuleProgress,
  clearOfflineCache,
} from "./utils/indexedDB";
import { loadSavedTheme, applyThemeToDOM, saveTheme } from "./utils/themeManager";
import confetti from "canvas-confetti";

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
      const isLoggedIn = localStorage.getItem("brain_studio_is_logged_in") === "true";
      const saved = localStorage.getItem("brain_studio_user_v3");
      if (isLoggedIn && saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.maxEnergy) {
          parsed.maxEnergy = 50;
        }
        return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return createBlankUser();
  });

  // Synced IFES Courses (from localStorage / Moodle profile)
  const [ifesCourses, setIfesCourses] = useState<IfesCourse[]>(() => {
    try {
      const isLoggedIn = localStorage.getItem("brain_studio_is_logged_in") === "true";
      return isLoggedIn ? loadSyncedCourses() : [];
    } catch {
      return [];
    }
  });

  // Dynamic CourseTracks derived directly from user's synced IFES subjects
  const [courses, setCourses] = useState<CourseTrack[]>(() => {
    try {
      const isLoggedIn = localStorage.getItem("brain_studio_is_logged_in") === "true";
      return isLoggedIn ? convertIfesCoursesToTracks(loadSyncedCourses()) : [];
    } catch {
      return [];
    }
  });

  const [currentCourse, setCurrentCourse] = useState<CourseTrack>(() => {
    try {
      const isLoggedIn = localStorage.getItem("brain_studio_is_logged_in") === "true";
      if (isLoggedIn) {
        const initialTracks = convertIfesCoursesToTracks(loadSyncedCourses());
        const found = initialTracks.find((c) => c.id === user.selectedCourseId);
        if (found) return found;
        if (initialTracks[0]) return initialTracks[0];
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
      description: "Faça login com sua matrícula IFES para carregar suas matérias.",
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
      return localStorage.getItem("brain_studio_is_logged_in") !== "true";
    } catch {
      return true;
    }
  });
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeLessonModule, setActiveLessonModule] = useState<TrackModule | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [selectedDeckForGames, setSelectedDeckForGames] = useState<string | null>(null);
  const [targetCallPeer, setTargetCallPeer] = useState<{ id: string; name: string; isVideo?: boolean } | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);
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

  // Listen for replay 3D splash events
  useEffect(() => {
    const handleReplay = () => {
      setShowSplash(true);
    };
    window.addEventListener("replay_3d_splash", handleReplay);
    return () => {
      window.removeEventListener("replay_3d_splash", handleReplay);
    };
  }, []);

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

  // Synchronize streak based on calendar days
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastActiveStr = user.lastActiveDate ? user.lastActiveDate.slice(0, 10) : "";

    if (!lastActiveStr || lastActiveStr === todayStr) {
      if (!user.lastActiveDate || user.lastActiveDate.slice(0, 10) !== todayStr) {
        setUser((prev) => ({
          ...prev,
          lastActiveDate: new Date().toISOString(),
        }));
      }
    } else {
      const diffMs = new Date(todayStr).getTime() - new Date(lastActiveStr).getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        setUser((prev) => ({
          ...prev,
          streakDays: prev.streakDays + 1,
          lastActiveDate: new Date().toISOString(),
        }));
      } else if (diffDays > 1) {
        setUser((prev) => ({
          ...prev,
          streakDays: 1,
          lastActiveDate: new Date().toISOString(),
        }));
      }
    }
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
      alert("⚡ Energia insuficiente! Visite a Loja para comprar uma Poção de Energia (🪙 50).");
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
      alert("Você não possui energias suficientes! Recarregue na Loja ou peça doação na sua Equipe.");
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
    setUser((prev) => ({
      ...prev,
      pet: newPet,
    }));
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
      alert("XP insuficiente para desbloquear este distintivo!");
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
    const baseUser = createBlankUser(
      name || ifesAccount?.fullname || email.split("@")[0],
      email
    );

    const isFirstTime = localStorage.getItem("brain_studio_tutorial_completed") !== "true";

    const loggedInUser: UserProfile = {
      ...baseUser,
      email: email.trim(),
      name: name?.trim() || ifesAccount?.fullname || email.split("@")[0],
      ifesAccount: ifesAccount,
      level: 1,
      xp: 0,
      coins: 0,
      streakDays: 1,
      activeTheme: "paper",
      pet: undefined,
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
    const tracks = convertIfesCoursesToTracks(synced);
    setCourses(tracks);
    if (tracks.length > 0) {
      setCurrentCourse(tracks[0]);
      setModules(tracks[0].modules || []);
    }
  };

  const handleUpdateProfile = (updatedUser: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  const handleUpdateIfesAccount = (ifesAccount: IfesAccountInfo | undefined) => {
    setUser((prev) => ({
      ...prev,
      ifesAccount,
      name: ifesAccount?.fullname ? ifesAccount.fullname : prev.name,
    }));
  };

  const handleUpdateQAcademicoAccount = (qacademicoAccount: QAcademicoAccountInfo | undefined) => {
    setUser((prev) => ({
      ...prev,
      qacademicoAccount,
      name: qacademicoAccount?.fullname ? qacademicoAccount.fullname : prev.name,
    }));
  };

  const handleImportQAcademicoCourses = (newCourses: IfesCourse[]) => {
    setIfesCourses((prev) => {
      const map = new Map<string, IfesCourse>();
      prev.forEach((c) => map.set(c.name.toLowerCase(), c));
      newCourses.forEach((c) => map.set(c.name.toLowerCase(), c));
      const merged = Array.from(map.values());
      saveSyncedCourses(merged);
      return merged;
    });

    setCourses((prevCourses) => {
      const tracks = convertIfesCoursesToTracks(newCourses);
      const map = new Map<string, CourseTrack>();
      prevCourses.forEach((t) => map.set(t.title.toLowerCase(), t));
      tracks.forEach((t) => map.set(t.title.toLowerCase(), t));
      const mergedTracks = Array.from(map.values());
      cacheStudyTracks(mergedTracks).catch(() => {});
      return mergedTracks;
    });
  };

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

      {/* Profile & Matrícula Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        user={user}
        onSaveUser={handleUpdateProfile}
        onResetCourses={handleResetCourses}
      />

      {/* Strict Notification Settings & Dynamic Lead Time Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
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
        onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
        isOnline={isOnline}
        currentTheme={currentTheme}
      />

      {/* Main App Container */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[var(--app-bg)] text-[var(--app-text)]">
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
          onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
          onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
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
            />
          )}

          {currentTab === "lumina" && (
            <SocraticTutorTab
              user={user}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              onRewardXp={handleRewardXp}
              courses={courses}
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
                setTargetCallPeer({ id: member.id, name: member.name, isVideo });
                setCurrentTab("study_room");
                stopSpeaking();
              }}
              onStartGroupCallWithCourse={() => {
                setCurrentTab("study_room");
                stopSpeaking();
              }}
              onRewardXp={handleRewardXp}
              onRewardCoins={handleRewardCoins}
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
            />
          )}

          {currentTab === "ifes" && (
            <IfesAvaTab
              user={user}
              onGenerateQuizFromTopic={(topic) => {
                setCurrentTab("games");
              }}
              onOpenSocraticWithTopic={(topic) => {
                setCurrentTab("lumina");
              }}
              onUpdateIfesAccount={handleUpdateIfesAccount}
              onUpdateQAcademicoAccount={handleUpdateQAcademicoAccount}
              onImportCourses={handleImportQAcademicoCourses}
              onRewardXp={handleRewardXp}
              onEnterCourse={(ifesCourse) => {
                const match = courses.find(
                  (c) =>
                    c.id === ifesCourse.id ||
                    c.title.toLowerCase().includes(ifesCourse.name.toLowerCase()) ||
                    ifesCourse.name.toLowerCase().includes(c.title.toLowerCase())
                );
                if (match) {
                  handleSelectCourse(match);
                }
                setCurrentTab("sequence");
                stopSpeaking();
              }}
            />
          )}

          {currentTab === "qacademico" && (
            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
              <QAcademicoView
                user={user}
                onUpdateQAcademicoAccount={handleUpdateQAcademicoAccount}
                onImportCourses={handleImportQAcademicoCourses}
              />
            </div>
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
              onOpenSocraticWithTopic={(topic) => {
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
            />
          )}

          {currentTab === "theme" && (
            <ColorThemeTab
              currentTheme={currentTheme}
              onThemeChange={(newTheme) => {
                setCurrentTheme(newTheme);
                saveTheme(newTheme);
                applyThemeToDOM(newTheme);
              }}
              user={user}
            />
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
      {/* Offline PWA Indicator */}
      <OfflineIndicator />
      {/* PWA Floating Install Banner */}
      <PWAInstallBanner />
      {/* First Launch Mandatory Tutorial & Starter Pet Selection */}
      {!isAuthOpen && (showTutorial || !user.pet) && (
        <FirstLaunchTutorial
          isOpen={!isAuthOpen && (showTutorial || !user.pet)}
          onComplete={handleTutorialComplete}
        />
      )}
      {/* 3D Fluid Logo Intro Animation */}
      {showSplash && (
        <Splash3DIntro onComplete={() => setShowSplash(false)} />
      )}
    </div>
  );
}
