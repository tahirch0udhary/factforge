import { request } from "./apiClient";

export function signupUser(payload) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function verifyClaim(claimPayload) {
  const body = typeof claimPayload === "string" ? { claim_text: claimPayload } : claimPayload;
  return request("/api/verify", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function getHistory({ skip = 0, limit = 20 } = {}) {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit)
  });
  return request(`/api/history?${params.toString()}`);
}

export function getStats() {
  return request("/api/stats");
}

export function getHealth() {
  return request("/health");
}