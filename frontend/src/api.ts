// src/api.ts

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8000";

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }
  return res.json() as Promise<{ status: string }>;
}

