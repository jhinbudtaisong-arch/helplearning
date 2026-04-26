import { createServer } from "node:http";
import { access, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 3100);
const DB_PATH = process.env.CAT_STUDY_DB_PATH
  ? path.resolve(process.env.CAT_STUDY_DB_PATH)
  : path.resolve(process.cwd(), "cat_study_db.json");
const DEMO_VERIFICATION_CODE = "123456";

const DEMO_USER = {
  id: "demo-admin",
  name: "Admin",
  email: "admin@catstudy.app",
  loginId: "admin",
  password: "1234",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const defaultDb = {
  users: [DEMO_USER],
  sessions: [],
  verification: {},
};

function normalizeIdentifier(value = "") {
  return String(value).trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    loginId: user.loginId,
    createdAt: user.createdAt,
  };
}

async function ensureDb() {
  try {
    await access(DB_PATH, fsConstants.F_OK);
  } catch {
    await writeDb(defaultDb);
    return defaultDb;
  }

  const db = await readDb();
  const hasDemoUser = db.users.some((user) => user.id === DEMO_USER.id);

  if (!hasDemoUser) {
    db.users.unshift(DEMO_USER);
    await writeDb(db);
  }

  return db;
}

async function readDb() {
  const raw = await readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(raw);

  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    verification:
      parsed.verification && typeof parsed.verification === "object" ? parsed.verification : {},
  };
}

async function writeDb(db) {
  await writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(body);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function getBearerToken(request) {
  const authHeader = request.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

async function createSession(db, userId) {
  const token = randomUUID();
  db.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);
  return token;
}

function findUserByIdentifier(users, identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier);

  return users.find((user) => {
    const matchesId = normalizeIdentifier(user.loginId) === normalizedIdentifier;
    const matchesEmail = normalizeIdentifier(user.email) === normalizedIdentifier;
    const matchesName = normalizeIdentifier(user.name) === normalizedIdentifier;

    return matchesId || matchesEmail || matchesName;
  });
}

async function handleSendVerification(request, response) {
  const db = await readDb();
  const body = await readJsonBody(request);
  const email = normalizeIdentifier(body.email);

  if (!email) {
    sendJson(response, 400, { error: "Please enter your email first." });
    return;
  }

  db.verification[email] = {
    code: DEMO_VERIFICATION_CODE,
    requestedAt: new Date().toISOString(),
  };
  await writeDb(db);

  sendJson(response, 200, {
    email,
    demoCode: DEMO_VERIFICATION_CODE,
    message: "Verification code generated.",
  });
}

async function handleRegister(request, response) {
  const db = await readDb();
  const body = await readJsonBody(request);
  const email = normalizeIdentifier(body.email);
  const name = String(body.name || "").trim();
  const password = String(body.password || "").trim();
  const verificationCode = String(body.verificationCode || "").trim();

  if (!email || !name || !password) {
    sendJson(response, 400, { error: "Please complete every sign up field." });
    return;
  }

  const savedCode = db.verification[email]?.code;
  if (!savedCode || verificationCode !== savedCode) {
    sendJson(response, 400, { error: "Verification code is incorrect." });
    return;
  }

  const emailTaken = db.users.some((user) => normalizeIdentifier(user.email) === email);
  if (emailTaken) {
    sendJson(response, 409, { error: "This email is already registered." });
    return;
  }

  const user = {
    id: randomUUID(),
    name,
    email,
    loginId: email,
    password,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  delete db.verification[email];

  const token = await createSession(db, user.id);

  sendJson(response, 201, {
    user: sanitizeUser(user),
    token,
  });
}

async function handleLogin(request, response) {
  const db = await readDb();
  const body = await readJsonBody(request);
  const identifier = String(body.identifier || "");
  const password = String(body.password || "");

  if (!identifier.trim() || !password.trim()) {
    sendJson(response, 400, { error: "Please enter both ID and password." });
    return;
  }

  const user = findUserByIdentifier(db.users, identifier);
  if (!user || user.password !== password) {
    sendJson(response, 401, { error: "Invalid ID or password." });
    return;
  }

  const token = await createSession(db, user.id);

  sendJson(response, 200, {
    user: sanitizeUser(user),
    token,
  });
}

async function handleSession(request, response) {
  const db = await readDb();
  const token = getBearerToken(request);

  if (!token) {
    sendJson(response, 401, { error: "Missing session token." });
    return;
  }

  const session = db.sessions.find((item) => item.token === token);
  const user = session ? db.users.find((item) => item.id === session.userId) : null;

  if (!session || !user) {
    sendJson(response, 401, { error: "Session expired." });
    return;
  }

  sendJson(response, 200, {
    user: sanitizeUser(user),
  });
}

async function handleLogout(request, response) {
  const db = await readDb();
  const token = getBearerToken(request);

  if (token) {
    db.sessions = db.sessions.filter((item) => item.token !== token);
    await writeDb(db);
  }

  sendJson(response, 200, { ok: true });
}

await ensureDb();

const server = createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/send-code") {
      await handleSendVerification(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      await handleRegister(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      await handleLogin(request, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/session") {
      await handleSession(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      await handleLogout(request, response);
      return;
    }

    sendJson(response, 404, { error: "Route not found." });
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(response, 400, { error: "Invalid JSON payload." });
      return;
    }

    console.error(error);
    sendJson(response, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, () => {
  console.log(`Cat Study backend listening on http://localhost:${PORT}`);
});
