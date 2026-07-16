"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Pulse = "checking" | "available" | "unavailable";
const healthIntervalMs = Number(process.env.NEXT_PUBLIC_BACKEND_HEALTH_INTERVAL_MS);
const pulsePath = process.env.NEXT_PUBLIC_BACKEND_PULSE_PATH;

export default function Wordmark({
  href = "/",
  label = "Sanjay Gandhi, home",
  initials = "SM",
}: {
  href?: string;
  label?: string;
  initials?: string;
}) {
  const [pulse, setPulse] = useState<Pulse>("checking");

  useEffect(() => {
    let active = true;
    if (!pulsePath || !Number.isFinite(healthIntervalMs) || healthIntervalMs <= 0) {
      setPulse("unavailable");
      return;
    }
    const check = async () => {
      try {
        const response = await fetch(pulsePath, { cache: "no-store" });
        if (active) setPulse(response.ok ? "available" : "unavailable");
      } catch {
        if (active) setPulse("unavailable");
      }
    };
    void check();
    const timer = window.setInterval(check, healthIntervalMs);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return <Link className={`wordmark wordmark-${pulse}`} href={href} aria-label={label}>
    {initials}<span aria-hidden="true">.</span>
  </Link>;
}
