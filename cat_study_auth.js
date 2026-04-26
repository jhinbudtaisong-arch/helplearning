const STORAGE_KEYS = {
  token: "cat-study-app.session-token",
};

export const DEMO_VERIFICATION_CODE = "123456";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStoredToken() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.token);
}

function setStoredToken(token) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.token, token);
}

function clearStoredToken() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEYS.token);
}

function getApiBaseUrl() {
  if (typeof window !== "undefined" && typeof window.__CAT_STUDY_API_URL__ === "string") {
    return window.__CAT_STUDY_API_URL__;
  }

  return "http://127.0.0.1:3100";
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export async function getCurrentSessionUser() {
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  try {
    const data = await request("/api/auth/session", {
      method: "GET",
      auth: true,
    });
    return data.user ?? null;
  } catch {
    clearStoredToken();
    return null;
  }
}

export async function requestVerificationCode(email) {
  return request("/api/auth/send-code", {
    method: "POST",
    body: { email },
  });
}

export async function registerUser({ email, name, password, verificationCode }) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: {
      email,
      name,
      password,
      verificationCode,
    },
  });

  if (data.token) {
    setStoredToken(data.token);
  }

  return data.user;
}

export async function loginUser({ identifier, password }) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: {
      identifier,
      password,
    },
  });

  if (data.token) {
    setStoredToken(data.token);
  }

  return data.user;
}

export async function logoutUser() {
  try {
    await request("/api/auth/logout", {
      method: "POST",
      auth: true,
    });
  } finally {
    clearStoredToken();
  }
}
