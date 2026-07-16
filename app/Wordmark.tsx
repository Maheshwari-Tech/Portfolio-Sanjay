"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Pulse = "checking" | "available" | "unavailable";

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
    const check = async () => {
      try {
        const response = await fetch("/api/pulse", { cache: "no-store" });
        if (active) setPulse(response.ok ? "available" : "unavailable");
      } catch {
        if (active) setPulse("unavailable");
      }
    };
    void check();
    const timer = window.setInterval(check, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return <Link className={`wordmark wordmark-${pulse}`} href={href} aria-label={label}>
    {initials}<span aria-hidden="true">.</span>
  </Link>;
}
