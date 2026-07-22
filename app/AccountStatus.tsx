"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "./supabaseClient";

type StoredUser = { name?: string; phone?: string };

export default function AccountStatus() {
  const [user, setUser] = useState<StoredUser>({});
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}"));
    } catch {
      setUser({});
    }
  }, []);

  async function logout() {
    menu.current?.removeAttribute("open");
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem("sanjay_portfolio_token");
    localStorage.removeItem("sanjay_portfolio_user");
    setUser({});
    window.location.href = "/";
  }

  if (!user.phone) return <Link className="account-status" href="/login">Member login</Link>;

  const displayName = user.name || `User ${user.phone.slice(-4)}`;
  return (
    <details className="profile-menu" ref={menu}>
      <summary aria-label={`Open profile menu for ${displayName}`}>
        <span className="profile-avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
        <span>{displayName}</span>
        <span className="profile-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="profile-dropdown">
        <p>Signed in as</p>
        <strong>{displayName}</strong>
        <Link href="/profile" onClick={() => menu.current?.removeAttribute("open")}>Update profile</Link>
        <button type="button" onClick={logout}>Log out</button>
      </div>
    </details>
  );
}
