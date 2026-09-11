import { apiUrl } from "./utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import CasesModule from "./components/CasesModule";
import SessionsModule from "./components/SessionsModule";
import CalendarModule from "./components/CalendarModule";
import DocumentsModule from "./components/DocumentsModule";
import AIAdvisor from "./components/AIAdvisor";
import AppWelcomeLogin from "./components/AppWelcomeLogin";
import SettingsModule from "./components/SettingsModule";
import DocumentationModule from "./components/DocumentationModule";
import ArchiveModule from "./components/ArchiveModule";
import RecycleBinModule from "./components/RecycleBinModule";
import TemplatesModule from "./components/TemplatesModule";
import PromoHubModule from "./components/PromoHubModule";
import YemeniLawsModule from "./components/YemeniLawsModule";
import PWAInstallButton from "./components/PWAInstallButton";

import { 
  LayoutDashboard, Briefcase, Clock, Calendar, FileText, 
  FolderOpen, Megaphone, Sparkles, Scale, Archive, Trash2, Settings,
  BookOpen
} from "lucide-react";

import { LegalCase, LegalSession, Document, CaseType, CaseStatus, SessionStatus, Attachment, RecycleBinItem } from "./types";

import { SEED_CASES, SEED_SESSIONS, SEED_DOCUMENTS } from "./data/seedData";

const INITIAL_CASES: any[] = [];
const INITIAL_SESSIONS: any[] = [];
const INITIAL_DOCUMENTS: any[] = [];

const NAV_ITEMS = [
  { id: "dashboard", label: "الرئيسية والمؤشرات", icon: LayoutDashboard },
  { id: "cases", label: "إدارة القضايا", icon: Briefcase },
  { id: "sessions", label: "جدول الجلسات", icon: Clock },
  { id: "calendar", label: "التقاويم المزدوجة", icon: Calendar },
  { id: "documents", label: "محرر الوثائق والمستندات", icon: FileText },
  { id: "templates", label: "نماذج الوثائق (654)", icon: FolderOpen },
  { id: "promo-hub", label: "مركز الترويج والإعلانات", icon: Megaphone },
  { id: "ai-advisor", label: "المستشار اليمني الذكي", icon: Sparkles },
  { id: "yemen-laws", label: "موسوعة التشريع اليمني", icon: BookOpen },
  { id: "notarizations", label: "التوثيقات والقرارات", icon: Scale },
  { id: "archive", label: "الأرشيف العدلي الحصين", icon: Archive },
  { id: "recycle-bin", label: "سلة المحذوفات", icon: Trash2 },
  { id: "settings", label: "الإعدادات والمظهر", icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [quickAiPrompt, setQuickAiPrompt] = useState<string>("");

  const [themeMode, setThemeMode] = useState<string>(() => {
    return localStorage.getItem("watihi_theme_mode") || "parchment";
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem("watihi_theme_accent") || "marib_gold";
  });

  const getThemeStyles = () => {
    let bg = "#F8F6F0";
    let card = "#FFFFFF";
    let text = "#0F172A";
    let border = "#E2DDD1";

    if (themeMode === "cosmic_navy") {
      bg = "#0B121F";
      card = "#111E30";
      text = "#E2E8F0";
      border = "#1E293B";
    } else if (themeMode === "shibam_sepia") {
      bg = "#F5ECD7";
      card = "#FDFBF7";
      text = "#3D2712";
      border = "#E4DCCF";
    }

    let accent = "#B58A3C";
    if (accentColor === "sanaa_green") accent = "#059669";
    else if (accentColor === "aden_sapphire") accent = "#1D4ED8";
    else if (accentColor === "taiz_crimson") accent = "#DC2626";
    else if (accentColor === "violet_sheba") accent = "#7C3AED";
    else if (accentColor.startsWith("#")) accent = accentColor;

    return `
      :root {
        --app-bg: ${bg};
        --app-card: ${card};
        --app-text: ${text};
        --app-border: ${border};
        --app-accent: ${accent};
      }
      body {
        background-color: var(--app-bg) !important;
        color: var(--app-text) !important;
      }
      .bg-stone-50, [class*="bg-stone-50"] {
        background-color: var(--app-bg) !important;
      }
      .bg-white, [class*="bg-white"] {
        background-color: var(--app-card) !important;
      }
      .bg-stone-100, [class*="bg-stone-100"] {
        background-color: ${themeMode === "cosmic_navy" ? "#1B2A4A" : "#F0EDE4"} !important;
      }
      .hover\\:bg-stone-50:hover {
        background-color: ${themeMode === "cosmic_navy" ? "#1D2D4F" : "#EFECE2"} !important;
      }
      .hover\\:bg-stone-100:hover {
        background-color: ${themeMode === "cosmic_navy" ? "#22355C" : "#E5E1D4"} !important;
      }
      .border, .border-stone-200, .border-stone-100, .border-stone-150, .border-stone-300, .border-slate-800, .border-slate-755 {
        border-color: var(--app-border) !important;
      }
      .text-slate-900, .text-stone-850, .text-stone-850, .text-stone-850, .text-stone-700, .text-slate-850, .text-slate-800, .text-slate-950, .text-stone-900 {
        color: var(--app-text) !important;
      }
      .text-stone-600, .text-stone-500, .text-stone-400, .text-slate-400, .text-slate-500 {
        color: ${themeMode === "cosmic_navy" ? "#94A3B8" : "#4A5568"} !important;
      }
      .text-amber-500, .text-amber-400, .text-amber-600, .text-amber-700 {
        color: var(--app-accent) !important;
      }
      .border-amber-500, .border-amber-400 {
        border-color: var(--app-accent) !important;
      }
      .bg-amber-400, .bg-amber-500, [class*="bg-amber-400"], [class*="bg-amber-500"] {
        background-color: var(--app-accent) !important;
        color: #FFFFFF !important;
      }
      .bg-amber-400:hover, .bg-amber-500:hover, [class*="bg-amber-400"]:hover, [class*="bg-amber-500"]:hover {
        filter: brightness(0.85) !important;
        background-color: var(--app-accent) !important;
      }
      input, select, textarea {
        background-color: var(--app-card) !important;
        color: var(--app-text) !important;
        border-color: var(--app-border) !important;
      }
      input:focus, select:focus, textarea:focus {
        border-color: var(--app-accent) !important;
        box-shadow: 0 0 0 2px ${accent}25 !important;
      }
      option {
        background-color: var(--app-card) !important;
        color: var(--app-text) !important;
      }
      #app-header {
        border-bottom-color: var(--app-accent) !important;
      }
      ::selection {
        background-color: ${accent}30 !important;
        color: var(--app-text) !important;
      }
      ::-webkit-scrollbar-track {
        background: var(--app-bg) !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--app-accent) !important;
      }
    `;
  };

  // User Session & Cloud Sync States
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(() => {
    try {
      const saved = localStorage.getItem("watihi_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAdmin = !currentUser || (currentUser as any).isAdmin === true;

  useEffect(() => {
    const adminOnlyTabs = ["promo-hub", "recycle-bin", "archive", "notarizations"];
    if (!isAdmin && adminOnlyTabs.includes(activeTab)) {
      setActiveTab("dashboard");
    }
  }, [activeTab, isAdmin]);

  const [attorneyName, setAttorneyName] = useState<string>(() => {
    return localStorage.getItem("watihi_attorney_name") || "الوتيحي للمحاماة";
  });

  const [bypassAuth, setBypassAuth] = useState<boolean>(() => {
    try {
      return localStorage.getItem("watihi_bypass_auth") === "true";
    } catch {
      return false;
    }
  });

  const [trialTimeLeft, setTrialTimeLeft] = useState<number | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error" | "offline">(
    typeof navigator !== "undefined" && navigator.onLine ? "synced" : "offline"
  );
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    return localStorage.getItem("watihi_last_synced_time") || null;
  });

  // Storage states with fallback
  const [cases, setCases] = useState<LegalCase[]>(() => {
    try {
      const saved = localStorage.getItem("watihi_cases");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading watihi_cases from localStorage:", e);
    }
    return INITIAL_CASES;
  });

  const [sessions, setSessions] = useState<LegalSession[]>(() => {
    try {
      const saved = localStorage.getItem("watihi_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading watihi_sessions from localStorage:", e);
    }
    return INITIAL_SESSIONS;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem("watihi_documents");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading watihi_documents from localStorage:", e);
    }
    return INITIAL_DOCUMENTS;
  });

  const [recycleBin, setRecycleBin] = useState<RecycleBinItem[]>(() => {
    try {
      const saved = localStorage.getItem("watihi_recycle_bin");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading watihi_recycle_bin from localStorage:", e);
    }
    return [];
  });

  // Refs to capture latest state values for non-stale reads in debounced calls
  const latestDataRef = useRef({ cases, sessions, documents, recycleBin, currentUser });
  useEffect(() => {
    latestDataRef.current = { cases, sessions, documents, recycleBin, currentUser };
  }, [cases, sessions, documents, recycleBin, currentUser]);

  const syncTimeoutRef = useRef<any>(null);
  const isSyncingRef = useRef<boolean>(false);
  const isSyncBlockedRef = useRef<boolean>(false);

  // Safe routine to save and push to server with intelligent debouncing, concurrency locking & retry backoff
  const syncWithServer = (
    forceCases?: LegalCase[],
    forceSessions?: LegalSession[],
    forceDocs?: Document[],
    forceRecycleBin?: RecycleBinItem[]
  ) => {
    if (!currentUser) return;
    if (!navigator.onLine) {
      setSyncStatus("offline");
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setSyncStatus("syncing");

    syncTimeoutRef.current = setTimeout(async () => {
      // Prevent concurrent overlapping requests
      if (isSyncingRef.current) {
        // Reschedule to allow current request to complete
        syncWithServer(forceCases, forceSessions, forceDocs, forceRecycleBin);
        return;
      }

      isSyncingRef.current = true;
      let retries = 3;
      let delay = 1000;

      const dataToSync = {
        cases: forceCases || latestDataRef.current.cases,
        sessions: forceSessions || latestDataRef.current.sessions,
        documents: forceDocs || latestDataRef.current.documents,
        recycleBin: forceRecycleBin || latestDataRef.current.recycleBin,
        username: latestDataRef.current.currentUser?.username || "",
        sessionToken: (latestDataRef.current.currentUser as any)?.sessionToken || ""
      };

      if (!dataToSync.username) {
        isSyncingRef.current = false;
        return;
      }

      while (retries > 0) {
        try {
          const response = await fetch(apiUrl("/api/sync/push"), {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-session-token": dataToSync.sessionToken
            },
            body: JSON.stringify({
              username: dataToSync.username,
              sessionToken: dataToSync.sessionToken,
              cases: dataToSync.cases,
              sessions: dataToSync.sessions,
              documents: dataToSync.documents,
              recycleBin: dataToSync.recycleBin
            })
          });

          if (!response.ok) {
            if (response.status === 404 || response.status === 401 || response.status === 403) {
              console.warn("Sync failed with unrecoverable server status:", response.status);
              setSyncStatus("error");
              isSyncingRef.current = false;
              return;
            }
            throw new Error(`Server status ${response.status}`);
          }
          
          setSyncStatus("synced");
          const timeStr = new Date().toLocaleTimeString("ar-YE", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncedTime(timeStr);
          localStorage.setItem("watihi_last_synced_time", timeStr);
          isSyncingRef.current = false;
          return;
        } catch (err: any) {
          console.warn(`Sync attempt failed (${retries} retries left):`, err);
          retries--;
          if (retries === 0) {
            console.error("Data synchronization error:", err);
            setSyncStatus("error");
          } else {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }
      isSyncingRef.current = false;
    }, 1000); // 1-second debounce buffer
  };

  // Sync to local storage & trigger background push on state changes
  useEffect(() => {
    localStorage.setItem("watihi_cases", JSON.stringify(cases));
    if (currentUser && isOnline && !isSyncBlockedRef.current) {
      syncWithServer();
    }
  }, [cases]);

  useEffect(() => {
    localStorage.setItem("watihi_sessions", JSON.stringify(sessions));
    if (currentUser && isOnline && !isSyncBlockedRef.current) {
      syncWithServer();
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("watihi_documents", JSON.stringify(documents));
    if (currentUser && isOnline && !isSyncBlockedRef.current) {
      syncWithServer();
    }
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("watihi_recycle_bin", JSON.stringify(recycleBin));
    if (currentUser && isOnline && !isSyncBlockedRef.current) {
      syncWithServer();
    }
  }, [recycleBin]);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (currentUser) {
        syncWithServer(cases, sessions, documents);
      } else {
        setSyncStatus("synced");
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [currentUser, cases, sessions, documents]);

  // 10-minute Session timeout for Local activated Guest/Trial session
  useEffect(() => {
    if (!bypassAuth) {
      setTrialTimeLeft(null);
      return;
    }

    const checkTimeout = () => {
      const activatedAtRaw = localStorage.getItem("watihi_bypass_activated_at");
      let activatedAt = activatedAtRaw ? parseInt(activatedAtRaw, 10) : null;

      if (!activatedAt) {
        activatedAt = Date.now();
        localStorage.setItem("watihi_bypass_activated_at", activatedAt.toString());
      }

      const tenMinutesMs = 10 * 60 * 1000;
      const elapsed = Date.now() - activatedAt;
      const remainingMs = tenMinutesMs - elapsed;

      if (remainingMs <= 0) {
        // Clear trial keys
        localStorage.removeItem("watihi_bypass_auth");
        localStorage.removeItem("watihi_bypass_activated_at");
        // Clear temporary data created in the session for maximum security
        localStorage.removeItem("watihi_cases");
        localStorage.removeItem("watihi_sessions");
        localStorage.removeItem("watihi_documents");

        setBypassAuth(false);
        setTrialTimeLeft(null);
        alert("⚠️ انتهت المدة المخصصة للتجربة محلياً (10 دقائق).\n\nقامت الخزنة المؤقتة بإغلاق الجلسة فوراً لحفظ الأمان والتام. يرجى تسجيل الدخول أو إدخال رمز تفعيل صالح للمتابعة.");
        window.location.reload();
      } else {
        setTrialTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));
      }
    };

    // Run first check
    checkTimeout();

    // Set interval check every 1 second
    const interval = setInterval(checkTimeout, 1000);
    return () => clearInterval(interval);
  }, [bypassAuth]);

  // Handle Authentication actions
  const handleLogin = (username: string, dataLoadedFromServer: any, userObject?: any, attorneyNameInput?: string) => {
    // Block synchronization during state updates to prevent overwriting with stale arrays
    isSyncBlockedRef.current = true;

    const user = userObject || { 
      username, 
      isAdmin: username.toLowerCase() === "admin" || username.toLowerCase() === "watihi" || false,
      subscriptionStatus: "active",
      subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      inviteCodeUsed: ""
    };
    setCurrentUser(user);
    localStorage.setItem("watihi_current_user", JSON.stringify(user));
    setBypassAuth(false);
    localStorage.removeItem("watihi_bypass_auth");
    localStorage.removeItem("watihi_bypass_activated_at");

    if (attorneyNameInput) {
      setAttorneyName(attorneyNameInput);
      localStorage.setItem("watihi_attorney_name", attorneyNameInput);
    }

    if (dataLoadedFromServer) {
      if (Array.isArray(dataLoadedFromServer.cases)) {
        setCases(dataLoadedFromServer.cases);
        localStorage.setItem("watihi_cases", JSON.stringify(dataLoadedFromServer.cases));
      }
      if (Array.isArray(dataLoadedFromServer.sessions)) {
        setSessions(dataLoadedFromServer.sessions);
        localStorage.setItem("watihi_sessions", JSON.stringify(dataLoadedFromServer.sessions));
      }
      if (Array.isArray(dataLoadedFromServer.documents)) {
        setDocuments(dataLoadedFromServer.documents);
        localStorage.setItem("watihi_documents", JSON.stringify(dataLoadedFromServer.documents));
      }
      if (Array.isArray(dataLoadedFromServer.recycleBin)) {
        setRecycleBin(dataLoadedFromServer.recycleBin);
        localStorage.setItem("watihi_recycle_bin", JSON.stringify(dataLoadedFromServer.recycleBin));
      }
    }

    setSyncStatus("synced");
    const timeStr = new Date().toLocaleTimeString("ar-YE", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncedTime(timeStr);
    localStorage.setItem("watihi_last_synced_time", timeStr);

    // Release synchronization lock after React state settles
    setTimeout(() => {
      isSyncBlockedRef.current = false;
    }, 1500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("watihi_current_user");
    localStorage.removeItem("watihi_last_synced_time");
    setLastSyncedTime(null);
    setSyncStatus(navigator.onLine ? "synced" : "offline");
    setBypassAuth(false);
    localStorage.removeItem("watihi_bypass_auth");
    localStorage.removeItem("watihi_bypass_activated_at");
    setRecycleBin([]);
    localStorage.removeItem("watihi_recycle_bin");
  };

  // Case updates handlers
  const handleAddCase = (newCase: LegalCase) => {
    setCases(prev => [newCase, ...prev]);
  };

  const handleUpdateCase = (updated: LegalCase) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteCase = (caseId: string) => {
    const caseToDelete = cases.find(c => c.id === caseId);
    if (caseToDelete) {
      const associatedSessions = sessions.filter(s => s.caseId === caseId);
      const newItem: RecycleBinItem = {
        id: caseId,
        type: "case",
        deletedAt: new Date().toISOString(),
        itemData: caseToDelete,
        associatedSessions: associatedSessions
      };
      setRecycleBin(prev => [newItem, ...prev]);
    }
    setCases(prev => prev.filter(c => c.id !== caseId));
    // Also delete connected sessions from active lists
    setSessions(prev => prev.filter(s => s.caseId !== caseId));
  };

  const handleAddAttachment = (caseId: string, att: Attachment) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          attachments: [att, ...c.attachments]
        };
      }
      return c;
    }));
  };

  const handleDeleteAttachment = (caseId: string, attId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          attachments: c.attachments.filter(a => a.id !== attId)
        };
      }
      return c;
    }));
  };

  // Sessions updates handlers
  const handleAddSession = (newSession: LegalSession) => {
    setSessions(prev => [newSession, ...prev]);
  };

  const handleUpdateSession = (updated: LegalSession) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleDeleteSession = (sessionId: string) => {
    const sessionToDelete = sessions.find(s => s.id === sessionId);
    if (sessionToDelete) {
      const newItem: RecycleBinItem = {
        id: sessionId,
        type: "session",
        deletedAt: new Date().toISOString(),
        itemData: sessionToDelete
      };
      setRecycleBin(prev => [newItem, ...prev]);
    }
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Documents updates handlers
  const handleAddDoc = (newDoc: Document) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleUpdateDoc = (updated: Document) => {
    setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleDeleteDoc = (docId: string) => {
    const docToDelete = documents.find(d => d.id === docId);
    if (docToDelete) {
      const newItem: RecycleBinItem = {
        id: docId,
        type: "document",
        deletedAt: new Date().toISOString(),
        itemData: docToDelete
      };
      setRecycleBin(prev => [newItem, ...prev]);
    }
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDocId === docId) setSelectedDocId(null);
  };

  const handleRestoreItem = (item: RecycleBinItem) => {
    if (item.type === "case") {
      setCases(prev => [item.itemData, ...prev]);
      if (item.associatedSessions && item.associatedSessions.length > 0) {
        setSessions(prev => [...item.associatedSessions!, ...prev]);
      }
    } else if (item.type === "session") {
      setSessions(prev => [item.itemData, ...prev]);
    } else if (item.type === "document") {
      setDocuments(prev => [item.itemData, ...prev]);
    }
    setRecycleBin(prev => prev.filter(i => i.id !== item.id));
  };

  const handlePermanentlyDeleteItem = (itemId: string) => {
    setRecycleBin(prev => prev.filter(i => i.id !== itemId));
  };

  const handleEmptyRecycleBin = () => {
    setRecycleBin([]);
  };

  const handleLoadSeedData = () => {
    setCases(SEED_CASES);
    setSessions(SEED_SESSIONS);
    setDocuments(SEED_DOCUMENTS);

    localStorage.setItem("watihi_cases", JSON.stringify(SEED_CASES));
    localStorage.setItem("watihi_sessions", JSON.stringify(SEED_SESSIONS));
    localStorage.setItem("watihi_documents", JSON.stringify(SEED_DOCUMENTS));

    syncWithServer(SEED_CASES, SEED_SESSIONS, SEED_DOCUMENTS);
  };

  if (!currentUser && !bypassAuth) {
    return (
      <AppWelcomeLogin 
        onLogin={(username, serverData, userObject, attorneyNameInput) => {
          if (attorneyNameInput) {
            setAttorneyName(attorneyNameInput);
            localStorage.setItem("watihi_attorney_name", attorneyNameInput);
          }
          handleLogin(username, serverData, userObject);
        }}
        onBypass={(attorneyNameInput) => {
          setBypassAuth(true);
          localStorage.setItem("watihi_bypass_auth", "true");
          localStorage.setItem("watihi_bypass_activated_at", Date.now().toString());
          if (attorneyNameInput) {
            setAttorneyName(attorneyNameInput);
            localStorage.setItem("watihi_attorney_name", attorneyNameInput);
          }
        }}
        isOnline={isOnline}
      />
    );
  }

  // Filter out archived items from active views
  const activeCases = cases.filter(c => c.status !== CaseStatus.CLOSED);
  const activeSessions = sessions.filter(s => {
    const parentCase = cases.find(c => c.id === s.caseId);
    return !parentCase || parentCase.status !== CaseStatus.CLOSED;
  });
  const activeDocuments = documents.filter(d => !d.isArchived);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900" id="main-app-shell">
      
      {/* If trial is active, show warning banner */}
      {trialTimeLeft !== null && (
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white py-2 px-4 text-center text-xs font-bold shadow-md flex items-center justify-center gap-3 animate-pulse" dir="rtl">
          <span>⚠️ جلسة تفعيل برمجية مؤقتة ومحمية (10 دقائق للتجربة)</span>
          <span className="bg-slate-950/25 px-2.5 py-0.5 rounded-full font-mono text-xs font-black">
            متبقي: {Math.floor(trialTimeLeft / 60)} دقيقة و {trialTimeLeft % 60} ثانية
          </span>
          <span className="text-[10px] opacity-90 hidden sm:inline">• بعد انتهائها سيغلق التطبيق فوراً لحفظ السلامة والأمان</span>
        </div>
      )}

      {/* Dynamic Header & Navigation tabs with Cloud Sync indicators */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sessions={activeSessions} 
        cases={activeCases} 
        currentUser={currentUser}
        isOnline={isOnline}
        syncStatus={syncStatus}
        lastSyncedTime={lastSyncedTime}
        handleLogout={handleLogout}
        attorneyName={attorneyName}
      />

      {/* Primary content area rendering with responsive layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8" dir="rtl">
        
        {/* Right Sidebar - Vertical Navigation Menu */}
        <aside className="w-full lg:w-72 shrink-0">
          {/* Mobile Accordion Toggle Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full bg-slate-900 text-amber-400 p-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-between shadow-md border border-slate-800 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const currentItem = NAV_ITEMS.find(n => n.id === activeTab);
                  const Icon = currentItem?.icon || LayoutDashboard;
                  return <Icon className="h-4.5 w-4.5 text-amber-400" />;
                })()}
                <span>أقسام المنصة: {NAV_ITEMS.find(n => n.id === activeTab)?.label || ""}</span>
              </div>
              <span className="text-xs">{mobileMenuOpen ? "▲ إغلاق القائمة" : "▼ استعراض الأقسام"}</span>
            </button>
          </div>

          {/* Sidebar Menu Panel */}
          <div className={`bg-white rounded-3xl border border-stone-200 shadow-sm p-5 space-y-4 lg:block sticky top-6 ${mobileMenuOpen ? "block" : "hidden"}`}>
            <div className="border-b border-stone-100 pb-3 hidden lg:block">
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider block mb-1">لوحة التحكم والتنقل</span>
              <h3 className="font-extrabold text-sm text-slate-900">أقسام المنصة العدلية</h3>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              {(() => {
                const isAdmin = !currentUser || (currentUser as any).isAdmin === true;
                const filteredNavItems = NAV_ITEMS.filter(item => {
                  if (!isAdmin) {
                    const adminOnlyTabs = ["promo-hub", "recycle-bin", "archive", "notarizations"];
                    return !adminOnlyTabs.includes(item.id);
                  }
                  return true;
                });
                return filteredNavItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false); // Close mobile menu after clicking
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-right text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-3 cursor-pointer border ${
                        isActive
                          ? "bg-slate-900 text-amber-400 border-slate-900 shadow-md transform lg:-translate-x-1"
                          : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200 hover:text-slate-900"
                      }`}
                    >
                      <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-400" : "text-stone-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                });
              })()}
            </nav>
            <PWAInstallButton />
          </div>
        </aside>

        {/* Left Area - Main Content */}
        <main className="flex-1 min-w-0 animate-fade-in space-y-6">
          
          {activeTab === "dashboard" && (
            <Dashboard 
              cases={activeCases}
              sessions={activeSessions}
              documents={activeDocuments}
              setActiveTab={setActiveTab}
              setSelectedCaseId={setSelectedCaseId}
              setSelectedDocId={setSelectedDocId}
              setQuickAiPrompt={setQuickAiPrompt}
              onAddSession={handleAddSession}
              currentUser={currentUser}
              isOnline={isOnline}
              syncStatus={syncStatus}
              lastSyncedTime={lastSyncedTime}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              onManualSync={() => syncWithServer(cases, sessions, documents)}
              attorneyName={attorneyName}
            />
          )}

          {activeTab === "cases" && (
            <CasesModule 
              cases={activeCases}
              sessions={activeSessions}
              selectedCaseId={selectedCaseId}
              setSelectedCaseId={setSelectedCaseId}
              onAddCase={handleAddCase}
              onUpdateCase={handleUpdateCase}
              onDeleteCase={handleDeleteCase}
              onAddAttachmentToCase={handleAddAttachment}
              onDeleteAttachmentFromCase={handleDeleteAttachment}
              setQuickAiPrompt={setQuickAiPrompt}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
            />
          )}

          {activeTab === "sessions" && (
            <SessionsModule 
              sessions={activeSessions}
              cases={activeCases}
              onAddSession={handleAddSession}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarModule 
              sessions={activeSessions}
              setActiveTab={setActiveTab}
              setSelectedCaseId={setSelectedCaseId}
            />
          )}

          {activeTab === "documents" && (
            <DocumentsModule 
              documents={activeDocuments}
              selectedDocId={selectedDocId}
              setSelectedDocId={setSelectedDocId}
              onAddDoc={handleAddDoc}
              onUpdateDoc={handleUpdateDoc}
              onDeleteDoc={handleDeleteDoc}
              currentUser={currentUser}
            />
          )}

          {activeTab === "templates" && (
            <TemplatesModule 
              onAddDoc={handleAddDoc}
              currentUser={currentUser}
              attorneyName={attorneyName}
            />
          )}

          {activeTab === "promo-hub" && (
            <PromoHubModule attorneyName={attorneyName} />
          )}

          {activeTab === "ai-advisor" && (
            <AIAdvisor 
              quickAiPrompt={quickAiPrompt}
              setQuickAiPrompt={setQuickAiPrompt}
              attorneyName={attorneyName}
            />
          )}

          {activeTab === "yemen-laws" && (
            <YemeniLawsModule />
          )}

          {activeTab === "notarizations" && (
            <DocumentationModule />
          )}

          {activeTab === "archive" && (
            <ArchiveModule 
              cases={cases}
              documents={documents}
              onUpdateCase={handleUpdateCase}
              onUpdateDoc={handleUpdateDoc}
              onAddDoc={handleAddDoc}
              currentUser={currentUser}
            />
          )}

          {activeTab === "recycle-bin" && (
            <RecycleBinModule 
              recycleBin={recycleBin}
              onRestoreItem={handleRestoreItem}
              onPermanentlyDeleteItem={handlePermanentlyDeleteItem}
              onEmptyRecycleBin={handleEmptyRecycleBin}
            />
          )}

          {activeTab === "settings" && (
            <SettingsModule 
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              accentColor={accentColor}
              setAccentColor={setAccentColor}
              currentUser={currentUser}
              cases={cases}
              sessions={sessions}
              documents={documents}
              syncStatus={syncStatus}
              lastSyncedTime={lastSyncedTime}
              onManualSync={() => syncWithServer(cases, sessions, documents)}
              handleLogout={handleLogout}
              onLoadSeedData={handleLoadSeedData}
              attorneyName={attorneyName}
              setAttorneyName={setAttorneyName}
            />
          )}

        </main>
      </div>

      {/* Dynamic Style injection override tag */}
      <style dangerouslySetInnerHTML={{ __html: getThemeStyles() }} />

      {/* Styled Footer */}
      <footer id="app-footer" className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-right">
            <span className="font-bold text-white">نظام المحامي {attorneyName} الذكي</span> • جميع الحقوق محفوظة © {new Date().getFullYear()}م
          </div>
          <div className="text-left text-[11px] font-mono text-slate-500">
            صياغات معتمدة • لجانب المحاكم الابتدائية والاستئنافية ومجلس القضاء اليمني الأعلى
          </div>
        </div>
      </footer>

    </div>
  );
}
