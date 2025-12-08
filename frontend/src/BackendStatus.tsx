// src/BackendStatus.tsx
import React, { useEffect, useState } from "react";
import { checkBackendHealth } from "./api";

type HealthState = "idle" | "loading" | "ok" | "error";

const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<HealthState>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setStatus("loading");
        const data = await checkBackendHealth();
        if (!cancelled) {
          setStatus("ok");
          setMessage(`Backend status: ${data.status}`);
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err?.message || "Unknown error");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  let display = "";
  if (status === "idle" || status === "loading") {
    display = "Checking backend health…";
  } else if (status === "ok") {
    display = message || "Backend is OK 🎉";
  } else {
    display = `Backend check failed ❌ – ${message}`;
  }

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", marginTop: "1rem" }}>
      <strong>Dealsub Backend:</strong>
      <div>{display}</div>
    </div>
  );
};

export default BackendStatus;

