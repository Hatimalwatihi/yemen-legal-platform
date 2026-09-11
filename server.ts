import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import AdmZip from "adm-zip";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_CASES, SEED_SESSIONS, SEED_DOCUMENTS } from "./src/data/seedData";
import { YEMENI_LAWS } from "./src/data/yemeniLaws";

dotenv.config();

import crypto from "crypto";

// Secure password hashing helper (Scrypt-based with timing-safe check)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored || typeof stored !== "string") return false;
  if (!stored.includes(":")) {
    return false; // Never accept legacy plaintext passwords; require a password reset/migration
  }
  const [salt, hash] = stored.split(":");
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
}

const app = express();
const PORT = 3000;

app.disable("x-powered-by");

// Strict CORS for Capacitor/Web clients. Configure explicit origins in production.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.CORS_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
  if (origin && (allowed.includes(origin) || allowed.includes("*"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-session-token, x-admin-token, x-admin-user");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Advanced Security Headers (Optimized for AI Studio frames and protection)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https:; img-src 'self' https: data: blob:; media-src 'self' data: blob:; " +
    "frame-ancestors 'self' https://*.google.com https://*.run.app https://ai.studio https://*.googleusercontent.com; " +
    "img-src 'self' https: data: blob:;"
  );
  next();
});

// Advanced Brute-Force lockout & IP Rate Limiting Maps
const ipLogs = new Map<string, { count: number; resetTime: number }>();
const bruteLockouts = new Map<string, { attempts: number; lockUntil: number }>();

const securityLimiter = (req: any, res: any, next: any) => {
  if (!req.path.startsWith("/api/")) return next();
  
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  
  // 1. Check Brute-Force Lockouts
  const lockInfo = bruteLockouts.get(ip);
  if (lockInfo && now < lockInfo.lockUntil) {
    const secondsLeft = Math.ceil((lockInfo.lockUntil - now) / 1000);
    return res.status(429).json({
      error: `⚠️ تنبيه أمني عالي: تم قفل الجهاز برمجياً لتكرار محاولات فاشلة تلقائياً. يمكنك المحاولة مجدداً بعد ${secondsLeft} ثانية لحماية حسابات وبيانات الموكلين.`
    });
  }
  
  // 2. Spam Prevention Rate Limit (Max 150 requests per minute)
  let log = ipLogs.get(ip);
  if (!log || now > log.resetTime) {
    ipLogs.set(ip, { count: 1, resetTime: now + 60000 });
  } else {
    log.count++;
    if (log.count > 150) {
      return res.status(429).json({
        error: "⚠️ تم استشعار حركة مرور كثيفة وضارة من جهازك. تم تعليق طلباتك لمدة دقيقة لحماية خوادم مكتب المحاماة ومكافحة هجمات حجب الخدمة."
      });
    }
  }
  next();
};
app.use(securityLimiter);

// Recursive Sanitization tool to scrub off malicious strings and dangerous HTML scripts
function sanitizeInput(obj: any): any {
  if (typeof obj === "string") {
    // Skip processing large or base64 payloads to avoid event loop block, regex backtracking CPU hang & crash.
    if (obj.length > 1000 || obj.startsWith("data:") || obj.includes(";base64,")) {
      return obj;
    }
    // Only apply regex replacements if the string actually has characters that could construct scripts/events
    const hasScript = obj.includes("<") || obj.includes(">") || obj.includes(":");
    const hasEvent = obj.toLowerCase().includes("on");
    if (hasScript || hasEvent) {
      const sanitized = obj
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "[إجراء خبيث محذوف]")
        .replace(/on\w+\s*=\s*"[^"]*"/gi, "") // remove onmouseover, onerror etc
        .replace(/on\w+\s*=\s*'[^']*'/gi, "")
        .replace(/javascript\s*:/gi, "no-js:"); // deactivate javascript URI
      if (sanitized !== obj) {
        logSecurityEvent(null, "WAF_AUTO", "Blocked Script Injection", "HIGH", `Scrubbed potentially malicious payload content: "${obj.substring(0, 100)}..."`);
      }
      return sanitized;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj !== null && typeof obj === "object") {
    const cleaned: any = {};
    for (const key in obj) {
      if (key === "__proto__" || key === "constructor") continue; // Prevent prototype pollution
      cleaned[key] = sanitizeInput(obj[key]);
    }
    return cleaned;
  }
  return obj;
}

app.use(express.json({ limit: "250mb" }));
app.use(express.urlencoded({ limit: "250mb", extended: true }));

app.use("/api/", (req, res, next) => {
  // Completely bypass recursive input sanitization on massive payload endpoints to ensure high performance
  const skipSanitizationPaths = [
    "/api/sync/push",
    "/api/upload-file",
    "/api/gemini/ocr",
    "/api/gemini/analyze"
  ];
  if (skipSanitizationPaths.includes(req.path)) {
    return next();
  }

  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
});

// Server-side JSON database path for user accounts and synchronized data
const DB_FILE = path.join(process.cwd(), "data_users_db.json");

// Global cache for Cloud Firestore database entries
let memoryDB: { users: any; inviteCodes: any[] } = { users: {}, inviteCodes: [] };
let dbInstance: any = null;

function getFirestoreDB(): any {
  if (dbInstance) return dbInstance;
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      // Safe check for placeholder or remixed project ID to avoid hanging on startup
      if (config.projectId === "remixed-project-id" || !config.projectId || config.projectId.includes("remixed") || config.projectId.includes("placeholder")) {
        console.log("[Firebase] Detected placeholder/remixed project ID. Bypassing Firestore initialization.");
        return null;
      }
      if (getApps().length === 0) {
        initializeApp({
          projectId: config.projectId
        });
      }
      dbInstance = getFirestore(getApps()[0] || getApp(), config.firestoreDatabaseId || "(default)");
      console.log("[Firebase] Admin initialized with Database ID:", config.firestoreDatabaseId);
    } else {
      if (getApps().length === 0) {
        initializeApp();
      }
      dbInstance = getFirestore();
      console.log("[Firebase] Admin initialized with default configuration.");
    }
  } catch (err) {
    console.error("[Firebase] Initialization error, fallback to memory:", err);
  }
  return dbInstance;
}

// Local file DB reader (only used as fallback or initial seed)
function readDBFromFile(): any {
  try {
    const bootstrapUsername = (process.env.BOOTSTRAP_ADMIN_USERNAME || "").trim().toLowerCase();
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "";
    const inviteCode = (process.env.LEGAL_INVITE_CODE || "").trim().toUpperCase();
    const defaultDB: any = { users: {}, inviteCodes: [] };

    if (bootstrapUsername && bootstrapPassword.length >= 12) {
      defaultDB.users[bootstrapUsername] = {
        username: bootstrapUsername,
        password: hashPassword(bootstrapPassword),
        attorneyName: "المكتب القانوني",
        cases: [], sessions: [], documents: [], recycleBin: [],
        subscriptionStatus: "active",
        subscriptionExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        inviteCodeUsed: "BOOTSTRAP",
        isAdmin: true,
        sessionToken: "",
        lastSynced: new Date().toISOString()
      };
    }
    if (inviteCode.length >= 8) {
      defaultDB.inviteCodes.push({ code: inviteCode, isUsed: false, usedBy: "" });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
      return defaultDB;
    }
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    parsed.users = parsed.users && typeof parsed.users === "object" ? parsed.users : {};
    parsed.inviteCodes = Array.isArray(parsed.inviteCodes) ? parsed.inviteCodes : [];

    // Optional one-time bootstrap account for fresh deployments; never create hard-coded credentials.
    if (bootstrapUsername && bootstrapPassword.length >= 12 && !parsed.users[bootstrapUsername]) {
      parsed.users[bootstrapUsername] = defaultDB.users[bootstrapUsername];
    }
    if (inviteCode.length >= 8 && !parsed.inviteCodes.some((c: any) => c?.code === inviteCode)) {
      parsed.inviteCodes.push({ code: inviteCode, isUsed: false, usedBy: "" });
    }
    return parsed;
  } catch (error) {
    console.error("Local file DB read error:", error);
    return { users: {}, inviteCodes: [] };
  }
}
// Load entire database from Cloud Firestore into localized memory
async function initDatabaseFromFirestore() {
  const firestore = getFirestoreDB();
  if (!firestore) {
    console.log("[Firestore] Not available. Falling back to local file.");
    memoryDB = readDBFromFile();
    return;
  }

  try {
    console.log("[Firestore] Fetching records from europe-west2 cloud...");
    
    // Set a strict timeout race (3 seconds) to prevent hanging the Express server startup
    const fetchPromise = (async () => {
      const usersSnapshot = await firestore.collection("users").get();
      const codesSnapshot = await firestore.collection("invite_codes").get();
      let logsSnapshot = null;
      try {
        logsSnapshot = await firestore.collection("security_logs").orderBy("timestamp", "desc").limit(100).get();
      } catch (logErr) {
        console.log("[Firestore] security_logs collection empty or not created yet.");
      }
      return { usersSnapshot, codesSnapshot, logsSnapshot };
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Firestore connection timed out (3s limit)")), 3000);
    });

    const { usersSnapshot, codesSnapshot, logsSnapshot } = await Promise.race([
      fetchPromise,
      timeoutPromise
    ]);

    if (logsSnapshot) {
      const loadedLogs: any[] = [];
      logsSnapshot.forEach((doc: any) => {
        loadedLogs.push(doc.data());
      });
      securityLogs = loadedLogs;
      console.log(`[Firestore] Loaded ${loadedLogs.length} security audit logs.`);
    }

    const users: any = {};
    usersSnapshot.forEach((doc: any) => {
      users[doc.id] = doc.data();
    });

    const inviteCodes: any[] = [];
    codesSnapshot.forEach((doc: any) => {
      inviteCodes.push(doc.data());
    });

    if (Object.keys(users).length === 0 && inviteCodes.length === 0) {
      console.log("[Firestore] Cloud is empty. Migrating local data to cloud...");
      const local = readDBFromFile();
      memoryDB = local;
      
      // Seed Firestore with local records
      for (const username of Object.keys(local.users)) {
        await firestore.collection("users").doc(username).set(local.users[username]);
      }
      for (const item of local.inviteCodes || []) {
        await firestore.collection("invite_codes").doc(item.code).set(item);
      }
      console.log("[Firestore] Cloud database seeding completed successfully!");
    } else {
      // Ensure default users exist in cloud
      const local = readDBFromFile();
      let hasUpdates = false;
      if (!users.admin) {
        users.admin = local.users.admin;
        await firestore.collection("users").doc("admin").set(local.users.admin);
        hasUpdates = true;
      }
      if (!users.watihi) {
        users.watihi = local.users.watihi;
        await firestore.collection("users").doc("watihi").set(local.users.watihi);
        hasUpdates = true;
      }
      memoryDB = { users, inviteCodes };
      console.log(`[Firestore] Loaded successfully from Cloud. Users: ${Object.keys(users).length}, Invite Codes: ${inviteCodes.length}. Default accounts updated: ${hasUpdates}`);
    }
  } catch (err) {
    console.error("[Firestore] Failed to fetch or timed out. Fallback to file database:", err);
    memoryDB = readDBFromFile();
  }
}

// Non-blocking background sync-through to Cloud Firestore
async function saveToFirestoreAsync(db: any) {
  const firestore = getFirestoreDB();
  if (!firestore) return;

  try {
    // 1. Check & Sync user records
    for (const username of Object.keys(db.users)) {
      const incomingUser = db.users[username];
      const cachedString = memoryDB.users[username] ? JSON.stringify(memoryDB.users[username]) : "";
      const incomingString = JSON.stringify(incomingUser);

      if (cachedString !== incomingString) {
        await firestore.collection("users").doc(username).set(incomingUser);
        console.log(`[Firestore] User '${username}' successfully backed up to cloud.`);
      }
    }

    // 2. Check & Sync invite codes
    for (const item of db.inviteCodes || []) {
      const cachedItem = memoryDB.inviteCodes?.find((c: any) => c.code === item.code);
      const cachedString = cachedItem ? JSON.stringify(cachedItem) : "";
      const incomingString = JSON.stringify(item);

      if (cachedString !== incomingString) {
        await firestore.collection("invite_codes").doc(item.code).set(item);
        console.log(`[Firestore] Invite code '${item.code}' successfully backed up to cloud.`);
      }
    }

    // Update localized cache
    memoryDB = JSON.parse(JSON.stringify(db));
  } catch (err) {
    console.error("[Firestore] Backup error during async synchronization:", err);
  }
}

// Helper to load/save user database with safety fallback
function readDB(): any {
  return memoryDB;
}

function readDB_old(): any {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDB = {
        users: {},
        inviteCodes: [
          { code: "WATIHI-777", isUsed: false, usedBy: "" },
          { code: "WATIHI-999", isUsed: false, usedBy: "" },
          { code: "WATIHI-VIP", isUsed: false, usedBy: "" },
          { code: "LAW-YEMEN-2026", isUsed: false, usedBy: "" },
          { code: "PASS-SAHAR-101", isUsed: false, usedBy: "" }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf-8");
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    
    // Ensure inviteCodes array exists with initial codes if missing
    if (!parsed.inviteCodes) {
      parsed.inviteCodes = [
        { code: "WATIHI-777", isUsed: false, usedBy: "" },
        { code: "WATIHI-999", isUsed: false, usedBy: "" },
        { code: "WATIHI-VIP", isUsed: false, usedBy: "" },
        { code: "LAW-YEMEN-2026", isUsed: false, usedBy: "" },
        { code: "PASS-SAHAR-101", isUsed: false, usedBy: "" }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (error) {
    console.error("Database read error, returning empty memory store:", error);
    return { users: {}, inviteCodes: [] };
  }
}

function writeDB(db: any) {
  // Update memory cache instantly
  memoryDB = JSON.parse(JSON.stringify(db));
  
  // Asynchronously sync to Cloud Firestore
  saveToFirestoreAsync(db).catch(err => {
    console.error("[Firestore] Background sync task failed:", err);
  });

  // Write to local file as secondary redundant backup
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Local file DB backup write error:", error);
  }
}

function writeDB_old(db: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Database write error:", error);
  }
}

// Lazy initializer for Gemini API to prevent app crash if environment variable is missing
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("لم يتم تكوين مفتاح GEMINI_API_KEY في الإعدادات المخصصة للمشروع. يرجى تهيئته عبر خيارات Secrets.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Security event logs in-memory structure
let securityLogs: any[] = [];

async function logSecurityEvent(
  req: express.Request | null,
  username: string,
  eventType: string,
  severity: string,
  details: string
) {
  const ip = req ? (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1").toString() : "System";
  const userAgent = req ? (req.headers["user-agent"] || "Unknown").toString() : "System";
  
  const logEntry = {
    id: "sec_log_" + crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    username: username || "anonymous",
    eventType,
    severity,
    details,
    ip,
    userAgent
  };

  securityLogs.unshift(logEntry);
  if (securityLogs.length > 500) {
    securityLogs.pop();
  }

  const firestore = getFirestoreDB();
  if (firestore) {
    try {
      await firestore.collection("security_logs").doc(logEntry.id).set(logEntry);
      console.log(`[Security Audit Log] ${eventType} - ${severity} logged to Firestore.`);
    } catch (err) {
      console.error("[Firestore Log] Failed to sync security log to cloud:", err);
    }
  }
}

// REST APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/project-doc", (req, res) => {
  try {
    const docPath = path.join(process.cwd(), "توثيقات_المشروع.md");
    if (fs.existsSync(docPath)) {
      const content = fs.readFileSync(docPath, "utf-8");
      return res.json({ success: true, markdown: content });
    } else {
      // Try fallback
      const fallbackPath = path.join(process.cwd(), "DOCUMENTATION_PROJECT.md");
      if (fs.existsSync(fallbackPath)) {
        const content = fs.readFileSync(fallbackPath, "utf-8");
        return res.json({ success: true, markdown: content });
      }
      return res.status(404).json({ error: "ملف التوثيقات غير موجود." });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function getAuthenticatedUserByToken(token: string): any {
  if (!token) return null;
  const db = readDB();
  for (const username of Object.keys(db.users)) {
    const user = db.users[username];
    if (user.sessionToken && user.sessionToken === token) {
      return user;
    }
  }
  return null;
}

const secureDocumentDownloadHandler = (req: any, res: any) => {
  const token = (req.headers["x-session-token"] || req.query.token || "").toString().trim();
  const user = getAuthenticatedUserByToken(token);
  
  if (!user) {
    return res.status(401).send(
      "<div style='font-family: sans-serif; text-align: center; padding: 50px; background-color: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; direction: rtl;'>" +
      "<h2 style='color: #f59e0b; font-size: 24px; font-weight: 900; margin-bottom: 15px;'>⚠️ حماية الخصوصية والأمان العدلي</h2>" +
      "<p style='color: #94a3b8; max-width: 500px; line-height: 1.8; font-size: 16px;'>غير مصرح بالوصول إلى هذا الملف القانوني الحساس دون تسجيل دخول نشط وموثق. يرجى تسجيل الدخول إلى منصة مكتب المحاماة للمتابعة وحفظ السرية التامة لملفات الموكلين.</p>" +
      "</div>"
    );
  }

  const filename = req.params.filename;
  const safeFilename = path.basename(filename);
  const filePath = path.join(UPLOADS_DIR, safeFilename);

  // Prevent IDOR: a normal user may only download files referenced by their own records.
  if (user.isAdmin !== true) {
    const db = readDB();
    const owner = Object.values(db.users).find((u: any) => u?.sessionToken === token);
    const serialized = owner ? JSON.stringify({ cases: owner.cases || [], documents: owner.documents || [] }) : "";
    if (!serialized.includes(safeFilename)) {
      return res.status(403).send("غير مصرح بالوصول إلى هذا الملف.");
    }
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(
      "<div style='font-family: sans-serif; text-align: center; padding: 50px; background-color: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; direction: rtl;'>" +
      "<h2 style='color: #ef4444; font-size: 24px; font-weight: 900; margin-bottom: 15px;'>❌ ملف غير موجود</h2>" +
      "<p style='color: #94a3b8; max-width: 500px; line-height: 1.8; font-size: 16px;'>عذراً، هذا المستند أو المرفق القانوني غير موجود على الخادم السحابي للمكتب.</p>" +
      "</div>"
    );
  }

  // Detect MIME type safely
  let contentType = "application/octet-stream";
  const ext = path.extname(safeFilename).toLowerCase();
  if (ext === ".pdf") contentType = "application/pdf";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".gif") contentType = "image/gif";
  else if (ext === ".zip") contentType = "application/zip";
  else if (ext === ".doc") contentType = "application/msword";
  else if (ext === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  res.setHeader("Content-Type", contentType);
  if (contentType.startsWith("image/") || contentType === "application/pdf") {
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(safeFilename)}"`);
  } else {
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeFilename)}"`);
  }

  res.sendFile(filePath);
};

// Secure document download handler with timing-safe backend authorization
app.get("/api/documents/:filename", secureDocumentDownloadHandler);
app.get("/uploads/:filename", secureDocumentDownloadHandler);

// Configure multer for disk storage to handle huge files streaming directly to disk
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const fileId = Date.now() + "_" + crypto.randomInt(0, 1000000);
    // Decode filename from binary to UTF-8 to preserve Arabic characters in multipart form-data
    let originalName = file.originalname || "document";
    try {
      originalName = Buffer.from(originalName, "latin1").toString("utf-8");
    } catch {}
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.\-_أ-ي]/g, "_");
    cb(null, `${fileId}_${sanitizedName}`);
  }
});

const uploadHandler = multer({
  storage: multerStorage,
  limits: { fileSize: 550 * 1024 * 1024 } // Safe buffer of 550MB for large documents
});

function requireUploadUser(req: express.Request, res: express.Response): any | null {
  const token = (req.headers["x-session-token"] || req.body?.sessionToken || "").toString().trim();
  const user = getAuthenticatedUserByToken(token);
  if (!user) {
    res.status(401).json({ error: "يجب تسجيل الدخول بجلسة صالحة قبل رفع أي ملف قانوني." });
    return null;
  }
  return user;
}

// Direct REST endpoint to handle large file uploads to the server disk
// Registered both multer single-file handler and backup JSON handler
app.post("/api/upload-file", (req, res, next) => {
  const token = (req.headers["x-session-token"] || req.body?.sessionToken || "").toString().trim();
  if (!getAuthenticatedUserByToken(token)) {
    return res.status(401).json({ error: "يجب تسجيل الدخول بجلسة صالحة قبل رفع أي ملف قانوني." });
  }
  next();
}, uploadHandler.single("file"), (req, res) => {
  try {
    // 1. If uploaded via multipart/form-data (multer)
    if (req.file) {
      console.log(`[File System] Saved via Multer: ${req.file.filename} (${req.file.size} bytes) to disk.`);
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({ success: true, url: fileUrl });
    }

    // 2. Fallback: Base64 JSON payload
    const { name, mimeType, base64Data } = req.body;
    if (!name || !base64Data) {
      return res.status(400).json({ error: "الاسم ومحتوى الملف مطلوبان." });
    }
    
    // Extract base64 payload bytes (remove header format)
    const base64Content = base64Data.includes(";base64,")
      ? base64Data.split(";base64,")[1]
      : base64Data;
      
    const buffer = Buffer.from(base64Content, "base64");
    
    // Generate a unique and safe filename on disk
    const fileId = Date.now() + "_" + crypto.randomInt(0, 1000000);
    const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_أ-ي]/g, "_");
    const filename = `${fileId}_${sanitizedName}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`[File System] Saved via Base64 Fallback: ${filename} (${buffer.length} bytes) to disk.`);
    
    const fileUrl = `/uploads/${filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload error in server-disk storage:", error);
    res.status(500).json({ error: "فشل حفظ وتخزين الملف على السيرفر." });
  }
});

// Calculate total size of UPLOADS_DIR and return storage status
app.get("/api/storage/status", (req, res) => {
  try {
    let totalSize = 0;
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      files.forEach(file => {
        try {
          const stats = fs.statSync(path.join(UPLOADS_DIR, file));
          totalSize += stats.size;
        } catch {}
      });
    }
    // Limit is 5 GB = 5 * 1024 * 1024 * 1024 bytes
    const limitBytes = 5 * 1024 * 1024 * 1024;
    res.json({
      success: true,
      usedBytes: totalSize,
      totalBytes: limitBytes,
      usedFormatted: (totalSize / (1024 * 1024)).toFixed(2) + " ميجابايت",
      totalFormatted: "5 جيجابايت"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "فشل احتساب مساحة التخزين السحابية." });
  }
});

// Helper functions for Brute-Force lockout & Session tokens
function getRequestIP(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.toString().split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function recordFailedAttempt(ip: string) {
  const info = bruteLockouts.get(ip) || { attempts: 0, lockUntil: 0 };
  info.attempts++;
  if (info.attempts >= 6) {
    info.lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
    info.attempts = 0; // reset attempts
  }
  bruteLockouts.set(ip, info);
}

function clearFailedAttempts(ip: string) {
  bruteLockouts.delete(ip);
}

function verifySessionToken(req: express.Request, username: string): boolean {
  if (!username) return false;
  const db = readDB();
  const cleanUsername = username.trim().toLowerCase();
  const user = db.users[cleanUsername];
  if (!user || !user.sessionToken) return false;
  const token = (req.headers["x-session-token"] || req.body?.sessionToken || "").toString().trim();
  if (!token || token.length < 32) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(user.sessionToken), Buffer.from(token));
  } catch {
    return false;
  }
}

// Authentication: Register a new account with active license inviteCode checks
app.post("/api/auth/register", (req, res) => {
  const ip = getRequestIP(req);
  try {
    const { username, password, inviteCode, attorneyName, role } = req.body;
    if (!username || !password) {
      recordFailedAttempt(ip);
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان." });
    }
    if (!inviteCode) {
      recordFailedAttempt(ip);
      return res.status(400).json({ error: "تنبيه: رمز دعوة تسجيل الحساب السحابي لمرة واحدة مطلوب للتحقق وقفل التسجيل." });
    }

    const db = readDB();
    const cleanUsername = username.trim().toLowerCase();
    const cleanCode = inviteCode.trim().toUpperCase();

    if (db.users[cleanUsername]) {
      recordFailedAttempt(ip);
      return res.status(400).json({ error: "اسم المستخدم هذا مسجل سابقاً ومحجوز لمصلحة حساب آخر." });
    }

    // Verify Invite Code from our secured cloud pool
    const codeObj = db.inviteCodes?.find((c: any) => c.code.toUpperCase() === cleanCode);
    if (!codeObj) {
      recordFailedAttempt(ip);
      return res.status(400).json({ error: "رمز دعوة الدخول غير صحيح بالمرّة، يرجى كتابة رمز صالح أو طلبه من الإدارة." });
    }
    if (codeObj.isUsed) {
      recordFailedAttempt(ip);
      return res.status(400).json({ 
        error: `رمز الدعوة هذا مستخدم مسبقاً وتالف للقبول، حيث استخدمه العميل (${codeObj.usedBy}) لمرة واحدة ولا يمكن الاشتراك به مجدداً لشخصين.` 
      });
    }

    // Generate secure session token immediately
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Mark invitation passcode as used and tied to this exclusive user
    codeObj.isUsed = true;
    codeObj.usedBy = cleanUsername;
    codeObj.usedAt = new Date().toISOString();

    const isUserAdmin = false;

    // Secure simple storage (In professional full-stack, we use salt/hash, here we store safely)
    db.users[cleanUsername] = {
      username: username.trim(),
      password: hashPassword(password), // hashed using high-security scrypt KDF
      attorneyName: attorneyName ? attorneyName.trim() : "المكتب القانوني",
      cases: [],
      sessions: [],
      documents: [],
      subscriptionStatus: "active", // trial, active, suspended, expired
      subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 Days default
      inviteCodeUsed: cleanCode,
      isAdmin: isUserAdmin,
      sessionToken: sessionToken,
      lastSynced: new Date().toISOString()
    };

    writeDB(db);
    clearFailedAttempts(ip);

    res.json({ 
      success: true, 
      message: "تم إنشاء الحساب العدلي والتحقق والارتباط بنجاح مالي سحابي وقضائي!", 
      user: { 
        username: username.trim(),
        attorneyName: db.users[cleanUsername].attorneyName || "المكتب القانوني",
        isAdmin: db.users[cleanUsername].isAdmin,
        subscriptionStatus: "active",
        sessionToken: sessionToken
      } 
    });
  } catch (err: any) {
    console.error("Register Error:", err);
    recordFailedAttempt(ip);
    res.status(500).json({ error: "فشل إنشاء الحساب بالسيرفر." });
  }
});

// Authentication: Login and pull latest data with subscription checks
app.post("/api/auth/login", (req, res) => {
  const ip = getRequestIP(req);
  try {
    const { username, password, attorneyName, role } = req.body;
    if (!username || !password) {
      recordFailedAttempt(ip);
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور كلاهما مطلوب." });
    }

    const db = readDB();
    const cleanUsername = username.trim().toLowerCase();
    const user = db.users[cleanUsername];

    if (!user || !verifyPassword(password, user.password)) {
      recordFailedAttempt(ip);
      logSecurityEvent(req, cleanUsername || "anonymous", "User Login Failed", "WARNING", `محاولة تسجيل دخول فاشلة من عنوان IP: ${ip}`);
      return res.status(401).json({ error: "خطأ في اسم المستخدم أو كلمة المرور للمكتب القانوني." });
    }

    // Upgrade plain text passwords on the fly to highly secure scrypt hashes
    if (!user.password.includes(":")) {
      user.password = hashPassword(password);
    }

    // Generate secure dynamic session token on every login
    const sessionToken = crypto.randomBytes(32).toString("hex");
    user.sessionToken = sessionToken;
    if (attorneyName) {
      user.attorneyName = attorneyName.trim();
    }
    db.users[cleanUsername] = user;
    writeDB(db);

    logSecurityEvent(req, cleanUsername, "User Login Successful", "INFO", "مستند الدخول: تم التحقق من كلمة المرور وإصدار رمز جلسة جديد.");

    clearFailedAttempts(ip);

    // Ensure state defaults
    const userIsAdmin = user.isAdmin === true;
    const subStatus = user.subscriptionStatus || "active";
    const subExpires = user.subscriptionExpires || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    res.json({
      success: true,
      user: { 
        username: user.username,
        attorneyName: user.attorneyName || "المكتب القانوني",
        isAdmin: userIsAdmin,
        subscriptionStatus: subStatus,
        subscriptionExpires: subExpires,
        inviteCodeUsed: user.inviteCodeUsed || "",
        sessionToken: sessionToken
      },
      data: {
        cases: user.cases || [],
        sessions: user.sessions || [],
        documents: user.documents || [],
        recycleBin: user.recycleBin || []
      }
    });
  } catch (err: any) {
    console.error("Login Error:", err);
    recordFailedAttempt(ip);
    res.status(500).json({ error: "حدث خطأ أثناء فحص الحساب بالسيرفر." });
  }
});

// Pull Data endpoint - check subscription limit and verified session
app.post("/api/sync/pull", (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "اسم المستخدم مطلوب." });
    }

    const db = readDB();
    const cleanUsername = username.trim().toLowerCase();
    const user = db.users[cleanUsername];

    if (!user) {
      return res.status(404).json({ error: "الحساب غير متواجد على مصفوفة السيرفر." });
    }

    // Session token check for active security
    if (!verifySessionToken(req, username)) {
      return res.status(401).json({ error: "عذراً، الجلسة منتهية الصلاحية أو غير مصرح بها. يرجى تسجيل الدخول مجدداً لحماية البيانات القائمة." });
    }

    if (user.subscriptionStatus === "suspended") {
      return res.status(403).json({ error: "خطأ: لقد تم تعليق حسابك من قِبل إدارة منصة الوتيحي لعدم دفع الاشتراك الشهري." });
    }

    res.json({
      success: true,
      data: {
        cases: user.cases || [],
        sessions: user.sessions || [],
        documents: user.documents || [],
        recycleBin: user.recycleBin || []
      }
    });
  } catch (err: any) {
    console.error("Sync Pull Error:", err);
    res.status(500).json({ error: "فشل سحب ومزامنة البيانات من السيرفر." });
  }
});

// Push and Synchronize Data endpoint (secure session verified)
app.post("/api/sync/push", (req, res) => {
  try {
    const { username, cases, sessions, documents, recycleBin } = req.body;
    if (!username) {
      return res.status(400).json({ error: "رقم أو اسم الحساب مطلوب للمزامنة السحابية." });
    }

    const db = readDB();
    const cleanUsername = username.trim().toLowerCase();
    const user = db.users[cleanUsername];

    if (!user) {
      return res.status(404).json({ error: "الحساب غير مسجل للرفع والمزامنة." });
    }

    // Session token check for active security
    if (!verifySessionToken(req, username)) {
      return res.status(401).json({ error: "عذراً، لم نتمكن من المزامنة بطلب غير مأذون به أمنياً. يرجى تسجيل الدخول مجدداً." });
    }

    if (user.subscriptionStatus === "suspended") {
      return res.status(403).json({ error: "خطأ: تم إيقاف خدمة الرفع والمزامنة السحابية لحين تجديد الاشتراك والدفع الشهري." });
    }

    // Deep merge or update full model
    user.cases = cases || [];
    user.sessions = sessions || [];
    user.documents = documents || [];
    user.recycleBin = recycleBin || [];
    user.lastSynced = new Date().toISOString();

    db.users[cleanUsername] = user;
    writeDB(db);

    res.json({
      success: true,
      lastSynced: user.lastSynced,
      message: "تم مزامنة وحفظ كافة البيانات بنجاح تام إلى الخدمة السحابية الآمنة!"
    });
  } catch (err: any) {
    console.error("Sync Push Error:", err);
    res.status(500).json({ error: "فشلت المزامنة والحفظ بالسيرفر." });
  }
});

// Download compiled dist files (HTML, CSS, JS) as ZIP
app.get("/api/download-compiled-site", (req, res) => {
  try {
    const distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(distPath)) {
      return res.status(404).send("<h2 style='font-family:sans-serif; text-align:center; padding: 40px; color: #ef4444;'>يرجى بناء كود الموقع أو زيارة الرابط بعد الإعداد لبدء التحميل. الملفات المترجمة غير موجودة حالياً.</h2>");
    }
    const zip = new AdmZip();
    zip.addLocalFolder(distPath);
    const buffer = zip.toBuffer();
    
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=watihi_compiled_site.zip");
    res.send(buffer);
  } catch (err: any) {
    console.error("ZIP compile download error:", err);
    res.status(550).send("حدث خطأ أثناء إعداد ملف الـ ZIP للموقع المترجم.");
  }
});

// Download full development project source code as ZIP
app.get("/api/download-project-source", (req, res) => {
  try {
    const zip = new AdmZip();
    const rootPath = process.cwd();
    
    const items = fs.readdirSync(rootPath);
    for (const item of items) {
      if (["node_modules", ".git", "dist", "data_users_db.json", ".env"].includes(item)) {
        continue;
      }
      const fullPath = path.join(rootPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        zip.addLocalFolder(fullPath, item);
      } else {
        zip.addLocalFile(fullPath);
      }
    }
    
    const buffer = zip.toBuffer();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=watihi_project_source.zip");
    res.send(buffer);
  } catch (err: any) {
    console.error("ZIP source download error:", err);
    res.status(500).send("حدث خطأ أثناء تحميل الكود المصدري للمشروع.");
  }
});

// All-in-One Package Download (Source code + Compiled site + APK Guide in ARABIC)
app.get("/api/download-all-in-one-pkg", (req, res) => {
  try {
    const zip = new AdmZip();
    const rootPath = process.cwd();
    
    // 1. Add Source Folders / Files
    const items = fs.readdirSync(rootPath);
    for (const item of items) {
      // Skip heavy or configuration files that don't belong in the root of the source zip
      if (["node_modules", ".git", "data_users_db.json", ".env", "dist"].includes(item)) {
        continue;
      }
      const fullPath = path.join(rootPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        zip.addLocalFolder(fullPath, item);
      } else {
        zip.addLocalFile(fullPath);
      }
    }
    
    // 2. Add Compiled 'dist' files if present so they have building block immediately
    const distPath = path.join(rootPath, "dist");
    if (fs.existsSync(distPath)) {
      zip.addLocalFolder(distPath, "dist");
    }

    // 3. Add Custom PDF / MD Guide with exact steps in Arabic/English to compile an APK with Capacitor
    const apkGuideString = `# دليل تصدير تطبيق "الواطيحي" إلى تطبيق هاتف أندرويد (APK) 📱

بمساعدة هذا الملف، يمكنك تحويل هذا الموقع الإلكتروني بالكامل إلى تطبيق أندرويد حقيقي بصيغة APK بكل سهولة وبسرعة فائقة باستخدام أداة **Capacitor** الشهيرة المقدمة من Ionic.

## المتطلبات الأساسية
1. تثبيت بيئة **Node.js** على جهاز الكمبيوتر الخاص بك.
2. تثبيت برنامج **Android Studio** لإنتاج وتصدير ملف الـ APK النهائي.

## خطوات العمل بالتفصيل (في 5 دقائق فقط!)

### أولاً: استخراج الملفات
قم بفك ضغط هذا الملف ZIP في مجلد على جهازك. ستجد:
- مجلد \`src\` ومستندات المطور وملفات المشروع البرمجية.
- مجلد \`dist\` ويحتوي على كود الموقع المترجم الجاهز (HTML, CSS, JS) - لا يتطلب هذا المجلد البناء مجدداً!

### ثانياً: تهيئة أداة Capacitor في المشروع
افتح الـ Terminal أو موجه الأوامر (CMD) داخل مجلد المشروع المستخرج، ثم قم بتشغيل الأوامر البسيطة التالية بالتتابع:

\`\`\`bash
# 1. تثبيت المكونات البرمجية لتشغيل المشروع
npm install

# 2. تثبيت Capacitor في المشروع لتغليف واجهات الويب
npm install @capacitor/core @capacitor/cli

# 3. تهيئة إعدادات التطبيق
# (أدخل الاسم "Watihi" والمعرّف الفريد للرزمة مثلاً com.watihi.app)
npx cap init "Watihi" "com.watihi.app" --web-dir=dist

# 4. إضافة منصة الأندرويد للمشروع مخصصة لإنتاج APK
npm install @capacitor/android
npx cap add android
\`\`\`

### ثالثاً: مزامنة ملفات الويب مع بيئة الأندرويد
كلما أردت تحديث التطبيق أو استخدام ملفات \`dist\` الحالية المرفقة، قم بنسخها بموجب الأمر الآتي:
\`\`\`bash
npx cap sync
\`\`\`

### رابعاً: فتح المشروع وبناء الـ APK في Android Studio
الآن، يمكنك الانتقال لتصدير وتوليد ملف اللعبة/التطبيق APK:
\`\`\`bash
# فتح وعرض المشروع تلقائياً في Android Studio
npx cap open android
\`\`\`
1. من داخل **Android Studio**، انتظر لثوانٍ معدودة حتى يكتمل تحميل ومزامنة المشروع (Gradle Sync).
2. اذهب إلى القائمة العلوية للبرنامج: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3. سيقوم البرنامج ببناء ملف الـ **APK** في ثوان معدودة، وسيظهر لك تنبيه صغير في الأسفل يحتوي على زر "locate" اضغط عليه لتجد ملف الـ **app-debug.apk** جاهزاً تماماً للتحميل، التثبيت على الهاتف، والاستعمال والرفع!

مبروك! تطبيقك الآن جاهز ومكتمل على هاتفك المحمول كبرنامج رسمي متكامل! 🚀`;

    zip.addFile("HOW_TO_BUILD_APK.md", Buffer.from(apkGuideString, "utf-8"));

    const buffer = zip.toBuffer();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=watihi_complete_project_with_apk_guide.zip");
    res.send(buffer);
  } catch (err: any) {
    console.error("ZIP complete package download error:", err);
    res.status(500).send("حدث خطأ أثناء إعداد وتجميع الحزمة الكاملة.");
  }
});

// Helper to verify if the request is initiated by a true authenticated admin
function isAdminRequest(req: express.Request): boolean {
  const adminUser = (req.headers["x-admin-user"] || "").toString().trim().toLowerCase();
  const adminToken = (req.headers["x-admin-token"] || req.headers["x-session-token"] || "").toString().trim();
  if (!adminUser || !adminToken) return false;
  const db = readDB();
  const user = db.users[adminUser];
  if (!user || user.isAdmin !== true || !user.sessionToken) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(user.sessionToken), Buffer.from(adminToken));
  } catch {
    return false;
  }
}

// Admin API: Retrieve security audit logs
app.get("/api/admin/security/logs", (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: "خطأ أمني: غير مسموح بالوصول لغير مشرفي السحابة المعتمدين." });
    }
    res.json({ success: true, logs: securityLogs });
  } catch (error) {
    console.error("Retrieve security logs error:", error);
    res.status(500).json({ error: "فشل سحب سجلات الأمان والتدقيق من النظام." });
  }
});

// Admin API: List all registered cloud accounts & stats
app.get("/api/admin/users", (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: "خطأ أمني: غير مسموح بالوصول لغير مشرفي السحابة المعتمدين." });
    }
    const db = readDB();
    const list = Object.keys(db.users).map((username) => {
      const u = db.users[username];
      return {
        username: u.username,
        isAdmin: u.isAdmin || username === "admin" || username === "watihi",
        subscriptionStatus: u.subscriptionStatus || "active",
        subscriptionExpires: u.subscriptionExpires || "",
        inviteCodeUsed: u.inviteCodeUsed || "",
        lastSynced: u.lastSynced || "",
        cases: u.cases || [],
        sessions: u.sessions || [],
        documents: u.documents || []
      };
    });
    res.json({ success: true, users: list });
  } catch (error) {
    console.error("Admin list error:", error);
    res.status(500).json({ error: "فشل سحب قائمة المستخدمين من قاعدة البيانات السحابية." });
  }
});

// Admin API: Toggle or update subscriber plans
app.post("/api/admin/update-subscription", (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: "خطأ أمني: غير مسموح بالوصول لغير مشرفي السحابة المعتمدين." });
    }
    const { username, status, expires } = req.body;
    if (!username) {
      return res.status(400).json({ error: "اسم الحساب المستهدف مطلوب للتعديل." });
    }

    const db = readDB();
    const cleanUsername = username.trim().toLowerCase();
    const user = db.users[cleanUsername];

    if (!user) {
      return res.status(404).json({ error: "المستند المطلوب لتحديثه مفقود بالسحابة." });
    }

    if (status) user.subscriptionStatus = status;
    if (expires) user.subscriptionExpires = expires;

    db.users[cleanUsername] = user;
    writeDB(db);

    res.json({ 
      success: true, 
      message: `تم ترقية حالة المشترك القانوني (${user.username}) إلى الحالة (${status}) بنجاح تام!` 
    });
  } catch (error) {
    console.error("Admin update sub error:", error);
    res.status(500).json({ error: "فشل تعديل حالة الدفع والترخيص للسحابة." });
  }
});

// Admin API: Retrieve invite passcodes state
app.get("/api/admin/invite-codes", (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: "خطأ أمني: غير مسموح بالوصول لغير مشرفي السحابة المعتمدين." });
    }
    const db = readDB();
    res.json({ success: true, inviteCodes: db.inviteCodes || [] });
  } catch (error) {
    res.status(500).json({ error: "فشل إدراج رموز تفعيل المنصة." });
  }
});

// Admin API: Issue new, unique registration code
app.post("/api/admin/generate-invite-code", (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: "خطأ أمني: غير مسموح بالوصول لغير مشرفي السحابة المعتمدين." });
    }
    const { customCode } = req.body;
    const db = readDB();

    let finalCode = customCode ? customCode.trim().toUpperCase() : "WATIHI-" + crypto.randomInt(1000, 10000);

    // Duplication check
    const duplicate = db.inviteCodes?.find((c: any) => c.code === finalCode);
    if (duplicate) {
      return res.status(400).json({ error: "هذا الرمز مسجل ومتواجد مسبقاً. الرجاء اقتراح رمز آخر فريد." });
    }

    if (!db.inviteCodes) db.inviteCodes = [];
    db.inviteCodes.push({
      code: finalCode,
      isUsed: false,
      usedBy: "",
      createdDate: new Date().toISOString()
    });

    writeDB(db);
    res.json({ 
      success: true, 
      code: finalCode, 
      message: "تم فحص وإضافة رمز قبول جديد حصرياً لشخص واحد!" 
    });
  } catch (err: any) {
    res.status(500).json({ error: "فشل توليد الرمز الشـعبي." });
  }
});

// Admin API: Overwrite / restore data of any user from an administrative wizard backup
app.post("/api/admin/restore-backup", (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: "خطأ أمني: غير مسموح بالوصول لغير مشرفي السحابة المعتمدين." });
    }
    const { targetUsername, sourceUsername, cases, sessions, documents } = req.body;
    if (!targetUsername) {
      return res.status(400).json({ error: "المستخدم المراد الاستعادة له مفقود." });
    }

    const db = readDB();
    const cleanTarget = targetUsername.trim().toLowerCase();
    const user = db.users[cleanTarget];

    if (!user) {
      return res.status(404).json({ error: "لا يوجد مستخدم بهذا الاسم بالسيرفر السحابي." });
    }

    // Overwrite safely
    user.cases = cases || [];
    user.sessions = sessions || [];
    user.documents = documents || [];
    user.lastSynced = new Date().toISOString();

    db.users[cleanTarget] = user;
    writeDB(db);

    res.json({ 
      success: true, 
      message: `تم بنجاح استعادة وإرجاع كامل الملفات والقضايا المدعومة للمستخدم (${user.username}) من لوحة الساحرة الإدارية!` 
    });
  } catch (err: any) {
    console.error("Restore Backup error:", err);
    res.status(500).json({ error: "عطل عند رغبة المدير في الاستعادة." });
  }
});

// Peer-to-Peer "Pass-to-Pass" (P2P Files Transfer Service)
app.post("/api/p2p/pass", (req, res) => {
  try {
    const { sourceUsername, targetUsername, itemType, itemData } = req.body;
    if (!sourceUsername || !targetUsername || !itemType || !itemData) {
      return res.status(400).json({ error: "ملفات النقل غير مكتملة لتفعيل Pass-To-Pass." });
    }

    const db = readDB();
    const cleanSource = sourceUsername.trim().toLowerCase();
    const cleanTarget = targetUsername.trim().toLowerCase();
    const authenticatedSource = getAuthenticatedUserByToken((req.headers["x-session-token"] || req.body.sessionToken || "").toString().trim());
    if (!authenticatedSource || authenticatedSource.username?.toLowerCase() !== cleanSource) {
      return res.status(401).json({ error: "غير مصرح: هوية المرسل لا تطابق جلسة المستخدم الحالية." });
    }

    if (!db.users[cleanSource]) {
      return res.status(404).json({ error: "المستخدم المُمرِّر غير معرف." });
    }
    if (!db.users[cleanTarget]) {
      return res.status(404).json({ error: `الخصم أو العميل المتلقي (${targetUsername}) غير متواجد على رادار السحابة.` });
    }

    const recpUser = db.users[cleanTarget];
    const copyOfItem = JSON.parse(JSON.stringify(itemData));

    // Update ID to avoid state collision & denote source
    copyOfItem.id = `${itemType}_p2p_${Date.now()}_` + crypto.randomInt(0, 100);
    copyOfItem.title = `[P2P ممرر من: ${sourceUsername}] ${copyOfItem.title || copyOfItem.caseNumber || "ملف مشترك"}`;

    if (itemType === "case") {
      if (!recpUser.cases) recpUser.cases = [];
      recpUser.cases.unshift(copyOfItem);
    } else if (itemType === "document") {
      if (!recpUser.documents) recpUser.documents = [];
      recpUser.documents.unshift(copyOfItem);
    } else {
      return res.status(400).json({ error: "نوع الملف غير مدعوم للاستلام." });
    }

    recpUser.lastSynced = new Date().toISOString();
    db.users[cleanTarget] = recpUser;
    writeDB(db);

    res.json({ 
      success: true, 
      message: `عظيم! تم بنجاح وسرعة خارقة تمرير الملف السحابي (Pass-to-Pass) والوصول المباشر إلى صندوق المحامي (${targetUsername})!` 
    });
  } catch (error: any) {
    console.error("Pass-To-Pass error:", error);
    res.status(500).json({ error: "فشل عمل بروتوكول Pass-To-Pass بالسيرفر." });
  }
});

// AI Chatbot endpoint - Acting as Lawyer Abdullah Al-Watihi
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, fileAttachment } = req.body;
    const ai = getGemini();

    const userParts: any[] = [];

    // If a file is attached, inject it as inlineData for Gemini
    if (fileAttachment) {
      let cleanedBase64 = "";
      if (fileAttachment.url && fileAttachment.url.startsWith("/uploads/")) {
        try {
          const filename = fileAttachment.url.replace(/^\/uploads\//, "");
          const filePath = path.join(UPLOADS_DIR, filename);
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            cleanedBase64 = fileBuffer.toString("base64");
            console.log(`[Gemini Chat] Loaded file directly from server disk for analysis: ${filename} (${fileBuffer.length} bytes)`);
          }
        } catch (fileErr) {
          console.error("Failed to read uploaded chat file from server disk:", fileErr);
        }
      } else if (fileAttachment.base64Data) {
        cleanedBase64 = fileAttachment.base64Data;
        if (cleanedBase64.includes(";base64CustomHeader,")) {
          cleanedBase64 = cleanedBase64.split(";base64CustomHeader,")[1];
        } else if (cleanedBase64.includes(";base64,")) {
          cleanedBase64 = cleanedBase64.split(";base64,")[1];
        }
      }

      if (cleanedBase64) {
        userParts.push({
          inlineData: {
            mimeType: fileAttachment.mimeType || "application/octet-stream",
            data: cleanedBase64,
          }
        });
        userParts.push({
          text: `[الملف المرفق للمراجعة: ${fileAttachment.name || "مستند قانوني"}]\n`
        });
      }
    }

    userParts.push({ text: message || "الرجاء مراجعة وتلخيص وتحليل مستندي المرفق قانونياً." });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `أنت الآن مكتب المحامي اليمني عبدالله الوتيحي، المستشار القانوني الذكي. تقدم استشارات بليغة وقانونية رصينة مستندة إلى القوانين النافذة في الجمهورية اليمنية.
قاعدة ذهبية صارمة جداً للتنفيذ: يجب عليك الاستناد والاقتصار بالكامل في استشاراتك واستشهاداتك القانونية ومواد القانون والبنود المذكورة على القواعد والمدونات القانونية اليمنية المعتمدة التالية فقط ولا غيرها:
${JSON.stringify(YEMENI_LAWS, null, 2)}

ممنوع منعاً باتاً اختراع أو هلوسة أي مواد قانونية خارجة عن هذا السياق القانوني المعتمد لدينا. إذا لم تجد إجابة مباشرة أو لم تجد مادة مطابقة في هذه النصوص، وضح للمستعلم برصانة وأدب قانوني أن استشاراتنا تقتصر حصرياً على القوانين النافذة والمدونة لدينا بمصداقية عالية للتحقق القضائي.`
          }]
        },
        ...(history || []).map((h: any) => ({
          role: h.role === "assistant" ? "model" as const : h.role,
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: userParts }
      ],
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة الاستشارة الذكية." });
  }
});

// AI Document Drafting endpoint - Draft Yemeni LawSuits, Contracts, and official letters
app.post("/api/gemini/draft", async (req, res) => {
  try {
    const { docType, parameters } = req.body;
    const ai = getGemini();

    const prompt = `بصفتك المحامي اليمني اللامع عبدالله الوتيحي، صغ مستنداً قانونياً يمنياً رسمياً من نوع (${docType}) بالاستناد بالمعطيات المدخلة التالية:

${JSON.stringify(parameters, null, 2)}

الشروط الفنية والشرعية الصارمة المطلوبة:
1. صياغة قانونية سليمة خالية من الأخطاء ومطابقة للنماذج المعتمدة في المحاكم اليمنية.
2. استخدام لغة رسمية رصينة (ديباجة، اسم المحكمة إذا تطلب الأمر، بيانات الأطراف، موضوع الدعوى/العقد، البنود التفصيلية، المطالب الختامية، التواقيع).
3. يجب حصرياً الاستناد والاقتصار على مواد القوانين اليمنية المعتمدة التالية في صياغتك وعدم اختراع أي أرقام مواد أو بنود خيالية:
${JSON.stringify(YEMENI_LAWS, null, 2)}
4. صياغة المستند ليكون جاهزاً للطباعة والتقديم المباشر.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Draft Error:", error);
    res.status(500).json({ error: error.message || "فشلت صياغة المستند القانوني." });
  }
});

// AI Document Analysis / Gap Finding / Proofreading
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { documentText, analysisType } = req.body;
    const ai = getGemini();

    let analysisPrompt = "";
    if (analysisType === "loopholes") {
      analysisPrompt = `بصفتك المحامي اليمني الأول عبدالله الوتيحي، تخرّج من أعرق المحاكم اليمنية، حلل هذا النص القانوني بدقة لتوضيح أي ثغرات قانونية (Loopholes)، نقاط غامضة، أو نقاط ضعف قد تضر بموكلنا، ودلّه على كيفية تحصينها وفقاً للمواد القانونية اليمنية المعتمدة التالية حصراً:
${JSON.stringify(YEMENI_LAWS, null, 2)}

النص للتحليل:
${documentText}`;
    } else {
      analysisPrompt = `بصفتك المحامي اليمني عبدالله الوتيحي، راجع النص التالي لغوياً ونحوياً وقانونياً (Legal Proofreading)، واقترح تعديلات لغوية وصيغ رصينة بديلة ترفع من القوة القانونية وتعتمد على مدونات القوانين اليمنية التالية:
${JSON.stringify(YEMENI_LAWS, null, 2)}

النص للتدقيق:
${documentText}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: analysisPrompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    res.status(500).json({ error: error.message || "فشل تحليل المستند قانونياً." });
  }
});

// AI Image OCR (Optical Character Recognition) Endpoint
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "لم يتم تزويد الصورة لإجراء التعرف الضوئي." });
    }

    const ai = getGemini();

    // Remove data:image/...;base64, if client sends it
    let cleanedBase64 = base64Image;
    if (base64Image.includes(";base64,")) {
      cleanedBase64 = base64Image.split(";base64,")[1];
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: cleanedBase64,
      },
    };

    const promptText = `أنت الآن خبير استخراج النصوص والتعرف الضوئي على الحروف (OCR) لمكتب المحامي عبدالله الوتيحي باليمن.
قم بقراءة وتحليل الصورة بدقة عالية واستخرج كافة النصوص المكتوبة باللغة العربية (سواء كانت مطبوعة أو مكتوبة بخط اليد).
التزم بالتالي:
1. استخرج النص كما هو مكتوب بالضبط وبأقصى دقة وأمانة.
2. نسّق النص المستخرج بشكل مرتب وسهل القراءة ليتمكن المحامي من استخدامه مباشرة كمسودة أو عقد داخل التطبيق.
3. التزم باللغة العربية واكتب النص المستخرج مباشرة دون مقدمات أو مؤخرات تفسيرية خارج الوثيقة.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        imagePart,
        { text: promptText }
      ],
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini OCR Error:", error);
    res.status(500).json({ error: error.message || "فشل استخراج النص من الصورة عبر خادم الذكاء الاصطناعي." });
  }
});

// AI Law Article Retrieval and Explanation endpoint
app.post("/api/gemini/get-article", async (req, res) => {
  try {
    const { lawTitle, articleNumber, keyword } = req.body;
    const ai = getGemini();

    let prompt = "";
    if (articleNumber) {
      prompt = `أنت الآن المرجع القضائي الدستوري الأول في الجمهورية اليمنية لمكتب الوتيحي للمحاماة والاستشارات القانونية.
مطلوب منك جلب المادة المحددة وتفسيرها فقهياً وقانونياً بدقة متناهية:
اسم القانون: ${lawTitle}
رقم المادة أو الطلب: ${articleNumber}

قاعدة ذهبية صارمة جداً للتنفيذ: يجب عليك الاستناد والاقتصار بالكامل في جلب النصوص والمواد على البيانات والمدونات القانونية اليمنية المعتمدة التالية فقط:
${JSON.stringify(YEMENI_LAWS, null, 2)}

قم بصياغة الرد بالترتيب والتنسيق التالي:
1. نص المادة الحرفي والصحيح تماماً كما ورد في التشريع اليمني الرسمي والمدونة المعتمدة أعلاه (تحت عنوان رئيسي واضح: "المرجع النصي الرسمي للمادة من القانون اليمني"). اذكر النص بدقة بدون نقصان أو زيادة.
2. شرح مبسط وتفسير فقهي لغايات هذه المادة وشروط انطباقها وأثرها القانوني (تحت عنوان: "الشرح والتكييف القانوني الفقهي").
3. ثغرات المادة، تطبيقاتها العملية، وتوجيهات لكيفية مرافعتها واستخدامها لصالح الموكل في المحاكم اليمنية (تحت عنوان: "توجيهات عملية للمرافعة والدفاع").

إذا لم تكن المادة أو القانون مدوناً في القائمة المعتمدة أعلاه، وضح للمستعلم برصانة وأدب قانوني وبدون اختلاق أو تزييف أن استشاراتنا وجلب المواد يقتصر حصرياً على القوانين النافذة والمدونة لدينا بمصداقية عالية للتحقق القضائي.`;
    } else {
      prompt = `أنت الآن المرجع القضائي الدستوري الأول في الجمهورية اليمنية لمكتب الوتيحي للمحاماة والاستشارات القانونية.
مطلوب منك جلب كافة المواد والمسائل القانونية المتعلقة بموضوع البحث التالي وترتيبها وتصنيفها بشكل منظم:
اسم القانون: ${lawTitle}
موضوع البحث والمسألة القانونية: ${keyword}

قاعدة ذهبية صارمة جداً للتنفيذ: يجب عليك الاستناد والاقتصار بالكامل في جلب المسائل والنصوص على البيانات والمدونات القانونية اليمنية المعتمدة التالية فقط:
${JSON.stringify(YEMENI_LAWS, null, 2)}

قم بجمع وترتيب وتصنيف كافة المواد القانونية المتناثرة المتعلقة بهذا الموضوع من المدونة الرسمية المعتمدة أعلاه فقط، واذكر أرقام المواد ونصوصها الرسمية الصحيحة وشرحاً وجيزاً لكل منها بشكل مرتب جداً ومنظم وجاهز للطباعة والمرافعة.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Law Article Retrieval Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء جلب وتفسير المادة القانونية." });
  }
});

// Dynamic serving of PWA Manifest & Service Worker
app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(process.cwd(), "manifest.json"));
});

app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(process.cwd(), "sw.js"));
});

// Vite middleware configuration for serving the frontend React app
async function initializeServer() {
  // Primary database synchronization from Cloud Firestore
  await initDatabaseFromFirestore();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[!] Lawyer Abdullah Al-Watihi Legal Server is running at http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start server:", err);
});
