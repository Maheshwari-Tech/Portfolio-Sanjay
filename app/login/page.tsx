"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, normalizeIndianPhone } from "../supabaseClient";
import { apiFetch } from "../apiClient";

export default function LoginPage({ adminMode = false }: { adminMode?: boolean }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"password" | "otp" | "profile">("password");
  const [verifiedSession, setVerifiedSession] = useState<Session | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const requestedNext = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
  const next = requestedNext?.startsWith("/") ? requestedNext : adminMode ? "/admin" : "/";

  function finish(session: Session, displayName?: string) {
    const user = session.user;
    const storedUser = {
      id: user.id,
      name: displayName || user.user_metadata?.name || "Member",
      phone: user.phone,
      role: user.phone === "+918847472124" ? "admin" : "member",
    };
    localStorage.setItem("sanjay_portfolio_token", session.access_token);
    localStorage.setItem("sanjay_portfolio_user", JSON.stringify(storedUser));
    window.location.href = next;
  }

  function finishLocal(data: {token:string;user:{id:number;name:string;phone:string;role:string}}) {
    localStorage.setItem("sanjay_portfolio_token", data.token);
    localStorage.setItem("sanjay_portfolio_user", JSON.stringify(data.user));
    window.location.href = next;
  }

  async function tryPassword(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    setStatus("Checking your password…");
    const normalizedPhone = normalizeIndianPhone(phone);
    if (!supabase) {
      try {
        const passwordResponse = await apiFetch("/auth/password", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizedPhone,password})});
        if (passwordResponse.ok) { finishLocal(await passwordResponse.json()); return; }
        const otpResponse = await apiFetch("/auth/request-otp", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizedPhone})});
        const otpData = await otpResponse.json();
        if (!otpResponse.ok) throw new Error(otpData.detail || "Could not create a code.");
        setStep("otp");
        setStatus(otpData.message || "A sign-in code was generated.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "The login service is unavailable.");
      } finally { setBusy(false); }
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ phone: normalizedPhone, password });
    if (!error && data.session) {
      finish(data.session);
      return;
    }

    setStatus("Password did not work. Sending a one-time code…");
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
    setBusy(false);
    if (otpError) {
      setStatus(otpError.message);
      return;
    }
    setStep("otp");
    setStatus("Code sent. It expires in 30 minutes and can be used once.");
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    if (!supabase) {
      try {
        const response = await apiFetch("/auth/verify-otp", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizeIndianPhone(phone),code:otp})});
        const data = await response.json();
        if (response.status === 428) { setStep("profile"); setStatus("Phone verified. Add your name to finish local signup."); return; }
        if (!response.ok) throw new Error(data.detail || "The code is invalid or expired.");
        finishLocal(data);
      } catch (error) { setStatus(error instanceof Error ? error.message : "The login service is unavailable."); }
      finally { setBusy(false); }
      return;
    }
    const { data, error } = await supabase.auth.verifyOtp({ phone: normalizeIndianPhone(phone), token: otp, type: "sms" });
    if (error || !data.session) {
      setBusy(false);
      setStatus(error?.message || "The code is invalid or expired.");
      return;
    }

    // The verified one-time code becomes the next password as requested.
    const { error: passwordError } = await supabase.auth.updateUser({ password: otp });
    if (passwordError) {
      setBusy(false);
      setStatus(passwordError.message);
      return;
    }
    if (!data.user?.user_metadata?.name) {
      setVerifiedSession(data.session);
      setStep("profile");
      setBusy(false);
      setStatus("Phone verified. Add your name to complete your profile.");
      return;
    }
    finish(data.session);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    if (!supabase) {
      try {
        const response = await apiFetch("/auth/verify-otp", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizeIndianPhone(phone),code:otp,name:name.trim()})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not complete signup.");
        finishLocal(data);
      } catch (error) { setStatus(error instanceof Error ? error.message : "The login service is unavailable."); setBusy(false); }
      return;
    }
    if (!verifiedSession) { setBusy(false); return; }
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    if (error) {
      setBusy(false);
      setStatus(error.message);
      return;
    }
    finish(verifiedSession, name.trim());
  }

  return (
    <main className="auth-page">
      <header className="article-nav">
        <Link className="wordmark" href="/">SM<span>.</span></Link>
        <Link href="/">Back to portfolio</Link>
      </header>
      <section className="auth-shell">
        <p className="eyebrow">{adminMode ? "ADMIN ACCESS" : "MEMBER ACCESS"}</p>
        <h1>{step === "password" ? "Sign in with mobile." : step === "otp" ? "Enter your OTP." : "Complete your profile."}</h1>
        <p>{step === "password" ? "Your password is checked first. If it fails, we send a one-time SMS code." : step === "otp" ? "Enter the six-digit code to continue." : "We only ask for your name when the account does not already have one."}</p>

        {step === "password" && (
          <form onSubmit={tryPassword}>
            <label>Mobile number<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="8847472124" /></label>
            <label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter password" /></label>
            <button disabled={busy} className="button button-dark">{busy ? "Checking…" : "Continue ↗"}</button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp}>
            <label>One-time code<input required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" /></label>
            <button disabled={busy || otp.length !== 6} className="button button-dark">{busy ? "Verifying…" : "Verify and continue ↗"}</button>
            <button type="button" className="text-link" onClick={() => { setStep("password"); setOtp(""); setStatus(""); }}>Back to password</button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={saveProfile}>
            <label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your name" /></label>
            <button disabled={busy} className="button button-dark">Create profile ↗</button>
          </form>
        )}
        {status && <p className="form-status" aria-live="polite">{status}</p>}
      </section>
    </main>
  );
}
