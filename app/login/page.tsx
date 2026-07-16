"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, normalizeIndianPhone } from "../supabaseClient";
import { apiFetch } from "../apiClient";
import CaptchaChallenge, { type CaptchaProvider } from "../CaptchaChallenge";
import Wordmark from "../Wordmark";

export default function LoginPage({ adminMode = false }: { adminMode?: boolean }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"password" | "otp" | "profile">("password");
  const [verifiedSession, setVerifiedSession] = useState<Session | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const captchaProviderValue = process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER?.toLowerCase();
  const captchaProvider = captchaProviderValue === "hcaptcha" || captchaProviderValue === "turnstile" ? captchaProviderValue as CaptchaProvider : null;
  const captchaSiteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || "";
  const captchaRequested = Boolean(captchaProviderValue || captchaSiteKey);
  const captchaConfigured = Boolean(captchaProvider && captchaSiteKey);
  const requestedNext = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
  const next = requestedNext?.startsWith("/") ? requestedNext : adminMode ? "/admin" : "/";

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || captchaProviderValue !== "hcaptcha") return;
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") return;
    const localUrl = new URL(window.location.href);
    localUrl.hostname = "portfolio.localtest.me";
    window.location.replace(localUrl.toString());
  }, [captchaProviderValue]);

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

  function resetCaptcha() {
    setCaptchaToken(null);
    setCaptchaResetKey((value) => value + 1);
  }

  function captchaIsReady() {
    if (!captchaRequested) return true;
    if (!captchaConfigured) {
      setStatus("Security verification is not configured. Add the public CAPTCHA site key to .env.local.");
      return false;
    }
    if (!captchaToken) {
      setStatus("Complete the security verification before continuing.");
      return false;
    }
    return true;
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
        setStatus("Invalid mobile number or password.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "The login service is unavailable.");
      } finally { setBusy(false); }
      return;
    }
    if (!captchaIsReady()) { setBusy(false); return; }
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: normalizedPhone,
      password,
      options: { captchaToken: captchaToken || undefined },
    });
    if (!error && data.session) {
      finish(data.session);
      return;
    }
    setBusy(false);
    resetCaptcha();
    if (error?.message.toLowerCase().includes("captcha")) {
      setStatus(error.message);
      return;
    }
    setStatus("Invalid mobile number or password.");
  }

  async function requestOtp() {
    const normalizedPhone = normalizeIndianPhone(phone);
    if (!/^\+[1-9]\d{9,14}$/.test(normalizedPhone)) {
      setStatus("Enter a valid mobile number first.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    setStatus("Requesting a one-time code…");
    if (!supabase) {
      try {
        const response = await apiFetch("/auth/request-otp", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizedPhone})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not create a code.");
        setStep("otp");
        setStatus(data.message || "A sign-in code was generated.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "The login service is unavailable.");
      } finally { setBusy(false); }
      return;
    }
    if (!captchaIsReady()) { setBusy(false); return; }
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: { captchaToken: captchaToken || undefined },
    });
    setBusy(false);
    resetCaptcha();
    if (error) {
      setStatus(error.message);
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
        <Wordmark />
        <Link href="/">Back to portfolio</Link>
      </header>
      <section className="auth-shell">
        <p className="eyebrow">{adminMode ? "ADMIN ACCESS" : "SIGN IN"}</p>
        <h1>{step === "password" ? adminMode ? "Admin sign in." : "Sign in with mobile." : step === "otp" ? "Enter your OTP." : "Complete your profile."}</h1>
        {step === "otp" && <p>Enter the six-digit code to continue.</p>}
        {step === "profile" && <p>Add your name to complete your profile.</p>}

        {step === "password" && (
          <form onSubmit={tryPassword}>
            <label>Mobile number<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="8847472124" /></label>
            <label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter password" /></label>
            {captchaConfigured && <CaptchaChallenge provider={captchaProvider!} siteKey={captchaSiteKey} resetKey={captchaResetKey} onToken={setCaptchaToken} />}
            <button disabled={busy} className="button button-dark">{busy ? "Checking…" : "Login ↗"}</button>
            <button disabled={busy} type="button" className="text-link" onClick={() => void requestOtp()}>Forgot password? Login with OTP</button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp}>
            <label>One-time code<input required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" /></label>
            <button disabled={busy || otp.length !== 6} className="button button-dark">{busy ? "Verifying…" : "Verify and continue ↗"}</button>
            <button type="button" className="text-link" onClick={() => { setStep("password"); setOtp(""); resetCaptcha(); setStatus(""); }}>Back to password</button>
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
