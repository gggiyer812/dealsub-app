// src/api.ts

// Replace this with your real Cloud Run backend URL:
const DEFAULT_API_BASE = "https://https://dealsub-app-147614082674.us-central1.run.app";

const API_BASE =
  process.env.REACT_APP_API_BASE || DEFAULT_API_BASE;

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }
  return res.json() as Promise<{ status: string }>;
}

