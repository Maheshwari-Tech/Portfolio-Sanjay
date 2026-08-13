"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getFreshAccessToken } from "./apiClient";
import { getSupabaseBrowserClient } from "./supabaseClient";

type StoredUser = { name?: string; phone?: string };

export default function AccountStatus() {
  const [user, setUser] = useState<StoredUser>({});
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let active = true;
    const readStoredUser = () => {
      try { return JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}") as StoredUser; }
      catch { return {}; }
    };
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      const task = window.setTimeout(() => {
        if (active) setUser(readStoredUser());
      }, 0);
      return () => {
        active = false;
        window.clearTimeout(task);
      };
    }

    void getFreshAccessToken().then((token) => {
      if (active) setUser(token ? readStoredUser() : {});
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        localStorage.removeItem("sanjay_portfolio_token");
        localStorage.removeItem("sanjay_portfolio_user");
        setUser({});
        return;
      }
      localStorage.setItem("sanjay_portfolio_token", session.access_token);
      const storedUser = readStoredUser();
      const nextUser = {
        ...storedUser,
        name: session.user.user_metadata?.name || storedUser.name || "Member",
        phone: session.user.phone || storedUser.phone,
      };
      localStorage.setItem("sanjay_portfolio_user", JSON.stringify(nextUser));
      setUser(nextUser);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
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
